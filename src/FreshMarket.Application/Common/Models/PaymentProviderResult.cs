using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FreshMarket.Application.Common.Models
{
    public class PaymentProviderResult
    {
        public string ExternalId { get; set; } = default!;
        public string? CheckoutUrl { get; set; }
        public string Status { get; set; } = "pending"; // pending, succeeded, failed
    }
}
