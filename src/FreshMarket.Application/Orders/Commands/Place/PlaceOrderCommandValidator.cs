namespace FreshMarket.Application.Orders.Commands.Place;

public class PlaceOrderCommandValidator : AbstractValidator<PlaceOrderCommand>
{
    public PlaceOrderCommandValidator()
    {
        RuleFor(x => x.UserId).GreaterThan(0);
        RuleFor(x => x.DeliverySlotId).GreaterThan(0);
        RuleFor(x => x.PostalCodePrefix).NotEmpty().MaximumLength(4);
        RuleFor(x => x.DeliveryAddress).NotEmpty();
        RuleFor(x => x.DeliveryPostalCode).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().WithMessage("A encomenda deve ter pelo menos um produto.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.ProductId).GreaterThan(0);
            item.RuleFor(i => i.Quantity).GreaterThan(0);
        });
    }
}
