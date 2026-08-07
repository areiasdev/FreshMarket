using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using FreshMarket.Application.Common.Interfaces;

public class OrderCleanupJob : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OrderCleanupJob> _logger;

    public OrderCleanupJob(IServiceScopeFactory scopeFactory, ILogger<OrderCleanupJob> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("OrderCleanupJob started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();

                var expirationTime = DateTime.UtcNow.AddMinutes(-15);

                var expiredOrders = await db.Orders
                    .Include(o => o.DeliverySlot)
                    .Include(o => o.Items).ThenInclude(i => i.Product)
                    .Include(o => o.Payments)
                    .Where(o =>
                        o.Status == OrderStatus.Pending &&
                        o.CreatedAt < expirationTime)
                    .ToListAsync(stoppingToken);

                // An order with a Pending payment may already be charged on Stripe's side — the
                // webhook confirming it just hasn't landed yet. Cancelling it now and releasing
                // stock would abandon a paid customer with no product and no alert, so leave those
                // for the next cycle (or manual reconciliation) instead of blind-cancelling.
                var stuckPayments = expiredOrders
                    .Where(o => o.Payments.Any(p => p.Status == PaymentStatusEnum.Pending))
                    .ToList();
                var toCancel = expiredOrders.Except(stuckPayments).ToList();

                foreach (var order in toCancel)
                {
                    order.Status = OrderStatus.Cancelled;
                    order.UpdatedAt = DateTime.UtcNow;

                    if (order.DeliverySlot != null && order.DeliverySlot.CurrentOrders > 0)
                        order.DeliverySlot.CurrentOrders--;

                    // Pending orders reserved stock at placement time (never deducted StockQuantity
                    // yet) — release that reservation or available stock permanently shrinks.
                    foreach (var item in order.Items.Where(i => i.Product.TrackStock))
                        item.Product.ReservedStock = Math.Max(0, item.Product.ReservedStock - item.Quantity);
                }

                if (toCancel.Count > 0)
                    await db.SaveChangesAsync(stoppingToken);

                if (stuckPayments.Count > 0)
                    _logger.LogWarning(
                        "Skipped auto-cancel for {Count} expired order(s) with an unresolved payment: {OrderIds}",
                        stuckPayments.Count, string.Join(", ", stuckPayments.Select(o => o.Id)));

                _logger.LogInformation("Expired orders cleaned: {Count}", toCancel.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in OrderCleanupJob");
            }

            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }
}