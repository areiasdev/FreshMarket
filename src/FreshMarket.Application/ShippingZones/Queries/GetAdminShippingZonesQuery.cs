using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Models;
using FreshMarket.Application.ShippingZones.Models;
using MediatR;

namespace FreshMarket.Application.ShippingZones.Queries;

public record GetAdminShippingZonesQuery : IRequest<PagedResult<ShippingZoneDto>>
{
    public int Page { get; init; }
    public int PageSize { get; init; }
}

public class GetAdminShippingZonesQueryHandler : IRequestHandler<GetAdminShippingZonesQuery, PagedResult<ShippingZoneDto>>
{
    private readonly IShippingZoneService _shippingZoneService;

    public GetAdminShippingZonesQueryHandler(IShippingZoneService shippingZoneService)
    {
        _shippingZoneService = shippingZoneService;
    }

    public async Task<PagedResult<ShippingZoneDto>> Handle(GetAdminShippingZonesQuery request, CancellationToken cancellationToken)
        => await _shippingZoneService.GetAdminListAsync(request.Page, request.PageSize, cancellationToken).ConfigureAwait(false);
}