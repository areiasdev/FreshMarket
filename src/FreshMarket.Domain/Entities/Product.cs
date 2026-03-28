using FreshMarket.Domain.Common;
using FreshMarket.Domain.Enums;

namespace FreshMarket.Domain.Entities;

public class Product : BaseEntity
{
    public int CategoryId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public decimal PricePerUnit { get; set; }
    public decimal MinQuantity { get; set; } = 1;
    public UnitType UnitType { get; set; } = UnitType.Unit;
    public bool IsActive { get; set; } = true;
    public bool IsSeasonal { get; set; } = false;

    // Stock
    public decimal StockQuantity { get; set; } = 0;
    public bool TrackStock { get; set; } = true;
    public decimal LowStockAlert { get; set; } = 5;

    public decimal ReservedStock { get; set; } = 0;

    public Category Category { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
}