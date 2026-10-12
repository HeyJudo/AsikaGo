using AsikaGo.Api.Data.Entities;
using AsikaGo.Api.Features.Roadmap;
using Xunit;

namespace AsikaGo.Tests;

public class RoadmapEngineTests
{
    private static readonly Guid PasigId = new("11111111-1111-1111-1111-111111111103");
    private static readonly Guid FoodId = new("22222222-2222-2222-2222-222222222201");
    private static readonly Guid RetailId = new("22222222-2222-2222-2222-222222222202");
    private static readonly Guid ServicesId = new("22222222-2222-2222-2222-222222222203");

    [Fact]
    public void GenerateRoadmap_NoMatchingRules_ReturnsEmptyRoadmap()
    {
        var engine = new RoadmapEngine();
        var steps = new List<RegistrationStep>
        {
            new() { Id = Guid.NewGuid(), Name = "Step 1", Agency = "DTI", Description = "Test", Actions = "Action 1" }
        };
        var rules = new List<RoadmapRule>
        {
            new() { Id = Guid.NewGuid(), StepId = steps[0].Id, Effect = RoadmapRuleEffect.Include, SortOrder = 1, BusinessType = "Corporation" }
        };

        var result = engine.GenerateRoadmap("Sole Proprietorship", FoodId, PasigId, rules, steps, []);
        Assert.Empty(result.Steps);
    }

    [Fact]
    public void GenerateRoadmap_ExcludeOverridesInclude_StepAndRequirement()
    {
        var engine = new RoadmapEngine();
        var stepId = Guid.NewGuid();
        var reqId = Guid.NewGuid();

        var steps = new List<RegistrationStep>
        {
            new() { Id = stepId, Name = "Step 1", Agency = "Agency", Description = "Desc", Actions = "Action 1" }
        };
        var reqs = new List<Requirement>
        {
            new() { Id = reqId, StepId = stepId, Name = "Req 1" }
        };
        var rules = new List<RoadmapRule>
        {
            // Include step
            new() { Id = Guid.NewGuid(), StepId = stepId, Effect = RoadmapRuleEffect.Include, SortOrder = 1 },
            // Exclude step
            new() { Id = Guid.NewGuid(), StepId = stepId, Effect = RoadmapRuleEffect.Exclude, SortOrder = 2 },
            // Include req
            new() { Id = Guid.NewGuid(), StepId = stepId, RequirementId = reqId, Effect = RoadmapRuleEffect.Include, SortOrder = 1 }
        };

        var result = engine.GenerateRoadmap("Sole Proprietorship", FoodId, PasigId, rules, steps, reqs);
        Assert.Empty(result.Steps);
    }

    [Fact]
    public void GenerateRoadmap_ExcludedStepDropsRequirements()
    {
        var engine = new RoadmapEngine();
        var stepId = Guid.NewGuid();
        var reqId = Guid.NewGuid();

        var steps = new List<RegistrationStep>
        {
            new() { Id = stepId, Name = "Step 1", Agency = "Agency", Description = "Desc", Actions = "Action 1" }
        };
        var reqs = new List<Requirement>
        {
            new() { Id = reqId, StepId = stepId, Name = "Req 1" }
        };
        var rules = new List<RoadmapRule>
        {
            // Exclude step
            new() { Id = Guid.NewGuid(), StepId = stepId, Effect = RoadmapRuleEffect.Exclude, SortOrder = 1 },
            // Requirement-level Include rule should be ignored because step is excluded
            new() { Id = Guid.NewGuid(), StepId = stepId, RequirementId = reqId, Effect = RoadmapRuleEffect.Include, SortOrder = 1 }
        };

        var result = engine.GenerateRoadmap("Sole Proprietorship", FoodId, PasigId, rules, steps, reqs);
        Assert.Empty(result.Steps);
    }

    [Fact]
    public void GenerateRoadmap_RequirementExcludeDoesNotAffectOtherRequirements()
    {
        var engine = new RoadmapEngine();
        var stepId = Guid.NewGuid();
        var req1Id = Guid.NewGuid();
        var req2Id = Guid.NewGuid();

        var steps = new List<RegistrationStep>
        {
            new() { Id = stepId, Name = "Step 1", Agency = "Agency", Description = "Desc", Actions = "Action 1" }
        };
        var reqs = new List<Requirement>
        {
            new() { Id = req1Id, StepId = stepId, Name = "Req 1" },
            new() { Id = req2Id, StepId = stepId, Name = "Req 2" }
        };
        var rules = new List<RoadmapRule>
        {
            new() { Id = Guid.NewGuid(), StepId = stepId, Effect = RoadmapRuleEffect.Include, SortOrder = 1 },
            new() { Id = Guid.NewGuid(), StepId = stepId, RequirementId = req1Id, Effect = RoadmapRuleEffect.Include, SortOrder = 1 },
            new() { Id = Guid.NewGuid(), StepId = stepId, RequirementId = req2Id, Effect = RoadmapRuleEffect.Include, SortOrder = 2 },
            // Exclude req 1 only
            new() { Id = Guid.NewGuid(), StepId = stepId, RequirementId = req1Id, Effect = RoadmapRuleEffect.Exclude, SortOrder = 3 }
        };

        var result = engine.GenerateRoadmap("Sole Proprietorship", FoodId, PasigId, rules, steps, reqs);
        var stepResult = Assert.Single(result.Steps);
        var reqResult = Assert.Single(stepResult.Requirements);
        Assert.Equal(req2Id, reqResult.Requirement.Id);
    }

    [Theory]
    [InlineData("Sole Proprietorship", "Step 1A", "Step 1B")]
    [InlineData("Partnership", "Step 1B", "Step 1A")]
    [InlineData("Corporation", "Step 1B", "Step 1A")]
    [InlineData("One Person Corporation", "Step 1B", "Step 1A")]
    public void Step1A_1B_GuaranteesAcrossCategories(string businessType, string expectedStep, string excludedStep)
    {
        var engine = new RoadmapEngine();
        var step1aId = Guid.NewGuid();
        var step1bId = Guid.NewGuid();

        var steps = new List<RegistrationStep>
        {
            new() { Id = step1aId, Name = "Step 1A", Agency = "DTI", Description = "DTI", Actions = "Action 1A" },
            new() { Id = step1bId, Name = "Step 1B", Agency = "SEC", Description = "SEC", Actions = "Action 1B" }
        };

        var rules = new List<RoadmapRule>
        {
            new() { Id = Guid.NewGuid(), StepId = step1aId, Effect = RoadmapRuleEffect.Include, SortOrder = 1, BusinessType = "Sole Proprietorship" },
            new() { Id = Guid.NewGuid(), StepId = step1bId, Effect = RoadmapRuleEffect.Include, SortOrder = 1, BusinessType = "Partnership" },
            new() { Id = Guid.NewGuid(), StepId = step1bId, Effect = RoadmapRuleEffect.Include, SortOrder = 1, BusinessType = "Corporation" },
            new() { Id = Guid.NewGuid(), StepId = step1bId, Effect = RoadmapRuleEffect.Include, SortOrder = 1, BusinessType = "One Person Corporation" }
        };

        foreach (var categoryId in new[] { FoodId, RetailId, ServicesId })
        {
            var result = engine.GenerateRoadmap(businessType, categoryId, PasigId, rules, steps, []);
            var step = Assert.Single(result.Steps);
            Assert.Equal(expectedStep, step.Step.Name);
            Assert.DoesNotContain(result.Steps, s => s.Step.Name == excludedStep);
        }
    }

    [Fact]
    public void GenerateRoadmap_GoldenCasesFixtureSimulation()
    {
        // Simulates golden case fixture verification for G-01 (Sole Proprietorship, Food and Beverage)
        var engine = new RoadmapEngine();
        var step1Id = Guid.NewGuid();
        var step2Id = Guid.NewGuid();

        var steps = new List<RegistrationStep>
        {
            new() { Id = step1Id, Name = "DTI Business Name Registration", Agency = "DTI", Description = "DTI desc", Actions = "Action 1" },
            new() { Id = step2Id, Name = "Barangay Business Clearance", Agency = "Barangay", Description = "Barangay desc", Actions = "Action 2" }
        };

        var req1Id = Guid.NewGuid();
        var req2Id = Guid.NewGuid();
        var requirements = new List<Requirement>
        {
            new() { Id = req1Id, StepId = step1Id, Name = "Valid ID" },
            new() { Id = req2Id, StepId = step2Id, Name = "Lease Contract", Description = "If renting" }
        };

        var rules = new List<RoadmapRule>
        {
            new() { Id = Guid.NewGuid(), StepId = step1Id, Effect = RoadmapRuleEffect.Include, SortOrder = 1, BusinessType = "Sole Proprietorship" },
            new() { Id = Guid.NewGuid(), StepId = step2Id, Effect = RoadmapRuleEffect.Include, SortOrder = 2 },
            new() { Id = Guid.NewGuid(), StepId = step1Id, RequirementId = req1Id, Effect = RoadmapRuleEffect.Include, SortOrder = 1 },
            new() { Id = Guid.NewGuid(), StepId = step2Id, RequirementId = req2Id, CategoryId = FoodId, Effect = RoadmapRuleEffect.Include, SortOrder = 1 }
        };

        var result = engine.GenerateRoadmap("Sole Proprietorship", FoodId, PasigId, rules, steps, requirements);

        Assert.Equal(2, result.Steps.Count);
        Assert.Equal("DTI Business Name Registration", result.Steps[0].Step.Name);
        var reqRes = Assert.Single(result.Steps[1].Requirements);
        Assert.Equal(FoodId, reqRes.AppliesToCategoryId);
    }
}
