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
    int CompletedSteps,
    int ProgressPercent,
    int? NextStepNumber);

public sealed record RoadmapStepResponse(
    int Number,
    Guid StepId,
    string Name,
    string Agency,
    string? ConditionNote,
    int RequirementCount,
    RoadmapStepStatus Status,
    int PreparedCount);

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
    IReadOnlyList<OfficeResponse> Offices,
    int? PreviousNumber,
    int? NextNumber,
    RoadmapStepStatus Status,
    DateTimeOffset? CompletedAt);

public sealed record OfficeResponse(
    string Name,
    OfficeAccess Access,
    string? Address,
    string? Website,
    string? Hours,
    string? Phone,
    string? Email,
    string? MapsUrl,
    bool IsVerified);

public sealed record RequirementResponse(
    Guid Id,
    string Name,
    string? Description,
    string? AppliesTo,
    SourceResponse? Source,
    bool IsPrepared);

public sealed record SourceResponse(
    string Name,
    string Url,
    DateOnly DateVerified);

public sealed record UpdateStepStatusRequest(bool? Completed);

public sealed record UpdateRequirementRequest(bool? IsPrepared);

public sealed record DocumentsResponse(
    int TotalCount,
    int PreparedCount,
    IReadOnlyList<DocumentStepResponse> Steps);

public sealed record DocumentStepResponse(
    int Number,
    string Name,
    RoadmapStepStatus Status,
    IReadOnlyList<RequirementResponse> Requirements);
