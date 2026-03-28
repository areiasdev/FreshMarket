using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Notifications.Models;
using FreshMarket.Domain.Entities;
using FreshMarket.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.Notifications.Services;

public class NotificationService : INotificationService
{
    private readonly IApplicationDbContext _db;

    public NotificationService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task CreateAsync(int userId, NotificationType type, string title, string message, int? orderId, CancellationToken ct)
    {
        var notification = new Notification
        {
            UserId  = userId,
            Type    = type,
            Title   = title,
            Message = message,
            OrderId = orderId,
            IsRead  = false,
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
    }

    public async Task<IEnumerable<NotificationDto>> GetByUserAsync(int userId, CancellationToken ct)
        => await _db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .Select(n => new NotificationDto
            {
                Id        = n.Id,
                Title     = n.Title,
                Message   = n.Message,
                Type      = n.Type,
                IsRead    = n.IsRead,
                OrderId   = n.OrderId,
                CreatedAt = n.CreatedAt,
            })
            .ToListAsync(ct)
            .ConfigureAwait(false);

    public async Task<int> GetUnreadCountAsync(int userId, CancellationToken ct)
        => await _db.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead, ct)
            .ConfigureAwait(false);

    public async Task MarkAsReadAsync(int notificationId, int userId, CancellationToken ct)
    {
        var notification = await _db.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId, ct)
            .ConfigureAwait(false);

        if (notification is null) return;

        notification.IsRead    = true;
        notification.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
    }

    public async Task MarkAllAsReadAsync(int userId, CancellationToken ct)
    {
        await _db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ExecuteUpdateAsync(s => s
                .SetProperty(n => n.IsRead,    true)
                .SetProperty(n => n.UpdatedAt, DateTime.UtcNow), ct)
            .ConfigureAwait(false);
    }
}
