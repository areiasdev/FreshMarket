using FreshMarket.Domain.Common;
using FreshMarket.Domain.Enums;

namespace FreshMarket.Domain.Entities;

public class Notification : BaseEntity
{
    public int UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public NotificationType Type { get; set; }
    public bool IsRead { get; set; } = false;
    public int? OrderId { get; set; }

    public User User { get; set; } = null!;
}
