using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Models;
using Stripe;
using Stripe.Checkout;

public class StripePaymentProvider : IPaymentProvider
{
    private readonly string _successUrl = "https://yourapp.com/success";
    private readonly string _cancelUrl = "https://yourapp.com/cancel";

    public StripePaymentProvider(IConfiguration config)
    {
        StripeConfiguration.ApiKey = config["Stripe:SecretKey"];
    }

    public async Task<PaymentProviderResult> CreateAsync(decimal amount, string currency, string description)
    {
        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
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
}