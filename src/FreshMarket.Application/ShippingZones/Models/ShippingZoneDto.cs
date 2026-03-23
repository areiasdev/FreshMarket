namespace FreshMarket.Application.ShippingZones.Models;

public class ShippingZoneDto
{
    public int Id { get; set; }
    public string PostalCodePrefix { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public decimal ShippingFee { get; set; }
    public decimal MinOrderValue { get; set; }
    public bool IsActive { get; set; }
}
