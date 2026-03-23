using FreshMarket.Application.Orders.Commands.UpdateStatus;

namespace FreshMarket.Application.Orders.Commands.UpdateStatus;

public class UpdateOrderStatusCommandValidator : AbstractValidator<UpdateOrderStatusCommand>
{
    public UpdateOrderStatusCommandValidator()
    {
        RuleFor(x => x.OrderId).GreaterThan(0);
        RuleFor(x => x.Status).IsInEnum();
    }
}
