using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.ShippingZones.Models;

namespace FreshMarket.Application.ShippingZones.Commands.Update;

public record UpdateShippingZoneCommand(
    int Id,
    string City,
    string PostalCodePrefix,
    decimal ShippingFee,
    decimal MinOrderValue,
    bool IsActive
) : IRequest<ShippingZoneDto>;

public class UpdateShippingZoneCommandHandler(IShippingZoneService shippingZoneService)
    : IRequestHandler<UpdateShippingZoneCommand, ShippingZoneDto>
{
    public async Task<ShippingZoneDto> Handle(UpdateShippingZoneCommand request, CancellationToken ct)
        => await shippingZoneService.UpdateAsync(
            request.Id, request.City, request.PostalCodePrefix,
            request.ShippingFee, request.MinOrderValue, request.IsActive, ct
        ).ConfigureAwait(false);
}
