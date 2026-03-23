using FreshMarket.Application.Common.Interfaces;

namespace FreshMarket.Application.DeliverySlots.Commands.Delete;

public record DeleteDeliverySlotCommand(int Id) : IRequest;

public class DeleteDeliverySlotCommandHandler : IRequestHandler<DeleteDeliverySlotCommand>
{
    private readonly IDeliverySlotService _deliverySlotService;

    public DeleteDeliverySlotCommandHandler(IDeliverySlotService deliverySlotService)
    {
        _deliverySlotService = deliverySlotService;
    }

    public async Task Handle(DeleteDeliverySlotCommand request, CancellationToken ct)
        => await _deliverySlotService.DeleteAsync(request.Id, ct).ConfigureAwait(false);
}
