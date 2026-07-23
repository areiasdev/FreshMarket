using FreshMarket.Application.Orders.Queries;
using FreshMarket.Application.Payments.Commands;
using FreshMarket.Application.Payments.Commands.Confirm;
using FreshMarket.Application.Payments.Commands.Create;
using FreshMarket.Application.Payments.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;
using System.Security.Claims;

namespace FreshMarket.Web.Endpoints;

public class Payments : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "CustomerPolicy")
            .MapPost(CreatePayment)
            .MapPost(ConfirmPayment, "confirm")
            .MapGet(GetByOrder, "order/{orderId}");
    }

    public async Task<IResult> CreatePayment(CreatePaymentCommand command, ClaimsPrincipal user, ISender sender, CancellationToken ct)
    {
        var order = await sender.Send(new GetOrderByIdQuery(command.OrderId), ct).ConfigureAwait(false);
        if (!IsOwnerOrAdmin(order.UserId, user)) return Results.Forbid();

        var result = await sender.Send(command, ct).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> ConfirmPayment(ConfirmPaymentCommand command, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(command, ct).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> GetByOrder(int orderId, ClaimsPrincipal user, ISender sender, CancellationToken ct)
    {
        var order = await sender.Send(new GetOrderByIdQuery(orderId), ct).ConfigureAwait(false);
        if (!IsOwnerOrAdmin(order.UserId, user)) return Results.Forbid();

        var result = await sender.Send(new GetPaymentByOrderQuery(orderId), ct).ConfigureAwait(false);
        return result is null ? Results.NotFound() : Results.Ok(result);
    }

    private static bool IsOwnerOrAdmin(int orderUserId, ClaimsPrincipal user)
    {
        var requestingId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var isAdmin = user.IsInRole("Admin") || user.IsInRole("SuperAdmin");
        return isAdmin || orderUserId == requestingId;
    }
}