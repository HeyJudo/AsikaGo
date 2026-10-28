using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AsikaGo.Tests;

// Signs every request in as a Supabase guest (anonymous sign-in), which counts as signed in.
public class TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string SchemeName = "Test";
    public static readonly Guid GuestId = new("33333333-3333-3333-3333-333333333333");

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // X-Test-User lets a test act as a different user.
        var sub = Guid.TryParse(Request.Headers["X-Test-User"], out var id) ? id : GuestId;
        var identity = new ClaimsIdentity([new Claim("sub", sub.ToString()), new Claim("is_anonymous", "true")], SchemeName);
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName)));
    }
}
