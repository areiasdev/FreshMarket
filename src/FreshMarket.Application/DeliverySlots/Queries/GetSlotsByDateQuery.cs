using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.DeliverySlots.Models;

namespace FreshMarket.Application.DeliverySlots.Queries;

public record GetSlotsByDateQuery(DateOnly Date) : IRequest<IEnumerable<DeliverySlotDto>>;

public class GetSlotsByDateQueryHandler : IRequestHandler<GetSlotsByDateQuery, IEnumerable<DeliverySlotDto>>
{
    private readonly IDeliverySlotService _deliverySlotService;

    public GetSlotsByDateQueryHandler(IDeliverySlotService deliverySlotService)
    {
        _deliverySlotService = deliverySlotService;
    }

    public async Task<IEnumerable<DeliverySlotDto>> Handle(GetSlotsByDateQuery request, CancellationToken ct)
        => await _deliverySlotService.GetByDateAsync(request.Date, ct).ConfigureAwait(false);
}
