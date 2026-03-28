using FreshMarket.Application.Common.Interfaces;
using MediatR;

namespace FreshMarket.Application.Notifications.Commands;

public record MarkAllAsReadCommand(int UserId) : IRequest;

public class MarkAllAsReadCommandHandler : IRequestHandler<MarkAllAsReadCommand>
{
    private readonly INotificationService _notifications;

    public MarkAllAsReadCommandHandler(INotificationService notifications)
    {
        _notifications = notifications;
    }

    public Task Handle(MarkAllAsReadCommand request, CancellationToken ct)
        => _notifications.MarkAllAsReadAsync(request.UserId, ct);
}
