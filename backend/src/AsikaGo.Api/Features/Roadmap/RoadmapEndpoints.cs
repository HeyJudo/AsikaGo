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
        group.MapPut("/steps/{number:int}/status", UpdateStepStatus)
             .Produces(StatusCodes.Status204NoContent)
             .ProducesValidationProblem()
             .ProducesProblem(StatusCodes.Status401Unauthorized)
             .ProducesProblem(StatusCodes.Status404NotFound);
        group.MapPut("/requirements/{requirementId:guid}", UpdateRequirement)
             .Produces(StatusCodes.Status204NoContent)
             .ProducesValidationProblem()
             .ProducesProblem(StatusCodes.Status401Unauthorized)
             .ProducesProblem(StatusCodes.Status404NotFound);
        group.MapGet("/documents", GetDocuments)
             .Produces<DocumentsResponse>(StatusCodes.Status200OK)
             .ProducesProblem(StatusCodes.Status401Unauthorized)
             .ProducesProblem(StatusCodes.Status404NotFound);

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
            .Select((s, i) => new RoadmapStepResponse(
                i + 1,
                s.Step.Id,
                s.Step.Name,
                s.Step.Agency,
                s.Step.ConditionNote,
                s.Requirements.Count,
                RoadmapStepStatus.NotStarted,
                0))
            .ToList();

        return TypedResults.Ok(new RoadmapResponse(
            roadmap.Id,
            roadmap.CreatedAt,
            profile.BusinessType,
            profile.Category!.Name,
            profile.City!.Name,
            profile.RegistrationStatus,
            steps,
            0,
            0,
            roadmap.Steps.Count > 0 ? 1 : null));
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

        var engine = new RoadmapEngine();
        var rules = await db.RoadmapRules.AsNoTracking().ToListAsync(ct);
        var requirements = await db.Requirements.AsNoTracking().Include(r => r.Source).ToListAsync(ct);

        var roadmap = await FindRoadmap(db, profile.Id, ct);
        if (roadmap is null)
        {
            var generated = engine.GenerateRoadmap(
                profile.BusinessType, profile.CategoryId, profile.CityId,
                rules, await db.RegistrationSteps.AsNoTracking().ToListAsync(ct), requirements);
            roadmap = await SaveRoadmap(db, profile.Id, generated, ct);
        }

        var saved = await db.RoadmapProgress.AsNoTracking()
            .Include(p => p.Step)
            .Where(p => p.RoadmapId == roadmap.Id)
            .OrderBy(p => p.SortOrder).ThenBy(p => p.StepId)
            .ToListAsync(ct);

        var steps = saved
            .Select(p => (p.Step!, engine.GetStepRequirements(
                p.StepId, profile.BusinessType, profile.CategoryId, profile.CityId, rules, requirements)))
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
                    ToSource(r.Requirement.Source),
                    false))
                .ToList(),
            number == 1 ? null : number - 1,
            number == total ? null : number + 1,
            RoadmapStepStatus.NotStarted,
            null));
    }

    private static async Task<Results<NoContent, UnauthorizedHttpResult, ProblemHttpResult, ValidationProblem>> UpdateStepStatus(
        HttpContext http, AppDbContext db, int number, UpdateStepStatusRequest request, CancellationToken ct)
    {
        var userId = GetUserId(http);
        if (userId is null) return TypedResults.Unauthorized();

        if (request?.Completed is null)
        {
            Dictionary<string, string[]> errors = new() { { "completed", ["The completed field is required."] } };
            return TypedResults.ValidationProblem(errors);
        }

        var roadmap = await LoadRoadmap(db, userId.Value, ct);
        if (roadmap is null) return NoProfile();

        if (number < 1 || number > roadmap.Steps.Count)
            return TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, detail: $"Step {number} is not in your roadmap.");

        return TypedResults.NoContent();
    }

    private static async Task<Results<NoContent, UnauthorizedHttpResult, ProblemHttpResult, ValidationProblem>> UpdateRequirement(
        HttpContext http, AppDbContext db, Guid requirementId, UpdateRequirementRequest request, CancellationToken ct)
    {
        var userId = GetUserId(http);
        if (userId is null) return TypedResults.Unauthorized();

        if (request?.IsPrepared is null)
        {
            Dictionary<string, string[]> errors = new() { { "isPrepared", ["The isPrepared field is required."] } };
            return TypedResults.ValidationProblem(errors);
        }

        var roadmap = await LoadRoadmap(db, userId.Value, ct);
        if (roadmap is null) return NoProfile();

        var exists = roadmap.Steps.SelectMany(s => s.Requirements).Any(r => r.Requirement.Id == requirementId);
        if (!exists)
            return TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, detail: $"Requirement {requirementId} is not in your roadmap.");

        return TypedResults.NoContent();
    }

    private static async Task<Results<Ok<DocumentsResponse>, UnauthorizedHttpResult, ProblemHttpResult>> GetDocuments(
        HttpContext http, AppDbContext db, CancellationToken ct)
    {
        var userId = GetUserId(http);
        if (userId is null) return TypedResults.Unauthorized();

        var roadmap = await LoadRoadmap(db, userId.Value, ct);
        if (roadmap is null) return NoProfile();

        var categoryName = roadmap.Profile.Category!.Name;
        var stepResponses = roadmap.Steps.Select((s, i) => new DocumentStepResponse(
            i + 1,
            s.Step.Name,
            RoadmapStepStatus.NotStarted,
            s.Requirements.Select(r => new RequirementResponse(
                r.Requirement.Id,
                r.Requirement.Name,
                r.Requirement.Description,
                r.AppliesToCategoryId is null ? null : categoryName,
                ToSource(r.Requirement.Source),
                false
            )).ToList()
        )).ToList();

        int totalCount = stepResponses.Sum(s => s.Requirements.Count);
        int preparedCount = 0;

        return TypedResults.Ok(new DocumentsResponse(totalCount, preparedCount, stepResponses));
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
