using System.Globalization;
using System.Text;
using AsikaGo.Api.Data;
using AsikaGo.Api.Features.Roadmap;

namespace AsikaGo.Api.Features.Assistant;

public sealed record RoadmapPromptContext(string Roadmap, string Progress, string? CurrentStep)
{
    public string Text => CurrentStep is null
        ? $"{Roadmap}\n\n{Progress}"
        : $"{Roadmap}\n\n{Progress}\n\n{CurrentStep}";

    // A missing profile returns null. An invalid current step raises ArgumentOutOfRangeException.
    public static async Task<RoadmapPromptContext?> LoadAsync(
        AppDbContext db, Guid userId, int? stepNumber, CancellationToken ct)
    {
        var roadmap = await RoadmapData.LoadRoadmap(db, userId, ct);
        if (roadmap is null) return null;

        var stepIds = roadmap.Steps.Select(s => s.Step.Id).ToArray();
        var offices = await RoadmapData.LoadOffices(db, stepIds, roadmap.Profile.CityId, ct);
        var prepared = RoadmapData.GetPreparedRequirementIds(roadmap);
        var steps = stepIds.Select((id, index) =>
            RoadmapData.BuildStepDetail(roadmap, index + 1, prepared, offices[id])).ToList();

        return Build(steps, stepNumber);
    }

    public static RoadmapPromptContext Build(IReadOnlyList<StepDetailResponse> steps, int? stepNumber = null)
    {
        var roadmap = new StringBuilder("Roadmap");
        var progress = new StringBuilder("Progress");
        string? currentStep = null;

        foreach (var step in steps.OrderBy(s => s.Number))
        {
            var number = step.Number.ToString(CultureInfo.InvariantCulture);
            var label = $"Step {number}: {step.Name}";
            roadmap.Append('\n').Append(label);
            AppendField(roadmap, "Agency", step.Agency);
            AppendField(roadmap, "Condition", step.ConditionNote);

            foreach (var action in step.Actions)
                AppendField(roadmap, "Action", action);

            foreach (var requirement in step.Requirements)
            {
                AppendField(roadmap, "Requirement", requirement.Name);
                AppendField(roadmap, "  Details", requirement.Description);
                AppendField(roadmap, "  Applies to", requirement.AppliesTo);
            }

            foreach (var office in step.Offices)
            {
                AppendField(roadmap, "Office", $"{office.Name} ({office.Access}, {(office.IsVerified ? "verified" : "unverified")})");
                AppendField(roadmap, "  Address", office.Address);
                AppendField(roadmap, "  Website", office.Website);
                AppendField(roadmap, "  Hours", office.Hours);
                AppendField(roadmap, "  Phone", office.Phone);
                AppendField(roadmap, "  Email", office.Email);
                AppendField(roadmap, "  Map", office.MapsUrl);
            }

            progress.Append('\n').Append(label).Append(" — ").Append(step.Status);
            var checkedDocuments = step.Requirements.Where(r => r.IsPrepared).Select(r => r.Name).ToArray();
            AppendField(progress, "Checked documents", checkedDocuments.Length == 0 ? "None" : string.Join(", ", checkedDocuments));

            if (step.Number == stepNumber)
                currentStep = $"Current step\n{label}";
        }

        if (stepNumber.HasValue && currentStep is null)
            throw new ArgumentOutOfRangeException(nameof(stepNumber), stepNumber, "The step is not in the roadmap.");

        return new RoadmapPromptContext(roadmap.ToString(), progress.ToString(), currentStep);
    }

    private static void AppendField(StringBuilder section, string label, string? value)
    {
        if (!string.IsNullOrWhiteSpace(value))
            section.Append('\n').Append(label).Append(": ").Append(value);
    }
}
