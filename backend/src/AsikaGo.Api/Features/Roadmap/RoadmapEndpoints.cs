using AsikaGo.Api.Data;
using AsikaGo.Api.Data.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace AsikaGo.Api.Features.Roadmap;

public static class RoadmapEndpoints
{
    // ponytail: placeholder data for the contract (US-005-BE-01). US-005-BE-02 and US-006-BE-01 replace it with the rule engine.
    private static readonly SourceResponse PlaceholderSource =
        new("Pasig BPLD Citizen's Charter 2025", "https://www.pasigcity.gov.ph", new DateOnly(2026, 10, 5));

    private static readonly StepDetailResponse[] PlaceholderSteps =
    [
        Step(1, "00000000-0000-0000-0000-00000000a001", "DTI Business Name Registration",
            "DTI (Department of Trade and Industry)",
            "Your business name must be registered before you can apply for any permit.",
            ["Go to bnrs.dti.gov.ph.", "Search and reserve your business name.", "Pay the fee online and save the certificate."],
            null,
            [Requirement("00000000-0000-0000-0000-00000000b001", "Valid government ID", null, null)]),
        Step(2, "00000000-0000-0000-0000-00000000a002", "Barangay Business Clearance",
            "Barangay hall of your business address",
            "The barangay confirms your business location is allowed.",
            ["Go to your barangay hall.", "Fill up the application form.", "Pay the clearance fee."],
            null,
            [
                Requirement("00000000-0000-0000-0000-00000000b002", "DTI Certificate of Business Name Registration", null, null),
                Requirement("00000000-0000-0000-0000-00000000b003", "Contract of lease or proof of ownership", "If you rent, bring the signed lease.", null),
            ]),
        Step(3, "00000000-0000-0000-0000-00000000a003", "Mayor's Permit (Business Permit)",
            "Pasig City Business Permits and Licensing Department (BPLD)",
            "This permit lets you legally operate your business in Pasig.",
            ["Submit your documents at the BPLD.", "Wait for the assessment of fees.", "Pay at the city treasurer and claim your permit."],
            "Only if your place is newly built or renovated",
            [
                Requirement("00000000-0000-0000-0000-00000000b004", "Barangay Business Clearance", null, null),
                Requirement("00000000-0000-0000-0000-00000000b005", "Sanitary permit", null, "Food and Beverage"),
                Requirement("00000000-0000-0000-0000-00000000b006", "Fire Safety Inspection Certificate", null, null),
            ]),
    ];

    public static IEndpointRouteBuilder MapRoadmapEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/roadmap");

        group.MapGet("/", GetRoadmap).ProducesProblem(StatusCodes.Status404NotFound);
        group.MapGet("/steps/{number:int}", GetStep).ProducesProblem(StatusCodes.Status404NotFound);

        return app;
    }

    private static async Task<Results<Ok<RoadmapResponse>, UnauthorizedHttpResult, ProblemHttpResult>> GetRoadmap(
        HttpContext http, AppDbContext db, CancellationToken ct)
    {
        var userId = GetUserId(http);
        if (userId is null) return TypedResults.Unauthorized();

        var roadmap = await LoadRoadmap(db, userId.Value, ct);
        if (roadmap is null) return NoProfile();

        var profile = roadmap.Profile;
        var steps = roadmap.Steps
            .Select((s, i) => new RoadmapStepResponse(i + 1, s.Step.Id, s.Step.Name, s.Step.Agency, s.Step.ConditionNote, s.Requirements.Count))
            .ToList();

        return TypedResults.Ok(new RoadmapResponse(
            roadmap.Id, roadmap.CreatedAt, profile.BusinessType, profile.Category!.Name, profile.City!.Name,
            profile.RegistrationStatus, steps));
    }

    // The step list is the saved snapshot (D14). Requirements come from the current rules.
    private sealed record LoadedRoadmap(
        Guid Id,
        DateTimeOffset CreatedAt,
        BusinessProfile Profile,
        IReadOnlyList<(RegistrationStep Step, IReadOnlyList<EngineRequirementResult> Requirements)> Steps);

    private static async Task<LoadedRoadmap?> LoadRoadmap(AppDbContext db, Guid userId, CancellationToken ct)
    {
        var profile = await db.BusinessProfiles.AsNoTracking()
            .Include(b => b.Category)
            .Include(b => b.City)
            .FirstOrDefaultAsync(b => b.UserId == userId, ct);
        if (profile is null) return null;

        var engine = new RoadmapEngine().GenerateRoadmap(
            profile.BusinessType, profile.CategoryId, profile.CityId,
            await db.RoadmapRules.AsNoTracking().ToListAsync(ct),
            await db.RegistrationSteps.AsNoTracking().ToListAsync(ct),
            await db.Requirements.AsNoTracking().Include(r => r.Source).ToListAsync(ct));

        var roadmap = await FindRoadmap(db, profile.Id, ct) ?? await SaveRoadmap(db, profile.Id, engine, ct);

        var saved = await db.RoadmapProgress.AsNoTracking()
            .Include(p => p.Step)
            .Where(p => p.RoadmapId == roadmap.Id)
            .OrderBy(p => p.SortOrder).ThenBy(p => p.StepId)
            .ToListAsync(ct);

        var steps = saved
            .Select(p => (p.Step!, engine.Steps.FirstOrDefault(s => s.Step.Id == p.StepId)?.Requirements ?? []))
            .ToList();

        return new LoadedRoadmap(roadmap.Id, roadmap.CreatedAt, profile, steps);
    }

    private static Task<UserRoadmap?> FindRoadmap(AppDbContext db, Guid businessId, CancellationToken ct) =>
        db.UserRoadmaps.AsNoTracking().FirstOrDefaultAsync(r => r.BusinessId == businessId, ct);

    private static async Task<UserRoadmap> SaveRoadmap(AppDbContext db, Guid businessId, RoadmapEngineResult engine, CancellationToken ct)
    {
        var roadmap = new UserRoadmap { Id = Guid.NewGuid(), BusinessId = businessId, CreatedAt = DateTimeOffset.UtcNow };
        db.UserRoadmaps.Add(roadmap);
        db.RoadmapProgress.AddRange(engine.Steps.Select(s => new RoadmapProgress
        {
            Id = Guid.NewGuid(),
            RoadmapId = roadmap.Id,
            StepId = s.Step.Id,
            SortOrder = s.SortOrder,
            Status = RoadmapStepStatus.NotStarted,
        }));

        try
        {
            await db.SaveChangesAsync(ct); // one SaveChanges = one transaction
            return roadmap;
        }
        catch (DbUpdateException)
        {
            // A parallel first call saved this business's roadmap first (unique business_id). Use that one.
            db.ChangeTracker.Clear();
            var winner = await FindRoadmap(db, businessId, ct);
            if (winner is null) throw;
            return winner;
        }
    }

    private static async Task<Results<Ok<StepDetailResponse>, UnauthorizedHttpResult, ProblemHttpResult>> GetStep(
        HttpContext http, AppDbContext db, int number, CancellationToken ct)
    {
        var userId = GetUserId(http);
        if (userId is null) return TypedResults.Unauthorized();

        if (!await db.BusinessProfiles.AnyAsync(b => b.UserId == userId.Value, ct)) return NoProfile();

        var step = PlaceholderSteps.FirstOrDefault(s => s.Number == number);
        return step is null
            ? TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, detail: $"Step {number} is not in your roadmap.")
            : TypedResults.Ok(step);
    }

    private static ProblemHttpResult NoProfile() =>
        TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, detail: "You have no business profile yet.");

    private static StepDetailResponse Step(int number, string id, string name, string agency, string description,
        string[] actions, string? conditionNote, RequirementResponse[] requirements) =>
        new(number, 3, new Guid(id), name, agency, description, actions, conditionNote, requirements,
            number == 1 ? null : number - 1,
            number == 3 ? null : number + 1);

    private static RequirementResponse Requirement(string id, string name, string? description, string? appliesTo) =>
        new(new Guid(id), name, description, appliesTo, PlaceholderSource);

    private static Guid? GetUserId(HttpContext http)
    {
        var sub = http.User?.FindFirst("sub")?.Value;
        if (Guid.TryParse(sub, out var id)) return id;
        var authUid = http.User?.FindFirst("auth.uid")?.Value;
        if (Guid.TryParse(authUid, out var uid)) return uid;
        return null;
    }
}
