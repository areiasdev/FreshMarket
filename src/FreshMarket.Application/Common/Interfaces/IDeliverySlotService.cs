using FreshMarket.Application.DeliverySlots.Models;

namespace FreshMarket.Application.Common.Interfaces;

public interface IDeliverySlotService
{
    Task<IEnumerable<DeliverySlotDto>> GetAvailableAsync(DateOnly date, string postalCodePrefix, CancellationToken ct);
    Task<IEnumerable<DeliverySlotDto>> GetByDateAsync(DateOnly date, CancellationToken ct);
    Task DeleteAsync(int id, CancellationToken ct);
}