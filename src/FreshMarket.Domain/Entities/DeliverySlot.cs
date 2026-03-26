using FreshMarket.Domain.Common;
using System.ComponentModel.DataAnnotations;

namespace FreshMarket.Domain.Entities;

public class DeliverySlot : BaseEntity
{
    public DateOnly DeliveryDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int MaxOrders { get; set; }
    public int CurrentOrders { get; set; } = 0;
    public decimal ShippingFee { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    [Timestamp]
    public byte[] RowVersion { get; set; } = default!;

    public ICollection<Order> Orders { get; set; } = [];
}