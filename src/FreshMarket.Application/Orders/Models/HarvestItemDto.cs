namespace FreshMarket.Application.Orders.Models;

public class HarvestItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public UnitType UnitType { get; set; }
    public decimal TotalQuantity { get; set; }
}
