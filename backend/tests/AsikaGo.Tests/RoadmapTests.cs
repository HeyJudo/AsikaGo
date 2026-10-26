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
    private static readonly Guid PartnershipId = new("77777777-0000-0000-0000-0000000000a5");
    private static readonly Guid PartnershipDeedReq = new("77777777-0000-0000-0000-0000000000b4");
    private static readonly Guid RetailStepId = new("77777777-0000-0000-0000-0000000000a6");

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
            new RegistrationStep { Id = PartnershipId, Name = "Partnership", Agency = "SEC", Description = "Partnership step.", Actions = "Register the partnership." },
            new RegistrationStep { Id = FireId, Name = "Fire", Agency = "BFP", Description = "Fire step.", Actions = "Ask for an inspection.", ConditionNote = "Only if your place is newly built or renovated" },
            new RegistrationStep { Id = RetailStepId, Name = "Retail", Agency = "City hall", Description = "Retail-only step.", Actions = "Register as a retailer." });
        db.Requirements.AddRange(
            new Requirement { Id = ValidIdReq, StepId = BarangayId, Name = "Valid ID", Description = "Any government ID.", SourceId = SourceId },
            new Requirement { Id = SanitaryReq, StepId = BarangayId, Name = "Sanitary permit" },
            new Requirement { Id = RetailReq, StepId = BarangayId, Name = "Retail permit" },
            new Requirement { Id = PartnershipDeedReq, StepId = PartnershipId, Name = "Partnership deed" });
        db.RoadmapRules.AddRange(
            Rule(DtiId, sortOrder: 1, businessType: "Sole Proprietorship"),
            Rule(SecId, sortOrder: 1, businessType: "Corporation"),
            Rule(BarangayId, sortOrder: 2),
            Rule(FireId, sortOrder: 3),
            Rule(RetailStepId, sortOrder: 4, categoryId: RetailId),
            Rule(BarangayId, sortOrder: 1, requirementId: ValidIdReq),
            Rule(BarangayId, sortOrder: 2, requirementId: SanitaryReq, categoryId: FoodId),
            Rule(BarangayId, sortOrder: 3, requirementId: RetailReq, categoryId: RetailId),
            Rule(PartnershipId, sortOrder: 1, businessType: "Partnership"),
            Rule(PartnershipId, sortOrder: 1, requirementId: PartnershipDeedReq));
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
        Assert.Equal((1, DtiId), (roadmap.Steps[0].Number, roadmap.Steps[0].StepId));
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

    private static async Task PutProfile(HttpClient client, string name, string businessType, Guid categoryId, string status)
    {
        var json = $"{{\"businessName\":\"{name}\",\"businessType\":\"{businessType}\",\"categoryId\":\"{categoryId}\",\"registrationStatus\":\"{status}\"}}";
        var response = await client.PutAsync("/api/business-profile", new StringContent(json, Encoding.UTF8, "application/json"));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private List<RoadmapProgress> SavedSteps(Guid user)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return db.RoadmapProgress
            .Where(p => db.UserRoadmaps.Any(r => r.Id == p.RoadmapId && db.BusinessProfiles.Any(b => b.Id == r.BusinessId && b.UserId == user)))
            .OrderBy(p => p.SortOrder)
            .ToList();
    }

    [Fact]
    public async Task PutProfile_BusinessTypeChanges_RebuildsSameRoadmapInPlace()
    {
        var user = await UserWithProfile();
        using var client = Client(user);
        var first = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));

        await PutProfile(client, "Shop", "Sole Proprietorship", FoodId, "Started");
        Assert.Equal(1, SavedRoadmapCount(user));

        var second = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));
        Assert.Equal(first.RoadmapId, second.RoadmapId);
        Assert.Equal(new[] { DtiId, BarangayId, FireId }, second.Steps.Select(s => s.StepId));
    }

    [Fact]
    public async Task PutProfile_CategoryChanges_RebuildsSameRoadmapInPlace()
    {
        var user = await UserWithProfile();
        using var client = Client(user);
        var first = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));
        Assert.Equal(new[] { SecId, BarangayId, FireId }, first.Steps.Select(s => s.StepId));

        await PutProfile(client, "Shop", "Corporation", RetailId, "Started");

        var second = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));
        Assert.Equal(first.RoadmapId, second.RoadmapId);
        Assert.Equal(new[] { SecId, BarangayId, FireId, RetailStepId }, second.Steps.Select(s => s.StepId));
        Assert.Equal("Retail", second.CategoryName);
        var retail = SavedSteps(user).Single(p => p.StepId == RetailStepId);
        Assert.Equal(RoadmapStepStatus.NotStarted, retail.Status);
        Assert.Null(retail.CompletedAt);
    }

    [Fact]
    public async Task PutProfile_RetailToFood_KeepsDoneStepDropsRetailStepKeepsRequirementProgress()
    {
        var user = Guid.NewGuid();
        using var client = Client(user);
        await PutProfile(client, "Shop", "Corporation", RetailId, "Started");
        var first = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));
        var doneAt = new DateTimeOffset(2026, 10, 20, 0, 0, 0, TimeSpan.Zero);
        var sharedRowIds = SavedSteps(user).Where(p => p.StepId != RetailStepId).Select(p => p.Id).ToList();

        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var rows = db.RoadmapProgress.Where(p => p.RoadmapId == first.RoadmapId).ToList();
            var barangay = rows.Single(p => p.StepId == BarangayId);
            barangay.Status = RoadmapStepStatus.Completed;
            barangay.CompletedAt = doneAt;
            barangay.SortOrder = 99;
            rows.Single(p => p.StepId == RetailStepId).Status = RoadmapStepStatus.Completed;
            db.RequirementProgress.Add(new RequirementProgress { RoadmapId = first.RoadmapId, RequirementId = RetailReq, IsPrepared = true, UpdatedAt = doneAt });
            db.SaveChanges();
        }

        await PutProfile(client, "Shop", "Corporation", FoodId, "Started");

        var second = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));
        Assert.Equal(first.RoadmapId, second.RoadmapId);
        var saved = SavedSteps(user);
        Assert.Equal(new[] { SecId, BarangayId, FireId }, saved.Select(p => p.StepId));
        Assert.Equal(sharedRowIds, saved.Select(p => p.Id));
        Assert.Equal(new[] { 1, 2, 3 }, saved.Select(p => p.SortOrder));
        Assert.Equal(RoadmapStepStatus.Completed, saved[1].Status);
        Assert.Equal(doneAt, saved[1].CompletedAt);
        Assert.Equal(RoadmapStepStatus.NotStarted, saved[0].Status);
        Assert.Equal(RoadmapStepStatus.NotStarted, saved[2].Status);
        Assert.DoesNotContain(saved, p => p.StepId == RetailStepId);

        using var scope2 = _factory.Services.CreateScope();
        var db2 = scope2.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.True(db2.RequirementProgress.Any(r => r.RoadmapId == first.RoadmapId && r.RequirementId == RetailReq && r.IsPrepared));
    }

    [Fact]
    public async Task PutProfile_SameTypeAndCategory_ChangesNothing()
    {
        var user = await UserWithProfile();
        using var client = Client(user);
        await client.GetAsync("/api/roadmap");
        var before = SavedSteps(user).Select(p => (p.Id, p.StepId, p.Status, p.SortOrder)).ToList();

        await PutProfile(client, "Renamed Shop", "Corporation", FoodId, "Planning");

        Assert.Equal(before, SavedSteps(user).Select(p => (p.Id, p.StepId, p.Status, p.SortOrder)).ToList());
    }

    [Fact]
    public async Task PutProfile_ChangeBeforeRoadmapBuilt_NextGetBuildsNewRoadmap()
    {
        var user = await UserWithProfile();
        using var client = Client(user);

        await PutProfile(client, "Shop", "Sole Proprietorship", FoodId, "Started");
        Assert.Equal(0, SavedRoadmapCount(user));

        var roadmap = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));
        Assert.Equal(new[] { DtiId, BarangayId, FireId }, roadmap.Steps.Select(s => s.StepId));
    }

    [Fact]
    public async Task PutProfile_OnlyNameAndRegistrationStatusChange_KeepsRoadmap()
    {
        var user = await UserWithProfile();
        using var client = Client(user);
        var first = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));

        await PutProfile(client, "Renamed Shop", "Corporation", FoodId, "Planning");

        var second = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));
        Assert.Equal(first.RoadmapId, second.RoadmapId);
        Assert.Equal(new[] { SecId, BarangayId, FireId }, second.Steps.Select(s => s.StepId));
        Assert.Equal(1, SavedRoadmapCount(user));
    }

    [Fact]
    public async Task GetStep_Barangay_ReturnsDetailRequirementsAndNeighbours()
    {
        using var client = Client(await UserWithProfile());
        var response = await client.GetAsync("/api/roadmap/steps/2");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var step = await Read<StepDetailResponse>(response);
        Assert.Equal((2, 3, BarangayId), (step.Number, step.TotalSteps, step.StepId));
        Assert.Equal(("Barangay", "Barangay hall", "Barangay step."), (step.Name, step.Agency, step.Description));
        Assert.Equal(new[] { "Go to the barangay hall.", "Pay the fee." }, step.Actions);
        Assert.Null(step.ConditionNote);
        Assert.Equal((1, 3), (step.PreviousNumber, step.NextNumber));

        Assert.Equal(new[] { ValidIdReq, SanitaryReq }, step.Requirements.Select(r => r.Id));
        Assert.Equal(new string?[] { null, "Food and Beverage" }, step.Requirements.Select(r => r.AppliesTo));
        Assert.Equal("Any government ID.", step.Requirements[0].Description);
        Assert.Equal(new SourceResponse("Test Charter", "https://example.test/charter", new DateOnly(2026, 10, 5)), step.Requirements[0].Source);
        Assert.Null(step.Requirements[1].Source);
    }

    [Fact]
    public async Task GetStep_FirstAndLast_HaveNoPreviousOrNext()
    {
        using var client = Client(await UserWithProfile());
        var first = await Read<StepDetailResponse>(await client.GetAsync("/api/roadmap/steps/1"));
        var last = await Read<StepDetailResponse>(await client.GetAsync("/api/roadmap/steps/3"));

        Assert.Equal((SecId, (int?)null, (int?)2), (first.StepId, first.PreviousNumber, first.NextNumber));
        Assert.Equal((FireId, (int?)2, (int?)null), (last.StepId, last.PreviousNumber, last.NextNumber));
        Assert.Equal("Only if your place is newly built or renovated", last.ConditionNote);
        Assert.Empty(last.Requirements);
    }

    [Fact]
    public async Task GetStep_BeforeGetRoadmap_BuildsTheRoadmapOnce()
    {
        var user = await UserWithProfile();
        using var client = Client(user);
        var step = await Read<StepDetailResponse>(await client.GetAsync("/api/roadmap/steps/1"));
        var roadmap = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));

        Assert.Equal(roadmap.Steps[0].StepId, step.StepId);
        Assert.Equal(1, SavedRoadmapCount(user));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(4)]
    public async Task GetStep_NumberNotInRoadmap_Returns404Problem(int number)
    {
        using var client = Client(await UserWithProfile());
        var response = await client.GetAsync($"/api/roadmap/steps/{number}");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task GetStep_SavedStepNoLongerInRules_KeepsItsRequirements()
    {
        using var client = Client(await UserWithProfile("Partnership"));
        var roadmap = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));
        Assert.Equal(new[] { PartnershipId, BarangayId, FireId }, roadmap.Steps.Select(s => s.StepId));

        // A knowledge-base edit removes the step's include rule after the roadmap was saved.
        RoadmapRule stepRule;
        using (var scope = _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            stepRule = db.RoadmapRules.Single(r => r.StepId == PartnershipId && r.RequirementId == null);
            db.RoadmapRules.Remove(stepRule);
            db.SaveChanges();
        }

        try
        {
            var after = await Read<RoadmapResponse>(await client.GetAsync("/api/roadmap"));
            var step = await Read<StepDetailResponse>(await client.GetAsync("/api/roadmap/steps/1"));

            Assert.Equal(1, after.Steps[0].RequirementCount);
            Assert.Equal(new[] { PartnershipDeedReq }, step.Requirements.Select(r => r.Id));
        }
        finally
        {
            using var scope = _factory.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.RoadmapRules.Add(stepRule);
            db.SaveChanges();
        }
    }

    [Fact]
    public async Task GetDocuments_ReturnsDocumentsResponse()
    {
        using var client = Client(await UserWithProfile());
        var response = await client.GetAsync("/api/roadmap/documents");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var docs = await Read<DocumentsResponse>(response);
        Assert.NotNull(docs.Steps);
        Assert.True(docs.TotalCount >= 0);
    }

    [Fact]
    public async Task UpdateStepStatus_MissingCompleted_ReturnsValidationProblem()
    {
        using var client = Client(await UserWithProfile());
        var response = await client.PutAsJsonAsync("/api/roadmap/steps/1/status", new { });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task UpdateRequirement_MissingIsPrepared_ReturnsValidationProblem()
    {
        using var client = Client(await UserWithProfile());
        var response = await client.PutAsJsonAsync($"/api/roadmap/requirements/{ValidIdReq}", new { });
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task UpdateStepStatus_SetsCompletedAndTimestamp()
    {
        using var client = Client(await UserWithProfile());
        var response = await client.PutAsJsonAsync("/api/roadmap/steps/1/status", new { completed = true });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var roadmap = await Read<RoadmapResponse>(response);
        Assert.Equal(RoadmapStepStatus.Completed, roadmap.Steps[0].Status);
        Assert.Equal(1, roadmap.CompletedSteps);
        Assert.Equal(33, roadmap.ProgressPercent);
        Assert.Equal(2, roadmap.NextStepNumber);

        var stepDetailResponse = await client.GetAsync("/api/roadmap/steps/1");
        var stepDetail = await Read<StepDetailResponse>(stepDetailResponse);
        Assert.Equal(RoadmapStepStatus.Completed, stepDetail.Status);
        Assert.NotNull(stepDetail.CompletedAt);
    }

    [Fact]
    public async Task UpdateStepStatus_RevertToNotStartedClearsTimestamp()
    {
        using var client = Client(await UserWithProfile());
        await client.PutAsJsonAsync("/api/roadmap/steps/1/status", new { completed = true });
        var response = await client.PutAsJsonAsync("/api/roadmap/steps/1/status", new { completed = false });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var roadmap = await Read<RoadmapResponse>(response);
        Assert.Equal(RoadmapStepStatus.NotStarted, roadmap.Steps[0].Status);
        Assert.Equal(0, roadmap.CompletedSteps);
        Assert.Equal(0, roadmap.ProgressPercent);
        Assert.Equal(1, roadmap.NextStepNumber);

        var stepDetailResponse = await client.GetAsync("/api/roadmap/steps/1");
        var stepDetail = await Read<StepDetailResponse>(stepDetailResponse);
        Assert.Equal(RoadmapStepStatus.NotStarted, stepDetail.Status);
        Assert.Null(stepDetail.CompletedAt);
    }

    [Fact]
    public async Task UpdateStepStatus_AllComplete_NextStepNumberIsNull()
    {
        using var client = Client(await UserWithProfile());
        await client.PutAsJsonAsync("/api/roadmap/steps/1/status", new { completed = true });
        await client.PutAsJsonAsync("/api/roadmap/steps/2/status", new { completed = true });
        var response = await client.PutAsJsonAsync("/api/roadmap/steps/3/status", new { completed = true });
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var roadmap = await Read<RoadmapResponse>(response);
        Assert.Equal(3, roadmap.CompletedSteps);
        Assert.Equal(100, roadmap.ProgressPercent);
        Assert.Null(roadmap.NextStepNumber);
    }

    [Fact]
    public async Task UpdateStepStatus_InvalidStepNumber_Returns404()
    {
        using var client = Client(await UserWithProfile());
        var response = await client.PutAsJsonAsync("/api/roadmap/steps/99/status", new { completed = true });
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task UpdateStepStatus_OtherUserRoadmap_Returns404()
    {
        var owner = await UserWithProfile();
        var otherUser = Guid.NewGuid();
        using var client = Client(otherUser);
        var response = await client.PutAsJsonAsync("/api/roadmap/steps/1/status", new { completed = true });
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(4)]
    public async Task UpdateStepStatus_StepZeroAndTotalPlusOne_Returns404(int number)
    {
        using var client = Client(await UserWithProfile());
        var response = await client.PutAsJsonAsync($"/api/roadmap/steps/{number}/status", new { completed = true });
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateRequirement_SetsInProgressStatus()
    {
        var user = await UserWithProfile();
        using var client = Client(user);
        var putReqResponse = await client.PutAsJsonAsync($"/api/roadmap/requirements/{ValidIdReq}", new { isPrepared = true });
        Assert.Equal(HttpStatusCode.NoContent, putReqResponse.StatusCode);

        var roadmapResponse = await client.GetAsync("/api/roadmap");
        var roadmap = await Read<RoadmapResponse>(roadmapResponse);
        Assert.Equal(RoadmapStepStatus.InProgress, roadmap.Steps[1].Status);
        Assert.Equal(1, roadmap.Steps[1].PreparedCount);
    }

    [Fact]
    public async Task UpdateStepStatus_CompletedStepWithPreparedRequirements_StaysCompleted()
    {
        var user = await UserWithProfile();
        using var client = Client(user);
        await client.PutAsJsonAsync($"/api/roadmap/requirements/{ValidIdReq}", new { isPrepared = true });
        var statusResponse = await client.PutAsJsonAsync("/api/roadmap/steps/2/status", new { completed = true });
        Assert.Equal(HttpStatusCode.OK, statusResponse.StatusCode);

        var roadmap = await Read<RoadmapResponse>(statusResponse);
        Assert.Equal(RoadmapStepStatus.Completed, roadmap.Steps[1].Status);
    }

    [Fact]
    public async Task UpdateRequirement_Valid_ReturnsNoContent()
    {
        using var client = Client(await UserWithProfile());
        var response = await client.PutAsJsonAsync($"/api/roadmap/requirements/{ValidIdReq}", new { isPrepared = true });
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
