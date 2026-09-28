namespace AsikaGo.Api.Data.Entities;

public class BusinessProfile
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Profile? User { get; set; }
    public string? BusinessName { get; set; }
    public required string BusinessType { get; set; }
    public Guid CategoryId { get; set; }
    public BusinessCategory? Category { get; set; }
    public Guid CityId { get; set; }
    public City? City { get; set; }
    public RegistrationStatus RegistrationStatus { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
