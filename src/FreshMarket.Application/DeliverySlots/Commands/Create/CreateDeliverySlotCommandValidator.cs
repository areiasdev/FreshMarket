using FreshMarket.Application.DeliverySlots.Commands.Create;

namespace FreshMarket.Application.DeliverySlots.Commands.Create;

public class CreateDeliverySlotCommandValidator : AbstractValidator<CreateDeliverySlotCommand>
{
    public CreateDeliverySlotCommandValidator()
    {
        RuleFor(x => x.DeliveryDate)
            .Must(d => d >= DateOnly.FromDateTime(DateTime.UtcNow))
            .WithMessage("A data de entrega não pode ser no passado.");
        RuleFor(x => x.MaxOrders).GreaterThan(0);
        RuleFor(x => x.EndTime).GreaterThan(x => x.StartTime)
            .WithMessage("A hora de fim deve ser posterior à hora de início.");
    }
}
