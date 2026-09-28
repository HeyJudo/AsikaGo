namespace AsikaGo.Api.Data.Entities;

public class SourceReference
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Url { get; set; }
    public DateOnly? DateVerified { get; set; }
}
