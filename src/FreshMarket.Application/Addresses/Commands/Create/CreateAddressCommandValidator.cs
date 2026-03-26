using FluentValidation;
using FreshMarket.Application.Addresses.Commands;

public class CreateAddressCommandValidator : AbstractValidator<CreateAddressCommand>
{
    public CreateAddressCommandValidator()
    {
        RuleFor(x => x.Request.UserId)
            .GreaterThan(0);

        RuleFor(x => x.Request.Label)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Request.Street)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Request.PostalCode)
            .NotEmpty()
            .MaximumLength(20);

        RuleFor(x => x.Request.City)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Request.Country)
            .NotEmpty()
            .Length(2); // ISO (PT, ES, etc)
    }
}