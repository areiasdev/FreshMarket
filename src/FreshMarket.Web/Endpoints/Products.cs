using FreshMarket.Application.Products.Commands.BulkUpdatePrice;
using FreshMarket.Application.Products.Commands.Create;
using FreshMarket.Application.Products.Commands.Delete;
using FreshMarket.Application.Products.Commands.Update;
using FreshMarket.Application.Products.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;

namespace FreshMarket.Web.Endpoints;

public class Products : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapGet(GetAllProducts)
            .MapGet(GetProductById, "{id}")
            .MapGet(GetProductsByCategory, "category/{categoryId}")
            .MapPost(CreateProduct)
            .MapPut(UpdateProduct, "{id}")
            .MapDelete(DeleteProduct, "{id}")
            .MapPut(BulkUpdatePrice, "bulk-price");
    }

    public async Task<IResult> GetAllProducts(ISender sender, int page = 1, int pageSize = 20, int? categoryId = null)
    {
        var result = await sender.Send(new GetAllProductsQuery(page, pageSize, categoryId)).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> GetProductById(int id, ISender sender)
    {
        var result = await sender.Send(new GetProductByIdQuery(id)).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> GetProductsByCategory(int categoryId, ISender sender)
    {
        var result = await sender.Send(new GetProductByCategoryQuery(categoryId)).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> CreateProduct(CreateProductCommand command, ISender sender)
    {
        var result = await sender.Send(command).ConfigureAwait(false);
        return Results.Created($"/api/products/{result.Id}", result);
    }

    public async Task<IResult> UpdateProduct(int id, UpdateProductCommand command, ISender sender)
    {
        var result = await sender.Send(command with { Id = id }).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> DeleteProduct(int id, ISender sender)
    {
        await sender.Send(new DeleteProductCommand(id)).ConfigureAwait(false);
        return Results.NoContent();
    }

    public async Task<IResult> BulkUpdatePrice(BulkUpdatePriceCommand command, ISender sender)
    {
        await sender.Send(command).ConfigureAwait(false);
        return Results.NoContent();
    }
}
