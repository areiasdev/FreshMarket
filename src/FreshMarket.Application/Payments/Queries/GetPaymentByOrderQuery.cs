using FreshMarket.Application.Payments.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FreshMarket.Application.Payments.Queries
{
    public record GetPaymentByOrderQuery(int OrderId) : IRequest<PaymentDto?>;

    public class GetPaymentByOrderQueryHandler : IRequestHandler<GetPaymentByOrderQuery, PaymentDto?>
    {
        private readonly IPaymentService _service;

        public GetPaymentByOrderQueryHandler(IPaymentService service)
        {
            _service = service;
        }

        public async Task<PaymentDto?> Handle(GetPaymentByOrderQuery request, CancellationToken ct)
            => await _service.GetByOrderIdAsync(request.OrderId, ct);
    }
}
