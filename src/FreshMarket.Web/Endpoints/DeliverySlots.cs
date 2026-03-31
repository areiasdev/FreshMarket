using FreshMarket.Application.DeliverySlots.Commands.Create;
using FreshMarket.Application.DeliverySlots.Commands.Delete;
using FreshMarket.Application.DeliverySlots.Commands.Update;
using FreshMarket.Application.DeliverySlots.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;

namespace FreshMarket.Web.Endpoints;

public class DeliverySlots : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "CustomerPolicy")
            .MapGet(GetAvailableSlots, "available")
            .MapGet(GetSlotsByDate, "date/{date}");

        app.MapGroup(this, "AdminPolicy")
            .MapPost(CreateSlot)
            .MapPut(UpdateSlot, "{id}")
            .MapDelete(DeleteSlot, "{id}");
    }

    public async Task<IResult> GetAvailableSlots(DateOnly date, ISender sender, string? postalCodePrefix = null)
    {
        var result = await sender.Send(new GetAvailableSlotsQuery(date, postalCodePrefix)).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> GetSlotsByDate(DateOnly date, ISender sender)
    {
        var result = await sender.Send(new GetSlotsByDateQuery(date)).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> CreateSlot(CreateDeliverySlotCommand command, ISender sender)
    {
        var result = await sender.Send(command).ConfigureAwait(false);
        return Results.Created($"/api/deliveryslots/{result.Id}", result);
    }

    public async Task<IResult> UpdateSlot(int id, UpdateDeliverySlotCommand command, ISender sender)
    {
        var result = await sender.Send(command with { Id = id }).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> DeleteSlot(int id, ISender sender)
    {
        await sender.Send(new DeleteDeliverySlotCommand(id)).ConfigureAwait(false);
        return Results.NoContent();
    }
}
