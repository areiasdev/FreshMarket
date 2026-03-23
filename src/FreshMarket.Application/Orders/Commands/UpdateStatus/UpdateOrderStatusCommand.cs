using FreshMarket.Application.Common.Interfaces;

namespace FreshMarket.Application.Orders.Commands.UpdateStatus;

public record UpdateOrderStatusCommand(int OrderId, OrderStatus Status) : IRequest;

public class UpdateOrderStatusCommandHandler : IRequestHandler<UpdateOrderStatusCommand>
{
    private readonly IOrderService _orderService;

    public UpdateOrderStatusCommandHandler(IOrderService orderService)
    {
        _orderService = orderService;
    }

    public async Task Handle(UpdateOrderStatusCommand request, CancellationToken ct)
        => await _orderService.UpdateStatusAsync(request.OrderId, request.Status, ct).ConfigureAwait(false);
}
