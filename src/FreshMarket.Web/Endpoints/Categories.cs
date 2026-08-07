using FreshMarket.Application.Categories.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;

namespace FreshMarket.Web.Endpoints;

public class Categories : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        // Public read-only catalog. Mutations live under AdminCategories (/api/admin/categories, AdminPolicy).
        app.MapGroup(this)
            .MapGet(GetAllCategories)
            .MapGet(GetCategoryById, "{id}");
    }

    public async Task<IResult> GetAllCategories(ISender sender)
    {
        var result = await sender.Send(new GetAllCategoriesQuery()).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> GetCategoryById(int id, ISender sender)
    {
        var result = await sender.Send(new GetCategoryByIdQuery(id)).ConfigureAwait(false);
        return Results.Ok(result);
    }
}
