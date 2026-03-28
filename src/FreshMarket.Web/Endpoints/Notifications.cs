using FreshMarket.Application.Notifications.Commands;
using FreshMarket.Application.Notifications.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;
using System.Security.Claims;

namespace FreshMarket.Web.Endpoints;

public class Notifications : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "CustomerPolicy")
            .MapGet(GetMyNotifications)
            .MapGet(GetUnreadCount, "unread-count")
            .MapPut(MarkAsRead, "{id:int}/read")
            .MapPut(MarkAllAsRead, "read-all");
    }

    public async Task<IResult> GetMyNotifications(ClaimsPrincipal user, ISender sender, CancellationToken ct)
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await sender.Send(new GetMyNotificationsQuery(userId), ct).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> GetUnreadCount(ClaimsPrincipal user, ISender sender, CancellationToken ct)
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var count = await sender.Send(new GetUnreadCountQuery(userId), ct).ConfigureAwait(false);
        return Results.Ok(new { count });
    }

    public async Task<IResult> MarkAsRead(int id, ClaimsPrincipal user, ISender sender, CancellationToken ct)
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await sender.Send(new MarkAsReadCommand(id, userId), ct).ConfigureAwait(false);
        return Results.NoContent();
    }

    public async Task<IResult> MarkAllAsRead(ClaimsPrincipal user, ISender sender, CancellationToken ct)
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await sender.Send(new MarkAllAsReadCommand(userId), ct).ConfigureAwait(false);
        return Results.NoContent();
    }
}
