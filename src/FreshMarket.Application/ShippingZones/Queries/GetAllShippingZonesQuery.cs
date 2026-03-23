using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.ShippingZones.Models;

namespace FreshMarket.Application.ShippingZones.Queries;

public record GetAllShippingZonesQuery : IRequest<IEnumerable<ShippingZoneDto>>;

public class GetAllShippingZonesQueryHandler : IRequestHandler<GetAllShippingZonesQuery, IEnumerable<ShippingZoneDto>>
{
    private readonly IShippingZoneService _shippingZoneService;

    public GetAllShippingZonesQueryHandler(IShippingZoneService shippingZoneService)
    {
        _shippingZoneService = shippingZoneService;
    }

    public async Task<IEnumerable<ShippingZoneDto>> Handle(GetAllShippingZonesQuery request, CancellationToken ct)
        => await _shippingZoneService.GetAllAsync(ct).ConfigureAwait(false);
}
