using FreshMarket.Domain.Common;
using FreshMarket.Domain.Enums;

namespace FreshMarket.Domain.Entities;

public class Payment : BaseEntity
{
    public int OrderId { get; set; }
    public PaymentMethodEnum Method { get; set; }
    public PaymentStatusEnum Status { get; set; } = PaymentStatusEnum.Pending;
    public decimal Amount { get; set; }
    public string? ExternalTransactionId { get; set; }
    public string? Provider { get; set; }
    public DateTime? PaidAt { get; set; }

    public Order Order { get; set; } = null!;
}
