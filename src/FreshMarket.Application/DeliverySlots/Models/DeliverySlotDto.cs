namespace FreshMarket.Application.DeliverySlots.Models;

public class DeliverySlotDto
{
    public int Id { get; set; }
    public DateOnly DeliveryDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int MaxOrders { get; set; }
    public int CurrentOrders { get; set; }
    public decimal ShippingFee { get; set; }
    public bool IsActive { get; set; }
    public int AvailableSpots => MaxOrders - CurrentOrders;
}
