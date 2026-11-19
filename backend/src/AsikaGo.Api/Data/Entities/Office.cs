namespace AsikaGo.Api.Data.Entities;

public enum OfficeAccess { Online, InPerson }

public sealed class Office
{
    public Guid Id { get; set; }
    public Guid StepId { get; set; }
    public Guid? CityId { get; set; }
    public int SortOrder { get; set; }
    public required string Name { get; set; }
    public OfficeAccess Access { get; set; }
    public string? Address { get; set; }
    public string? Website { get; set; }
    public string? Hours { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? MapsUrl { get; set; }
    public required string Source { get; set; }
    public bool IsVerified { get; set; }
    public DateOnly CheckedOn { get; set; }
}
