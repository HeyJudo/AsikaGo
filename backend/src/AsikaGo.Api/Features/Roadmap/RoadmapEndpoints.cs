using AsikaGo.Api.Data;
using AsikaGo.Api.Data.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace AsikaGo.Api.Features.Roadmap;

public static class RoadmapEndpoints
{
    public static IEndpointRouteBuilder MapRoadmapEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/roadmap");

        group.MapGet("/", GetRoadmap);
        group.MapGet("/steps/{number:int}", GetStepDetails);

        return app;
    }

    private static async Task<Results<Ok<RoadmapResponse>, UnauthorizedHttpResult>> GetRoadmap(
        HttpContext http, CancellationToken ct)
    {
        var userId = GetUserId(http);
        if (userId is null) return TypedResults.Unauthorized();

        // TODO: Load real roadmap data from database
        var roadmap = new RoadmapResponse(
            Id: Guid.NewGuid(),
            UserId: userId.Value,
            CreatedAt: DateTime.UtcNow,
            UpdatedAt: DateTime.UtcNow,
            Steps: new List<RoadmapStepResponse>
            {
                new RoadmapStepResponse(
                    Number: 1,
                    Title: "Business Profile Setup",
                    Description: "Complete your business profile with company details and registration information",
                    Status: StepStatus.Started,
                    Requirements: new List<RequirementResponse>
                    {
                        new RequirementResponse(
                            Id: Guid.NewGuid(),
                            Text: "Business name and type",
                            Source: new SourceResponse(
                                Type: "Profile",
                                Description: "Required business identification"
                            )
                        ),
                        new RequirementResponse(
                            Id: Guid.NewGuid(),
                            Text: "Category selection",
                            Source: new SourceResponse(
                                Type: "Category",
                                Description: "Industry/business category"
                            )
                        )
                    },
                    EstimatedHours: 2
                ),
                new RoadmapStepResponse(
                    Number: 2,
                    Title: "Document Upload",
                    Description: "Upload business registration documents",
                    Status: StepStatus.Planned,
                    Requirements: new List<RequirementResponse>
                    {
                        new RequirementResponse(
                            Id: Guid.NewGuid(),
                            Text: "Registration certificate",
                            Source: new SourceResponse(
                                Type: "Upload",
                                Description: "Business registration document"
                            )
                        )
                    },
                    EstimatedHours: 4
                )
            }
        );

        return TypedResults.Ok(roadmap);
    }

    private static async Task<Results<Ok<RoadmapStepResponse>, UnauthorizedHttpResult>> GetStepDetails(
        HttpContext http, int number, CancellationToken ct)
    {
        var userId = GetUserId(http);
        if (userId is null) return TypedResults.Unauthorized();

        // TODO: Load real step details from database
        var step = new RoadmapStepResponse(
            Number: number,
            Title: GetStepTitle(number),
            Description: GetStepDescription(number),
            Status: GetStepStatus(number),
            Requirements: new List<RequirementResponse>
            {
                new RequirementResponse(
                    Id: Guid.NewGuid(),
                    Text: "Requirement 1 for step " + number,
                    Source: new SourceResponse(
                        Type: "Internal",
                        Description: "Internal requirement for step " + number
                    )
                ),
                new RequirementResponse(
                    Id: Guid.NewGuid(),
                    Text: "Requirement 2 for step " + number,
                    Source: new SourceResponse(
                        Type: "External",
                        Description: "External requirement for step " + number
                    )
                )
            },
            EstimatedHours: 2 * number
        );

        return TypedResults.Ok(step);
    }

    private static Guid? GetUserId(HttpContext http)
    {
        var sub = http.User?.FindFirst("sub")?.Value;
        if (Guid.TryParse(sub, out var id)) return id;
        var authUid = http.User?.FindFirst("auth.uid")?.Value;
        if (Guid.TryParse(authUid, out var uid)) return uid;
        return null;
    }

    private static string GetStepTitle(int number)
    {
        var titles = new[]
        {
            "Business Profile Setup",
            "Document Upload",
            "Market Analysis",
            "Team Building",
            "Funding"
        };

        return number >= 1 && number <= titles.Length ? titles[number - 1] : "Unknown Step";
    }

    private static string GetStepDescription(int number)
    {
        var descriptions = new[]
        {
            "Complete your business profile with company details and registration information",
            "Upload business registration documents",
            "Conduct market research and analysis",
            "Assemble your team members",
            "Secure funding and investment"
        };

        return number >= 1 && number <= descriptions.Length ? descriptions[number - 1] : "Unknown step";
    }

    private static StepStatus GetStepStatus(int number)
    {
        return number switch
        {
            1 => StepStatus.Started,
            2 => StepStatus.Planned,
            3 => StepStatus.Locked,
            4 => StepStatus.Locked,
            5 => StepStatus.Locked,
            _ => StepStatus.Locked
        };
    }
}