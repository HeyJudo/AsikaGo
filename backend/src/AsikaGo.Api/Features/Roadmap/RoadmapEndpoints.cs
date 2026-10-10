using AsikaGo.Api.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace AsikaGo.Api.Features.Roadmap;

public static class RoadmapEndpoints
{
    // ponytail: placeholder data for the contract (US-005-BE-01). US-005-BE-02 and US-006-BE-01 replace it with the rule engine.
    private static readonly SourceResponse PlaceholderSource =
        new("Pasig BPLD Citizen's Charter 2025", "https://www.pasigcity.gov.ph", new DateOnly(2026, 10, 5));

    private static readonly StepDetailResponse[] PlaceholderSteps =
    [
        Step(1, "00000000-0000-0000-0000-00000000a001", "DTI Business Name Registration",
            "DTI (Department of Trade and Industry)",
            "Your business name must be registered before you can apply for any permit.",
            ["Go to bnrs.dti.gov.ph.", "Search and reserve your business name.", "Pay the fee online and save the certificate."],
            null,
            [Requirement("00000000-0000-0000-0000-00000000b001", "Valid government ID", null, null)]),
        Step(2, "00000000-0000-0000-0000-00000000a002", "Barangay Business Clearance",
            "Barangay hall of your business address",
            "The barangay confirms your business location is allowed.",
            ["Go to your barangay hall.", "Fill up the application form.", "Pay the clearance fee."],
            null,
            [
                Requirement("00000000-0000-0000-0000-00000000b002", "DTI Certificate of Business Name Registration", null, null),
                Requirement("00000000-0000-0000-0000-00000000b003", "Contract of lease or proof of ownership", "If you rent, bring the signed lease.", null),
            ]),
        Step(3, "00000000-0000-0000-0000-00000000a003", "Mayor's Permit (Business Permit)",
            "Pasig City Business Permits and Licensing Department (BPLD)",
            "This permit lets you legally operate your business in Pasig.",
            ["Submit your documents at the BPLD.", "Wait for the assessment of fees.", "Pay at the city treasurer and claim your permit."],
            "Only if your place is newly built or renovated",
            [
                Requirement("00000000-0000-0000-0000-00000000b004", "Barangay Business Clearance", null, null),
                Requirement("00000000-0000-0000-0000-00000000b005", "Sanitary permit", null, "Food and Beverage"),
                Requirement("00000000-0000-0000-0000-00000000b006", "Fire Safety Inspection Certificate", null, null),
            ]),
    ];

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

        var profile = await db.BusinessProfiles
            .Where(b => b.UserId == userId.Value)
            .Select(b => new { b.BusinessType, CategoryName = b.Category!.Name, CityName = b.City!.Name, b.RegistrationStatus, b.CreatedAt })
            .FirstOrDefaultAsync(ct);
        if (profile is null) return NoProfile();

        var steps = PlaceholderSteps
            .Select(s => new RoadmapStepResponse(s.Number, s.StepId, s.Name, s.Agency, s.ConditionNote, s.Requirements.Count))
            .ToList();

        return TypedResults.Ok(new RoadmapResponse(
            new Guid("00000000-0000-0000-0000-00000000c001"),
            profile.CreatedAt,
            profile.BusinessType,
            profile.CategoryName,
            profile.CityName,
            profile.RegistrationStatus,
            steps));
    }

    private static async Task<Results<Ok<StepDetailResponse>, UnauthorizedHttpResult, ProblemHttpResult>> GetStep(
        HttpContext http, AppDbContext db, int number, CancellationToken ct)
    {
        var userId = GetUserId(http);
        if (userId is null) return TypedResults.Unauthorized();

        if (!await db.BusinessProfiles.AnyAsync(b => b.UserId == userId.Value, ct)) return NoProfile();

        var step = PlaceholderSteps.FirstOrDefault(s => s.Number == number);
        return step is null
            ? TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, detail: $"Step {number} is not in your roadmap.")
            : TypedResults.Ok(step);
    }

    private static ProblemHttpResult NoProfile() =>
        TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, detail: "You have no business profile yet.");

    private static StepDetailResponse Step(int number, string id, string name, string agency, string description,
        string[] actions, string? conditionNote, RequirementResponse[] requirements) =>
        new(number, 3, new Guid(id), name, agency, description, actions, conditionNote, requirements,
            number == 1 ? null : number - 1,
            number == 3 ? null : number + 1);

    private static RequirementResponse Requirement(string id, string name, string? description, string? appliesTo) =>
        new(new Guid(id), name, description, appliesTo, PlaceholderSource);

    private static Guid? GetUserId(HttpContext http)
    {
        var sub = http.User?.FindFirst("sub")?.Value;
        if (Guid.TryParse(sub, out var id)) return id;
        var authUid = http.User?.FindFirst("auth.uid")?.Value;
        if (Guid.TryParse(authUid, out var uid)) return uid;
        return null;
    }
}
