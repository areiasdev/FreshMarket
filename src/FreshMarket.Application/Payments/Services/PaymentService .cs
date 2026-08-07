using FreshMarket.Application.Common.Email;
using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Payments.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

public class PaymentService : IPaymentService
{
    private readonly IApplicationDbContext _db;
    private readonly IPaymentProviderFactory _factory;
    private readonly IOrderService _orders;
    private readonly ICacheService _cache;
    private readonly IEmailService _email;
    private readonly ILogger<PaymentService> _logger;

    public PaymentService(IApplicationDbContext db, IPaymentProviderFactory factory, IOrderService orders,
        ICacheService cache, IEmailService email, ILogger<PaymentService> logger)
    {
        _db      = db;
        _factory = factory;
        _orders  = orders;
        _cache   = cache;
        _email   = email;
        _logger  = logger;
    }

    public async Task<PaymentDto> CreatePaymentAsync(int orderId, PaymentMethodEnum method, CancellationToken ct)
    {
        // Carregamos items e produtos já aqui para evitar segunda query no caminho Cash
        var order = await _db.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct)
            ?? throw new NotFoundException(nameof(Order), orderId);

        if (order.Status != OrderStatus.Pending)
            throw new BusinessException("Order já não pode ser paga");

        var provider = _factory.Get(method);
        var result   = await provider.CreateAsync(order.TotalAmount, "eur", $"Order {order.OrderNumber}");

        var payment = new Payment
        {
            OrderId               = orderId,
            Method                = method,
            Status                = PaymentStatusEnum.Pending,
            Amount                = order.TotalAmount,
            ExternalTransactionId = result.ExternalId,
            Provider              = method.ToString(),
        };

        _db.Payments.Add(payment);

        // Pagamento em dinheiro: o cliente paga na recolha — não há confirmação externa.
        // Deduzimos o stock agora (equivalente ao ConfirmPayment de Stripe/MBWay)
        // e avançamos direto para Em Preparo, pois o admin já pode preparar.
        if (method == PaymentMethodEnum.Cash)
        {
            foreach (var item in order.Items.Where(i => i.Product.TrackStock))
            {
                if (item.Product.StockQuantity < item.Quantity)
                    throw new BusinessException($"Stock inconsistente para {item.Product.Name}");

                item.Product.StockQuantity -= item.Quantity;
                item.Product.ReservedStock  = Math.Max(0, item.Product.ReservedStock - item.Quantity);
            }
        }

        await _db.SaveChangesAsync(ct);

        // Avança o estado depois de guardar o pagamento,
        // para que as notificações e emails sejam enviados com o estado correto
        if (method == PaymentMethodEnum.Cash)
            await _orders.UpdateStatusAsync(orderId, OrderStatus.Preparing, ct);

        var dto = Map(payment);
        dto.RedirectUrl = result.CheckoutUrl;
        return dto;
    }

    public async Task<PaymentDto> ConfirmPaymentAsync(string externalTransactionId, CancellationToken ct)
    {
        // Stripe retries webhook deliveries; without this lock two near-simultaneous deliveries
        // for the same session can both pass the "not yet Succeeded" check below and double-deduct stock.
        var lockKey = $"payment-confirm-lock:{externalTransactionId}";
        var lockAcquired = await _cache.AcquireLockAsync(lockKey, TimeSpan.FromSeconds(15), ct);
        if (!lockAcquired)
        {
            var inFlight = await _db.Payments
                .FirstOrDefaultAsync(p => p.ExternalTransactionId == externalTransactionId, ct)
                ?? throw new NotFoundException(nameof(Payment), externalTransactionId);
            return Map(inFlight);
        }

        try
        {
            var payment = await _db.Payments
                .Include(p => p.Order)
                    .ThenInclude(o => o.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(p => p.ExternalTransactionId == externalTransactionId, ct)
                ?? throw new NotFoundException(nameof(Payment), externalTransactionId);

            if (payment.Status == PaymentStatusEnum.Succeeded)
                return Map(payment);

            var providerStatus = await _factory.Get(payment.Method).GetStatusAsync(externalTransactionId);

            if (providerStatus.Status is not ("paid" or "succeeded"))
                throw new BusinessException("Pagamento não concluído");

            var order = payment.Order;

            // Second, order-scoped lock (shared key pattern with OrderService.CancelAsync) so a
            // customer cancelling this order can't interleave with the webhook confirming it —
            // without it, stock could be double-deducted or double-restored.
            var orderLockKey = $"order-lock:{order.Id}";
            var orderLockAcquired = await _cache.AcquireLockAsync(orderLockKey, TimeSpan.FromSeconds(15), ct);
            if (!orderLockAcquired)
                throw new BusinessException("A encomenda está a ser processada. Tenta novamente em breve.");

            try
            {
                payment.Status = PaymentStatusEnum.Succeeded;
                payment.PaidAt = DateTime.UtcNow;

                var needsStatusUpdate = order.Status != OrderStatus.Paid;

                if (needsStatusUpdate)
                {
                    order.PaidAt = DateTime.UtcNow;

                    foreach (var item in order.Items.Where(i => i.Product.TrackStock))
                    {
                        if (item.Product.StockQuantity < item.Quantity)
                            throw new BusinessException($"Stock inconsistente para {item.Product.Name}");

                        item.Product.StockQuantity -= item.Quantity;
                        item.Product.ReservedStock  = Math.Max(0, item.Product.ReservedStock - item.Quantity);
                    }
                }

                await _db.SaveChangesAsync(ct);

                // Trigger the full status pipeline: cache invalidation + email + in-app notification
                if (needsStatusUpdate)
                    await _orders.UpdateStatusAsync(order.Id, OrderStatus.Paid, ct);

                return Map(payment);
            }
            finally
            {
                await _cache.ReleaseLockAsync(orderLockKey, ct);
            }
        }
        finally
        {
            await _cache.ReleaseLockAsync(lockKey, ct);
        }
    }

    public async Task MarkFailedAsync(string externalTransactionId, CancellationToken ct)
    {
        var payment = await _db.Payments
            .FirstOrDefaultAsync(p => p.ExternalTransactionId == externalTransactionId, ct);

        if (payment is null || payment.Status == PaymentStatusEnum.Succeeded) return;

        payment.Status = PaymentStatusEnum.Failed;
        await _db.SaveChangesAsync(ct);
    }

    public async Task<PaymentDto?> GetByOrderIdAsync(int orderId, CancellationToken ct)
    {
        var payment = await _db.Payments
            .Where(p => p.OrderId == orderId)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync(ct);

        return payment is null ? null : Map(payment);
    }

    public async Task<PaymentDto> RefundAsync(int orderId, decimal? amount, CancellationToken ct)
    {
        var payment = await _db.Payments
            .Include(p => p.Order).ThenInclude(o => o.User)
            .Where(p => p.OrderId == orderId)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync(ct)
            ?? throw new NotFoundException(nameof(Payment), orderId);

        if (payment.Status != PaymentStatusEnum.Succeeded)
            throw new BusinessException("Só é possível reembolsar um pagamento com sucesso.");

        var refundAmount = amount ?? payment.Amount;
        if (refundAmount <= 0 || refundAmount > payment.Amount)
            throw new BusinessException("Valor de reembolso inválido.");

        await _factory.Get(payment.Method).RefundAsync(payment.ExternalTransactionId!, amount, "eur")
            .ConfigureAwait(false);

        payment.Status = PaymentStatusEnum.Refunded;
        payment.RefundedAmount = refundAmount;
        payment.RefundedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        // Refund already succeeded server-side above — a failed notification email must not
        // undo that or fail the request, just get logged like every other order/payment email.
        try
        {
            var isPartial = refundAmount < payment.Amount;
            var html = EmailTemplates.PaymentRefunded(
                payment.Order.User.FullName, payment.Order.OrderNumber ?? $"#{orderId}", refundAmount, isPartial);
            await _email.SendAsync(payment.Order.User.Email, $"Reembolso — {payment.Order.OrderNumber}", html, ct)
                .ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send refund email for order {OrderId}", orderId);
        }

        return Map(payment);
    }

    private static PaymentDto Map(Payment payment) => new()
    {
        Id                    = payment.Id,
        OrderId               = payment.OrderId,
        Method                = payment.Method,
        Status                = payment.Status,
        Amount                = payment.Amount,
        ExternalTransactionId = payment.ExternalTransactionId,
        Provider              = payment.Provider,
        PaidAt                = payment.PaidAt,
        CreatedAt             = payment.CreatedAt,
        RefundedAmount        = payment.RefundedAmount,
        RefundedAt            = payment.RefundedAt,
    };
}
