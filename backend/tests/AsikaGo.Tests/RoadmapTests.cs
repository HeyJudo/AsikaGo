using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using AsikaGo.Api.Features.Roadmap;
using Xunit;

namespace AsikaGo.Tests;

public class RoadmapTests : IClassFixture<CustomWebApplicationFactory>
{
    private const string FoodId = "22222222-2222-2222-2222-222222222201";

    private static readonly JsonSerializerOptions JsonOptions =
        new() { PropertyNameCaseInsensitive = true, Converters = { new JsonStringEnumConverter() } };

    private readonly CustomWebApplicationFactory _factory;

    public RoadmapTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private HttpClient Client(Guid user)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-User", user.ToString());
        return client;
    }

    private async Task<Guid> UserWithProfile()
    {
        var user = Guid.NewGuid();
        using var client = Client(user);
        var json = $"{{\"businessType\":\"Corporation\",\"categoryId\":\"{FoodId}\",\"registrationStatus\":\"Started\"}}";
        var response = await client.PutAsync("/api/business-profile", new StringContent(json, Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return user;
    }

    private static async Task<T> Read<T>(HttpResponseMessage r) =>
        JsonSerializer.Deserialize<T>(await r.Content.ReadAsStringAsync(), JsonOptions)!;

    [Theory]
    [InlineData("/api/roadmap")]
    [InlineData("/api/roadmap/steps/1")]
    public async Task Roadmap_NoBusinessProfile_Returns404Problem(string url)
    {
        using var client = Client(Guid.NewGuid());
        var response = await client.GetAsync(url);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task GetRoadmap_ReturnsProfileFieldsAndThreeStepsNumbered1To3()
    {
        using var client = Client(await UserWithProfile());
        var response = await client.GetAsync("/api/roadmap");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var roadmap = await Read<RoadmapResponse>(response);
        Assert.Equal("Corporation", roadmap.BusinessType);
        Assert.Equal("Food and Beverage", roadmap.CategoryName);
        Assert.Equal("Pasig", roadmap.CityName);
        Assert.Equal("Started", roadmap.RegistrationStatus.ToString());
        Assert.Equal(new[] { 1, 2, 3 }, roadmap.Steps.Select(s => s.Number));
        Assert.All(roadmap.Steps, s => Assert.NotEqual(Guid.Empty, s.StepId));
    }

    [Fact]
    public async Task GetStep_LinksToNeighbours_AndMatchesRoadmapStep()
    {
        using var client = Client(await UserWithProfile());
        var roadmap = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));

        var first = await Read<StepDetailResponse>(await client.GetAsync("/api/roadmap/steps/1"));
        var middle = await Read<StepDetailResponse>(await client.GetAsync("/api/roadmap/steps/2"));
        var last = await Read<StepDetailResponse>(await client.GetAsync("/api/roadmap/steps/3"));

        Assert.Equal((null, 2), (first.PreviousNumber, first.NextNumber));
        Assert.Equal((1, 3), (middle.PreviousNumber, middle.NextNumber));
        Assert.Equal((2, null), (last.PreviousNumber, last.NextNumber));
        Assert.All(new[] { first, middle, last }, s => Assert.Equal(3, s.TotalSteps));
        Assert.Equal(roadmap.Steps[1].StepId, middle.StepId);
        Assert.Equal(roadmap.Steps[1].RequirementCount, middle.Requirements.Count);
        Assert.NotEmpty(middle.Actions);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(4)]
    public async Task GetStep_NumberNotInRoadmap_Returns404Problem(int number)
    {
        using var client = Client(await UserWithProfile());
        var response = await client.GetAsync($"/api/roadmap/steps/{number}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }
}
