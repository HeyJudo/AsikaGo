namespace AsikaGo.Api.Data.Entities;

public class RoadmapProgress
{
    public Guid Id { get; set; }
    public Guid RoadmapId { get; set; }
    public UserRoadmap? Roadmap { get; set; }
    public Guid StepId { get; set; }
    public RegistrationStep? Step { get; set; }
    public int SortOrder { get; set; }
    public RoadmapStepStatus Status { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
}
