namespace FreshMarket.Application.Payments.Commands.Refund;

public class RefundPaymentCommandValidator : AbstractValidator<RefundPaymentCommand>
{
    public RefundPaymentCommandValidator()
    {
        RuleFor(x => x.Amount).GreaterThan(0).When(x => x.Amount.HasValue);
    }
}
