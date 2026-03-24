using FreshMarket.Application.Products.Commands.BulkUpdatePrice;
using FreshMarket.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;

namespace FreshMarket.Web.Endpoints.Admin;

public class AdminProducts : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "AdminPolicy")
            .MapPut(BulkUpdatePrice, "bulk-price");
    }

    public async Task<IResult> BulkUpdatePrice(BulkUpdatePriceCommand command, ISender sender)
    {
        await sender.Send(command).ConfigureAwait(false);
        return Results.NoContent();
    }
}
