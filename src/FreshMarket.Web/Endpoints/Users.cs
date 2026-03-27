using FreshMarket.Application.Users.Command.UpdateProfile;
using FreshMarket.Application.Users.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;
using System.Security.Claims;

namespace FreshMarket.Web.Endpoints;

public class Users : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "CustomerPolicy")
            .MapGet(GetMe, "me")
            .MapPut(UpdateMe, "me");
    }

    public async Task<IResult> GetMe(ClaimsPrincipal user, ISender sender, CancellationToken ct)
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await sender.Send(new GetUserProfileQuery(userId), ct).ConfigureAwait(false);
        return result is null ? Results.NotFound() : Results.Ok(result);
    }

    public async Task<IResult> UpdateMe(UpdateUserProfileCommand command, ClaimsPrincipal user, ISender sender, CancellationToken ct)
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await sender.Send(command with { UserId = userId }, ct).ConfigureAwait(false);
        return Results.Ok(result);
    }
}
