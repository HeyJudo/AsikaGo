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

    [Theory]
    [InlineData("G-01", "Sole Proprietorship", "Food and Beverage", 57)]
    [InlineData("G-02", "Sole Proprietorship", "Retail", 57)]
    [InlineData("G-03", "Sole Proprietorship", "Services", 61)]
    [InlineData("G-04", "Partnership", "Food and Beverage", 57)]
    [InlineData("G-05", "Partnership", "Retail", 57)]
    [InlineData("G-06", "Partnership", "Services", 61)]
    [InlineData("G-07", "Corporation", "Food and Beverage", 58)]
    [InlineData("G-08", "Corporation", "Retail", 58)]
    [InlineData("G-09", "Corporation", "Services", 62)]
    [InlineData("G-10", "One Person Corporation", "Food and Beverage", 58)]
    [InlineData("G-11", "One Person Corporation", "Retail", 58)]
    [InlineData("G-12", "One Person Corporation", "Services", 62)]
    public void GenerateRoadmap_GoldenCases_MatchesFixture(string caseId, string businessType, string categoryName, int expectedTotalRequirements)
    {
        Assert.NotNull(caseId);
        var engine = new RoadmapEngine();
        var categoryId = categoryName switch
        {
            "Food and Beverage" => FoodId,
            "Retail" => RetailId,
            "Services" => ServicesId,
            _ => throw new ArgumentException()
        };

        var (steps, requirements, rules) = GetPasigFixture();

        var result = engine.GenerateRoadmap(businessType, categoryId, PasigId, rules, steps, requirements);

        Assert.Equal(10, result.Steps.Count);
        for (int i = 0; i < result.Steps.Count; i++)
        {
            Assert.Equal(i + 1, result.Steps[i].Number);
        }

        if (businessType == "Sole Proprietorship")
        {
            Assert.Equal("DTI Business Name Registration", result.Steps[0].Step.Name);
            Assert.Equal("BIR Business Registration for Sole Proprietors", result.Steps[9].Step.Name);
        }
        else
        {
            Assert.Equal("SEC Company Registration", result.Steps[0].Step.Name);
            Assert.Equal("BIR Business Registration for Corporations and Partnerships", result.Steps[9].Step.Name);
        }

        int totalReqs = result.Steps.Sum(s => s.Requirements.Count);
        Assert.Equal(expectedTotalRequirements, totalReqs);
    }

    private static (List<RegistrationStep> Steps, List<Requirement> Requirements, List<RoadmapRule> Rules) GetPasigFixture()
    {
        var s1aId = new Guid("44444444-4444-4444-4444-00000000001a");
        var s1bId = new Guid("44444444-4444-4444-4444-00000000001b");
        var s2Id = new Guid("44444444-4444-4444-4444-000000000002");
        var s3Id = new Guid("44444444-4444-4444-4444-000000000003");
        var s4Id = new Guid("44444444-4444-4444-4444-000000000004");
        var s5Id = new Guid("44444444-4444-4444-4444-000000000005");
        var s6Id = new Guid("44444444-4444-4444-4444-000000000006");
        var s7Id = new Guid("44444444-4444-4444-4444-000000000007");
        var s8Id = new Guid("44444444-4444-4444-4444-000000000008");
        var s9Id = new Guid("44444444-4444-4444-4444-000000000009");
        var s10aId = new Guid("44444444-4444-4444-4444-00000000010a");
        var s10bId = new Guid("44444444-4444-4444-4444-00000000010b");

        var steps = new List<RegistrationStep>
        {
            new() { Id = s1aId, Name = "DTI Business Name Registration", Agency = "DTI", Description = "Desc", Actions = "Action" },
            new() { Id = s1bId, Name = "SEC Company Registration", Agency = "SEC", Description = "Desc", Actions = "Action" },
            new() { Id = s2Id, Name = "Barangay Business Clearance", Agency = "Barangay", Description = "Desc", Actions = "Action" },
            new() { Id = s3Id, Name = "Certificate of Conformance", Agency = "CPDO", Description = "Desc", Actions = "Action" },
            new() { Id = s4Id, Name = "Fire Safety Inspection Certificate for Occupancy", Agency = "BFP", Description = "Desc", Actions = "Action" },
            new() { Id = s5Id, Name = "Business Application Form and Documents", Agency = "BPLD", Description = "Desc", Actions = "Action" },
            new() { Id = s6Id, Name = "Tax Order of Payment", Agency = "BPLD", Description = "Desc", Actions = "Action" },
            new() { Id = s7Id, Name = "Pay Local Business Taxes and Fees", Agency = "Treasurer", Description = "Desc", Actions = "Action" },
            new() { Id = s8Id, Name = "Health, Environment, and Fire Permits", Agency = "BOSS", Description = "Desc", Actions = "Action" },
            new() { Id = s9Id, Name = "Claim Business Permit and Sticker", Agency = "BOSS", Description = "Desc", Actions = "Action" },
            new() { Id = s10aId, Name = "BIR Business Registration for Sole Proprietors", Agency = "BIR", Description = "Desc", Actions = "Action" },
            new() { Id = s10bId, Name = "BIR Business Registration for Corporations and Partnerships", Agency = "BIR", Description = "Desc", Actions = "Action" }
        };

        var requirements = new List<Requirement>();
        var rules = new List<RoadmapRule>();

        // Step 1A reqs (5)
        for (int i = 1; i <= 5; i++)
        {
            var reqId = new Guid($"55555555-5555-5555-5555-00000001a00{i}");
            requirements.Add(new Requirement { Id = reqId, StepId = s1aId, Name = $"1A Req {i}" });
            rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s1aId, RequirementId = reqId, BusinessType = "Sole Proprietorship", Effect = RoadmapRuleEffect.Include, SortOrder = i });
        }
        rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s1aId, BusinessType = "Sole Proprietorship", Effect = RoadmapRuleEffect.Include, SortOrder = 1 });

        // Step 1B reqs (6)
        for (int i = 1; i <= 6; i++)
        {
            var reqId = new Guid($"55555555-5555-5555-5555-00000001b0{i:D2}");
            requirements.Add(new Requirement { Id = reqId, StepId = s1bId, Name = $"1B Req {i}" });
            if (i == 1 || i == 5 || i == 6)
            {
                foreach (var bt in new[] { "Partnership", "Corporation", "One Person Corporation" })
                {
                    rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s1bId, RequirementId = reqId, BusinessType = bt, Effect = RoadmapRuleEffect.Include, SortOrder = i });
                }
            }
            else if (i == 2 || i == 4)
            {
                foreach (var bt in new[] { "Corporation", "One Person Corporation" })
                {
                    rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s1bId, RequirementId = reqId, BusinessType = bt, Effect = RoadmapRuleEffect.Include, SortOrder = i });
                }
            }
            else if (i == 3)
            {
                rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s1bId, RequirementId = reqId, BusinessType = "Partnership", Effect = RoadmapRuleEffect.Include, SortOrder = i });
            }
        }
        foreach (var bt in new[] { "Partnership", "Corporation", "One Person Corporation" })
        {
            rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s1bId, BusinessType = bt, Effect = RoadmapRuleEffect.Include, SortOrder = 1 });
        }

        // Steps 2-9 common rules
        rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s2Id, Effect = RoadmapRuleEffect.Include, SortOrder = 2 });
        rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s3Id, Effect = RoadmapRuleEffect.Include, SortOrder = 3 });
        rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s4Id, Effect = RoadmapRuleEffect.Include, SortOrder = 4 });
        rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s5Id, Effect = RoadmapRuleEffect.Include, SortOrder = 5 });
        rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s6Id, Effect = RoadmapRuleEffect.Include, SortOrder = 6 });
        rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s7Id, Effect = RoadmapRuleEffect.Include, SortOrder = 7 });
        rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s8Id, Effect = RoadmapRuleEffect.Include, SortOrder = 8 });
        rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s9Id, Effect = RoadmapRuleEffect.Include, SortOrder = 9 });

        // Step 2 reqs (6)
        for (int i = 1; i <= 6; i++)
        {
            var reqId = new Guid($"55555555-5555-5555-5555-00000000200{i}");
            requirements.Add(new Requirement { Id = reqId, StepId = s2Id, Name = $"Step2 Req {i}" });
            rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s2Id, RequirementId = reqId, Effect = RoadmapRuleEffect.Include, SortOrder = i });
        }

        // Step 3 reqs (8)
        for (int i = 1; i <= 8; i++)
        {
            var reqId = new Guid($"55555555-5555-5555-5555-00000000300{i}");
            requirements.Add(new Requirement { Id = reqId, StepId = s3Id, Name = $"Step3 Req {i}" });
            rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s3Id, RequirementId = reqId, Effect = RoadmapRuleEffect.Include, SortOrder = i });
        }

        // Step 4 reqs (1)
        var req4Id = new Guid("55555555-5555-5555-5555-000000004001");
        requirements.Add(new Requirement { Id = req4Id, StepId = s4Id, Name = "Step4 Req 1" });
        rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s4Id, RequirementId = req4Id, Effect = RoadmapRuleEffect.Include, SortOrder = 1 });

        // Step 5 common reqs (10)
        for (int i = 1; i <= 10; i++)
        {
            var reqId = new Guid($"55555555-5555-5555-5555-000000005{i:D3}");
            requirements.Add(new Requirement { Id = reqId, StepId = s5Id, Name = $"Step5 Common Req {i}" });
            rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s5Id, RequirementId = reqId, Effect = RoadmapRuleEffect.Include, SortOrder = i });
        }

        // Step 5 F&B reqs (4: 5011..5014)
        for (int i = 11; i <= 14; i++)
        {
            var reqId = new Guid($"55555555-5555-5555-5555-000000005{i:D3}");
            requirements.Add(new Requirement { Id = reqId, StepId = s5Id, Name = $"Step5 FB Req {i}" });
            rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s5Id, RequirementId = reqId, CategoryId = FoodId, Effect = RoadmapRuleEffect.Include, SortOrder = i });
        }

        // Step 5 Retail reqs (5: 5015..5019)
        for (int i = 15; i <= 19; i++)
        {
            var reqId = new Guid($"55555555-5555-5555-5555-000000005{i:D3}");
            requirements.Add(new Requirement { Id = reqId, StepId = s5Id, Name = $"Step5 Retail Req {i}" });
            rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s5Id, RequirementId = reqId, CategoryId = RetailId, Effect = RoadmapRuleEffect.Include, SortOrder = i });
        }

        // Step 5 Services reqs (9: 5020..5028)
        for (int i = 20; i <= 28; i++)
        {
            var reqId = new Guid($"55555555-5555-5555-5555-000000005{i:D3}");
            requirements.Add(new Requirement { Id = reqId, StepId = s5Id, Name = $"Step5 Services Req {i}" });
            rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s5Id, RequirementId = reqId, CategoryId = ServicesId, Effect = RoadmapRuleEffect.Include, SortOrder = i });
        }

        // Step 6 req (1)
        var req6Id = new Guid("55555555-5555-5555-5555-000000006001");
        requirements.Add(new Requirement { Id = req6Id, StepId = s6Id, Name = "Step6 Req 1" });
        rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s6Id, RequirementId = req6Id, Effect = RoadmapRuleEffect.Include, SortOrder = 1 });

        // Step 7 req (1)
        var req7Id = new Guid("55555555-5555-5555-5555-000000007001");
        requirements.Add(new Requirement { Id = req7Id, StepId = s7Id, Name = "Step7 Req 1" });
        rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s7Id, RequirementId = req7Id, Effect = RoadmapRuleEffect.Include, SortOrder = 1 });

        // Step 8 common reqs
        foreach (var (rId, sOrder, name) in new[] { ("55555555-5555-5555-5555-000000008001", 1, "Sanitary Permit"), ("55555555-5555-5555-5555-000000008006", 6, "Environmental clearance from CENRO"), ("55555555-5555-5555-5555-000000008007", 7, "Fire Safety Inspection Permit for your business permit") })
        {
            var reqId = new Guid(rId);
            requirements.Add(new Requirement { Id = reqId, StepId = s8Id, Name = name });
            rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s8Id, RequirementId = reqId, Effect = RoadmapRuleEffect.Include, SortOrder = sOrder });
        }

        // Step 8 F&B reqs
        foreach (var (rId, sOrder, name) in new[] { ("55555555-5555-5555-5555-000000008002", 2, "Health Certificate for food workers"), ("55555555-5555-5555-5555-000000008005", 5, "Pest control contract") })
        {
            var reqId = new Guid(rId);
            requirements.Add(new Requirement { Id = reqId, StepId = s8Id, Name = name });
            rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s8Id, RequirementId = reqId, CategoryId = FoodId, Effect = RoadmapRuleEffect.Include, SortOrder = sOrder });
        }

        // Step 8 Retail req
        var req8Retail = new Guid("55555555-5555-5555-5555-000000008003");
        requirements.Add(new Requirement { Id = req8Retail, StepId = s8Id, Name = "Health Certificate" });
        rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s8Id, RequirementId = req8Retail, CategoryId = RetailId, Effect = RoadmapRuleEffect.Include, SortOrder = 2 });

        // Step 8 Services req
        var req8Services = new Guid("55555555-5555-5555-5555-000000008004");
        requirements.Add(new Requirement { Id = req8Services, StepId = s8Id, Name = "Health Certificate" });
        rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s8Id, RequirementId = req8Services, CategoryId = ServicesId, Effect = RoadmapRuleEffect.Include, SortOrder = 2 });

        // Step 9 reqs (5)
        for (int i = 1; i <= 5; i++)
        {
            var reqId = new Guid($"55555555-5555-5555-5555-00000000900{i}");
            requirements.Add(new Requirement { Id = reqId, StepId = s9Id, Name = $"Step9 Req {i}" });
            rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s9Id, RequirementId = reqId, Effect = RoadmapRuleEffect.Include, SortOrder = i });
        }

        // Step 10A reqs (11)
        for (int i = 1; i <= 11; i++)
        {
            var reqId = new Guid($"55555555-5555-5555-5555-00000010a0{i:D2}");
            requirements.Add(new Requirement { Id = reqId, StepId = s10aId, Name = $"10A Req {i}" });
            rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s10aId, RequirementId = reqId, BusinessType = "Sole Proprietorship", Effect = RoadmapRuleEffect.Include, SortOrder = i });
        }
        rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s10aId, BusinessType = "Sole Proprietorship", Effect = RoadmapRuleEffect.Include, SortOrder = 10 });

        // Step 10B reqs (14)
        for (int i = 1; i <= 14; i++)
        {
            var reqId = new Guid($"55555555-5555-5555-5555-00000010b0{i:D2}");
            requirements.Add(new Requirement { Id = reqId, StepId = s10bId, Name = $"10B Req {i}" });
            if (i == 1 || (i >= 6 && i <= 14))
            {
                foreach (var bt in new[] { "Partnership", "Corporation", "One Person Corporation" })
                {
                    rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s10bId, RequirementId = reqId, BusinessType = bt, Effect = RoadmapRuleEffect.Include, SortOrder = i });
                }
            }
            else if (i == 2 || i == 4)
            {
                foreach (var bt in new[] { "Corporation", "One Person Corporation" })
                {
                    rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s10bId, RequirementId = reqId, BusinessType = bt, Effect = RoadmapRuleEffect.Include, SortOrder = i });
                }
            }
            else if (i == 3 || i == 5)
            {
                rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s10bId, RequirementId = reqId, BusinessType = "Partnership", Effect = RoadmapRuleEffect.Include, SortOrder = i });
            }
        }
        foreach (var bt in new[] { "Partnership", "Corporation", "One Person Corporation" })
        {
            rules.Add(new RoadmapRule { Id = Guid.NewGuid(), StepId = s10bId, BusinessType = bt, Effect = RoadmapRuleEffect.Include, SortOrder = 10 });
        }

        return (steps, requirements, rules);
    }

    [Fact]
    public void GenerateRoadmap_CityIdFilter_RespectsMatchAndMismatch()
    {
        var engine = new RoadmapEngine();
        var stepId = Guid.NewGuid();
        var steps = new List<RegistrationStep>
        {
            new() { Id = stepId, Name = "City Step", Agency = "City", Description = "Desc", Actions = "Action" }
        };
        var rules = new List<RoadmapRule>
        {
            new() { Id = Guid.NewGuid(), StepId = stepId, CityId = PasigId, Effect = RoadmapRuleEffect.Include, SortOrder = 1 }
        };

        var matchingResult = engine.GenerateRoadmap("Sole Proprietorship", FoodId, PasigId, rules, steps, []);
        Assert.Single(matchingResult.Steps);

        var otherCityId = Guid.NewGuid();
        var mismatchResult = engine.GenerateRoadmap("Sole Proprietorship", FoodId, otherCityId, rules, steps, []);
        Assert.Empty(mismatchResult.Steps);
    }

    [Fact]
    public void GenerateRoadmap_CategoryIdFilter_RespectsMatchAndMismatch()
    {
        var engine = new RoadmapEngine();
        var stepId = Guid.NewGuid();
        var reqId = Guid.NewGuid();
        var steps = new List<RegistrationStep>
        {
            new() { Id = stepId, Name = "Step", Agency = "Agency", Description = "Desc", Actions = "Action" }
        };
        var reqs = new List<Requirement>
        {
            new() { Id = reqId, StepId = stepId, Name = "Req" }
        };
        var rules = new List<RoadmapRule>
        {
            new() { Id = Guid.NewGuid(), StepId = stepId, Effect = RoadmapRuleEffect.Include, SortOrder = 1 },
            new() { Id = Guid.NewGuid(), StepId = stepId, RequirementId = reqId, CategoryId = FoodId, Effect = RoadmapRuleEffect.Include, SortOrder = 1 }
        };

        var matchingResult = engine.GenerateRoadmap("Sole Proprietorship", FoodId, PasigId, rules, steps, reqs);
        Assert.Single(matchingResult.Steps[0].Requirements);

        var mismatchResult = engine.GenerateRoadmap("Sole Proprietorship", RetailId, PasigId, rules, steps, reqs);
        Assert.Empty(mismatchResult.Steps[0].Requirements);
    }

    [Fact]
    public void GenerateRoadmap_SortingAndStability_OrdersCorrectlyAndNumbersConsecutively()
    {
        var engine = new RoadmapEngine();
        var step1Id = Guid.NewGuid();
        var step2Id = Guid.NewGuid();
        var req1Id = Guid.NewGuid();
        var req2Id = Guid.NewGuid();

        var steps = new List<RegistrationStep>
        {
            new() { Id = step2Id, Name = "Second Step", Agency = "Agency", Description = "Desc", Actions = "Action" },
            new() { Id = step1Id, Name = "First Step", Agency = "Agency", Description = "Desc", Actions = "Action" }
        };
        var reqs = new List<Requirement>
        {
            new() { Id = req2Id, StepId = step1Id, Name = "Req B" },
            new() { Id = req1Id, StepId = step1Id, Name = "Req A" }
        };
        var rules = new List<RoadmapRule>
        {
            new() { Id = Guid.NewGuid(), StepId = step1Id, Effect = RoadmapRuleEffect.Include, SortOrder = 1 },
            new() { Id = Guid.NewGuid(), StepId = step2Id, Effect = RoadmapRuleEffect.Include, SortOrder = 2 },
            new() { Id = Guid.NewGuid(), StepId = step1Id, RequirementId = req1Id, Effect = RoadmapRuleEffect.Include, SortOrder = 1 },
            new() { Id = Guid.NewGuid(), StepId = step1Id, RequirementId = req2Id, Effect = RoadmapRuleEffect.Include, SortOrder = 2 }
        };

        var result = engine.GenerateRoadmap("Sole Proprietorship", FoodId, PasigId, rules, steps, reqs);

        Assert.Equal(2, result.Steps.Count);
        Assert.Equal(1, result.Steps[0].Number);
        Assert.Equal("First Step", result.Steps[0].Step.Name);
        Assert.Equal(2, result.Steps[1].Number);
        Assert.Equal("Second Step", result.Steps[1].Step.Name);

        Assert.Equal(2, result.Steps[0].Requirements.Count);
        Assert.Equal("Req A", result.Steps[0].Requirements[0].Requirement.Name);
        Assert.Equal("Req B", result.Steps[0].Requirements[1].Requirement.Name);
    }
}
