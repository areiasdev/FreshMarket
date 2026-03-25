using FreshMarket.Application.ShippingZones.Commands.Create;
using FreshMarket.Application.ShippingZones.Commands.Toggle;
using FreshMarket.Application.ShippingZones.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;

namespace FreshMarket.Web.Endpoints.Admin;

public class AdminShippingZones : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "AdminPolicy")
            .MapGet(GetAll, "")
            .MapPost(Create, "")
            .MapPatch("{id:int}/toggle-active", ToggleActive);
    }

    public async Task<IResult> GetAll([AsParameters] GetAdminShippingZonesQuery query, ISender sender)
    {
        var result = await sender.Send(query).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> Create(CreateShippingZoneCommand command, ISender sender)
    {
        var result = await sender.Send(command).ConfigureAwait(false);
        return Results.Created($"/api/admin/shippingzones/{result.Id}", result);
    }

    public async Task<IResult> ToggleActive(int id, ISender sender)
    {
        await sender.Send(new ToggleShippingZoneActiveCommand(id)).ConfigureAwait(false);
        return Results.NoContent();
    }
}