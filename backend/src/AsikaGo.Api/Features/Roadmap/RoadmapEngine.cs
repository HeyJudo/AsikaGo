using AsikaGo.Api.Data.Entities;

namespace AsikaGo.Api.Features.Roadmap;

public class RoadmapEngine
{
    public RoadmapEngineResult GenerateRoadmap(
        string businessType,
        Guid categoryId,
        Guid cityId,
        IEnumerable<RoadmapRule> rules,
        IEnumerable<RegistrationStep> steps,
        IEnumerable<Requirement> requirements)
    {
        var ruleList = rules.ToList();
        var stepList = steps.ToList();
        var reqList = requirements.ToList();

        // 1. Filter matching rules
        var matchingRules = ruleList.Where(r => RuleMatches(r, businessType, categoryId, cityId)).ToList();

        // 2. Evaluate steps
        var stepResults = new List<(RegistrationStep Step, RoadmapRule Rule, int SortOrder)>();

        foreach (var step in stepList)
        {
            var stepRules = matchingRules.Where(r => r.StepId == step.Id && r.RequirementId == null).ToList();

            // Exclude wins over include
            var hasExclude = stepRules.Any(r => r.Effect == RoadmapRuleEffect.Exclude);
            if (hasExclude) continue;

            var includeRules = stepRules.Where(r => r.Effect == RoadmapRuleEffect.Include).ToList();
            if (includeRules.Count > 0)
            {
                // Order by sort order, pick the first rule for sorting
                var bestRule = includeRules.OrderBy(r => r.SortOrder).ThenBy(r => r.Id).First();
                stepResults.Add((step, bestRule, bestRule.SortOrder));
            }
        }

        // Order steps by sort order, secondary sort by Step ID for stability
        var orderedSteps = stepResults
            .OrderBy(s => s.SortOrder)
            .ThenBy(s => s.Step.Id)
            .ToList();

        var finalSteps = new List<EngineStepResult>();
        int stepNumber = 1;

        foreach (var (step, stepRule, stepSortOrder) in orderedSteps)
        {
            var orderedReqs = RequirementsFor(step.Id, matchingRules, reqList);

            finalSteps.Add(new EngineStepResult(step, stepNumber++, stepSortOrder, orderedReqs));
        }

        return new RoadmapEngineResult(finalSteps);
    }

    // Requirements of one step for this profile. Used for saved roadmaps too, so it does not
    // check whether the current rules would still include the step (D14).
    public IReadOnlyList<EngineRequirementResult> GetStepRequirements(
        Guid stepId,
        string businessType,
        Guid categoryId,
        Guid cityId,
        IEnumerable<RoadmapRule> rules,
        IEnumerable<Requirement> requirements)
    {
        var matchingRules = rules.Where(r => RuleMatches(r, businessType, categoryId, cityId)).ToList();
        return RequirementsFor(stepId, matchingRules, requirements.ToList());
    }

    private static List<EngineRequirementResult> RequirementsFor(Guid stepId, List<RoadmapRule> matchingRules, List<Requirement> reqList)
    {
        var reqResults = new List<EngineRequirementResult>();

        foreach (var req in reqList.Where(req => req.StepId == stepId))
        {
            var reqRules = matchingRules.Where(r => r.RequirementId == req.Id).ToList();

            var reqHasExclude = reqRules.Any(r => r.Effect == RoadmapRuleEffect.Exclude);
            if (reqHasExclude) continue;

            var reqIncludeRules = reqRules.Where(r => r.Effect == RoadmapRuleEffect.Include).ToList();
            if (reqIncludeRules.Count > 0)
            {
                var bestReqRule = reqIncludeRules.OrderBy(r => r.SortOrder).ThenBy(r => r.Id).First();
                reqResults.Add(new EngineRequirementResult(
                    req,
                    bestReqRule.CategoryId,
                    bestReqRule.SortOrder));
            }
        }

        // Order requirements by sort order, secondary sort by Requirement ID for stability
        return reqResults
            .OrderBy(r => r.SortOrder)
            .ThenBy(r => r.Requirement.Id)
            .ToList();
    }

    private static bool RuleMatches(RoadmapRule rule, string businessType, Guid categoryId, Guid cityId)
    {
        if (rule.CategoryId.HasValue && rule.CategoryId.Value != categoryId) return false;
        if (rule.CityId.HasValue && rule.CityId.Value != cityId) return false;
        if (!string.IsNullOrEmpty(rule.BusinessType) && !string.Equals(rule.BusinessType, businessType, StringComparison.Ordinal)) return false;
        return true;
    }
}

public record RoadmapEngineResult(IReadOnlyList<EngineStepResult> Steps);

public record EngineStepResult(
    RegistrationStep Step,
    int Number,
    int SortOrder,
    IReadOnlyList<EngineRequirementResult> Requirements);

public record EngineRequirementResult(
    Requirement Requirement,
    Guid? AppliesToCategoryId,
    int SortOrder);
