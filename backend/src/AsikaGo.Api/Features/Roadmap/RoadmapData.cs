using AsikaGo.Api.Data;
using AsikaGo.Api.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace AsikaGo.Api.Features.Roadmap;

internal static class RoadmapData
{
    // The step list is the saved snapshot (D14). Requirements come from the current rules.
    internal sealed record LoadedRoadmap(
        Guid Id,
        DateTimeOffset CreatedAt,
        BusinessProfile Profile,
        IReadOnlyList<(RegistrationStep Step, IReadOnlyList<EngineRequirementResult> Requirements, RoadmapProgress Progress)> Steps,
        IReadOnlyList<RequirementProgress> RequirementProgress);

    internal static async Task<LoadedRoadmap?> LoadRoadmap(AppDbContext db, Guid userId, CancellationToken ct)
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

        var savedProgress = await db.RoadmapProgress.AsNoTracking()
            .Include(p => p.Step)
            .Where(p => p.RoadmapId == roadmap.Id)
            .OrderBy(p => p.SortOrder).ThenBy(p => p.StepId)
            .ToListAsync(ct);

        var reqProgress = await db.RequirementProgress.AsNoTracking()
            .Where(p => p.RoadmapId == roadmap.Id)
            .ToListAsync(ct);

        var steps = savedProgress
            .Select(p => (
                p.Step!,
                engine.GetStepRequirements(p.StepId, profile.BusinessType, profile.CategoryId, profile.CityId, rules, requirements),
                p
            ))
            .ToList();

        return new LoadedRoadmap(roadmap.Id, roadmap.CreatedAt, profile, steps, reqProgress);
    }

    // D17: only NotStarted and Completed are stored. A step that is not done but has a checked document is InProgress.
    internal static RoadmapStepStatus StepStatus(RoadmapProgress progress, int preparedCount) =>
        progress.Status != RoadmapStepStatus.Completed && preparedCount > 0 ? RoadmapStepStatus.InProgress : progress.Status;

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

    internal static async Task<ILookup<Guid, OfficeResponse>> LoadOffices(
        AppDbContext db, Guid[] stepIds, Guid cityId, CancellationToken ct)
    {
        var offices = await db.Offices.AsNoTracking()
            .Where(o => stepIds.Contains(o.StepId) && (o.CityId == null || o.CityId == cityId))
            .OrderBy(o => o.SortOrder).ThenBy(o => o.Id)
            .Select(o => new
            {
                o.StepId,
                Office = new OfficeResponse(o.Name, o.Access, o.Address, o.Website, o.Hours,
                    o.Phone, o.Email, o.MapsUrl, o.IsVerified)
            })
            .ToListAsync(ct);

        return offices.ToLookup(o => o.StepId, o => o.Office);
    }

    internal static HashSet<Guid> GetPreparedRequirementIds(LoadedRoadmap roadmap) =>
        roadmap.RequirementProgress.Where(rp => rp.IsPrepared).Select(rp => rp.RequirementId).ToHashSet();

    internal static StepDetailResponse BuildStepDetail(
        LoadedRoadmap roadmap, int number, IReadOnlySet<Guid> preparedRequirementIds,
        IEnumerable<OfficeResponse> offices)
    {
        var (step, requirements, progress) = roadmap.Steps[number - 1];
        var total = roadmap.Steps.Count;
        var categoryName = roadmap.Profile.Category!.Name;
        var requirementResponses = requirements.Select(r => new RequirementResponse(
            r.Requirement.Id,
            r.Requirement.Name,
            r.Requirement.Description,
            r.AppliesToCategoryId is null ? null : categoryName,
            ToSource(r.Requirement.Source),
            preparedRequirementIds.Contains(r.Requirement.Id))).ToList();

        return new StepDetailResponse(
            number,
            total,
            step.Id,
            step.Name,
            step.Agency,
            step.Description,
            step.Actions.Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries),
            step.ConditionNote,
            requirementResponses,
            offices.ToList(),
            number == 1 ? null : number - 1,
            number == total ? null : number + 1,
            StepStatus(progress, requirementResponses.Count(r => r.IsPrepared)),
            progress.CompletedAt);
    }

    // ponytail: a source with no date_verified is sent as no source, because the UI line reads "checked <date>".
    // Every seeded source has a date. Make dateVerified nullable in the contract if undated sources ever appear.
    internal static SourceResponse? ToSource(SourceReference? source) =>
        source?.DateVerified is { } date ? new SourceResponse(source.Name, source.Url, date) : null;
}
