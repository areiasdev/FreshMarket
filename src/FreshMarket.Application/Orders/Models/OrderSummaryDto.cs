using FreshMarket.Application.DeliverySlots.Models;
using FreshMarket.Domain.Enums;
namespace FreshMarket.Application.Orders.Models;

public class OrderSummaryDto
{
    public int Id { get; set; }
    public string? OrderNumber { get; set; }
    public OrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal ShippingFee { get; set; }
    public DateTime CreatedAt { get; set; }
    public string DeliveryCity { get; set; } = string.Empty;
    public string DeliveryPostalCode { get; set; } = string.Empty;
    public int ItemCount { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public DeliverySlotInfo? DeliverySlot { get; set; }

    public DateOnly? PreferredDeliveryDate { get; set; }
}
