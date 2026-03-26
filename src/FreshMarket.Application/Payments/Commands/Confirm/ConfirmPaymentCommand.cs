using FreshMarket.Application.Payments.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FreshMarket.Application.Payments.Commands.Confirm
{
    public record ConfirmPaymentCommand(string ExternalTransactionId) : IRequest<PaymentDto>;

    public class ConfirmPaymentCommandHandler : IRequestHandler<ConfirmPaymentCommand, PaymentDto>
    {
        private readonly IPaymentService _service;

        public ConfirmPaymentCommandHandler(IPaymentService service)
        {
            _service = service;
        }

        public async Task<PaymentDto> Handle(ConfirmPaymentCommand request, CancellationToken ct)
            => await _service.ConfirmPaymentAsync(request.ExternalTransactionId, ct);
    }
}
