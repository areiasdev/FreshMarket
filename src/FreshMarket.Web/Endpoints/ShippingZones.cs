using FreshMarket.Application.ShippingZones.Commands.Create;
using FreshMarket.Application.ShippingZones.Commands.Update;
using FreshMarket.Application.ShippingZones.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;

namespace FreshMarket.Web.Endpoints;

public class ShippingZones : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetAllShippingZones)
            .MapGet(GetByPostalCode, "postal/{postalCodePrefix}")
            .MapPost(CreateShippingZone).RequireAuthorization()
            .MapPut(UpdateShippingZone, "{id}").RequireAuthorization();
    }

    public async Task<IResult> GetAllShippingZones(ISender sender)
    {
        var result = await sender.Send(new GetAllShippingZonesQuery()).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> GetByPostalCode(string postalCodePrefix, ISender sender)
    {
        var result = await sender.Send(new GetShippingZoneByPostalCodeQuery(postalCodePrefix)).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> CreateShippingZone(CreateShippingZoneCommand command, ISender sender)
    {
        var result = await sender.Send(command).ConfigureAwait(false);
        return Results.Created($"/api/shippingzones/{result.Id}", result);
    }

    public async Task<IResult> UpdateShippingZone(int id, UpdateShippingZoneCommand command, ISender sender)
    {
        var result = await sender.Send(command with { Id = id }).ConfigureAwait(false);
        return Results.Ok(result);
    }
}
