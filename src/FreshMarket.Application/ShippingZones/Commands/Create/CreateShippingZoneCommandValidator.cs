using FreshMarket.Application.ShippingZones.Commands.Create;

namespace FreshMarket.Application.ShippingZones.Commands.Create;

public class CreateShippingZoneCommandValidator : AbstractValidator<CreateShippingZoneCommand>
{
    public CreateShippingZoneCommandValidator()
    {
        RuleFor(x => x.PostalCodePrefix).NotEmpty().MaximumLength(4)
            .Matches("^[0-9]+$").WithMessage("O prefixo postal só pode conter números.");
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ShippingFee).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MinOrderValue).GreaterThanOrEqualTo(0);
    }
}
