using AsikaGo.Api.Data.Entities;
using AsikaGo.Api.Features.Assistant;
using AsikaGo.Api.Features.Roadmap;

namespace AsikaGo.Tests;

public class RoadmapPromptContextTests
{
    [Fact]
    public void Build_FormatsOrderedRoadmapProgressAndOptionalCurrentStep()
    {
        var first = new StepDetailResponse(
            1, 2, Guid.NewGuid(), "Barangay clearance", "Barangay hall", "Apply for clearance.",
            ["Apply in person.", "Pay the fee."], "For new businesses.",
            [new RequirementResponse(Guid.NewGuid(), "Valid ID", "Bring a copy.", "Retail", null, true)],
            [
                new OfficeResponse("Branch B", OfficeAccess.InPerson, "Main Street", null,
                    "8 AM–5 PM", "555-0100", "office@example.test", "https://example.test/map", false),
                new OfficeResponse("Portal", OfficeAccess.Online, null, "https://example.test", null, null, null, null, true)
            ],
            null, 2, RoadmapStepStatus.Completed, DateTimeOffset.UtcNow);
        var second = new StepDetailResponse(
            2, 2, Guid.NewGuid(), "Business permit", "City hall", "Apply for a permit.",
            ["Submit the form."], null, [], [], 1, null, RoadmapStepStatus.NotStarted, null);

        var context = RoadmapPromptContext.Build([second, first], 2);
        var expected = """
            Roadmap
            Step 1: Barangay clearance
            Agency: Barangay hall
            Condition: For new businesses.
            Action: Apply in person.
            Action: Pay the fee.
            Requirement: Valid ID
              Details: Bring a copy.
              Applies to: Retail
            Office: Branch B (InPerson, unverified)
              Address: Main Street
              Hours: 8 AM–5 PM
              Phone: 555-0100
              Email: office@example.test
              Map: https://example.test/map
            Office: Portal (Online, verified)
              Website: https://example.test
            Step 2: Business permit
            Agency: City hall
            Action: Submit the form.

            Progress
            Step 1: Barangay clearance — Completed
            Checked documents: Valid ID
            Step 2: Business permit — NotStarted
            Checked documents: None

            Current step
            Step 2: Business permit
            """;
        Assert.Equal(expected.ReplaceLineEndings("\n"), context.Text);
        Assert.Equal(context, RoadmapPromptContext.Build([first, second], 2));

        var withoutCurrent = RoadmapPromptContext.Build([first, second]);
        Assert.Null(withoutCurrent.CurrentStep);
        Assert.Equal($"{context.Roadmap}\n\n{context.Progress}", withoutCurrent.Text);
        Assert.Throws<ArgumentOutOfRangeException>(() => RoadmapPromptContext.Build([first, second], 3));
    }
}
