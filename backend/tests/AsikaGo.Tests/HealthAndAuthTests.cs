using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http;

namespace AsikaGo.Tests;

public class HealthAndAuthTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public HealthAndAuthTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Health_ReturnsOk()
    {
        using var client = _factory.CreateClient();
        var response = await client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Me_WithoutToken_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AssessmentOptions_WithoutToken_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/assessment/options");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetBusinessProfile_WithoutToken_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/business-profile");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task PutBusinessProfile_WithoutToken_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();
        var response = await client.PutAsJsonAsync("/api/business-profile", new { businessType = "Partnership" });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("/api/roadmap")]
    [InlineData("/api/roadmap/steps/1")]
    [InlineData("/api/roadmap/documents")]
    public async Task Roadmap_Get_WithoutToken_ReturnsUnauthorized(string url)
    {
        using var client = _factory.CreateClient();
        var response = await client.GetAsync(url);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Roadmap_PutStepStatus_WithoutToken_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();
        var response = await client.PutAsJsonAsync("/api/roadmap/steps/1/status", new { completed = true });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Roadmap_PutRequirement_WithoutToken_ReturnsUnauthorized()
    {
        using var client = _factory.CreateClient();
        var response = await client.PutAsJsonAsync("/api/roadmap/requirements/77777777-0000-0000-0000-0000000000b1", new { isPrepared = true });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
