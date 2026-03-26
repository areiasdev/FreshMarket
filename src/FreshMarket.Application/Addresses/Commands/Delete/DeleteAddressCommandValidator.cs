using FluentValidation;
using FreshMarket.Application.Addresses.Commands;

public class DeleteAddressCommandValidator : AbstractValidator<DeleteAddressCommand>
{
    public DeleteAddressCommandValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0);
    }
}