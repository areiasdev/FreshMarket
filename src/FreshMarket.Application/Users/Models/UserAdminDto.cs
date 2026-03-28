namespace FreshMarket.Application.Users.Models;

public class UserAdminDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int OrderCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
