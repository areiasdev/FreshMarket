using FreshMarket.Domain.Enums;

namespace FreshMarket.Application.Notifications.Models;

public class NotificationDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; }
    public int? OrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}
