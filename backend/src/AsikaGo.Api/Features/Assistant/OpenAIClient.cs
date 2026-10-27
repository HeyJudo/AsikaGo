using System.Diagnostics;
using System.Net;
using System.Net.Http.Headers;
using System.Text.Json;

namespace AsikaGo.Api.Features.Assistant;

public sealed record Extraction(string? BusinessType, string? Category);

// Calls the OpenAI Responses API (D21). Any failure surfaces as OpenAIException; the endpoint turns it into a 503.
public sealed class OpenAIClient(HttpClient http, IConfiguration config, ILogger<OpenAIClient> logger)
{
    public static readonly string[] BusinessTypes = ["Sole Proprietorship", "Partnership", "Corporation", "One Person Corporation"];
    public static readonly string[] Categories = ["Retail", "Food and Beverage", "Services"];

    // Mich's draft from docs/qa/ai-extraction-cases.md (TE-003-AI-01). Fixed text only, the user's text goes in its own message.
    private const string ExtractInstructions = """
        You help a business owner in Pasig City who is starting to register a business. Read their description and pick two things.

        1. Business type. Choose exactly one of: Sole Proprietorship, Partnership, Corporation, One Person Corporation.

        2. Category. Choose exactly one of: Retail, Food and Beverage, Services.

        Rules:

        - The description may be in English, Tagalog, or Taglish. It may be short or have spelling mistakes. Read it for meaning.
        - Pick a value only when the description says it clearly or it follows directly from what they wrote. Examples: "ako lang may-ari, sarili kong pangalan" means Sole Proprietorship. "kami ng kaibigan ko, partners" means Partnership.
        - If you are not sure about a field, answer null for that field. A wrong answer is worse than null.
        - Do not guess the business type from the kind of business. A bakery can be any of the four types.
        - If the description fits more than one category, answer null for the category.
        - Never answer with a value that is not on the lists above.
        """;

    public static void Configure(HttpClient http, IConfiguration config)
    {
        http.BaseAddress = new Uri("https://api.openai.com/v1/");
        http.Timeout = TimeSpan.FromSeconds(15);
        http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", config["OpenAI:ApiKey"]);
    }

    public async Task<Extraction> ExtractAsync(string description, CancellationToken ct)
    {
        var body = new
        {
            model = config["OpenAI:Model"],
            store = false,
            max_output_tokens = 200,
            reasoning = new { effort = "none" },
            input = new[]
            {
                new { role = "developer", content = ExtractInstructions },
                new { role = "user", content = description },
            },
            text = new
            {
                format = new
                {
                    type = "json_schema",
                    name = "business_extraction",
                    strict = true,
                    schema = new
                    {
                        type = "object",
                        properties = new
                        {
                            businessType = new { type = new[] { "string", "null" }, @enum = (string?[])[.. BusinessTypes, null] },
                            category = new { type = new[] { "string", "null" }, @enum = (string?[])[.. Categories, null] },
                        },
                        required = new[] { "businessType", "category" },
                        additionalProperties = false,
                    },
                },
            },
        };

        var text = await SendAsync(body, ct);
        try
        {
            return JsonSerializer.Deserialize<Extraction>(text, JsonSerializerOptions.Web)!;
        }
        catch (JsonException e)
        {
            throw new OpenAIException("OpenAI returned output that is not the expected JSON.", e);
        }
    }

    // Returns the model's output_text, or "{}" when it refused (no answer is a valid answer).
    private async Task<string> SendAsync(object body, CancellationToken ct)
    {
        var started = Stopwatch.GetTimestamp();
        try
        {
            using var response = await PostWithOneRetryAsync(body, ct);
            if (!response.IsSuccessStatusCode)
                throw new OpenAIException($"OpenAI returned {(int)response.StatusCode}.");

            using var json = JsonDocument.Parse(await response.Content.ReadAsStreamAsync(ct));
            var root = json.RootElement;
            var usage = root.GetProperty("usage");
            logger.LogInformation("OpenAI call: {InputTokens} input, {OutputTokens} output, {CachedTokens} cached tokens, {ElapsedMs} ms",
                usage.GetProperty("input_tokens").GetInt32(),
                usage.GetProperty("output_tokens").GetInt32(),
                usage.TryGetProperty("input_tokens_details", out var details) ? details.GetProperty("cached_tokens").GetInt32() : 0,
                (long)Stopwatch.GetElapsedTime(started).TotalMilliseconds);

            return root.GetProperty("output").EnumerateArray()
                .Where(o => o.GetProperty("type").GetString() == "message")
                .SelectMany(o => o.GetProperty("content").EnumerateArray())
                .Where(c => c.GetProperty("type").GetString() == "output_text")
                .Select(c => c.GetProperty("text").GetString())
                .FirstOrDefault() ?? "{}";
        }
        catch (Exception e) when (e is HttpRequestException or JsonException or KeyNotFoundException or InvalidOperationException
                                  || (e is TaskCanceledException && !ct.IsCancellationRequested))
        {
            // Never log the description or the key: only what failed and how long it took.
            logger.LogWarning("OpenAI call failed after {ElapsedMs} ms: {Error}", (long)Stopwatch.GetElapsedTime(started).TotalMilliseconds, e.GetType().Name);
            throw new OpenAIException("OpenAI call failed.", e);
        }
        catch (OpenAIException e)
        {
            logger.LogWarning("OpenAI call failed after {ElapsedMs} ms: {Error}", (long)Stopwatch.GetElapsedTime(started).TotalMilliseconds, e.Message);
            throw;
        }
    }

    // D21: the only retry is one on 503 server_is_overloaded with Retry-After <= 3 s. 429 and everything else fail at once.
    private async Task<HttpResponseMessage> PostWithOneRetryAsync(object body, CancellationToken ct)
    {
        var response = await http.PostAsJsonAsync("responses", body, ct);
        if (response.StatusCode != HttpStatusCode.ServiceUnavailable
            || response.Headers.RetryAfter?.Delta is not { } wait || wait > TimeSpan.FromSeconds(3)
            || !(await response.Content.ReadAsStringAsync(ct)).Contains("\"server_is_overloaded\""))
            return response;

        response.Dispose();
        await Task.Delay(wait, ct);
        return await http.PostAsJsonAsync("responses", body, ct);
    }
}

public sealed class OpenAIException(string message, Exception? inner = null) : Exception(message, inner);
