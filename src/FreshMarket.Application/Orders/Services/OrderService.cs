using FreshMarket.Application.Common.Constants;
using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Mapping;
using FreshMarket.Application.DeliverySlots.Models;
using FreshMarket.Application.Orders.Models;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.Orders.Services;

public class OrderService : IOrderService
{
    private readonly IApplicationDbContext _db;
    private readonly ICacheService _cache;

    public OrderService(IApplicationDbContext db, ICacheService cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<OrderDto> GetByIdAsync(int id, CancellationToken ct)
    {
        var key = CacheKeys.OrderById(id);
        var cached = await _cache.GetAsync<OrderDto>(key, ct);
        if (cached is not null) return cached;

        var order = await _db.Orders
            .IgnoreQueryFilters()
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .Include(o => o.DeliverySlot)
            .Include(o => o.Payments)
            .FirstOrDefaultAsync(o => o.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Order), id);

        var lastPayment = order.Payments.OrderByDescending(p => p.CreatedAt).FirstOrDefault();

        var result = new OrderDto
        {
            Id = order.Id,
            OrderNumber = order.OrderNumber,
            UserId = order.UserId,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            ShippingFee = order.ShippingFee,
            Notes = order.Notes,
            CreatedAt = order.CreatedAt,
            DeliveryStreet = order.DeliveryStreet,
            DeliveryPostalCode = order.DeliveryPostalCode,
            DeliveryCity = order.DeliveryCity,
            DeliveryCountry = order.DeliveryCountry,
            PaymentMethod = lastPayment?.Method,
            PaymentStatus = lastPayment?.Status,
            ExternalTransactionId = lastPayment?.ExternalTransactionId,
            DeliverySlot = order.DeliverySlot == null ? null : new DeliverySlotInfo
            {
                DeliveryDate = order.DeliverySlot.DeliveryDate,
                StartTime = order.DeliverySlot.StartTime,
                EndTime = order.DeliverySlot.EndTime,
            },
            Items = order.Items.Select(i => new OrderItemDto
            {
                ProductId = i.ProductId,
                ProductName = i.Product.Name,
                Quantity = i.Quantity,
                UnitType = i.Product.UnitType,
                UnitPrice = i.UnitPrice,
                Subtotal = i.Subtotal,
            }).ToList()
        };

        await _cache.SetAsync(key, result, TimeSpan.FromMinutes(2), ct);
        return result;
    }

    public async Task<IEnumerable<OrderSummaryDto>> GetMyOrdersAsync(int userId, CancellationToken ct)
    {
        var key = CacheKeys.OrdersByUser(userId);
        var cached = await _cache.GetAsync<IEnumerable<OrderSummaryDto>>(key, ct);
        if (cached is not null) return cached;

        var result = await _db.Orders
            .IgnoreQueryFilters()
            .Include(o => o.Items)
            .Include(o => o.DeliverySlot)
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => o.ToSummaryDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

        await _cache.SetAsync(key, result, TimeSpan.FromMinutes(2), ct);
        return result;
    }

    // Admin — sempre IgnoreQueryFilters em orders
    public async Task<PagedResult<OrderSummaryDto>> GetByStatusAsync(OrderStatus status, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.Orders
            .IgnoreQueryFilters()
            .Include(o => o.Items)
            .Include(o => o.DeliverySlot)
            .Where(o => o.Status == status)
            .OrderByDescending(o => o.CreatedAt);

        var total = await query.CountAsync(ct).ConfigureAwait(false);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => o.ToSummaryDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

        return new PagedResult<OrderSummaryDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<IEnumerable<OrderSummaryDto>> GetBySlotAsync(int slotId, CancellationToken ct)
        => await _db.Orders
            .IgnoreQueryFilters()
            .Include(o => o.Items)
            .Include(o => o.DeliverySlot)
            .Where(o => o.DeliverySlotId == slotId)
            .Select(o => o.ToSummaryDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

    public async Task<IEnumerable<HarvestItemDto>> GetHarvestListAsync(DateOnly date, CancellationToken ct)
        => await _db.OrderItems
            .IgnoreQueryFilters()
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
                TotalQuantity = g.Sum(i => i.Quantity),
            })
            .ToListAsync(ct)
            .ConfigureAwait(false);

    public async Task<OrderDto> PlaceOrderAsync(
    int userId, int deliverySlotId, int? addressId,
    string deliveryStreet, string deliveryPostalCode, string deliveryCity, string deliveryCountry,
    string? notes,
    IEnumerable<(int ProductId, decimal Quantity)> items,
    CancellationToken ct)
    {
        using var transaction = await _db.Database.BeginTransactionAsync(ct);

        try
        {
            var slot = await _db.DeliverySlots
                .FirstOrDefaultAsync(s => s.Id == deliverySlotId && s.IsActive, ct)
                ?? throw new NotFoundException(nameof(DeliverySlot), deliverySlotId);

            if (slot.CurrentOrders >= slot.MaxOrders)
                throw new BusinessException("Slot cheio");

            var itemList = items.ToList();
            var productIds = itemList.Select(i => i.ProductId).ToList();

            var products = await _db.Products
                .Where(p => productIds.Contains(p.Id) && p.IsActive)
                .ToDictionaryAsync(p => p.Id, ct);

            if (products.Count != itemList.Count)
                throw new BusinessException("Produto inválido");

            var order = new Order
            {
                UserId = userId,
                DeliverySlotId = deliverySlotId,
                AddressId = addressId,
                ShippingFee = slot.ShippingFee,
                DeliveryStreet = deliveryStreet,
                DeliveryPostalCode = deliveryPostalCode,
                DeliveryCity = deliveryCity,
                DeliveryCountry = deliveryCountry,
                Notes = notes,
                OrderNumber = GenerateOrderNumber(),
            };

            decimal total = 0;

            foreach (var (productId, quantity) in itemList)
            {
                var product = products[productId];

                if (product.UnitType == UnitType.Unit && quantity % 1 != 0)
                    throw new BusinessException($"'{product.Name}' só aceita unidades inteiras");

                var availableStock = product.StockQuantity - product.ReservedStock;

                if (product.TrackStock && availableStock < quantity)
                    throw new BusinessException($"'{product.Name}' tem stock insuficiente.");

                if (quantity < product.MinQuantity)
                    throw new BusinessException($"Quantidade mínima para {product.Name} é {product.MinQuantity}");


                if (product.TrackStock)
                    product.ReservedStock += quantity;

                var subtotal = Math.Round(quantity * product.PricePerUnit, 2);

                total += subtotal;

                order.Items.Add(new OrderItem
                {
                    ProductId = productId,
                    Quantity = quantity,
                    UnitPrice = product.PricePerUnit,
                    Subtotal = subtotal,
                });
            }

            order.TotalAmount = total + slot.ShippingFee;

            slot.CurrentOrders++;

            _db.Orders.Add(order);

            await _db.SaveChangesAsync(ct);

            await transaction.CommitAsync(ct);

            await _cache.RemoveAsync(CacheKeys.OrdersByUser(userId), ct);
            await _cache.RemoveByPrefixAsync("slots:", ct);

            return await GetByIdAsync(order.Id, ct);
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync(ct);
            throw new BusinessException("Alguém acabou de reservar este slot. Tenta novamente.");
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    public async Task UpdateStatusAsync(int orderId, OrderStatus status, CancellationToken ct)
    {
        var order = await _db.Orders
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(o => o.Id == orderId, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Order), orderId);

        order.Status = status;
        order.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        await _cache.RemoveAsync(CacheKeys.OrderById(orderId), ct);
        await _cache.RemoveAsync(CacheKeys.OrdersByUser(order.UserId), ct);
    }

    public async Task CancelAsync(int orderId, CancellationToken ct)
    {
        var order = await _db.Orders
            .IgnoreQueryFilters()
            .Include(o => o.DeliverySlot)
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Order), orderId);

        order.Status = OrderStatus.Cancelled;
        order.UpdatedAt = DateTime.UtcNow;

        foreach (var item in order.Items.Where(i => i.Product.TrackStock))
            item.Product.ReservedStock -= item.Quantity;

        if (order.DeliverySlot != null && order.DeliverySlot.CurrentOrders > 0)
            order.DeliverySlot.CurrentOrders--;

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        await _cache.RemoveAsync(CacheKeys.OrderById(orderId), ct);
        await _cache.RemoveAsync(CacheKeys.OrdersByUser(order.UserId), ct);
        await _cache.RemoveByPrefixAsync("slots:", ct);
    }

    private static string GenerateOrderNumber()
    {
        var date = DateTime.UtcNow.ToString("yyyyMMdd");
        var random = Random.Shared.Next(1000, 9999);
        return $"FM-{date}-{random}";
    }
}