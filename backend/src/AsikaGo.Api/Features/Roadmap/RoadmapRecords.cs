using AsikaGo.Api.Data.Entities;

namespace AsikaGo.Api.Features.Roadmap;

public sealed record RoadmapResponse(
    Guid RoadmapId,
    DateTimeOffset CreatedAt,
    string BusinessType,
    string CategoryName,
    string CityName,
    RegistrationStatus RegistrationStatus,
    IReadOnlyList<RoadmapStepResponse> Steps,
    int CompletedSteps = 0,
    int ProgressPercent = 0,
    int? NextStepNumber = 1);

public sealed record RoadmapStepResponse(
    int Number,
    Guid StepId,
    string Name,
    string Agency,
    string? ConditionNote,
    int RequirementCount,
    RoadmapStepStatus Status = RoadmapStepStatus.NotStarted,
    int PreparedCount = 0);

public sealed record StepDetailResponse(
    int Number,
    int TotalSteps,
    Guid StepId,
    string Name,
    string Agency,
    string Description,
    IReadOnlyList<string> Actions,
    string? ConditionNote,
    IReadOnlyList<RequirementResponse> Requirements,
    int? PreviousNumber,
    int? NextNumber,
    RoadmapStepStatus Status = RoadmapStepStatus.NotStarted,
    DateTimeOffset? CompletedAt = null);

public sealed record RequirementResponse(
    Guid Id,
    string Name,
    string? Description,
    string? AppliesTo,
    SourceResponse? Source,
    bool IsPrepared = false);

public sealed record SourceResponse(
    string Name,
    string Url,
    DateOnly DateVerified);

public sealed record UpdateStepStatusRequest(bool Completed);

public sealed record UpdateRequirementRequest(bool IsPrepared);

public sealed record DocumentsResponse(
    int TotalCount,
    int PreparedCount,
    IReadOnlyList<DocumentStepResponse> Steps);

public sealed record DocumentStepResponse(
    int Number,
    string Name,
    RoadmapStepStatus Status,
    IReadOnlyList<RequirementResponse> Requirements);
