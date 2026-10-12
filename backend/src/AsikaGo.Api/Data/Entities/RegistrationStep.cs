namespace AsikaGo.Api.Data.Entities;

public class RegistrationStep
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Agency { get; set; }
    public required string Description { get; set; }
    public required string Actions { get; set; } // one action per line
    public string? ConditionNote { get; set; } // nullable, for conditional steps only
}
