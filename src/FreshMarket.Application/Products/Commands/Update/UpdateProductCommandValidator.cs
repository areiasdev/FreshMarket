using FreshMarket.Application.Products.Commands.Update;

namespace FreshMarket.Application.Products.Commands.Update;

public class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Name).NotEmpty().MaximumLength(150);
        RuleFor(x => x.PricePerUnit).GreaterThan(0);
        RuleFor(x => x.MinQuantity).GreaterThan(0);
        RuleFor(x => x.MinQuantity)
            .Must(q => q % 1 == 0)
            .When(x => x.UnitType == (int)UnitType.Unit)
            .WithMessage("Para produtos vendidos por unidade, a quantidade mínima deve ser um número inteiro.");
        RuleFor(x => x.StockQuantity).GreaterThanOrEqualTo(0);
    }
}
