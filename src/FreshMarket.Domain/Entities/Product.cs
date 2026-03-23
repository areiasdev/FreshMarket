using FreshMarket.Domain.Common;
using FreshMarket.Domain.Enums;

namespace FreshMarket.Domain.Entities;

public class Product : BaseEntity
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal PricePerUnit { get; set; }
    public UnitType UnitType { get; set; }
    public decimal MinQuantity { get; set; } = 1;
    public decimal StockQuantity { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsSeasonal { get; set; }
    public bool IsActive { get; set; } = true;

    public Category Category { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}