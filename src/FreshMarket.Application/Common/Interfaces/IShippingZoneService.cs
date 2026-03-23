using FreshMarket.Application.ShippingZones.Models;

namespace FreshMarket.Application.Common.Interfaces;

public interface IShippingZoneService
{
    Task<IEnumerable<ShippingZoneDto>> GetAllAsync(CancellationToken ct);
    Task<ShippingZoneDto> GetByPostalCodeAsync(string postalCodePrefix, CancellationToken ct);
    Task<ShippingZoneDto> CreateAsync(string postalCodePrefix, string city, decimal shippingFee, decimal minOrderValue, CancellationToken ct);
    Task<ShippingZoneDto> UpdateAsync(int id, decimal shippingFee, decimal minOrderValue, bool isActive, CancellationToken ct);
}
