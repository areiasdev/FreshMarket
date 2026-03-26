using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.DeliverySlots.Models;

namespace FreshMarket.Application.DeliverySlots.Commands.Update;

public record UpdateDeliverySlotCommand(int Id, int MaxOrders, int ShippingFee, bool IsActive) : IRequest<DeliverySlotDto>;

public class UpdateDeliverySlotCommandHandler : IRequestHandler<UpdateDeliverySlotCommand, DeliverySlotDto>
{
    private readonly IDeliverySlotService _deliverySlotService;

    public UpdateDeliverySlotCommandHandler(IDeliverySlotService deliverySlotService)
    {
        _deliverySlotService = deliverySlotService;
    }

    public async Task<DeliverySlotDto> Handle(UpdateDeliverySlotCommand request, CancellationToken ct)
        => await _deliverySlotService.UpdateAsync(request.Id, request.ShippingFee , request.MaxOrders, request.IsActive, ct).ConfigureAwait(false);
}
