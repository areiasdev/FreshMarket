using FreshMarket.Application.Addresses.Commands;
using FreshMarket.Application.Addresses.Queries;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;
using System.Security.Claims;

namespace FreshMarket.Web.Endpoints;

public class Addresses : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "CustomerPolicy")
            .MapGet(GetUserAddresses, "user/{userId}")
            .MapGet(GetAddressById, "{id}")
            .MapPost(CreateAddress)
            .MapPut(UpdateAddress, "{id}")
            .MapDelete(DeleteAddress, "{id}")
            .MapPut(SetDefaultAddress, "{id}/default");

        app.MapGroup(this)
            .MapGet(ValidatePostalCode, "validate-postal-code");
    }

    public async Task<IResult> GetUserAddresses(int userId, ClaimsPrincipal user, ISender sender)
    {
        var requestingId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = user.IsInRole("Admin") || user.IsInRole("SuperAdmin");
        if (!isAdmin && requestingId != userId) return Results.Forbid();

        var result = await sender.Send(new GetUserAddressesQuery(userId));
        return Results.Ok(result);
    }

    public async Task<IResult> GetAddressById(int id, ClaimsPrincipal user, ISender sender)
    {
        var result = await sender.Send(new GetAddressByIdQuery(id));
        var requestingId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = user.IsInRole("Admin") || user.IsInRole("SuperAdmin");
        if (!isAdmin && result.UserId != requestingId) return Results.Forbid();

        return Results.Ok(result);
    }

    public async Task<IResult> CreateAddress(CreateAddressCommand command, ClaimsPrincipal user, ISender sender)
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        command.Request.UserId = userId;
        var result = await sender.Send(command);
        return Results.Created($"/api/addresses/{result.Id}", result);
    }

    public async Task<IResult> UpdateAddress(int id, UpdateAddressCommand command, ClaimsPrincipal user, ISender sender)
    {
        var existing = await sender.Send(new GetAddressByIdQuery(id));
        var requestingId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = user.IsInRole("Admin") || user.IsInRole("SuperAdmin");
        if (!isAdmin && existing.UserId != requestingId) return Results.Forbid();

        var result = await sender.Send(command with { Id = id });
        return Results.Ok(result);
    }

    public async Task<IResult> DeleteAddress(int id, ClaimsPrincipal user, ISender sender)
    {
        var existing = await sender.Send(new GetAddressByIdQuery(id));
        var requestingId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = user.IsInRole("Admin") || user.IsInRole("SuperAdmin");
        if (!isAdmin && existing.UserId != requestingId) return Results.Forbid();

        await sender.Send(new DeleteAddressCommand(id));
        return Results.NoContent();
    }

    public async Task<IResult> SetDefaultAddress(int id, int userId, ClaimsPrincipal user, ISender sender)
    {
        var requestingId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = user.IsInRole("Admin") || user.IsInRole("SuperAdmin");
        if (!isAdmin && requestingId != userId) return Results.Forbid();

        await sender.Send(new SetDefaultAddressCommand(userId, id));
        return Results.NoContent();
    }

    public Task<IResult> ValidatePostalCode(string postalCode, IPostalCodeService postalCodeService)
    {
        var result = postalCodeService.Validate(postalCode);
        return Task.FromResult(Results.Ok(result));
    }
}
