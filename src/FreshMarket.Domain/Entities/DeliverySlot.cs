using FreshMarket.Domain.Common;

namespace FreshMarket.Domain.Entities;

public class DeliverySlot : BaseEntity
{
    public DateOnly DeliveryDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int MaxOrders { get; set; }
    public int CurrentOrders { get; set; }
    public int? ShippingZoneId { get; set; }
    public bool IsActive { get; set; } = true;

    public ShippingZone? ShippingZone { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}