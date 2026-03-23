using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.DeliverySlots.Models;

namespace FreshMarket.Application.DeliverySlots.Commands.Create;

public record CreateDeliverySlotCommand(
    DateOnly DeliveryDate,
    TimeOnly StartTime,
    TimeOnly EndTime,
    int MaxOrders,
    int? ShippingZoneId
) : IRequest<DeliverySlotDto>;

public class CreateDeliverySlotCommandHandler : IRequestHandler<CreateDeliverySlotCommand, DeliverySlotDto>
{
    private readonly IDeliverySlotService _deliverySlotService;

    public CreateDeliverySlotCommandHandler(IDeliverySlotService deliverySlotService)
    {
        _deliverySlotService = deliverySlotService;
    }

    public async Task<DeliverySlotDto> Handle(CreateDeliverySlotCommand request, CancellationToken ct)
        => await _deliverySlotService.CreateAsync(
            request.DeliveryDate, request.StartTime, request.EndTime,
            request.MaxOrders, request.ShippingZoneId, ct
        ).ConfigureAwait(false);
}
