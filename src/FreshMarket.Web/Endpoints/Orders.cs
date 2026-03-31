using FreshMarket.Application.Orders.Commands.Cancel;
using FreshMarket.Application.Orders.Commands.Place;
using FreshMarket.Application.Orders.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;
using System.Security.Claims;

namespace FreshMarket.Web.Endpoints;

public class Orders : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "CustomerPolicy")
            .MapGet(GetMyOrders, "my")
            .MapGet(GetById, "{id:int}")
            .MapPost(PlaceOrder, "")
            .MapPut("{id:int}/cancel", CancelOrder);
    }

    public async Task<IResult> GetMyOrders(ClaimsPrincipal user, ISender sender, CancellationToken ct)
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await sender.Send(new GetMyOrdersQuery(userId), ct).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> GetById(int id, ClaimsPrincipal user, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetOrderByIdQuery(id), ct).ConfigureAwait(false);
        var requestingId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = user.IsInRole("Admin") || user.IsInRole("SuperAdmin");
        if (!isAdmin && result.UserId != requestingId) return Results.Forbid();
        return Results.Ok(result);
    }

    public async Task<IResult> PlaceOrder(PlaceOrderCommand command, ClaimsPrincipal user, ISender sender, CancellationToken ct)
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await sender.Send(command with { UserId = userId }, ct).ConfigureAwait(false);
        return Results.Created($"/api/orders/{result.Id}", result);
    }

    public async Task<IResult> CancelOrder(int id, ClaimsPrincipal user, ISender sender, CancellationToken ct)
    {
        var order = await sender.Send(new GetOrderByIdQuery(id), ct).ConfigureAwait(false);
        var requestingId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = user.IsInRole("Admin") || user.IsInRole("SuperAdmin");
        if (!isAdmin && order.UserId != requestingId) return Results.Forbid();
        await sender.Send(new CancelOrderCommand(id), ct).ConfigureAwait(false);
        return Results.NoContent();
    }
}
