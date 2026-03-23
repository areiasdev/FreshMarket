namespace FreshMarket.Application.Orders.Models;

public class OrderSummaryDto
{
    public int Id { get; set; }
    public OrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal ShippingFee { get; set; }
    public string? PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateOnly? DeliveryDate { get; set; }
    public int ItemCount { get; set; }
}
