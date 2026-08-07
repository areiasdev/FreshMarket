using FreshMarket.Application.Payments.Models;

public interface IPaymentService
{
    Task<PaymentDto> CreatePaymentAsync(int orderId, PaymentMethodEnum method, CancellationToken ct);

    Task<PaymentDto> ConfirmPaymentAsync(string externalTransactionId, CancellationToken ct);

    Task MarkFailedAsync(string externalTransactionId, CancellationToken ct);

    Task<PaymentDto?> GetByOrderIdAsync(int orderId, CancellationToken ct);
    Task<PaymentDto> RefundAsync(int orderId, decimal? amount, CancellationToken ct);
}