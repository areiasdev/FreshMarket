namespace FreshMarket.Application.Users.Command.Login;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6)
            .Matches("[A-Z]").WithMessage("A password deve ter pelo menos uma letra maiúscula.")
            .Matches("[0-9]").WithMessage("A password deve ter pelo menos um número.");
    }
}
