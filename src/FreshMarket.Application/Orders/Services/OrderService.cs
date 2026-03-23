using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Mapping;
using FreshMarket.Application.Orders.Models;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.Orders.Services;

public class OrderService : IOrderService
{
    private readonly IApplicationDbContext _db;

    public OrderService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<OrderDto> GetByIdAsync(int id, CancellationToken ct)
    {
        var order = await _db.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.DeliverySlot)
            .FirstOrDefaultAsync(o => o.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Order), id);

        return new OrderDto
        {
            Id = order.Id,
            UserId = order.UserId,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            ShippingFee = order.ShippingFee,
            PaymentMethod = order.PaymentMethod,
            PaymentStatus = order.PaymentStatus,
            ExternalTransactionId = order.ExternalTransactionId,
            Notes = order.Notes,
            DeliveryAddress = order.DeliveryAddress,
            DeliveryPostalCode = order.DeliveryPostalCode,
            CreatedAt = order.CreatedAt,
            DeliverySlot = order.DeliverySlot == null ? null : new DeliverySlotInfo
            {
                DeliveryDate = order.DeliverySlot.DeliveryDate,
                StartTime = order.DeliverySlot.StartTime,
                EndTime = order.DeliverySlot.EndTime
            },
            Items = order.Items.Select(i => new OrderItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                Quantity = i.Quantity,
                UnitType = i.Product.UnitType,
                UnitPrice = i.UnitPrice,
                Subtotal = i.Subtotal
            }).ToList()
        };
    }

    public async Task<IEnumerable<OrderSummaryDto>> GetMyOrdersAsync(int userId, CancellationToken ct)
        => await _db.Orders
            .Include(o => o.Items)
            .Include(o => o.DeliverySlot)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => o.ToSummaryDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

    public async Task<IEnumerable<OrderSummaryDto>> GetByStatusAsync(OrderStatus status, CancellationToken ct)
        => await _db.Orders
            .Include(o => o.Items)
            .Include(o => o.DeliverySlot)
            .Where(o => o.Status == status)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => o.ToSummaryDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

    public async Task<IEnumerable<OrderSummaryDto>> GetBySlotAsync(int slotId, CancellationToken ct)
        => await _db.Orders
            .Include(o => o.Items)
            .Include(o => o.DeliverySlot)
            .Where(o => o.DeliverySlotId == slotId)
            .Select(o => o.ToSummaryDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

    public async Task<IEnumerable<HarvestItemDto>> GetHarvestListAsync(DateOnly date, CancellationToken ct)
        => await _db.OrderItems
            .Include(i => i.Product)
            .Include(i => i.Order).ThenInclude(o => o.DeliverySlot)
            .Where(i =>
                i.Order.DeliverySlot.DeliveryDate == date &&
                i.Order.Status != OrderStatus.Cancelled)
            .GroupBy(i => new { i.ProductId, i.Product.Name, i.Product.UnitType })
            .Select(g => new HarvestItemDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name,
                UnitType = g.Key.UnitType,
                TotalQuantity = g.Sum(i => i.Quantity)
            })
            .ToListAsync(ct)
            .ConfigureAwait(false);

    public async Task<OrderDto> PlaceOrderAsync(
        int userId, int deliverySlotId, string postalCodePrefix,
        string deliveryAddress, string deliveryPostalCode, string? notes,
        IEnumerable<(int ProductId, decimal Quantity)> items, CancellationToken ct)
    {
        // Validar zona de entrega
        var zone = await _db.ShippingZones
            .FirstOrDefaultAsync(z => z.PostalCodePrefix == postalCodePrefix && z.IsActive, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(ShippingZone), postalCodePrefix);

        // Validar e reservar slot — concorrência controlada
        var slot = await _db.DeliverySlots
            .FirstOrDefaultAsync(s => s.Id == deliverySlotId && s.IsActive && s.CurrentOrders < s.MaxOrders, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(DeliverySlot), deliverySlotId);

        // Criar encomenda
        var order = new Order
        {
            UserId = userId,
            DeliverySlotId = deliverySlotId,
            ShippingZoneId = zone.Id,
            ShippingFee = zone.ShippingFee,
            DeliveryAddress = deliveryAddress,
            DeliveryPostalCode = deliveryPostalCode,
            Notes = notes
        };

        // Criar items com preço fixado no momento
        var itemList = items.ToList();
        var productIds = itemList.Select(i => i.ProductId).ToList();
        var products = await _db.Products
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToListAsync(ct)
            .ConfigureAwait(false);

        foreach (var (productId, quantity) in itemList)
        {
            var product = products.FirstOrDefault(p => p.Id == productId)
                ?? throw new NotFoundException(nameof(Product), productId);

            order.Items.Add(new OrderItem
            {
                ProductId = productId,
                Quantity = quantity,
                UnitPrice = product.PricePerUnit,
                Subtotal = Math.Round(quantity * product.PricePerUnit, 2)
            });
        }

        order.TotalAmount = order.Items.Sum(i => i.Subtotal) + zone.ShippingFee;

        // Incrementar slot com controlo de concorrência
        slot.CurrentOrders++;

        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        return await GetByIdAsync(order.Id, ct).ConfigureAwait(false);
    }

    public async Task UpdateStatusAsync(int orderId, OrderStatus status, CancellationToken ct)
    {
        var order = await _db.Orders
            .FirstOrDefaultAsync(o => o.Id == orderId, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Order), orderId);

        order.Status = status;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
    }

    public async Task CancelAsync(int orderId, CancellationToken ct)
    {
        var order = await _db.Orders
            .Include(o => o.DeliverySlot)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Order), orderId);

        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;

        // Libertar capacidade no slot
        if (order.DeliverySlot != null && order.DeliverySlot.CurrentOrders > 0)
            order.DeliverySlot.CurrentOrders--;

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
    }
}
