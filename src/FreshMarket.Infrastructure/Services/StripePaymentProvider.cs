using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Models;
using Stripe;
using Stripe.Checkout;

public class StripePaymentProvider : IPaymentProvider
{
    private readonly string _successUrl;
    private readonly string _cancelUrl;
    private readonly List<string> _paymentMethodTypes;

    public StripePaymentProvider(IConfiguration config, List<string>? paymentMethodTypes = null)
    {
        StripeConfiguration.ApiKey = config["Stripe:SecretKey"];
        _successUrl = config["Stripe:SuccessUrl"] ?? "https://yourapp.com/success";
        _cancelUrl = config["Stripe:CancelUrl"] ?? "https://yourapp.com/cancel";
        _paymentMethodTypes = paymentMethodTypes ?? ["card"];
    }

    public async Task<PaymentProviderResult> CreateAsync(decimal amount, string currency, string description)
    {
        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = _paymentMethodTypes,
            Mode = "payment",
            SuccessUrl = _successUrl,
            CancelUrl = _cancelUrl,
            LineItems = new List<SessionLineItemOptions>
            {
                new()
                {
                    Quantity = 1,
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = currency,
                        UnitAmount = (long)(amount * 100),
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = description
                        }
                    }
                }
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options);

        return new PaymentProviderResult
        {
            ExternalId = session.Id,
            CheckoutUrl = session.Url,
            Status = "pending"
        };
    }

    public async Task<PaymentProviderResult> GetStatusAsync(string externalId)
    {
        var service = new SessionService();
        var session = await service.GetAsync(externalId);

        return new PaymentProviderResult
        {
            ExternalId = session.Id,
            Status = session.PaymentStatus // paid, unpaid
        };
    }

    public async Task<PaymentProviderResult> RefundAsync(string externalId, decimal? amount, string currency)
    {
        // externalId is the Checkout Session id — refunds are issued against the PaymentIntent.
        var sessionService = new SessionService();
        var session = await sessionService.GetAsync(externalId);

        var options = new RefundCreateOptions { PaymentIntent = session.PaymentIntentId };
        if (amount.HasValue)
            options.Amount = (long)(amount.Value * 100);

        var refundService = new RefundService();
        var refund = await refundService.CreateAsync(options);

        return new PaymentProviderResult
        {
            ExternalId = session.Id,
            Status = refund.Status // succeeded, pending, failed, canceled
        };
    }
}