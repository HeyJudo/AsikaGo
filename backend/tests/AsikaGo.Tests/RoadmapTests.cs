using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using AsikaGo.Api.Data;
using AsikaGo.Api.Data.Entities;
using AsikaGo.Api.Features.Roadmap;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace AsikaGo.Tests;

public class RoadmapTests : IClassFixture<CustomWebApplicationFactory>
{
    private static readonly Guid FoodId = new("22222222-2222-2222-2222-222222222201");
    private static readonly Guid RetailId = new("22222222-2222-2222-2222-222222222202");

    private static readonly Guid SourceId = new("77777777-0000-0000-0000-000000000001");
    private static readonly Guid DtiId = new("77777777-0000-0000-0000-0000000000a1");
    private static readonly Guid SecId = new("77777777-0000-0000-0000-0000000000a2");
    private static readonly Guid BarangayId = new("77777777-0000-0000-0000-0000000000a3");
    private static readonly Guid FireId = new("77777777-0000-0000-0000-0000000000a4");
    private static readonly Guid ValidIdReq = new("77777777-0000-0000-0000-0000000000b1");
    private static readonly Guid SanitaryReq = new("77777777-0000-0000-0000-0000000000b2");
    private static readonly Guid RetailReq = new("77777777-0000-0000-0000-0000000000b3");

    private static readonly JsonSerializerOptions JsonOptions =
        new() { PropertyNameCaseInsensitive = true, Converters = { new JsonStringEnumConverter() } };

    private readonly CustomWebApplicationFactory _factory;

    public RoadmapTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        SeedKnowledgeBase();
    }

    // Small hand-written knowledge base. Expected results in the tests are read from this, not from the engine.
    private void SeedKnowledgeBase()
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (db.RegistrationSteps.Any(s => s.Id == DtiId)) return;

        db.SourceReferences.Add(new SourceReference { Id = SourceId, Name = "Test Charter", Url = "https://example.test/charter", DateVerified = new DateOnly(2026, 10, 5) });
        db.RegistrationSteps.AddRange(
            new RegistrationStep { Id = DtiId, Name = "DTI", Agency = "DTI", Description = "DTI step.", Actions = "Register online." },
            new RegistrationStep { Id = SecId, Name = "SEC", Agency = "SEC", Description = "SEC step.", Actions = "Register on eSPARC." },
            new RegistrationStep { Id = BarangayId, Name = "Barangay", Agency = "Barangay hall", Description = "Barangay step.", Actions = "Go to the barangay hall.\r\nPay the fee." },
            new RegistrationStep { Id = FireId, Name = "Fire", Agency = "BFP", Description = "Fire step.", Actions = "Ask for an inspection.", ConditionNote = "Only if your place is newly built or renovated" });
        db.Requirements.AddRange(
            new Requirement { Id = ValidIdReq, StepId = BarangayId, Name = "Valid ID", Description = "Any government ID.", SourceId = SourceId },
            new Requirement { Id = SanitaryReq, StepId = BarangayId, Name = "Sanitary permit" },
            new Requirement { Id = RetailReq, StepId = BarangayId, Name = "Retail permit" });
        db.RoadmapRules.AddRange(
            Rule(DtiId, sortOrder: 1, businessType: "Sole Proprietorship"),
            Rule(SecId, sortOrder: 1, businessType: "Corporation"),
            Rule(BarangayId, sortOrder: 2),
            Rule(FireId, sortOrder: 3),
            Rule(BarangayId, sortOrder: 1, requirementId: ValidIdReq),
            Rule(BarangayId, sortOrder: 2, requirementId: SanitaryReq, categoryId: FoodId),
            Rule(BarangayId, sortOrder: 3, requirementId: RetailReq, categoryId: RetailId));
        db.SaveChanges();
    }

    private static RoadmapRule Rule(Guid stepId, int sortOrder, string? businessType = null, Guid? requirementId = null, Guid? categoryId = null) =>
        new() { Id = Guid.NewGuid(), StepId = stepId, SortOrder = sortOrder, BusinessType = businessType, RequirementId = requirementId, CategoryId = categoryId, Effect = RoadmapRuleEffect.Include };

    private HttpClient Client(Guid user)
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-User", user.ToString());
        return client;
    }

    private async Task<Guid> UserWithProfile(string businessType = "Corporation")
    {
        var user = Guid.NewGuid();
        using var client = Client(user);
        var json = $"{{\"businessType\":\"{businessType}\",\"categoryId\":\"{FoodId}\",\"registrationStatus\":\"Started\"}}";
        var response = await client.PutAsync("/api/business-profile", new StringContent(json, Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return user;
    }

    private int SavedRoadmapCount(Guid user)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return db.UserRoadmaps.Count(r => db.BusinessProfiles.Any(b => b.Id == r.BusinessId && b.UserId == user));
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
    public async Task GetRoadmap_Corporation_ReturnsSecBarangayFireNumbered1To3()
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
        Assert.Equal(new[] { SecId, BarangayId, FireId }, roadmap.Steps.Select(s => s.StepId));
        Assert.Equal(new[] { 0, 2, 0 }, roadmap.Steps.Select(s => s.RequirementCount));
        Assert.Equal("Only if your place is newly built or renovated", roadmap.Steps[2].ConditionNote);
    }

    [Fact]
    public async Task GetRoadmap_SoleProprietorship_StartsWithDti()
    {
        using var client = Client(await UserWithProfile("Sole Proprietorship"));
        var roadmap = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));
        Assert.Equal(new[] { DtiId, BarangayId, FireId }, roadmap.Steps.Select(s => s.StepId));
    }

    [Fact]
    public async Task GetRoadmap_SecondCall_ReturnsSameRoadmapAndSavesNothingNew()
    {
        var user = await UserWithProfile();
        using var client = Client(user);
        var first = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));
        var second = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));

        Assert.Equal(first.RoadmapId, second.RoadmapId);
        Assert.Equal(1, SavedRoadmapCount(user));
    }

    [Fact]
    public async Task GetRoadmap_UsesSavedSteps_NotCurrentRules()
    {
        var user = await UserWithProfile();
        using var client = Client(user);
        var first = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.RoadmapProgress.RemoveRange(db.RoadmapProgress.Where(p => p.RoadmapId == first.RoadmapId && p.StepId == FireId));
            db.SaveChanges();
        }

        var second = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));
        Assert.Equal(new[] { SecId, BarangayId }, second.Steps.Select(s => s.StepId));
    }
}
