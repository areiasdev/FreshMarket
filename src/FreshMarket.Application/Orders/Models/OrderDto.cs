using FreshMarket.Application.DeliverySlots.Models;

namespace FreshMarket.Application.Orders.Models;

public class OrderDto
{
    public int Id { get; set; }
    public string? OrderNumber { get; set; }
    public int UserId { get; set; }
    public OrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal ShippingFee { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }

    // Morada snapshot
    public string DeliveryStreet { get; set; } = string.Empty;
    public string DeliveryPostalCode { get; set; } = string.Empty;
    public string DeliveryCity { get; set; } = string.Empty;
    public string DeliveryCountry { get; set; } = string.Empty;

    // Pagamento — do último Payment
    public PaymentMethodEnum? PaymentMethod { get; set; }
    public PaymentStatusEnum? PaymentStatus { get; set; }
    public string? ExternalTransactionId { get; set; }

    public DeliverySlotInfo? DeliverySlot { get; set; }
    public List<OrderItemDto> Items { get; set; } = [];
}
