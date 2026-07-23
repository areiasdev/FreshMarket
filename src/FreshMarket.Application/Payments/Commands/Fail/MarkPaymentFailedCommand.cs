using FreshMarket.Application.Common.Interfaces;

namespace FreshMarket.Application.Payments.Commands.Fail;

public record MarkPaymentFailedCommand(string ExternalTransactionId) : IRequest;

public class MarkPaymentFailedCommandHandler : IRequestHandler<MarkPaymentFailedCommand>
{
    private readonly IPaymentService _service;

    public MarkPaymentFailedCommandHandler(IPaymentService service)
    {
        _service = service;
    }

    public async Task Handle(MarkPaymentFailedCommand request, CancellationToken ct)
        => await _service.MarkFailedAsync(request.ExternalTransactionId, ct);
}
