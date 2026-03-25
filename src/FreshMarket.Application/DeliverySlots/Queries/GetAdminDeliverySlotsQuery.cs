using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Models;
using FreshMarket.Application.DeliverySlots.Models;
using MediatR;

namespace FreshMarket.Application.DeliverySlots.Queries;

public record GetAdminDeliverySlotsQuery : IRequest<PagedResult<DeliverySlotDto>>
{
    public int Page { get; init; }
    public int PageSize { get; init; }
}

public class GetAdminDeliverySlotsQueryHandler : IRequestHandler<GetAdminDeliverySlotsQuery, PagedResult<DeliverySlotDto>>
{
    private readonly IDeliverySlotService _deliverySlotService;

    public GetAdminDeliverySlotsQueryHandler(IDeliverySlotService deliverySlotService)
    {
        _deliverySlotService = deliverySlotService;
    }

    public async Task<PagedResult<DeliverySlotDto>> Handle(GetAdminDeliverySlotsQuery request, CancellationToken cancellationToken)
        => await _deliverySlotService.GetAdminListAsync(request.Page, request.PageSize, cancellationToken).ConfigureAwait(false);
}