using FreshMarket.Domain.Common;
using FreshMarket.Domain.Enums;

namespace FreshMarket.Domain.Entities;

public class Order : BaseEntity
{
    public int UserId { get; set; }
    public int DeliverySlotId { get; set; }
    public int? AddressId { get; set; }

    // Snapshot imutável no momento da encomenda
    public string DeliveryStreet { get; set; } = string.Empty;
    public string DeliveryPostalCode { get; set; } = string.Empty;
    public string DeliveryCity { get; set; } = string.Empty;
    public string DeliveryCountry { get; set; } = "PT";

    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal TotalAmount { get; set; }
    public decimal ShippingFee { get; set; }
    public string? Notes { get; set; }
    public string? OrderNumber { get; set; } // ex: "FM-20260326-0001"

    public DateTime? PaidAt { get; set; }

    public User User { get; set; } = null!;
    public DeliverySlot DeliverySlot { get; set; } = null!;
    public Address? Address { get; set; }

    public ICollection<OrderItem> Items { get; set; } = [];
    public ICollection<Payment> Payments { get; set; } = [];
}
