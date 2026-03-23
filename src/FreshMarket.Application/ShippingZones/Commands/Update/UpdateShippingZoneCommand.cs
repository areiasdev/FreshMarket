using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.ShippingZones.Models;

namespace FreshMarket.Application.ShippingZones.Commands.Update;

public record UpdateShippingZoneCommand(int Id, decimal ShippingFee, decimal MinOrderValue, bool IsActive) : IRequest<ShippingZoneDto>;

public class UpdateShippingZoneCommandHandler : IRequestHandler<UpdateShippingZoneCommand, ShippingZoneDto>
{
    private readonly IShippingZoneService _shippingZoneService;

    public UpdateShippingZoneCommandHandler(IShippingZoneService shippingZoneService)
    {
        _shippingZoneService = shippingZoneService;
    }

    public async Task<ShippingZoneDto> Handle(UpdateShippingZoneCommand request, CancellationToken ct)
        => await _shippingZoneService.UpdateAsync(
            request.Id, request.ShippingFee, request.MinOrderValue, request.IsActive, ct
        ).ConfigureAwait(false);
}
