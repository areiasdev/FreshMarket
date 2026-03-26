using FreshMarket.Application.Payments.Commands;
using FreshMarket.Application.Payments.Commands.Confirm;
using FreshMarket.Application.Payments.Commands.Create;
using FreshMarket.Application.Payments.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;

namespace FreshMarket.Web.Endpoints;

public class Payments : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapPost(CreatePayment)
            .MapPost(ConfirmPayment, "confirm")
            .MapGet(GetByOrder, "order/{orderId}");
    }

    public async Task<IResult> CreatePayment(CreatePaymentCommand command, ISender sender)
    {
        var result = await sender.Send(command);
        return Results.Ok(result);
    }

    public async Task<IResult> ConfirmPayment(ConfirmPaymentCommand command, ISender sender)
    {
        var result = await sender.Send(command);
        return Results.Ok(result);
    }

    public async Task<IResult> GetByOrder(int orderId, ISender sender)
    {
        var result = await sender.Send(new GetPaymentByOrderQuery(orderId));
        return result is null ? Results.NotFound() : Results.Ok(result);
    }
}