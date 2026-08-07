namespace FreshMarket.Application.Users.Command.Login;

public class GuestCheckoutCommandValidator : AbstractValidator<GuestCheckoutCommand>
{
    public GuestCheckoutCommandValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Phone).MaximumLength(30);
    }
}
