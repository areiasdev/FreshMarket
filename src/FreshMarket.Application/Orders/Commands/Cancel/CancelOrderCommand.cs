using FreshMarket.Application.Common.Interfaces;

namespace FreshMarket.Application.Orders.Commands.Cancel;

public record CancelOrderCommand(int OrderId) : IRequest;

public class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand>
{
    private readonly IOrderService _orderService;

    public CancelOrderCommandHandler(IOrderService orderService)
    {
        _orderService = orderService;
    }

    public async Task Handle(CancelOrderCommand request, CancellationToken ct)
        => await _orderService.CancelAsync(request.OrderId, ct).ConfigureAwait(false);
}
