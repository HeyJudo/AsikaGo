using AsikaGo.Api.Data;
using AsikaGo.Api.Features.Assessment;
using AsikaGo.Api.Features.Assistant;
using AsikaGo.Api.Features.Me;
using AsikaGo.Api.Features.Roadmap;
using AsikaGo.Api.Infrastructure;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.ConfigureHttpJsonOptions(o => o.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();
builder.Services.AddSupabaseAuth(builder.Configuration);
builder.Services.AddAssistant();

// Render's proxy appends the caller's IP to X-Forwarded-For. Trust only that last hop, so the per-IP rate limit sees real callers.
builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor;
    o.ForwardLimit = 1;
    o.KnownIPNetworks.Clear();
    o.KnownProxies.Clear();
});

builder.Services.AddDbContext<AppDbContext>(options => options
    .UseNpgsql(builder.Configuration.GetConnectionString("Default"))
    .UseSnakeCaseNamingConvention());

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173"];

builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins(allowedOrigins)
    .AllowAnyHeader()
    .AllowAnyMethod()));

var app = builder.Build();

app.UseForwardedHeaders();
app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapGet("/health", () => TypedResults.Ok(new { status = "ok" })).AllowAnonymous();

var api = app.MapGroup("/api").RequireAuthorization();
api.MapMeEndpoints();
api.MapAssessmentEndpoints();
api.MapBusinessProfileEndpoints();
api.MapRoadmapEndpoints();
api.MapAssistantEndpoints();

app.Run();

public partial class Program;
