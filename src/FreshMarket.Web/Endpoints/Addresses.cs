using FreshMarket.Application.Addresses.Commands;
using FreshMarket.Application.Addresses.Queries;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;

namespace FreshMarket.Web.Endpoints;

public class Addresses : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetUserAddresses, "user/{userId}")
            .MapGet(GetAddressById, "{id}")
            .MapPost(CreateAddress)
            .MapPut(UpdateAddress, "{id}")
            .MapDelete(DeleteAddress, "{id}")
            .MapPut(SetDefaultAddress, "{id}/default")
            .MapGet(ValidatePostalCode, "validate-postal-code");
    }

    public async Task<IResult> GetUserAddresses(int userId, ISender sender)
    {
        var result = await sender.Send(new GetUserAddressesQuery(userId));
        return Results.Ok(result);
    }

    public async Task<IResult> GetAddressById(int id, ISender sender)
    {
        var result = await sender.Send(new GetAddressByIdQuery(id));
        return Results.Ok(result);
    }

    public async Task<IResult> CreateAddress(CreateAddressCommand command, ISender sender)
    {
        var result = await sender.Send(command);
        return Results.Created($"/api/addresses/{result.Id}", result);
    }

    public async Task<IResult> UpdateAddress(int id, UpdateAddressCommand command, ISender sender)
    {
        var result = await sender.Send(command with { Id = id });
        return Results.Ok(result);
    }

    public async Task<IResult> DeleteAddress(int id, ISender sender)
    {
        await sender.Send(new DeleteAddressCommand(id));
        return Results.NoContent();
    }

    public async Task<IResult> SetDefaultAddress(int id, int userId, ISender sender)
    {
        await sender.Send(new SetDefaultAddressCommand(userId, id));
        return Results.NoContent();
    }

    public Task<IResult> ValidatePostalCode(string postalCode, IPostalCodeService postalCodeService)
    {
        var result = postalCodeService.Validate(postalCode);
        return Task.FromResult(Results.Ok(result));
    }
}