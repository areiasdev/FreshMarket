using FreshMarket.Application.Products.Commands.Create;

namespace FreshMarket.Application.Products.Commands.Create;

public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.PricePerUnit).GreaterThan(0);
        RuleFor(x => x.MinQuantity).GreaterThan(0);
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
    }
}
