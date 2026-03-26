using FreshMarket.Domain.Common;

namespace FreshMarket.Domain.Entities;

public class Address : BaseEntity
{
    public int UserId { get; set; }
    public string Label { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = "PT";
    public bool IsDefault { get; set; } = false;

    public User User { get; set; } = null!;
}