using FreshMarket.Application.Products.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;

namespace FreshMarket.Web.Endpoints;

public class Products : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        // Public read-only catalog. Mutations live under AdminProducts (/api/admin/products, AdminPolicy).
        app.MapGroup(this)
            .MapGet(GetAllProducts)
            .MapGet(GetProductById, "{id}");
    }

    public async Task<IResult> GetAllProducts(ISender sender, int page = 1, int pageSize = 20, int? categoryId = null, string? search = null, bool? isSeasonal = null)
    {
        var result = await sender.Send(new GetAllProductsQuery(page, pageSize, categoryId, search, isSeasonal)).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> GetProductById(int id, ISender sender)
    {
        var result = await sender.Send(new GetProductByIdQuery(id)).ConfigureAwait(false);
        return Results.Ok(result);
    }
}
