using FreshMarket.Domain.Common;

namespace FreshMarket.Domain.Entities;

public class User : BaseEntity
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? PostalCode { get; set; }
    public string Role { get; set; } = "Customer";

    public ICollection<Order> Orders { get; set; } = new List<Order>();
}