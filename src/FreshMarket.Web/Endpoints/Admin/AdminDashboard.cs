using FreshMarket.Application.Dashboard.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;

namespace FreshMarket.Web.Endpoints.Admin;

public class AdminDashboard : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "AdminPolicy")
            .MapGet(GetStats, "");
    }

    public async Task<IResult> GetStats(ISender sender)
    {
        var result = await sender.Send(new GetDashboardStatsQuery()).ConfigureAwait(false);
        return Results.Ok(result);
    }
}