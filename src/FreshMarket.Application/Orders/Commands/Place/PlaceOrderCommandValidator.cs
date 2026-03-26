namespace FreshMarket.Application.Orders.Commands.Place;

public class PlaceOrderCommandValidator : AbstractValidator<PlaceOrderCommand>
{
    public PlaceOrderCommandValidator()
    {
        RuleFor(x => x.UserId).GreaterThan(0);
        RuleFor(x => x.DeliverySlotId).GreaterThan(0);

        // ← PostalCodePrefix removido
        RuleFor(x => x.DeliveryStreet).NotEmpty().MaximumLength(300);
        RuleFor(x => x.DeliveryPostalCode)
            .NotEmpty()
            .Matches(@"^\d{4}-\d{3}$").WithMessage("Código postal inválido. Formato esperado: 0000-000.");
        RuleFor(x => x.DeliveryCity).NotEmpty().MaximumLength(100);
        RuleFor(x => x.DeliveryCountry).NotEmpty().Length(2, 3);

        RuleFor(x => x.Items)
            .NotEmpty().WithMessage("A encomenda deve ter pelo menos um produto.");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).GreaterThan(0);
            item.RuleFor(i => i.Quantity).GreaterThan(0);
        });
    }
}