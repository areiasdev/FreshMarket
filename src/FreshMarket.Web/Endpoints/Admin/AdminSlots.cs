using FreshMarket.Application.DeliverySlots.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;

namespace FreshMarket.Web.Endpoints.Admin;

public class AdminSlots : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetSlotsByDate, "date/{date}");
    }

    public async Task<IResult> GetSlotsByDate(DateOnly date, ISender sender)
    {
        var result = await sender.Send(new GetSlotsByDateQuery(date)).ConfigureAwait(false);
        return Results.Ok(result);
    }
}
