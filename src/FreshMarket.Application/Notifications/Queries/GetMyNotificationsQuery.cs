using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Notifications.Models;
using MediatR;

namespace FreshMarket.Application.Notifications.Queries;

public record GetMyNotificationsQuery(int UserId) : IRequest<IEnumerable<NotificationDto>>;

public class GetMyNotificationsQueryHandler : IRequestHandler<GetMyNotificationsQuery, IEnumerable<NotificationDto>>
{
    private readonly INotificationService _notifications;

    public GetMyNotificationsQueryHandler(INotificationService notifications)
    {
        _notifications = notifications;
    }

    public Task<IEnumerable<NotificationDto>> Handle(GetMyNotificationsQuery request, CancellationToken ct)
        => _notifications.GetByUserAsync(request.UserId, ct);
}
