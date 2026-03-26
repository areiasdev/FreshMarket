using FreshMarket.Application.Payments.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FreshMarket.Application.Payments.Commands.Create
{
    public record CreatePaymentCommand(int OrderId, PaymentMethodEnum Method) : IRequest<PaymentDto>;

    public class CreatePaymentCommandHandler : IRequestHandler<CreatePaymentCommand, PaymentDto>
    {
        private readonly IPaymentService _service;

        public CreatePaymentCommandHandler(IPaymentService service)
        {
            _service = service;
        }

        public async Task<PaymentDto> Handle(CreatePaymentCommand request, CancellationToken ct)
            => await _service.CreatePaymentAsync(request.OrderId, request.Method, ct);
    }
}
