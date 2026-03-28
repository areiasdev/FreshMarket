using FreshMarket.Application.Notifications.Models;
using FreshMarket.Domain.Enums;

namespace FreshMarket.Application.Common.Interfaces;

public interface INotificationService
{
    Task CreateAsync(int userId, NotificationType type, string title, string message, int? orderId, CancellationToken ct);
    Task<IEnumerable<NotificationDto>> GetByUserAsync(int userId, CancellationToken ct);
    Task<int> GetUnreadCountAsync(int userId, CancellationToken ct);
    Task MarkAsReadAsync(int notificationId, int userId, CancellationToken ct);
    Task MarkAllAsReadAsync(int userId, CancellationToken ct);
}
