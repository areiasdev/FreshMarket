using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.DeliverySlots.Models;

namespace FreshMarket.Application.DeliverySlots.Queries;

public record GetAvailableSlotsQuery(DateOnly Date, string PostalCodePrefix) : IRequest<IEnumerable<DeliverySlotDto>>;

public class GetAvailableSlotsQueryHandler : IRequestHandler<GetAvailableSlotsQuery, IEnumerable<DeliverySlotDto>>
{
    private readonly IDeliverySlotService _deliverySlotService;

    public GetAvailableSlotsQueryHandler(IDeliverySlotService deliverySlotService)
    {
        _deliverySlotService = deliverySlotService;
    }

    public async Task<IEnumerable<DeliverySlotDto>> Handle(GetAvailableSlotsQuery request, CancellationToken ct)
        => await _deliverySlotService.GetAvailableAsync(request.Date, request.PostalCodePrefix, ct).ConfigureAwait(false);
}
