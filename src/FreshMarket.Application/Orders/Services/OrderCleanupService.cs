using FreshMarket.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

public class OrderCleanupService
{
    private readonly IApplicationDbContext _db;

    public OrderCleanupService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task ExpirePendingOrdersAsync(CancellationToken ct)
    {
        var limit = DateTime.UtcNow.AddMinutes(-15);

        var orders = await _db.Orders
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .Include(o => o.DeliverySlot)
            .Where(o => o.Status == OrderStatus.Pending && o.CreatedAt <= limit)
            .ToListAsync(ct);

        foreach (var order in orders)
        {
            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            foreach (var item in order.Items)
            {
                if (item.Product.TrackStock)
                    item.Product.StockQuantity += item.Quantity;
            }

            if (order.DeliverySlot != null && order.DeliverySlot.CurrentOrders > 0)
                order.DeliverySlot.CurrentOrders--;
        }

        await _db.SaveChangesAsync(ct);
    }
}