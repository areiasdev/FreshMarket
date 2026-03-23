using FreshMarket.Application.DeliverySlots.Models;

namespace FreshMarket.Application.Common.Interfaces;

public interface IDeliverySlotService
{
    Task<IEnumerable<DeliverySlotDto>> GetAvailableAsync(DateOnly date, string postalCodePrefix, CancellationToken ct);
    Task<IEnumerable<DeliverySlotDto>> GetByDateAsync(DateOnly date, CancellationToken ct);
    Task<DeliverySlotDto> CreateAsync(DateOnly deliveryDate, TimeOnly startTime, TimeOnly endTime, int maxOrders, int? shippingZoneId, CancellationToken ct);
    Task<DeliverySlotDto> UpdateAsync(int id, int maxOrders, bool isActive, CancellationToken ct);
    Task DeleteAsync(int id, CancellationToken ct);
}
