using FreshMarket.Application.Common.Shipping;
using FreshMarket.Web.Infrastructure;
using Microsoft.AspNetCore.Builder;

namespace FreshMarket.Web.Endpoints;

public class Shipping : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetOptions, "options");
    }

    /// <summary>Returns available shipping speed options with fees for the given country.</summary>
    public IResult GetOptions(string country = "PT")
    {
        var options = ShippingCalculator.GetOptions(country);
        return Results.Ok(options);
    }
}
