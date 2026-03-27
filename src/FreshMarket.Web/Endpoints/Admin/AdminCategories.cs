using FreshMarket.Application.Categories.Commands.Create;
using FreshMarket.Application.Categories.Commands.Toggle;
using FreshMarket.Application.Categories.Commands.Update;
using FreshMarket.Application.Categories.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace FreshMarket.Web.Endpoints.Admin;

public class AdminCategories : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "AdminPolicy")
            .MapGet(GetAll, "")
            .MapPost(Create, "")
            .MapPut(Update, "{id:int}")
            .MapPatch(ToggleActive, "{id:int}/toggle-active");
    }

    public async Task<IResult> GetAll([AsParameters] GetAdminCategoriesQuery query, ISender sender)
    {
        var result = await sender.Send(query).ConfigureAwait(false);
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

    public async Task<IResult> Update(int id, UpdateCategoryCommand command, ISender sender)
    {
        var result = await sender.Send(command with { Id = id }).ConfigureAwait(false);
        return Results.Ok(result);
    }
}