using FreshMarket.Application.Products.Commands.BulkUpdatePrice;
using FreshMarket.Application.Products.Commands.Create;
using FreshMarket.Application.Products.Commands.Delete;
using FreshMarket.Application.Products.Commands.Toggle;
using FreshMarket.Application.Products.Commands.Update;
using FreshMarket.Application.Products.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;

namespace FreshMarket.Web.Endpoints.Admin;

public class AdminProducts : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "AdminPolicy")
            .MapGet(GetAll, "")
            .MapPost(Create, "")
            .MapPut(Update, "{id:int}")
            .MapPut(ToggleActive, "{id:int}/toggle-active")
            .MapPut(BulkUpdatePrice, "bulk-price");
    }

    public async Task<IResult> GetAll([AsParameters] GetAdminProductsQuery query, ISender sender)
    {
        var result = await sender.Send(query).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> Create(CreateProductCommand command, ISender sender)
    {
        var result = await sender.Send(command).ConfigureAwait(false);
        return Results.Created($"/api/admin/products/{result.Id}", result);
    }

    public async Task<IResult> Update(int id, UpdateProductCommand command, ISender sender)
    {
        var result = await sender.Send(command with { Id = id }).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> ToggleActive(int id, ISender sender)
    {
        await sender.Send(new ToggleProductActiveCommand(id)).ConfigureAwait(false);
        return Results.NoContent();
    }

    public async Task<IResult> BulkUpdatePrice(BulkUpdatePriceCommand command, ISender sender)
    {
        await sender.Send(command).ConfigureAwait(false);
        return Results.NoContent();
    }
}