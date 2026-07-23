using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Payments.Models;
using Microsoft.EntityFrameworkCore;

public class PaymentService : IPaymentService
{
    private readonly IApplicationDbContext _db;
    private readonly IPaymentProviderFactory _factory;
    private readonly IOrderService _orders;
    private readonly ICacheService _cache;

    public PaymentService(IApplicationDbContext db, IPaymentProviderFactory factory, IOrderService orders, ICacheService cache)
    {
        _db      = db;
        _factory = factory;
        _orders  = orders;
        _cache   = cache;
    }

    public async Task<PaymentDto> CreatePaymentAsync(int orderId, PaymentMethodEnum method, CancellationToken ct)
    {
        // Carregamos items e produtos já aqui para evitar segunda query no caminho Cash
        var order = await _db.Orders
            .Include(o => o.Items).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == orderId, ct)
            ?? throw new Exception("Order not found");

        if (order.Status != OrderStatus.Pending)
            throw new Exception("Order já não pode ser paga");

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
                    throw new Exception($"Stock inconsistente para {item.Product.Name}");

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
                ?? throw new Exception("Payment not found");
            return Map(inFlight);
        }

        try
        {
            var payment = await _db.Payments
                .Include(p => p.Order)
                    .ThenInclude(o => o.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(p => p.ExternalTransactionId == externalTransactionId, ct)
                ?? throw new Exception("Payment not found");

            if (payment.Status == PaymentStatusEnum.Succeeded)
                return Map(payment);

            var providerStatus = await _factory.Get(payment.Method).GetStatusAsync(externalTransactionId);

            if (providerStatus.Status is not ("paid" or "succeeded"))
                throw new Exception("Pagamento não concluído");

            payment.Status = PaymentStatusEnum.Succeeded;
            payment.PaidAt = DateTime.UtcNow;

            var order = payment.Order;
            var needsStatusUpdate = order.Status != OrderStatus.Paid;

            if (needsStatusUpdate)
            {
                order.PaidAt = DateTime.UtcNow;

                foreach (var item in order.Items.Where(i => i.Product.TrackStock))
                {
                    if (item.Product.StockQuantity < item.Quantity)
                        throw new Exception($"Stock inconsistente para {item.Product.Name}");

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
    };
}
