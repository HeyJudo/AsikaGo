namespace AsikaGo.Api.Data.Entities;

public class RoadmapRule
{
    public Guid Id { get; set; }
    public Guid? CategoryId { get; set; } // null = any category
    public BusinessCategory? Category { get; set; }
    public Guid? CityId { get; set; } // null = any city
    public City? City { get; set; }
    public Guid StepId { get; set; }
    public RegistrationStep? Step { get; set; }
    public Guid? RequirementId { get; set; } // null = rule is about the whole step
    public Requirement? Requirement { get; set; }
    public RoadmapRuleEffect Effect { get; set; }
    public int SortOrder { get; set; }
}
