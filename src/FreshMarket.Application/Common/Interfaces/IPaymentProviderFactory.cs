using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

public interface IPaymentProviderFactory
{
    IPaymentProvider Get(PaymentMethodEnum method);
}
