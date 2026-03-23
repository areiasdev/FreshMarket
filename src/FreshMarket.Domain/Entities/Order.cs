using FreshMarket.Domain.Common;
using FreshMarket.Domain.Enums;

namespace FreshMarket.Domain.Entities;

public class Order : BaseEntity
{
    public int UserId { get; set; }
    public int DeliverySlotId { get; set; }
    public int ShippingZoneId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal TotalAmount { get; set; }
    public decimal ShippingFee { get; set; }
    public string? PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
    public string? ExternalTransactionId { get; set; }
    public string? Notes { get; set; }
    public string DeliveryAddress { get; set; } = string.Empty;
    public string DeliveryPostalCode { get; set; } = string.Empty;

    public User User { get; set; } = null!;
    public DeliverySlot DeliverySlot { get; set; } = null!;
    public ShippingZone ShippingZone { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
}
