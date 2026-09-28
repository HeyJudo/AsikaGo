using AsikaGo.Api.Data;
using AsikaGo.Api.Data.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace AsikaGo.Api.Features.Me;

public static class MeEndpoints
{
    public static IEndpointRouteBuilder MapMeEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/me", GetMe);
        return app;
    }

    private static async Task<Results<Ok<MeResponse>, UnauthorizedHttpResult>> GetMe(
        HttpContext http, AppDbContext db, CancellationToken ct)
    {
        var user = http.User;
        var subClaim = user.FindFirst("sub")?.Value;
        if (!Guid.TryParse(subClaim, out var userId))
        {
            return TypedResults.Unauthorized();
        }

        var email = user.FindFirst("email")?.Value;
        var isAnonymous = bool.TryParse(user.FindFirst("is_anonymous")?.Value, out var parsed) && parsed;

        var profile = await db.Profiles.FirstOrDefaultAsync(p => p.Id == userId, ct);
        if (profile is null)
        {
            profile = new Profile
            {
                Id = userId,
                Email = email,
                IsAnonymous = isAnonymous,
            };
            db.Profiles.Add(profile);
        }
        else
        {
            // A guest who links Google keeps the same id but gains an email and loses is_anonymous.
            profile.Email = email;
            profile.IsAnonymous = isAnonymous;
        }

        await db.SaveChangesAsync(ct);

        return TypedResults.Ok(new MeResponse(profile.Id, profile.Email, profile.IsAnonymous));
    }
}

public record MeResponse(Guid Id, string? Email, bool IsAnonymous);
