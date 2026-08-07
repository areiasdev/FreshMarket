using System.Linq.Expressions;
using FreshMarket.Application.Common.Constants;
using FreshMarket.Application.Common.Email;
using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Shipping;
using FreshMarket.Application.DeliverySlots.Models;
using FreshMarket.Application.Orders.Models;
using FreshMarket.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FreshMarket.Application.Orders.Services;

public class OrderService : IOrderService
{
    private readonly IApplicationDbContext _db;
    private readonly ICacheService _cache;
    private readonly IEmailService _email;
    private readonly INotificationService _notifications;
    private readonly ILogger<OrderService> _logger;

    public OrderService(IApplicationDbContext db, ICacheService cache, IEmailService email, INotificationService notifications, ILogger<OrderService> logger)
    {
        _db            = db;
        _cache         = cache;
        _email         = email;
        _notifications = notifications;
        _logger        = logger;
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
            PreferredDeliveryDate = order.PreferredDeliveryDate,
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
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(SummaryProjection)
            .ToListAsync(ct)
            .ConfigureAwait(false);

        await _cache.SetAsync(key, result, TimeSpan.FromMinutes(2), ct);
        return result;
    }

    // Admin � sempre IgnoreQueryFilters em orders
    public async Task<PagedResult<OrderSummaryDto>> GetByStatusAsync(OrderStatus status, int page, int pageSize, string? search, CancellationToken ct)
    {
        var query = _db.Orders
            .IgnoreQueryFilters()
            .Where(o => o.Status == status);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(o =>
                (o.OrderNumber != null && o.OrderNumber.Contains(search)) ||
                o.User.FullName.Contains(search) ||
                o.User.Email.Contains(search));

        var orderedQuery = query.OrderByDescending(o => o.CreatedAt);

        var total = await orderedQuery.CountAsync(ct).ConfigureAwait(false);
        var items = await orderedQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(SummaryProjection)
            .ToListAsync(ct)
            .ConfigureAwait(false);

        return new PagedResult<OrderSummaryDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<IEnumerable<OrderSummaryDto>> GetBySlotAsync(int slotId, CancellationToken ct)
        => await _db.Orders
            .IgnoreQueryFilters()
            .Where(o => o.DeliverySlotId == slotId)
            .Select(SummaryProjection)
            .ToListAsync(ct)
            .ConfigureAwait(false);

    public async Task<IEnumerable<HarvestItemDto>> GetHarvestListAsync(DateOnly from, DateOnly to, CancellationToken ct)
        => await _db.OrderItems
            .IgnoreQueryFilters()
            .Where(i =>
                i.Order.DeliverySlot != null &&
                i.Order.DeliverySlot.DeliveryDate >= from &&
                i.Order.DeliverySlot.DeliveryDate <= to &&
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
    int userId, int? deliverySlotId, int? addressId,
    string deliveryStreet, string deliveryPostalCode,
    string deliveryCity, string deliveryCountry,
    string? notes, DateOnly? preferredDeliveryDate,
    IEnumerable<(int ProductId, decimal Quantity)> items,
    string shippingSpeed,
    CancellationToken ct)
    {
        using var transaction = await _db.Database.BeginTransactionAsync(ct);
        try
        {
            // Slot opcional
            DeliverySlot? slot = null;
            if (deliverySlotId.HasValue)
            {
                slot = await _db.DeliverySlots
                    .FirstOrDefaultAsync(s => s.Id == deliverySlotId.Value && s.IsActive, ct)
                    ?? throw new NotFoundException(nameof(DeliverySlot), deliverySlotId.Value);

                if (slot.CurrentOrders >= slot.MaxOrders)
                    throw new BusinessException("Slot cheio");
            }

            var itemList = items.ToList();
            var productIds = itemList.Select(i => i.ProductId).ToList();
            var products = await _db.Products
                .Where(p => productIds.Contains(p.Id) && p.IsActive)
                .ToDictionaryAsync(p => p.Id, ct);

            if (products.Count != itemList.Count)
                throw new BusinessException("Produto inv�lido ou inativo.");

            var shippingFee = ShippingCalculator.Calculate(shippingSpeed, deliveryCountry);

            var order = new Order
            {
                UserId = userId,
                DeliverySlotId = deliverySlotId,
                AddressId = addressId,
                ShippingFee = shippingFee,
                DeliveryStreet = deliveryStreet,
                DeliveryPostalCode = deliveryPostalCode,
                DeliveryCity = deliveryCity,
                DeliveryCountry = deliveryCountry,
                Notes = notes,
                PreferredDeliveryDate = preferredDeliveryDate,
                OrderNumber = GenerateOrderNumber(),
            };

            decimal total = 0;
            foreach (var (productId, quantity) in itemList)
            {
                var product = products[productId];

                if (product.UnitType == UnitType.Unit && quantity % 1 != 0)
                    throw new BusinessException($"'{product.Name}' s� aceita unidades inteiras.");

                var available = product.StockQuantity - product.ReservedStock;
                if (product.TrackStock && available < quantity)
                    throw new BusinessException($"'{product.Name}' tem stock insuficiente.");

                if (quantity < product.MinQuantity)
                    throw new BusinessException($"Quantidade m�nima para '{product.Name}' � {product.MinQuantity}.");

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

            order.TotalAmount = total + shippingFee;

            if (slot is not null)
                slot.CurrentOrders++;

            _db.Orders.Add(order);
            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            await _cache.RemoveAsync(CacheKeys.OrdersByUser(userId), ct);
            await _cache.RemoveByPrefixAsync("slots:", ct);

            var orderDto = await GetByIdAsync(order.Id, ct);

            // Awaited sequentially — both touch the same scoped DbContext, which isn't thread-safe,
            // and firing them unawaited let them outlive (and crash against) the disposed request scope.
            // Each still swallows its own failure internally so it can't break the order response.
            await SendOrderPlacedEmailAsync(order.Id, userId, orderDto, ct).ConfigureAwait(false);
            await CreateNotificationSafeAsync(userId, NotificationType.OrderPlaced,
                    "Encomenda recebida!",
                    $"A tua encomenda {orderDto.OrderNumber} foi recebida e está a ser processada.",
                    order.Id, ct).ConfigureAwait(false);

            return orderDto;
        }
        catch (DbUpdateConcurrencyException)
        {
            // Now also fires for Product.RowVersion conflicts (concurrent stock reservation),
            // not just DeliverySlot \u2014 message is deliberately generic to cover both.
            await transaction.RollbackAsync(ct);
            throw new BusinessException("Algo mudou entretanto (stock ou hor\u00e1rio de entrega). Tenta novamente.");
        }
        catch
        {
            await transaction.RollbackAsync(ct);
            throw;
        }
    }

    private async Task SendOrderPlacedEmailAsync(int orderId, int userId, OrderDto orderDto, CancellationToken ct)
    {
        try
        {
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
            if (user is null) return;

            string? estimated = orderDto.DeliverySlot is not null
                ? $"{orderDto.DeliverySlot.DeliveryDate:dd/MM/yyyy} · {orderDto.DeliverySlot.StartTime}–{orderDto.DeliverySlot.EndTime}"
                : orderDto.PreferredDeliveryDate.HasValue
                    ? orderDto.PreferredDeliveryDate.Value.ToString("dd/MM/yyyy")
                    : DateTime.UtcNow.AddHours(72).ToString("dd/MM/yyyy");

            var items = orderDto.Items.Select(i => (
                i.ProductName,
                i.Quantity,
                i.UnitType == UnitType.Weight ? "kg" : "un",
                i.UnitPrice,
                i.Subtotal));

            var address = $"{orderDto.DeliveryStreet}, {orderDto.DeliveryPostalCode} {orderDto.DeliveryCity}";
            var html = EmailTemplates.OrderPlaced(
                user.FullName, orderDto.OrderNumber ?? $"#{orderId}",
                orderDto.TotalAmount, orderDto.ShippingFee,
                address, estimated, items);

            await _email.SendAsync(user.Email, $"Encomenda {orderDto.OrderNumber} recebida!", html, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send order-placed email for order {OrderId}", orderId);
        }
    }

    private static readonly Dictionary<OrderStatus, OrderStatus[]> AllowedTransitions = new()
    {
        [OrderStatus.Pending]   = [OrderStatus.Paid, OrderStatus.Preparing, OrderStatus.Cancelled],
        [OrderStatus.Paid]      = [OrderStatus.Preparing, OrderStatus.Cancelled],
        [OrderStatus.Preparing] = [OrderStatus.Shipped, OrderStatus.Cancelled],
        [OrderStatus.Shipped]   = [OrderStatus.Delivered],
        [OrderStatus.Delivered] = [],
        [OrderStatus.Cancelled] = [],
    };

    public async Task UpdateStatusAsync(int orderId, OrderStatus status, CancellationToken ct)
    {
        var order = await _db.Orders
            .IgnoreQueryFilters()
            .Include(o => o.User)
            .Include(o => o.Payments)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Order), orderId);

        if (order.Status == status) return;

        if (!AllowedTransitions[order.Status].Contains(status))
            throw new BusinessException($"Não é possível mudar o estado de '{order.Status}' para '{status}'.");

        order.Status = status;
        order.UpdatedAt = DateTime.UtcNow;

        // Cash orders: when delivered, automatically mark the payment as collected
        var isCash = order.Payments.OrderByDescending(p => p.CreatedAt)
            .FirstOrDefault()?.Method == PaymentMethodEnum.Cash;
        if (isCash && status == OrderStatus.Delivered)
        {
            var cashPayment = order.Payments.OrderByDescending(p => p.CreatedAt).First();
            cashPayment.Status = PaymentStatusEnum.Succeeded;
            cashPayment.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        await _cache.RemoveAsync(CacheKeys.OrderById(orderId), ct);
        await _cache.RemoveAsync(CacheKeys.OrdersByUser(order.UserId), ct);

        // Awaited sequentially — see PlaceOrderAsync for why these can't be fire-and-forget.
        await SendStatusUpdateEmailAsync(order, status, ct).ConfigureAwait(false);
        await CreateStatusNotificationAsync(order.UserId, order.Id, order.OrderNumber, status, ct).ConfigureAwait(false);
    }

    private async Task SendStatusUpdateEmailAsync(Order order, OrderStatus status, CancellationToken ct)
    {
        try
        {
            if (status is OrderStatus.Pending or OrderStatus.Cancelled) return;

            var (label, message, color) = EmailTemplates.StatusInfo(status);
            var html = EmailTemplates.OrderStatusUpdate(
                order.User.FullName, order.OrderNumber ?? $"#{order.Id}",
                label, message, color);

            await _email.SendAsync(order.User.Email, label + $" — {order.OrderNumber}", html, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send status-update email for order {OrderId}", order.Id);
        }
    }

    public async Task CancelAsync(int orderId, CancellationToken ct)
    {
        // Shares its key pattern with PaymentService's payment-confirm lock so a webhook
        // confirming payment can't interleave with a customer cancelling the same order
        // (which would otherwise double-deduct or double-restore stock).
        var lockKey = $"order-lock:{orderId}";
        var lockAcquired = await _cache.AcquireLockAsync(lockKey, TimeSpan.FromSeconds(15), ct);
        if (!lockAcquired)
            throw new BusinessException("A encomenda está a ser processada. Tenta novamente em breve.");

        try
        {
            var order = await _db.Orders
                .IgnoreQueryFilters()
                .Include(o => o.User)
                .Include(o => o.DeliverySlot)
                .Include(o => o.Items).ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId, ct)
                .ConfigureAwait(false)
                ?? throw new NotFoundException(nameof(Order), orderId);

            if (order.Status == OrderStatus.Cancelled)
                throw new BusinessException("Encomenda já está cancelada.");
            if (order.Status is OrderStatus.Shipped or OrderStatus.Delivered)
                throw new BusinessException("Não é possível cancelar uma encomenda já enviada ou entregue.");

            // Paid/Preparing orders already had StockQuantity deducted (and ReservedStock cleared)
            // when the payment was confirmed — cancelling them must give the stock back instead of
            // touching ReservedStock again, or stock silently disappears.
            var stockWasDeducted = order.Status != OrderStatus.Pending;

            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            foreach (var item in order.Items.Where(i => i.Product.TrackStock))
            {
                if (stockWasDeducted)
                    item.Product.StockQuantity += item.Quantity;
                else
                    item.Product.ReservedStock = Math.Max(0, item.Product.ReservedStock - item.Quantity);
            }

            if (order.DeliverySlot != null && order.DeliverySlot.CurrentOrders > 0)
                order.DeliverySlot.CurrentOrders--;

            await _db.SaveChangesAsync(ct).ConfigureAwait(false);

            await _cache.RemoveAsync(CacheKeys.OrderById(orderId), ct);
            await _cache.RemoveAsync(CacheKeys.OrdersByUser(order.UserId), ct);
            await _cache.RemoveByPrefixAsync("slots:", ct);

            // Awaited sequentially — see PlaceOrderAsync for why these can't be fire-and-forget.
            await SendCancelledEmailAsync(order, ct).ConfigureAwait(false);
            await CreateNotificationSafeAsync(order.UserId, NotificationType.OrderCancelled,
                    "Encomenda cancelada",
                    $"A encomenda {order.OrderNumber ?? $"#{orderId}"} foi cancelada.",
                    orderId, ct).ConfigureAwait(false);
        }
        finally
        {
            await _cache.ReleaseLockAsync(lockKey, ct);
        }
    }

    private async Task SendCancelledEmailAsync(Order order, CancellationToken ct)
    {
        try
        {
            var html = EmailTemplates.OrderCancelled(
                order.User.FullName, order.OrderNumber ?? $"#{order.Id}", order.TotalAmount);
            await _email.SendAsync(order.User.Email, $"Encomenda {order.OrderNumber} cancelada", html, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send cancellation email for order {OrderId}", order.Id);
        }
    }

    private async Task CreateStatusNotificationAsync(int userId, int orderId, string? orderNumber, OrderStatus status, CancellationToken ct)
    {
        try
        {
            var (type, title, message) = status switch
            {
                OrderStatus.Paid      => (NotificationType.OrderPaid,      "Pagamento confirmado",    $"O pagamento da encomenda {orderNumber ?? $"#{orderId}"} foi confirmado."),
                OrderStatus.Preparing => (NotificationType.OrderPreparing, "Encomenda em preparação", $"A tua encomenda {orderNumber ?? $"#{orderId}"} está a ser preparada."),
                OrderStatus.Shipped   => (NotificationType.OrderShipped,   "Encomenda a caminho!",    $"A tua encomenda {orderNumber ?? $"#{orderId}"} está a caminho."),
                OrderStatus.Delivered => (NotificationType.OrderDelivered, "Encomenda entregue!",     $"A tua encomenda {orderNumber ?? $"#{orderId}"} foi entregue. Bom proveito!"),
                _ => default,
            };

            if (type == default) return;

            await _notifications.CreateAsync(userId, type, title, message, orderId, ct).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to create status notification for order {OrderId}", orderId);
        }
    }

    private async Task CreateNotificationSafeAsync(int userId, NotificationType type, string title, string message, int orderId, CancellationToken ct)
    {
        try
        {
            await _notifications.CreateAsync(userId, type, title, message, orderId, ct).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to create notification for order {OrderId}", orderId);
        }
    }

    private static readonly Expression<Func<Order, OrderSummaryDto>> SummaryProjection =
        o => new OrderSummaryDto
        {
            Id = o.Id,
            OrderNumber = o.OrderNumber,
            Status = o.Status,
            TotalAmount = o.TotalAmount,
            ShippingFee = o.ShippingFee,
            CreatedAt = o.CreatedAt,
            DeliveryCity = o.DeliveryCity,
            DeliveryPostalCode = o.DeliveryPostalCode,
            Notes = o.Notes,
            PreferredDeliveryDate = o.PreferredDeliveryDate,
            ItemCount = o.Items.Count,
            UserFullName = o.User != null ? o.User.FullName : "—",
            UserIsGuest = o.User != null && o.User.IsGuest,
            PaymentMethod = o.Payments
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => (PaymentMethodEnum?)p.Method)
                .FirstOrDefault(),
            DeliverySlot = o.DeliverySlot == null ? null : new DeliverySlotInfo
            {
                DeliveryDate = o.DeliverySlot.DeliveryDate,
                StartTime = o.DeliverySlot.StartTime,
                EndTime = o.DeliverySlot.EndTime,
            },
        };

    private static string GenerateOrderNumber()
    {
        var date = DateTime.UtcNow.ToString("yyyyMMdd");
        var random = Random.Shared.Next(1000, 9999);
        return $"FM-{date}-{random}";
    }
}