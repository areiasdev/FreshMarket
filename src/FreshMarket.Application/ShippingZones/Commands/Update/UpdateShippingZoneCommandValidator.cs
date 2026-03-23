using FreshMarket.Application.ShippingZones.Commands.Update;

namespace FreshMarket.Application.ShippingZones.Commands.Update;

public class UpdateShippingZoneCommandValidator : AbstractValidator<UpdateShippingZoneCommand>
{
    public UpdateShippingZoneCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.ShippingFee).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MinOrderValue).GreaterThanOrEqualTo(0);
    }
}
