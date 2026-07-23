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
                    .Where(o =>
                        o.Status == OrderStatus.Pending &&
                        o.CreatedAt < expirationTime)
                    .ToListAsync(stoppingToken);

                foreach (var order in expiredOrders)
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

                if (expiredOrders.Any())
                    await db.SaveChangesAsync(stoppingToken);

                _logger.LogInformation("Expired orders cleaned: {Count}", expiredOrders.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in OrderCleanupJob");
            }

            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }
}