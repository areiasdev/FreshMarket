using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.ShippingZones.Models;

namespace FreshMarket.Application.ShippingZones.Queries;

public record GetShippingZoneByPostalCodeQuery(string PostalCodePrefix) : IRequest<ShippingZoneDto>;

public class GetShippingZoneByPostalCodeQueryHandler : IRequestHandler<GetShippingZoneByPostalCodeQuery, ShippingZoneDto>
{
    private readonly IShippingZoneService _shippingZoneService;

    public GetShippingZoneByPostalCodeQueryHandler(IShippingZoneService shippingZoneService)
    {
        _shippingZoneService = shippingZoneService;
    }

    public async Task<ShippingZoneDto> Handle(GetShippingZoneByPostalCodeQuery request, CancellationToken ct)
        => await _shippingZoneService.GetByPostalCodeAsync(request.PostalCodePrefix, ct).ConfigureAwait(false);
}
