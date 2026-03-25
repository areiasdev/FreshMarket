using FreshMarket.Application.Categories.Commands.Create;
using FreshMarket.Application.Categories.Commands.Toggle;
using FreshMarket.Application.Categories.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;

namespace FreshMarket.Web.Endpoints.Admin;

public class AdminCategories : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "AdminPolicy")
            .MapGet(GetAll, "")
            .MapPost(Create, "")
            .MapPatch("{id:int}/toggle-active", ToggleActive);
    }

    public async Task<IResult> GetAll(ISender sender)
    {
        var result = await sender.Send(new GetAdminCategoriesQuery()).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> Create(CreateCategoryCommand command, ISender sender)
    {
        var result = await sender.Send(command).ConfigureAwait(false);
        return Results.Created($"/api/admin/categories/{result.Id}", result);
    }

    public async Task<IResult> ToggleActive(int id, ISender sender)
    {
        await sender.Send(new ToggleCategoryActiveCommand(id)).ConfigureAwait(false);
        return Results.NoContent();
    }
}