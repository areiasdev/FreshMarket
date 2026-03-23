namespace FreshMarket.Application.Orders.Models;

public class OrderItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public UnitType UnitType { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
}
