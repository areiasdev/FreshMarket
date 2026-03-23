using FreshMarket.Domain.Common;

namespace FreshMarket.Domain.Entities;

public class ShippingZone : BaseEntity
{
    public string PostalCodePrefix { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public decimal ShippingFee { get; set; }
    public decimal MinOrderValue { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<DeliverySlot> DeliverySlots { get; set; } = new List<DeliverySlot>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}