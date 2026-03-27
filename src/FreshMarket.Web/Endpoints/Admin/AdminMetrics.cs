using FreshMarket.Application.Metrics.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;

namespace FreshMarket.Web.Endpoints.Admin;

public class AdminMetrics : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "AdminPolicy")
            .MapGet(GetMetrics, "");
    }

    public async Task<IResult> GetMetrics(ISender sender)
    {
        var result = await sender.Send(new GetMetricsQuery()).ConfigureAwait(false);
        return Results.Ok(result);
    }
}
