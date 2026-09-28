namespace AsikaGo.Api.Data.Entities;

public class Requirement
{
    public Guid Id { get; set; }
    public Guid StepId { get; set; }
    public RegistrationStep? Step { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public Guid? SourceId { get; set; }
    public SourceReference? Source { get; set; }
}
