using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FreshMarket.Application.Common.Interfaces
{
    public interface IPaymentProvider
    {
        Task<PaymentProviderResult> CreateAsync(decimal amount, string currency, string description);

        Task<PaymentProviderResult> GetStatusAsync(string externalId);

        /// <summary>Refunds the payment. Pass null amount for a full refund.</summary>
        Task<PaymentProviderResult> RefundAsync(string externalId, decimal? amount, string currency);
    }
}
