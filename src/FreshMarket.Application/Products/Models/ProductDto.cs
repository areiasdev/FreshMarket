namespace FreshMarket.Application.Products.Models;

public class ProductDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal PricePerUnit { get; set; }
    public UnitType UnitType { get; set; }
    public decimal MinQuantity { get; set; }
    public decimal StockQuantity { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsSeasonal { get; set; }
    public bool IsActive { get; set; }
}
