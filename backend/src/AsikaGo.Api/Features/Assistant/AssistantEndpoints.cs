using System.Threading.RateLimiting;
using AsikaGo.Api.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace AsikaGo.Api.Features.Assistant;

public sealed record ExtractRequest(string? Description);

public sealed record ExtractResponse(string? BusinessType, Guid? CategoryId);

public static class AssistantEndpoints
{
    private const int MaxDescriptionLength = 1000;

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
}
