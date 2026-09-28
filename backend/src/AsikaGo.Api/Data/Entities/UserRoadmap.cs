namespace AsikaGo.Api.Data.Entities;

public class UserRoadmap
{
    public Guid Id { get; set; }
    public Guid BusinessId { get; set; }
    public BusinessProfile? Business { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
