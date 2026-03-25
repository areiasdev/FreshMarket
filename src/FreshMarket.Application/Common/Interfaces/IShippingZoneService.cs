using FreshMarket.Application.DeliverySlots.Models;
using FreshMarket.Application.ShippingZones.Models;

namespace FreshMarket.Application.Common.Interfaces;

public interface IShippingZoneService
{
    Task<IEnumerable<ShippingZoneDto>> GetAllAsync(CancellationToken ct);
    Task<ShippingZoneDto> GetByPostalCodeAsync(string postalCodePrefix, CancellationToken ct);
    Task<ShippingZoneDto> CreateAsync(string postalCodePrefix, string city, decimal shippingFee, decimal minOrderValue, CancellationToken ct);
    Task<ShippingZoneDto> UpdateAsync(int id, string city, string postalCodePrefix, decimal shippingFee, decimal minOrderValue, bool isActive, CancellationToken ct);
    Task<PagedResult<ShippingZoneDto>> GetAdminListAsync(int page, int pageSize, CancellationToken ct);
}
