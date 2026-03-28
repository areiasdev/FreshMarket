using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Orders.Models;

namespace FreshMarket.Application.Orders.Queries;

public record GetHarvestListQuery(DateOnly From, DateOnly To) : IRequest<IEnumerable<HarvestItemDto>>;

public class GetHarvestListQueryHandler : IRequestHandler<GetHarvestListQuery, IEnumerable<HarvestItemDto>>
{
    private readonly IOrderService _orderService;

    public GetHarvestListQueryHandler(IOrderService orderService)
    {
        _orderService = orderService;
    }

    public async Task<IEnumerable<HarvestItemDto>> Handle(GetHarvestListQuery request, CancellationToken ct)
        => await _orderService.GetHarvestListAsync(request.From, request.To, ct).ConfigureAwait(false);
}
