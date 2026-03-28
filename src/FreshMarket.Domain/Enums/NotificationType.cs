namespace FreshMarket.Domain.Enums;

public enum NotificationType
{
    OrderPlaced    = 0,
    OrderPaid      = 1,
    OrderPreparing = 2,
    OrderShipped   = 3,
    OrderDelivered = 4,
    OrderCancelled = 5,
    PaymentFailed  = 6,
}
