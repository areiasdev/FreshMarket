using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Orders.Models;

namespace FreshMarket.Application.Orders.Queries;

public record GetOrdersByStatusQuery(OrderStatus Status) : IRequest<IEnumerable<OrderSummaryDto>>;

public class GetOrdersByStatusQueryHandler : IRequestHandler<GetOrdersByStatusQuery, IEnumerable<OrderSummaryDto>>
{
    private readonly IOrderService _orderService;

    public GetOrdersByStatusQueryHandler(IOrderService orderService)
    {
        _orderService = orderService;
    }

    public async Task<IEnumerable<OrderSummaryDto>> Handle(GetOrdersByStatusQuery request, CancellationToken ct)
        => await _orderService.GetByStatusAsync(request.Status, ct).ConfigureAwait(false);
}
