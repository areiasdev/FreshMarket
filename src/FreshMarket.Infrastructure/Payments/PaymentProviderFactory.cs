using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Domain.Enums;
using Microsoft.Extensions.DependencyInjection;

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
            PaymentMethodEnum.Card  => _sp.GetRequiredKeyedService<StripePaymentProvider>("card"),
            PaymentMethodEnum.MBWay => _sp.GetRequiredKeyedService<StripePaymentProvider>("mb_way"),
            PaymentMethodEnum.Cash  => _sp.GetRequiredService<CashPaymentProvider>(),
            _ => throw new NotSupportedException($"Método {method} não suportado")
        };
}