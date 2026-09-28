namespace AsikaGo.Api.Data.Entities;

public class BusinessCategory
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
}
