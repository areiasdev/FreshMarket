using FreshMarket.Application.Orders.Models;

namespace FreshMarket.Application.Common.Interfaces;

public interface IOrderService
{
    Task<OrderDto> GetByIdAsync(int id, CancellationToken ct);
    Task<IEnumerable<OrderSummaryDto>> GetMyOrdersAsync(int userId, CancellationToken ct);
    Task<IEnumerable<OrderSummaryDto>> GetByStatusAsync(OrderStatus status, CancellationToken ct);
    Task<IEnumerable<OrderSummaryDto>> GetBySlotAsync(int slotId, CancellationToken ct);
    Task<IEnumerable<HarvestItemDto>> GetHarvestListAsync(DateOnly date, CancellationToken ct);
    Task<OrderDto> PlaceOrderAsync(
        int userId,
        int deliverySlotId,
        int? addressId,
        string deliveryStreet,
        string deliveryPostalCode,
        string deliveryCity,
        string deliveryCountry,
        string? notes,
        IEnumerable<(int ProductId, decimal Quantity)> items,
        CancellationToken ct);
    Task UpdateStatusAsync(int orderId, OrderStatus status, CancellationToken ct);
    Task CancelAsync(int orderId, CancellationToken ct);
}