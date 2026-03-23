namespace FreshMarket.Application.Products.Models;

public class ProductListDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PricePerUnit { get; set; }
    public UnitType UnitType { get; set; }
    public decimal StockQuantity { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsSeasonal { get; set; }
    public string CategoryName { get; set; } = string.Empty;
}
