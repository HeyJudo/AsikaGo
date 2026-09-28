namespace AsikaGo.Api.Data.Entities;

public class RequirementProgress
{
    public Guid RoadmapId { get; set; }
    public UserRoadmap? Roadmap { get; set; }
    public Guid RequirementId { get; set; }
    public Requirement? Requirement { get; set; }
    public bool IsPrepared { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
