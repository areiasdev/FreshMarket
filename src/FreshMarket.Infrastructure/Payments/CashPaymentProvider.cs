using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Models;

/// <summary>
/// Pagamento na entrega — sem integração externa.
/// A encomenda fica Pending até o admin confirmar manualmente.
/// </summary>
public class CashPaymentProvider : IPaymentProvider
{
    public Task<PaymentProviderResult> CreateAsync(
        decimal amount, string currency, string description)
    {
        // Gera um ID interno — não há redirect, não há external provider
        return Task.FromResult(new PaymentProviderResult
        {
            ExternalId = $"cash_{Guid.NewGuid():N}",
            CheckoutUrl = null,   // sem redirect
            Status = "pending",
        });
    }

    public Task<PaymentProviderResult> GetStatusAsync(string externalId)
    {
        // Status controlado manualmente pelo admin — nunca auto-confirmado
        return Task.FromResult(new PaymentProviderResult
        {
            ExternalId = externalId,
            Status = "pending",
        });
    }
}