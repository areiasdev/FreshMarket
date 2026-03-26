using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Orders.Models;

namespace FreshMarket.Application.Orders.Commands.Place;

public record PlaceOrderItem(int ProductId, decimal Quantity);

public record PlaceOrderCommand(
    int UserId,
    int DeliverySlotId,
    int? AddressId,
    string DeliveryStreet,
    string DeliveryPostalCode,
    string DeliveryCity,
    string DeliveryCountry,
    string? Notes,
    IEnumerable<PlaceOrderItem> Items
) : IRequest<OrderDto>;

public class PlaceOrderCommandHandler : IRequestHandler<PlaceOrderCommand, OrderDto>
{
    private readonly IOrderService _orderService;

    public PlaceOrderCommandHandler(IOrderService orderService)
    {
        _orderService = orderService;
    }

    public async Task<OrderDto> Handle(PlaceOrderCommand request, CancellationToken ct)
        => await _orderService.PlaceOrderAsync(
            request.UserId,
            request.DeliverySlotId,
            request.AddressId,
            request.DeliveryStreet,
            request.DeliveryPostalCode,
            request.DeliveryCity,
            request.DeliveryCountry,
            request.Notes,
            request.Items.Select(i => (i.ProductId, i.Quantity)),
            ct
        ).ConfigureAwait(false);
}