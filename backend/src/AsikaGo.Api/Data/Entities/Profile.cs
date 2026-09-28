namespace AsikaGo.Api.Data.Entities;

public class Profile
{
    public Guid Id { get; set; } // = auth.users.id, not DB-generated
    public string? Email { get; set; }
    public string? DisplayName { get; set; }
    public bool IsAnonymous { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
