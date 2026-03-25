using FreshMarket.Application.Orders.Commands.Cancel;
using FreshMarket.Application.Orders.Commands.UpdateStatus;
using FreshMarket.Application.Orders.Queries;
using FreshMarket.Domain.Enums;
using FreshMarket.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;

namespace FreshMarket.Web.Endpoints.Admin;

public class AdminOrders : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "AdminPolicy")
            .MapGet(GetOrdersByStatus, "status/{status}")
            .MapGet(GetOrdersBySlot, "slot/{slotId}")
            .MapGet(GetHarvestList, "harvest/{date}")
            .MapPut(UpdateOrderStatus, "{id}/status")
            .MapPut(CancelOrder, "{id}/cancel");
    }

    public async Task<IResult> GetOrdersByStatus(OrderStatus status, ISender sender)
    {
        var result = await sender.Send(new GetOrdersByStatusQuery(status)).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> GetOrdersBySlot(int slotId, ISender sender)
    {
        var result = await sender.Send(new GetOrdersBySlotQuery(slotId)).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> GetHarvestList(DateOnly date, ISender sender)
    {
        var result = await sender.Send(new GetHarvestListQuery(date)).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> UpdateOrderStatus(int id, UpdateOrderStatusCommand command, ISender sender)
    {
        await sender.Send(command with { OrderId = id }).ConfigureAwait(false);
        return Results.NoContent();
    }

    public async Task<IResult> CancelOrder(int id, ISender sender)
    {
        await sender.Send(new CancelOrderCommand(id)).ConfigureAwait(false);
        return Results.NoContent();
    }
}
