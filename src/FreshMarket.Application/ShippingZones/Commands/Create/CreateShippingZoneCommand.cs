using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.ShippingZones.Models;

namespace FreshMarket.Application.ShippingZones.Commands.Create;

public record CreateShippingZoneCommand(
    string PostalCodePrefix,
    string City,
    decimal ShippingFee,
    decimal MinOrderValue
) : IRequest<ShippingZoneDto>;

public class CreateShippingZoneCommandHandler : IRequestHandler<CreateShippingZoneCommand, ShippingZoneDto>
{
    private readonly IShippingZoneService _shippingZoneService;

    public CreateShippingZoneCommandHandler(IShippingZoneService shippingZoneService)
    {
        _shippingZoneService = shippingZoneService;
    }

    public async Task<ShippingZoneDto> Handle(CreateShippingZoneCommand request, CancellationToken ct)
        => await _shippingZoneService.CreateAsync(
            request.PostalCodePrefix, request.City,
            request.ShippingFee, request.MinOrderValue, ct
        ).ConfigureAwait(false);
}
