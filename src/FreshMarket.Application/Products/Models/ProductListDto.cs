namespace FreshMarket.Application.Products.Models;

public class ProductListDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal PricePerUnit { get; set; }
    public decimal MinQuantity { get; set; }
    public UnitType UnitType { get; set; }
    public bool IsSeasonal { get; set; }
    public bool InStock => !TrackStock || StockQuantity > 0;
    public string CategoryName { get; set; } = string.Empty;
    public int CategoryId { get; set; }

    public bool IsActive { get; set; }

    // Stock info — só exposto se necessário
    public bool TrackStock { get; set; }
    public decimal StockQuantity { get; set; }
    public decimal LowStockAlert { get; set; }

    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}

public class ProductDetailDto : ProductListDto
{
    public string? Description { get; set; }
}
