using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Orders.Models;

namespace FreshMarket.Application.Orders.Queries;

public record GetOrdersByStatusQuery : IRequest<PagedResult<OrderSummaryDto>>
{
    public OrderStatus Status { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}
public class GetOrdersByStatusQueryHandler : IRequestHandler<GetOrdersByStatusQuery, PagedResult<OrderSummaryDto>>
{
    private readonly IOrderService _orderService;

    public GetOrdersByStatusQueryHandler(IOrderService orderService)
    {
        _orderService = orderService;
    }

    public async Task<PagedResult<OrderSummaryDto>> Handle(GetOrdersByStatusQuery request, CancellationToken ct)
    => await _orderService.GetByStatusAsync(request.Status, request.Page, request.PageSize, ct).ConfigureAwait(false);
}
