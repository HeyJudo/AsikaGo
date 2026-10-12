using AsikaGo.Api.Data;
using AsikaGo.Api.Data.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace AsikaGo.Api.Features.Roadmap;

public static class RoadmapEndpoints
{
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

        var roadmap = await LoadRoadmap(db, userId.Value, ct);
        if (roadmap is null) return NoProfile();

        var total = roadmap.Steps.Count;
        if (number < 1 || number > total)
            return TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, detail: $"Step {number} is not in your roadmap.");

        var (step, requirements) = roadmap.Steps[number - 1];
        var categoryName = roadmap.Profile.Category!.Name;

        return TypedResults.Ok(new StepDetailResponse(
            number,
            total,
            step.Id,
            step.Name,
            step.Agency,
            step.Description,
            step.Actions.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
            step.ConditionNote,
            requirements
                .Select(r => new RequirementResponse(
                    r.Requirement.Id,
                    r.Requirement.Name,
                    r.Requirement.Description,
                    r.AppliesToCategoryId is null ? null : categoryName,
                    ToSource(r.Requirement.Source)))
                .ToList(),
            number == 1 ? null : number - 1,
            number == total ? null : number + 1));
    }

    // ponytail: a source with no date_verified is sent as no source, because the UI line reads "checked <date>".
    // Every seeded source has a date. Make dateVerified nullable in the contract if undated sources ever appear.
    private static SourceResponse? ToSource(SourceReference? source) =>
        source?.DateVerified is { } date ? new SourceResponse(source.Name, source.Url, date) : null;

    private static ProblemHttpResult NoProfile() =>
        TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, detail: "You have no business profile yet.");

    private static Guid? GetUserId(HttpContext http)
    {
        var sub = http.User?.FindFirst("sub")?.Value;
        if (Guid.TryParse(sub, out var id)) return id;
        var authUid = http.User?.FindFirst("auth.uid")?.Value;
        if (Guid.TryParse(authUid, out var uid)) return uid;
        return null;
    }
}
