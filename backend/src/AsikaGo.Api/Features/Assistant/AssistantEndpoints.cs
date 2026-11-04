using System.Text;
using System.Text.Json;
using System.Threading.RateLimiting;
using AsikaGo.Api.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace AsikaGo.Api.Features.Assistant;

public sealed record ExtractRequest(string? Description);

public sealed record ExtractResponse(string? BusinessType, Guid? CategoryId);


public sealed record AskRequest(string? Question, int? StepNumber, List<ChatMessageDto>? History);

public sealed record ChatMessageDto(string? Role, string? Text);

public sealed record AssistantDeltaPayload(string Text);

public sealed record AssistantDonePayload(bool Incomplete);

public sealed record AssistantErrorPayload(string Message);

public static class AssistantEndpoints
{
    private const int MaxDescriptionLength = 1000;
    private const int MaxQuestionLength = 1000;
    private const int MaxHistoryItems = 6;
    private const int MaxHistoryTextLength = 2000;

    public static IServiceCollection AddAssistant(this IServiceCollection services)
    {
        services.AddHttpClient<OpenAIClient>((sp, http) => OpenAIClient.Configure(http, sp.GetRequiredService<IConfiguration>()));

        // D21 guardrails, in memory: they reset when the API restarts, the OpenAI project spend limit is the backstop.
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = (context, _) => new ValueTask(TypedResults.Problem(
                "You've asked the assistant too many times. Please wait a bit and try again.",
                statusCode: StatusCodes.Status429TooManyRequests,
                title: "Too many requests").ExecuteAsync(context.HttpContext));

            options.GlobalLimiter = PartitionedRateLimiter.CreateChained(
                Limit(ctx => ctx.User.FindFirst("sub")?.Value, 20, TimeSpan.FromMinutes(1)),
                Limit(ctx => ctx.User.FindFirst("sub")?.Value, 200, TimeSpan.FromDays(1)),
                Limit(ctx => ctx.Connection.RemoteIpAddress?.ToString(), 60, TimeSpan.FromMinutes(1)));
        });

        return services;
    }

    // Only /api/assistant is limited; every other route gets no limiter.
    private static PartitionedRateLimiter<HttpContext> Limit(Func<HttpContext, string?> key, int permits, TimeSpan window) =>
        PartitionedRateLimiter.Create<HttpContext, string>(ctx => ctx.Request.Path.StartsWithSegments("/api/assistant")
            ? RateLimitPartition.GetFixedWindowLimiter(key(ctx) ?? "unknown", _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = permits,
                Window = window,
            })
            : RateLimitPartition.GetNoLimiter("none"));

    public static IEndpointRouteBuilder MapAssistantEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/assistant");

        group.MapPost("/extract", Extract)
            .ProducesProblem(StatusCodes.Status429TooManyRequests)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);
        group.MapPost("/ask", Ask)
            .RequireAuthorization()
            .Produces<AssistantDeltaPayload>(StatusCodes.Status200OK, contentType: "text/event-stream")
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status429TooManyRequests)
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);

        return app;
    }

    private static async Task<Results<Ok<ExtractResponse>, ValidationProblem, ProblemHttpResult>> Extract(
        ExtractRequest request, OpenAIClient openAI, AppDbContext db, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Description))
            return TypedResults.ValidationProblem(new Dictionary<string, string[]> { ["description"] = ["Please describe your business."] });
        if (request.Description.Length > MaxDescriptionLength)
            return TypedResults.ValidationProblem(new Dictionary<string, string[]> { ["description"] = [$"Please keep it to {MaxDescriptionLength} characters or less."] });

        Extraction answer;
        try
        {
            answer = await openAI.ExtractAsync(request.Description, ct);
        }
        catch (OpenAIException)
        {
            return TypedResults.Problem(
                "The assistant is not available right now. You can fill in the form yourself.",
                statusCode: StatusCodes.Status503ServiceUnavailable,
                title: "Assistant unavailable");
        }

        // Model output is untrusted: keep only values the knowledge base knows.
        var businessType = OpenAIClient.BusinessTypes.Contains(answer.BusinessType) ? answer.BusinessType : null;
        var categoryId = answer.Category is null ? null : await db.BusinessCategories
            .Where(c => c.Name == answer.Category)
            .Select(c => (Guid?)c.Id)
            .FirstOrDefaultAsync(ct);

        return TypedResults.Ok(new ExtractResponse(businessType, categoryId));
    }

    private static async Task<IResult> Ask(
        AskRequest request, HttpContext httpContext, CancellationToken ct)
    {
        var errors = new Dictionary<string, List<string>>();

        void AddError(string key, string message)
        {
            if (!errors.TryGetValue(key, out var list))
            {
                list = [];
                errors[key] = list;
            }
            list.Add(message);
        }

        if (string.IsNullOrWhiteSpace(request.Question))
        {
            AddError("question", "Please enter a question.");
        }
        else if (request.Question.Length > MaxQuestionLength)
        {
            AddError("question", $"Please keep your question to {MaxQuestionLength} characters or less.");
        }

        // Assumption: Step numbers start at 1
        if (request.StepNumber is not null && request.StepNumber < 1)
        {
            AddError("stepNumber", "Step number must be at least 1.");
        }

        if (request.History is not null)
        {
            if (request.History.Count > MaxHistoryItems)
            {
                AddError("history", $"Please keep history to {MaxHistoryItems} messages at most.");
            }
            else
            {
                for (var i = 0; i < request.History.Count; i++)
                {
                    var msg = request.History[i];
                    if (msg is null)
                    {
                        AddError($"history[{i}]", "Message cannot be null.");
                        continue;
                    }

                    if (msg.Role is not ("user" or "assistant"))
                    {
                        AddError($"history[{i}].role", "Role must be 'user' or 'assistant'.");
                    }

                    var text = msg.Text ?? string.Empty;
                    if (text.Length > MaxHistoryTextLength)
                    {
                        AddError($"history[{i}].text", $"Message text must be {MaxHistoryTextLength} characters or less.");
                    }
                }
            }
        }

        if (errors.Count > 0)
        {
            return TypedResults.ValidationProblem(errors.ToDictionary(kv => kv.Key, kv => kv.Value.ToArray()));
        }

        httpContext.Response.ContentType = "text/event-stream";
        httpContext.Response.Headers.CacheControl = "no-cache";

        var streamResult = TypedResults.Stream(async stream =>
        {
            await using var writer = new StreamWriter(stream, new UTF8Encoding(false), leaveOpen: true);

            async Task WriteEventAsync(string eventName, object payload)
            {
                await writer.WriteAsync("event: " + eventName + "\n");
                var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions(JsonSerializerDefaults.Web));
                await writer.WriteAsync("data: " + json + "\n\n");
                await writer.FlushAsync();
            }

            try
            {
                await WriteEventAsync("delta", new AssistantDeltaPayload("Placeholder "));
                if (ct.IsCancellationRequested) return;

                await WriteEventAsync("delta", new AssistantDeltaPayload("answer "));
                if (ct.IsCancellationRequested) return;

                await WriteEventAsync("delta", new AssistantDeltaPayload("stream."));
                if (ct.IsCancellationRequested) return;

                await WriteEventAsync("done", new AssistantDonePayload(false));
            }
            catch (OperationCanceledException)
            {
                // Client disconnected quietly
            }
        }, contentType: "text/event-stream");

        return streamResult;
    }
}
