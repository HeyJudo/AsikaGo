using System.ComponentModel.DataAnnotations;
using AsikaGo.Api.Data.Entities;

namespace AsikaGo.Api.Features.Assessment;

public sealed record AssessmentOptionsResponse(
    IReadOnlyList<CategoryOption> Categories,
    IReadOnlyList<string> BusinessTypes,
    IReadOnlyList<string> RegistrationStatuses);

public sealed record CategoryOption(Guid Id, string Name, string? Description);

public sealed record SaveBusinessProfileRequest(
    [MaxLength(100)] string? BusinessName,
    [Required] string BusinessType,
    [Required] Guid CategoryId,
    [Required] RegistrationStatus? RegistrationStatus);

public sealed record BusinessProfileResponse(
    Guid Id,
    string? BusinessName,
    string BusinessType,
    Guid CategoryId,
    string CategoryName,
    Guid CityId,
    string CityName,
    RegistrationStatus RegistrationStatus,
    DateTimeOffset CreatedAt);