using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Orders.Models;

namespace FreshMarket.Application.Orders.Queries;

public record GetMyOrdersQuery(int UserId) : IRequest<IEnumerable<OrderSummaryDto>>;

public class GetMyOrdersQueryHandler : IRequestHandler<GetMyOrdersQuery, IEnumerable<OrderSummaryDto>>
{
    private readonly IOrderService _orderService;

    public GetMyOrdersQueryHandler(IOrderService orderService)
    {
        _orderService = orderService;
    }

    public async Task<IEnumerable<OrderSummaryDto>> Handle(GetMyOrdersQuery request, CancellationToken ct)
        => await _orderService.GetMyOrdersAsync(request.UserId, ct).ConfigureAwait(false);
}
