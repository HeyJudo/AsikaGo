using AsikaGo.Api.Data;
using AsikaGo.Api.Data.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using static AsikaGo.Api.Features.Roadmap.RoadmapData;

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

        return TypedResults.Ok(BuildRoadmapResponse(roadmap));
    }

    private static RoadmapResponse BuildRoadmapResponse(LoadedRoadmap roadmap)
    {
        var profile = roadmap.Profile;
        var totalSteps = roadmap.Steps.Count;

        var preparedReqIds = GetPreparedRequirementIds(roadmap);

        var steps = roadmap.Steps
            .Select((s, i) =>
            {
                var preparedCount = s.Requirements.Count(r => preparedReqIds.Contains(r.Requirement.Id));
                return new RoadmapStepResponse(
                    i + 1,
                    s.Step.Id,
                    s.Step.Name,
                    s.Step.Agency,
                    s.Step.ConditionNote,
                    s.Requirements.Count,
                    StepStatus(s.Progress, preparedCount),
                    preparedCount);
            })
            .ToList();

        int completedSteps = roadmap.Steps.Count(s => s.Progress.Status == RoadmapStepStatus.Completed);
        int progressPercent = totalSteps > 0 ? (completedSteps * 100) / totalSteps : 0;

        int? nextStepNumber = null;
        for (int i = 0; i < roadmap.Steps.Count; i++)
        {
            if (roadmap.Steps[i].Progress.Status != RoadmapStepStatus.Completed)
            {
                nextStepNumber = i + 1;
                break;
            }
        }

        return new RoadmapResponse(
            roadmap.Id,
            roadmap.CreatedAt,
            profile.BusinessType,
            profile.Category!.Name,
            profile.City!.Name,
            profile.RegistrationStatus,
            steps,
            completedSteps,
            progressPercent,
            nextStepNumber);
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

        var stepId = roadmap.Steps[number - 1].Step.Id;
        var offices = await LoadOffices(db, [stepId], roadmap.Profile.CityId, ct);
        return TypedResults.Ok(BuildStepDetail(roadmap, number, GetPreparedRequirementIds(roadmap), offices[stepId]));
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

        var progress = await db.RoadmapProgress.SingleAsync(p => p.Id == roadmap.Steps[number - 1].Progress.Id, ct);

        if (request.Completed.Value)
        {
            // Marking a done step done again keeps the first completion time.
            if (progress.Status != RoadmapStepStatus.Completed)
            {
                progress.Status = RoadmapStepStatus.Completed;
                progress.CompletedAt = DateTimeOffset.UtcNow;
            }
        }
        else
        {
            progress.Status = RoadmapStepStatus.NotStarted;
            progress.CompletedAt = null;
        }

        await db.SaveChangesAsync(ct);
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

        var reqProgress = await db.RequirementProgress
            .FirstOrDefaultAsync(rp => rp.RoadmapId == roadmap.Id && rp.RequirementId == requirementId, ct);

        if (reqProgress is null)
        {
            db.RequirementProgress.Add(new RequirementProgress
            {
                RoadmapId = roadmap.Id,
                RequirementId = requirementId,
                IsPrepared = request.IsPrepared.Value,
                UpdatedAt = DateTimeOffset.UtcNow
            });

            try
            {
                await db.SaveChangesAsync(ct);
                return TypedResults.NoContent();
            }
            catch (DbUpdateException)
            {
                // A parallel first check of this document saved its row first (PK roadmap_id + requirement_id). Update that one.
                db.ChangeTracker.Clear();
                reqProgress = await db.RequirementProgress
                    .FirstOrDefaultAsync(rp => rp.RoadmapId == roadmap.Id && rp.RequirementId == requirementId, ct);
                if (reqProgress is null) throw;
            }
        }

        reqProgress.IsPrepared = request.IsPrepared.Value;
        reqProgress.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
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
        var preparedReqIds = GetPreparedRequirementIds(roadmap);

        var stepResponses = roadmap.Steps.Select((s, i) =>
        {
            var reqs = s.Requirements.Select(r => new RequirementResponse(
                r.Requirement.Id,
                r.Requirement.Name,
                r.Requirement.Description,
                r.AppliesToCategoryId is null ? null : categoryName,
                ToSource(r.Requirement.Source),
                preparedReqIds.Contains(r.Requirement.Id)
            )).ToList();

            return new DocumentStepResponse(
                i + 1,
                s.Step.Name,
                StepStatus(s.Progress, reqs.Count(r => r.IsPrepared)),
                reqs);
        }).ToList();

        int totalCount = stepResponses.Sum(s => s.Requirements.Count);
        int preparedCount = stepResponses.SelectMany(s => s.Requirements).Count(r => r.IsPrepared);

        return TypedResults.Ok(new DocumentsResponse(totalCount, preparedCount, stepResponses));
    }

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
