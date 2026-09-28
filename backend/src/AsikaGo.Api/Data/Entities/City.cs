namespace AsikaGo.Api.Data.Entities;

public class City
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Region { get; set; }
}
