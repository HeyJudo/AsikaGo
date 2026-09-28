using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace AsikaGo.Api.Infrastructure;

public static class AuthExtensions
{
    public static IServiceCollection AddSupabaseAuth(this IServiceCollection services, IConfiguration config)
    {
        var supabaseUrl = config["Supabase:Url"]
            ?? throw new InvalidOperationException("Supabase:Url is not configured.");

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = $"{supabaseUrl}/auth/v1";
                options.Audience = "authenticated";
                options.MapInboundClaims = false;
            });

        services.AddAuthorization();

        return services;
    }
}
