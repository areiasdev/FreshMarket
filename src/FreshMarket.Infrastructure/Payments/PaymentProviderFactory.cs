using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Domain.Enums;

public class PaymentProviderFactory : IPaymentProviderFactory
{
    private readonly IServiceProvider _sp;

    public PaymentProviderFactory(IServiceProvider sp)
    {
        _sp = sp;
    }

    public IPaymentProvider Get(PaymentMethodEnum method)
        => method switch
        {
            PaymentMethodEnum.Card => _sp.GetRequiredService<StripePaymentProvider>(),
            PaymentMethodEnum.MBWay => _sp.GetRequiredService<MbWayPaymentProvider>(),
            _ => throw new NotSupportedException($"Método {method} não suportado")
        };
}