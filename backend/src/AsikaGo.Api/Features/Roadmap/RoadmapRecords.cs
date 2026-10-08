using System.Collections.Generic;

namespace AsikaGo.Api.Features.Roadmap;

public sealed record RoadmapResponse(
    Guid Id,
    Guid UserId,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    IReadOnlyList<RoadmapStepResponse> Steps
);

public sealed record RoadmapStepResponse(
    int Number,
    string Title,
    string Description,
    StepStatus Status,
    IReadOnlyList<RequirementResponse> Requirements,
    int EstimatedHours
);

public enum StepStatus
{
    Planned,
    Started,
    Completed,
    Locked
}

public sealed record RequirementResponse(
    Guid Id,
    string Text,
    SourceResponse Source
);

public sealed record SourceResponse(
    string Type,
    string Description
);

public sealed record StepDetailResponse(
    RoadmapStepResponse Step,
    IReadOnlyList<RequirementResponse> Requirements
);