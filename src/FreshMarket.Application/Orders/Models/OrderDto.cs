namespace FreshMarket.Application.Orders.Models;

public class OrderDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public OrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal ShippingFee { get; set; }
    public string? PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public string? ExternalTransactionId { get; set; }
    public string? Notes { get; set; }
    public string DeliveryAddress { get; set; } = string.Empty;
    public string DeliveryPostalCode { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DeliverySlotInfo? DeliverySlot { get; set; }
    public List<OrderItemDto> Items { get; set; } = [];
}

public class DeliverySlotInfo
{
    public DateOnly DeliveryDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}
