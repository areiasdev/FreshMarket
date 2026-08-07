using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Payments.Models;

namespace FreshMarket.Application.Payments.Commands.Refund;

public record RefundPaymentCommand(int OrderId, decimal? Amount) : IRequest<PaymentDto>;

public class RefundPaymentCommandHandler : IRequestHandler<RefundPaymentCommand, PaymentDto>
{
    private readonly IPaymentService _paymentService;

    public RefundPaymentCommandHandler(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    public async Task<PaymentDto> Handle(RefundPaymentCommand request, CancellationToken ct)
        => await _paymentService.RefundAsync(request.OrderId, request.Amount, ct).ConfigureAwait(false);
}
