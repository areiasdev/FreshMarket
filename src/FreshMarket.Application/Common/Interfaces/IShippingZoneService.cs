using FreshMarket.Application.ShippingZones.Models;

namespace FreshMarket.Application.Common.Interfaces;

public interface IShippingZoneService
{
    Task<IEnumerable<ShippingZoneDto>> GetAllAsync(CancellationToken ct);
    Task<ShippingZoneDto?> GetByPostalCodeAsync(string postalCodePrefix, CancellationToken ct);
}