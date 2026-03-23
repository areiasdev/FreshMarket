using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Orders.Models;

namespace FreshMarket.Application.Orders.Queries;

public record GetOrdersBySlotQuery(int SlotId) : IRequest<IEnumerable<OrderSummaryDto>>;

public class GetOrdersBySlotQueryHandler : IRequestHandler<GetOrdersBySlotQuery, IEnumerable<OrderSummaryDto>>
{
    private readonly IOrderService _orderService;

    public GetOrdersBySlotQueryHandler(IOrderService orderService)
    {
        _orderService = orderService;
    }

    public async Task<IEnumerable<OrderSummaryDto>> Handle(GetOrdersBySlotQuery request, CancellationToken ct)
        => await _orderService.GetBySlotAsync(request.SlotId, ct).ConfigureAwait(false);
}
