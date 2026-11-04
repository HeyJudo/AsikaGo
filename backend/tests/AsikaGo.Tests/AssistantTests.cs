using System.Collections.Concurrent;
using System.Net;
using System.Text;
using System.Text.Json;
using AsikaGo.Api.Data;
using AsikaGo.Api.Features.Assistant;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AsikaGo.Tests;

// Swaps OpenAI for a fake handler (no test calls the real API) and captures log lines.
public class AssistantFactory : CustomWebApplicationFactory
{
    public FakeOpenAI OpenAI { get; } = new();
    public ConcurrentQueue<string> Logs { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.UseSetting("OpenAI:ApiKey", "sk-test-secret");
        builder.ConfigureTestServices(services =>
        {
            services.AddHttpClient<OpenAIClient>().ConfigurePrimaryHttpMessageHandler(() => OpenAI);
            services.AddLogging(l => l.AddProvider(new CapturingLoggerProvider(Logs)));
        });
    }
}

public class FakeOpenAI : HttpMessageHandler
{
    public Func<HttpResponseMessage> Respond { get; set; } = () => Answer("Sole Proprietorship", "Retail");
    public List<(HttpRequestMessage Request, string Body)> Requests { get; } = new();

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        var body = await request.Content!.ReadAsStringAsync(ct);
        lock (Requests) Requests.Add((request, body));
        return Respond();
    }

    public static HttpResponseMessage Answer(string? type, string? category) => Json(HttpStatusCode.OK, JsonSerializer.Serialize(new
    {
        status = "completed",
        output = new object[]
        {
            new { type = "reasoning", summary = Array.Empty<object>() },
            new { type = "message", content = new[] { new { type = "output_text", text = JsonSerializer.Serialize(new { businessType = type, category }) } } },
        },
        usage = new { input_tokens = 412, output_tokens = 17, input_tokens_details = new { cached_tokens = 0 } },
    }));

    public static HttpResponseMessage Error(HttpStatusCode status, string code, string? retryAfter = null)
    {
        var response = Json(status, $$$"""{"error":{"message":"x","type":"service_unavailable_error","code":"{{{code}}}"}}""");
        if (retryAfter is not null) response.Headers.Add("Retry-After", retryAfter);
        return response;
    }

    private static HttpResponseMessage Json(HttpStatusCode status, string body) =>
        new(status) { Content = new StringContent(body, Encoding.UTF8, "application/json") };
}

public class CapturingLoggerProvider(ConcurrentQueue<string> logs) : ILoggerProvider
{
    public ILogger CreateLogger(string categoryName) => new Logger(logs);
    public void Dispose() { }

    private class Logger(ConcurrentQueue<string> logs) : ILogger
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
        public bool IsEnabled(LogLevel logLevel) => true;
        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
            => logs.Enqueue(formatter(state, exception) + exception);
    }
}

public class AssistantTests(AssistantFactory factory) : IClassFixture<AssistantFactory>
{
    private const string Description = "magbubukas ako ng tindahan ng mga damit, ako lang may-ari";

    // Each test gets its own user and IP so the rate limiters don't leak between tests.
    private HttpClient Client(Guid? user = null, string? ip = null)
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-User", (user ?? Guid.NewGuid()).ToString());
        client.DefaultRequestHeaders.Add("X-Forwarded-For", ip ?? $"10.0.{Random.Shared.Next(256)}.{Random.Shared.Next(256)}");
        return client;
    }

    private static Task<HttpResponseMessage> Extract(HttpClient client, string? description = Description) =>
        client.PostAsJsonAsync("/api/assistant/extract", new { description });

    private Guid CategoryId(string name)
    {
        using var scope = factory.Services.CreateScope();
        return scope.ServiceProvider.GetRequiredService<AppDbContext>().BusinessCategories.Single(c => c.Name == name).Id;
    }

    [Fact]
    public async Task Extract_ReturnsTypeAndMappedCategoryId()
    {
        factory.OpenAI.Respond = () => FakeOpenAI.Answer("Sole Proprietorship", "Retail");

        var response = await Extract(Client());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Sole Proprietorship", body.GetProperty("businessType").GetString());
        Assert.Equal(CategoryId("Retail"), body.GetProperty("categoryId").GetGuid());
    }

    [Fact]
    public async Task Extract_NullsAndUnknownValues_ReturnNull()
    {
        factory.OpenAI.Respond = () => FakeOpenAI.Answer(null, "Mining");

        var body = await (await Extract(Client())).Content.ReadFromJsonAsync<JsonElement>();

        Assert.Equal(JsonValueKind.Null, body.GetProperty("businessType").ValueKind);
        Assert.Equal(JsonValueKind.Null, body.GetProperty("categoryId").ValueKind);
    }

    [Fact]
    public async Task Extract_SendsStrictSchemaAndGuardrails_UserTextLastInOwnMessage()
    {
        factory.OpenAI.Respond = () => FakeOpenAI.Answer("Partnership", "Services");
        var user = Guid.NewGuid();

        await Extract(Client(user));

        var (request, raw) = factory.OpenAI.Requests.Last(r => r.Body.Contains(Description));
        Assert.Equal("https://api.openai.com/v1/responses", request.RequestUri!.ToString());
        Assert.Equal("Bearer sk-test-secret", request.Headers.Authorization!.ToString());

        var body = JsonDocument.Parse(raw).RootElement;
        Assert.Equal("gpt-6.1-terra", body.GetProperty("model").GetString());
        Assert.False(body.GetProperty("store").GetBoolean());
        Assert.Equal(200, body.GetProperty("max_output_tokens").GetInt32());
        Assert.Equal("none", body.GetProperty("reasoning").GetProperty("effort").GetString());

        var input = body.GetProperty("input").EnumerateArray().ToList();
        Assert.Equal(2, input.Count);
        Assert.Equal("developer", input[0].GetProperty("role").GetString());
        Assert.DoesNotContain(Description, input[0].GetProperty("content").GetString());
        Assert.Equal("user", input[1].GetProperty("role").GetString());
        Assert.Equal(Description, input[1].GetProperty("content").GetString());

        var format = body.GetProperty("text").GetProperty("format");
        Assert.Equal("json_schema", format.GetProperty("type").GetString());
        Assert.True(format.GetProperty("strict").GetBoolean());
        var props = format.GetProperty("schema").GetProperty("properties");
        Assert.Equal(
            ["Sole Proprietorship", "Partnership", "Corporation", "One Person Corporation", null],
            props.GetProperty("businessType").GetProperty("enum").EnumerateArray().Select(e => e.GetString()));
        Assert.Equal(
            ["Retail", "Food and Beverage", "Services", null],
            props.GetProperty("category").GetProperty("enum").EnumerateArray().Select(e => e.GetString()));
    }

    [Fact]
    public void OpenAIClient_Has15SecondTimeout()
    {
        var http = factory.Services.GetRequiredService<IHttpClientFactory>().CreateClient(nameof(OpenAIClient));
        Assert.Equal(TimeSpan.FromSeconds(15), http.Timeout);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task Extract_EmptyDescription_Returns400(string? description)
    {
        var response = await Extract(Client(), description);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Extract_Over1000Characters_Returns400_And1000IsAllowed()
    {
        factory.OpenAI.Respond = () => FakeOpenAI.Answer(null, null);
        var client = Client();

        Assert.Equal(HttpStatusCode.BadRequest, (await Extract(client, new string('a', 1001))).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Extract(client, new string('a', 1000))).StatusCode);
    }

    [Fact]
    public async Task Extract_21stCallInAMinute_Returns429ProblemDetails()
    {
        factory.OpenAI.Respond = () => FakeOpenAI.Answer(null, null);
        var client = Client();

        for (var i = 0; i < 20; i++)
            Assert.Equal(HttpStatusCode.OK, (await Extract(client)).StatusCode);

        var response = await Extract(client);
        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType!.MediaType);
    }

    [Fact]
    public async Task Extract_61stCallFromOneIp_Returns429()
    {
        factory.OpenAI.Respond = () => FakeOpenAI.Answer(null, null);
        const string ip = "203.0.113.7";

        for (var u = 0; u < 3; u++)
        {
            var client = Client(ip: ip);
            for (var i = 0; i < 20; i++)
                Assert.Equal(HttpStatusCode.OK, (await Extract(client)).StatusCode);
        }

        Assert.Equal(HttpStatusCode.TooManyRequests, (await Extract(Client(ip: ip))).StatusCode);
    }

    [Theory]
    [InlineData(HttpStatusCode.InternalServerError, "server_error")]
    [InlineData(HttpStatusCode.Unauthorized, "invalid_api_key")]
    [InlineData(HttpStatusCode.TooManyRequests, "rate_limit_exceeded")]
    public async Task Extract_OpenAIError_Returns503ProblemDetails_NoRetry(HttpStatusCode status, string code)
    {
        var calls = 0;
        factory.OpenAI.Respond = () => { calls++; return FakeOpenAI.Error(status, code, "0"); };

        var response = await Extract(Client());

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType!.MediaType);
        Assert.Equal(1, calls);
    }

    [Fact]
    public async Task Extract_Timeout_Returns503()
    {
        factory.OpenAI.Respond = () => throw new TaskCanceledException("timeout", new TimeoutException());

        var response = await Extract(Client());

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
    }

    [Fact]
    public async Task Extract_NullOutputOrNoUsage_ReturnsNulls()
    {
        factory.OpenAI.Respond = () => new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent(
            """{"output":[{"type":"message","content":[{"type":"output_text","text":"null"}]}]}""") };

        var response = await Extract(Client());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(JsonValueKind.Null, (await response.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("businessType").ValueKind);
    }

    [Fact]
    public async Task Extract_MalformedOutput_Returns503()
    {
        factory.OpenAI.Respond = () => new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("{\"output\":[") };

        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await Extract(Client())).StatusCode);
    }

    [Fact]
    public async Task Extract_OverloadedWithShortRetryAfter_RetriesOnce()
    {
        var calls = 0;
        factory.OpenAI.Respond = () => ++calls == 1
            ? FakeOpenAI.Error(HttpStatusCode.ServiceUnavailable, "server_is_overloaded", "0")
            : FakeOpenAI.Answer("Corporation", "Services");

        var response = await Extract(Client());

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(2, calls);
    }

    [Fact]
    public async Task Extract_OverloadedTwice_Returns503AfterOneRetry()
    {
        var calls = 0;
        factory.OpenAI.Respond = () => { calls++; return FakeOpenAI.Error(HttpStatusCode.ServiceUnavailable, "server_is_overloaded", "0"); };

        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await Extract(Client())).StatusCode);
        Assert.Equal(2, calls);
    }

    [Theory]
    [InlineData("4")]
    [InlineData(null)]
    public async Task Extract_OverloadedWithLongOrMissingRetryAfter_DoesNotRetry(string? retryAfter)
    {
        var calls = 0;
        factory.OpenAI.Respond = () => { calls++; return FakeOpenAI.Error(HttpStatusCode.ServiceUnavailable, "server_is_overloaded", retryAfter); };

        Assert.Equal(HttpStatusCode.ServiceUnavailable, (await Extract(Client())).StatusCode);
        Assert.Equal(1, calls);
    }

    [Fact]
    public async Task Extract_LogsTokensAndTime_NeverDescriptionOrKey()
    {
        factory.OpenAI.Respond = () => FakeOpenAI.Answer("Sole Proprietorship", "Retail");
        const string secret = "kakaibang-paglalarawan-para-sa-log-test";

        await Extract(Client(), secret);

        Assert.Contains(factory.Logs, l => l.Contains("412 input") && l.Contains("17 output") && l.Contains("0 cached") && l.Contains(" ms"));
        Assert.DoesNotContain(factory.Logs, l => l.Contains(secret) || l.Contains("sk-test-secret"));
    }

    [Fact]
    public async Task Ask_WithoutToken_ReturnsUnauthorized()
    {
        var factoryWithoutAuth = new WebApplicationFactory<Program>();
        var client = factoryWithoutAuth.CreateClient();
        var response = await client.PostAsJsonAsync("/api/assistant/ask", new { question = "Saan kukunin ang cedula?" });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Ask_Guest_Returns200AndEventStream()
    {
        var response = await Client().PostAsJsonAsync("/api/assistant/ask", new { question = "Saan kukunin ang cedula?" });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/event-stream", response.Content.Headers.ContentType!.MediaType);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData(null)]
    public async Task Ask_EmptyQuestion_Returns400(string? question)
    {
        var response = await Client().PostAsJsonAsync("/api/assistant/ask", new { question });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Ask_QuestionTooLong_Returns400()
    {
        var response = await Client().PostAsJsonAsync("/api/assistant/ask", new { question = new string('a', 1001) });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Ask_StepNumberInvalid_Returns400()
    {
        var response = await Client().PostAsJsonAsync("/api/assistant/ask", new { question = "Test", stepNumber = 0 });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Ask_HistoryTooManyItems_Returns400()
    {
        var history = Enumerable.Range(0, 7).Select(_ => new { role = "user", text = "Hi" }).ToList();
        var response = await Client().PostAsJsonAsync("/api/assistant/ask", new { question = "Test", history });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Ask_NullHistoryItem_Returns400()
    {
        var response = await Client().PostAsJsonAsync("/api/assistant/ask", new { question = "Test", history = new object?[] { null } });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Theory]
    [InlineData("admin")]
    [InlineData("USER")]
    [InlineData("system")]
    [InlineData("")]
    public async Task Ask_InvalidRole_Returns400(string role)
    {
        var history = new[] { new { role, text = "Hi" } };
        var response = await Client().PostAsJsonAsync("/api/assistant/ask", new { question = "Test", history });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Ask_HistoryTextTooLong_Returns400()
    {
        var history = new[] { new { role = "user", text = new string('a', 2001) } };
        var response = await Client().PostAsJsonAsync("/api/assistant/ask", new { question = "Test", history });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Ask_EmptyOrNullHistoryText_Returns200()
    {
        ChatMessageDto[] history = [new("user", null), new("assistant", "")];
        var response = await Client().PostAsJsonAsync("/api/assistant/ask", new { question = "Test", history });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Ask_ValidRequest_StreamsSSEEventsInOrder()
    {
        var response = await Client().PostAsJsonAsync("/api/assistant/ask", new { question = "Saan kukunin ang cedula?" });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/event-stream", response.Content.Headers.ContentType!.MediaType);

        var stream = await response.Content.ReadAsStreamAsync();
        using var reader = new StreamReader(stream);

        var events = new List<(string Event, string Data)>();
        string? currentEvent = null;

        while (await reader.ReadLineAsync() is { } line)
        {
            if (string.IsNullOrWhiteSpace(line))
            {
                currentEvent = null;
                continue;
            }

            if (line.StartsWith("event: "))
            {
                currentEvent = line["event: ".Length..].Trim();
            }
            else if (line.StartsWith("data: ") && currentEvent is not null)
            {
                var data = line["data: ".Length..].Trim();
                events.Add((currentEvent, data));
            }
        }

        Assert.Equal(4, events.Count);
        Assert.Equal("delta", events[0].Event);
        Assert.Equal("{\"text\":\"Placeholder \"}", events[0].Data);

        Assert.Equal("delta", events[1].Event);
        Assert.Equal("{\"text\":\"answer \"}", events[1].Data);

        Assert.Equal("delta", events[2].Event);
        Assert.Equal("{\"text\":\"stream.\"}", events[2].Data);

        Assert.Equal("done", events[3].Event);
        Assert.Equal("{\"incomplete\":false}", events[3].Data);
    }
}
