using AsikaGo.Api.Data.Entities;

namespace AsikaGo.Api.Features.Roadmap;

public sealed record RoadmapResponse(
    Guid RoadmapId,
    DateTimeOffset CreatedAt,
    string BusinessType,
    string CategoryName,
    string CityName,
    RegistrationStatus RegistrationStatus,
    IReadOnlyList<RoadmapStepResponse> Steps);

public sealed record RoadmapStepResponse(
    int Number,
    Guid StepId,
    string Name,
    string Agency,
    string? ConditionNote,
    int RequirementCount);

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
    int? NextNumber);

public sealed record RequirementResponse(
    Guid Id,
    string Name,
    string? Description,
    string? AppliesTo,
    SourceResponse Source);

public sealed record SourceResponse(
    string Name,
    string Url,
    DateOnly DateVerified);
