using FreshMarket.Application.Users.Commands;
using FreshMarket.Application.Users.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;

namespace FreshMarket.Web.Endpoints.Admin;

public class AdminUsers : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "AdminPolicy")
            .MapGet(GetAll, "")
            .MapGet(GetById, "{id:int}")
            .MapPut(ToggleActive, "{id:int}/toggle-active");

        // Only SuperAdmins can change roles
        app.MapGroup(this, "SuperAdminPolicy")
            .MapPut(UpdateRole, "{id:int}/role");
    }

    public async Task<IResult> GetAll([AsParameters] GetAllUsersQuery query, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(query, ct).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> GetById(int id, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetUserByIdAdminQuery(id), ct).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> UpdateRole(int id, UpdateUserRoleCommand command, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(command with { Id = id }, ct).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> ToggleActive(int id, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new ToggleUserActiveCommand(id), ct).ConfigureAwait(false);
        return Results.Ok(result);
    }
}
