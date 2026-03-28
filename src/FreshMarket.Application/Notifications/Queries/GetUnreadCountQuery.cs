using FreshMarket.Application.Common.Interfaces;
using MediatR;

namespace FreshMarket.Application.Notifications.Queries;

public record GetUnreadCountQuery(int UserId) : IRequest<int>;

public class GetUnreadCountQueryHandler : IRequestHandler<GetUnreadCountQuery, int>
{
    private readonly INotificationService _notifications;

    public GetUnreadCountQueryHandler(INotificationService notifications)
    {
        _notifications = notifications;
    }

    public Task<int> Handle(GetUnreadCountQuery request, CancellationToken ct)
        => _notifications.GetUnreadCountAsync(request.UserId, ct);
}
