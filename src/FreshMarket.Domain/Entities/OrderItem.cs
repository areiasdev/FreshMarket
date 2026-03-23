using FreshMarket.Domain.Common;

namespace FreshMarket.Domain.Entities;

public class OrderItem : BaseEntity
{
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }

    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
