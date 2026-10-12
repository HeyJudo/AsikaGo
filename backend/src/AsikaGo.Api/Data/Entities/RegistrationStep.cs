namespace AsikaGo.Api.Data.Entities;

public class RegistrationStep
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Agency { get; set; }
    public required string Description { get; set; }
    public string? Actions { get; set; } // null = no actions specified (one action per line)
    public string? ConditionNote { get; set; } // nullable, for conditional steps only
}
