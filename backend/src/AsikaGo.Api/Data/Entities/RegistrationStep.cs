namespace AsikaGo.Api.Data.Entities;

public class RegistrationStep
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Agency { get; set; }
    public required string Description { get; set; }
}
