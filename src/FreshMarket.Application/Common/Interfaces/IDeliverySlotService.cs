using FreshMarket.Application.DeliverySlots.Models;

namespace FreshMarket.Application.Common.Interfaces;

public interface IDeliverySlotService
{
    Task<IEnumerable<DeliverySlotDto>> GetAvailableAsync(DateOnly date, CancellationToken ct);
    Task<IEnumerable<DeliverySlotDto>> GetByDateAsync(DateOnly date, CancellationToken ct);
    Task<DeliverySlotDto> CreateAsync(DateOnly deliveryDate, TimeOnly startTime, TimeOnly endTime, int maxOrders, decimal shippingFee, CancellationToken ct);
    Task<DeliverySlotDto> UpdateAsync(int id, int maxOrders, decimal shippingFee, bool isActive, CancellationToken ct);
    Task DeleteAsync(int id, CancellationToken ct);
    Task<PagedResult<DeliverySlotDto>> GetAdminListAsync(int page, int pageSize, CancellationToken ct);
}