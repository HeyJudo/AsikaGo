using AsikaGo.Api.Data;
using AsikaGo.Api.Data.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace AsikaGo.Api.Features.Assessment;

public static class AssessmentEndpoints
{
    private static readonly Guid PasigId = new("11111111-1111-1111-1111-111111111103");

    public static IEndpointRouteBuilder MapAssessmentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/assessment");

        group.MapGet("/options", GetOptions).AllowAnonymous();
        group.MapGet("/business-profile", GetBusinessProfile);
        group.MapPut("/business-profile", PutBusinessProfile);

        return app;
    }

    private static async Task<Results<Ok<AssessmentOptionsResponse>, UnauthorizedHttpResult>> GetOptions(
        AppDbContext db, CancellationToken ct)
    {
        var categories = await db.BusinessCategories
            .OrderBy(c => c.Name)
            .Select(c => new CategoryOption(c.Id, c.Name, c.Description))
            .ToListAsync(ct);

        var businessTypes = new[] { "Sole Proprietorship", "Partnership", "Corporation", "One Person Corporation" };

        var registrationStatuses = Enum.GetValues<RegistrationStatus>()
            .Select(s => s.ToString())
            .ToArray();

        return TypedResults.Ok(new AssessmentOptionsResponse(
            categories,
            businessTypes,
            registrationStatuses));
    }

    private static async Task<Results<Ok<BusinessProfileResponse>, IResult>> GetBusinessProfile(
        HttpContext http, AppDbContext db, CancellationToken ct)
    {
        var userId = GetUserId(http);
        if (userId is null) return TypedResults.Unauthorized();

        var profile = await db.BusinessProfiles
            .Where(b => b.UserId == userId.Value)
            .Select(b => new BusinessProfileResponse(
                b.Id,
                b.BusinessName,
                b.BusinessType,
                b.CategoryId,
                b.Category!.Name,
                b.CityId,
                b.City!.Name,
                b.RegistrationStatus,
                b.CreatedAt))
            .FirstOrDefaultAsync(ct);

        return profile is null
            ? TypedResults.NotFound()
            : TypedResults.Ok(profile);
    }

    private static async Task<Results<Ok<BusinessProfileResponse>, IResult>> PutBusinessProfile(
        HttpContext http, AppDbContext db, SaveBusinessProfileRequest request, CancellationToken ct)
    {
        var userId = GetUserId(http);
        if (userId is null) return TypedResults.Unauthorized();

        var allowedTypes = new[] { "Sole Proprietorship", "Partnership", "Corporation", "One Person Corporation" };
        var errors = new Dictionary<string, string[]>();

        if (request.BusinessType is null || !allowedTypes.Contains(request.BusinessType))
            errors["businessType"] = new[] { "Please choose a business type." };

        var categoryExists = await db.BusinessCategories.AnyAsync(c => c.Id == request.CategoryId, ct);
        if (request.CategoryId == Guid.Empty || !categoryExists)
            errors["categoryId"] = new[] { "Please choose a business category." };

        if (request.RegistrationStatus is not RegistrationStatus.Planning and not RegistrationStatus.Started)
            errors["registrationStatus"] = new[] { "Please tell us where you are in the process." };

        if (request.BusinessName is not null && request.BusinessName.Length > 100)
            errors["businessName"] = new[] { "Business name must be 100 characters or less." };

        if (errors.Count > 0)
            return TypedResults.ValidationProblem(errors);

        var existing = await db.BusinessProfiles.FirstOrDefaultAsync(b => b.UserId == userId.Value, ct);

        if (existing is null)
        {
            existing = new BusinessProfile
            {
                Id = Guid.NewGuid(),
                UserId = userId.Value,
                BusinessName = request.BusinessName,
                BusinessType = request.BusinessType!,
                CategoryId = request.CategoryId,
                CityId = PasigId,
                RegistrationStatus = request.RegistrationStatus
            };
            db.BusinessProfiles.Add(existing);
        }
        else
        {
            existing.BusinessName = request.BusinessName;
            existing.BusinessType = request.BusinessType!;
            existing.CategoryId = request.CategoryId;
            existing.CityId = PasigId;
            existing.RegistrationStatus = request.RegistrationStatus;
        }

        await db.SaveChangesAsync(ct);

        var response = await db.BusinessProfiles
            .Where(b => b.UserId == userId.Value)
            .Select(b => new BusinessProfileResponse(
                b.Id,
                b.BusinessName,
                b.BusinessType,
                b.CategoryId,
                b.Category!.Name,
                b.CityId,
                b.City!.Name,
                b.RegistrationStatus,
                b.CreatedAt))
            .FirstAsync(ct);

        return TypedResults.Ok(response);
    }

    private static Guid? GetUserId(HttpContext http)
    {
        var sub = http.User?.FindFirst("sub")?.Value;
        if (Guid.TryParse(sub, out var id)) return id;
        var authUid = http.User?.FindFirst("auth.uid")?.Value;
        if (Guid.TryParse(authUid, out var uid)) return uid;
        return null;
    }
}
