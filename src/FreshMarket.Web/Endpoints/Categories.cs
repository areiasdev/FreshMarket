using FreshMarket.Application.Categories.Commands.Create;
using FreshMarket.Application.Categories.Commands.Delete;
using FreshMarket.Application.Categories.Commands.Update;
using FreshMarket.Application.Categories.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;

namespace FreshMarket.Web.Endpoints;

public class Categories : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetAllCategories)
            .MapGet(GetCategoryById, "{id}")
            .MapPost(CreateCategory).RequireAuthorization()
            .MapPut(UpdateCategory, "{id}").RequireAuthorization()
            .MapDelete(DeleteCategory, "{id}").RequireAuthorization();
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

    public async Task<IResult> CreateCategory(CreateCategoryCommand command, ISender sender)
    {
        var result = await sender.Send(command).ConfigureAwait(false);
        return Results.Created($"/api/categories/{result.Id}", result);
    }

    public async Task<IResult> UpdateCategory(int id, UpdateCategoryCommand command, ISender sender)
    {
        var result = await sender.Send(command with { Id = id }).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> DeleteCategory(int id, ISender sender)
    {
        await sender.Send(new DeleteCategoryCommand(id)).ConfigureAwait(false);
        return Results.NoContent();
    }
}
