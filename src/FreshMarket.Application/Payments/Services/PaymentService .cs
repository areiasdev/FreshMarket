using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Payments.Models;
using Microsoft.EntityFrameworkCore;

public class PaymentService : IPaymentService
{
    private readonly IApplicationDbContext _db;
    private readonly IPaymentProviderFactory _factory;

    public PaymentService(IApplicationDbContext db, IPaymentProviderFactory factory)
    {
        _db = db;
        _factory = factory;
    }

    public async Task<PaymentDto> CreatePaymentAsync(int orderId, PaymentMethodEnum method, CancellationToken ct)
    {
        var order = await _db.Orders
            .FirstOrDefaultAsync(o => o.Id == orderId, ct)
            ?? throw new Exception("Order not found");

        if (order.Status != OrderStatus.Pending)
            throw new Exception("Order já não pode ser paga");

        var provider = _factory.Get(method);

        var result = await provider.CreateAsync(
            order.TotalAmount,
            "eur",
            $"Order {order.OrderNumber}"
        );

        var payment = new Payment
        {
            OrderId = orderId,
            Method = method,
            Status = PaymentStatusEnum.Pending,
            Amount = order.TotalAmount,
            ExternalTransactionId = result.ExternalId,
            Provider = method.ToString()
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync(ct);

        var dto = Map(payment);
        dto.RedirectUrl = result.CheckoutUrl; 
        return dto;
    }

    public async Task<PaymentDto> ConfirmPaymentAsync(string externalTransactionId, CancellationToken ct)
    {
        var payment = await _db.Payments
            .Include(p => p.Order)
                .ThenInclude(o => o.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(p => p.ExternalTransactionId == externalTransactionId, ct)
            ?? throw new Exception("Payment not found");

        if (payment.Status == PaymentStatusEnum.Succeeded)
            return Map(payment);

        var method = payment.Method;
        var provider = _factory.Get(method);

        var providerStatus = await provider.GetStatusAsync(externalTransactionId);

        var isSuccess = providerStatus.Status is "paid" or "succeeded";

        if (!isSuccess)
            throw new Exception("Pagamento não concluído");

        payment.Status = PaymentStatusEnum.Succeeded;
        payment.PaidAt = DateTime.UtcNow;

        var order = payment.Order;

        if (order.Status != OrderStatus.Paid)
        {
            order.Status = OrderStatus.Paid;

            foreach (var item in order.Items)
            {
                if (item.Product.TrackStock)
                {
                    if (item.Product.StockQuantity < item.Quantity)
                        throw new Exception($"Stock inconsistente para {item.Product.Name}");

                    item.Product.StockQuantity -= item.Quantity;
                }
            }
        }

        await _db.SaveChangesAsync(ct);

        return Map(payment);
    }

    public async Task<PaymentDto?> GetByOrderIdAsync(int orderId, CancellationToken ct)
    {
        var payment = await _db.Payments
            .Where(p => p.OrderId == orderId)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync(ct);

        return payment is null ? null : Map(payment);
    }
    private static PaymentDto Map(Payment payment)
        => new()
        {
            Id = payment.Id,
            OrderId = payment.OrderId,
            Method = payment.Method,
            Status = payment.Status,
            Amount = payment.Amount,
            ExternalTransactionId = payment.ExternalTransactionId,
            Provider = payment.Provider,
            PaidAt = payment.PaidAt,
            CreatedAt = payment.CreatedAt,
            
        };
}