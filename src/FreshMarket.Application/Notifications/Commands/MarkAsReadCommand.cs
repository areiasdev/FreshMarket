using FreshMarket.Application.Common.Interfaces;
using MediatR;

namespace FreshMarket.Application.Notifications.Commands;

public record MarkAsReadCommand(int NotificationId, int UserId) : IRequest;

public class MarkAsReadCommandHandler : IRequestHandler<MarkAsReadCommand>
{
    private readonly INotificationService _notifications;

    public MarkAsReadCommandHandler(INotificationService notifications)
    {
        _notifications = notifications;
    }

    public Task Handle(MarkAsReadCommand request, CancellationToken ct)
        => _notifications.MarkAsReadAsync(request.NotificationId, request.UserId, ct);
}
