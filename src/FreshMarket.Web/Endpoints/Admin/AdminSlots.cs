using FreshMarket.Application.DeliverySlots.Commands.Create;
using FreshMarket.Application.DeliverySlots.Commands.Toggle;
using FreshMarket.Application.DeliverySlots.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;

namespace FreshMarket.Web.Endpoints.Admin;

public class AdminSlots : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "AdminPolicy")
            .MapGet(GetSlotsByDate, "date/{date}")
            .MapGet(GetAll, "")
            .MapPost(Create, "")
            .MapPatch("{id:int}/toggle-active", ToggleActive);
    }

    public async Task<IResult> GetSlotsByDate(DateOnly date, ISender sender)
    {
        var result = await sender.Send(new GetSlotsByDateQuery(date)).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> GetAll([AsParameters] GetAdminDeliverySlotsQuery query, ISender sender)
    {
        var result = await sender.Send(query).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> Create(CreateDeliverySlotCommand command, ISender sender)
    {
        var result = await sender.Send(command).ConfigureAwait(false);
        return Results.Created($"/api/admin/slots/{result.Id}", result);
    }

    public async Task<IResult> ToggleActive(int id, ISender sender)
    {
        await sender.Send(new ToggleDeliverySlotActiveCommand(id)).ConfigureAwait(false);
        return Results.NoContent();
    }
}
