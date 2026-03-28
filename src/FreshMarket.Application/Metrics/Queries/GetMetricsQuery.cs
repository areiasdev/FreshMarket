using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Metrics.Models;
using FreshMarket.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.Metrics.Queries;

public record GetMetricsQuery(DateOnly? From = null, DateOnly? To = null) : IRequest<MetricsDto>;

public class GetMetricsQueryHandler : IRequestHandler<GetMetricsQuery, MetricsDto>
{
    private readonly IApplicationDbContext _db;

    public GetMetricsQueryHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<MetricsDto> Handle(GetMetricsQuery request, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var dateFrom = request.From.HasValue
            ? request.From.Value.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc)
            : now.Date.AddDays(-29);
        var dateTo = request.To.HasValue
            ? request.To.Value.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc)
            : now.Date.AddDays(1);
        var thirtyDaysAgo = dateFrom;
        var rangeDays = (int)(dateTo.Date - dateFrom.Date).TotalDays + 1;

        // ── Load data to memory (following existing project pattern) ──────────

        var allOrders = await _db.Orders
            .IgnoreQueryFilters()
            .Select(o => new { o.CreatedAt, o.Status, o.TotalAmount })
            .ToListAsync(ct);

        var allOrderItems = await _db.OrderItems
            .IgnoreQueryFilters()
            .Where(i => i.Order.Status != OrderStatus.Cancelled)
            .Select(i => new
            {
                i.ProductId,
                ProductName = i.Product.Name,
                i.UnitPrice,
                i.Subtotal,
                i.Quantity,
            })
            .ToListAsync(ct);

        var allUsers = await _db.Users
            .IgnoreQueryFilters()
            .Select(u => new { u.CreatedAt })
            .ToListAsync(ct);

        // ── Revenue by day (last 30 days, non-cancelled) ──────────────────────

        var revenueByDayDict = allOrders
            .Where(o => o.CreatedAt >= dateFrom && o.CreatedAt <= dateTo && o.Status != OrderStatus.Cancelled)
            .GroupBy(o => o.CreatedAt.Date)
            .ToDictionary(
                g => g.Key,
                g => new { Revenue = g.Sum(o => o.TotalAmount), Count = g.Count() });

        var revenueByDay = Enumerable.Range(0, rangeDays)
            .Select(i =>
            {
                var date = dateFrom.AddDays(i);
                revenueByDayDict.TryGetValue(date, out var data);
                return new DailyRevenueDto
                {
                    Date = date.ToString("dd/MM"),
                    Revenue = data?.Revenue ?? 0,
                    OrderCount = data?.Count ?? 0,
                };
            })
            .ToList();

        // ── Orders by status ──────────────────────────────────────────────────

        var statusLabels = new Dictionary<OrderStatus, string>
        {
            { OrderStatus.Pending,   "Pendente"  },
            { OrderStatus.Paid,      "Pago"      },
            { OrderStatus.Preparing, "Em preparo" },
            { OrderStatus.Shipped,   "Enviado"   },
            { OrderStatus.Delivered, "Entregue"  },
            { OrderStatus.Cancelled, "Cancelado" },
        };

        var ordersByStatus = allOrders
            .GroupBy(o => o.Status)
            .Select(g => new OrdersByStatusDto
            {
                Status = statusLabels.GetValueOrDefault(g.Key, g.Key.ToString()),
                Count  = g.Count(),
            })
            .Where(s => s.Count > 0)
            .ToList();

        // ── Top 10 products by revenue ────────────────────────────────────────

        var topProducts = allOrderItems
            .GroupBy(i => new { i.ProductId, i.ProductName })
            .Select(g => new TopProductDto
            {
                ProductName   = g.Key.ProductName,
                TotalRevenue  = g.Sum(i => i.Subtotal),
                TotalQuantity = g.Sum(i => i.Quantity),
            })
            .OrderByDescending(p => p.TotalRevenue)
            .Take(10)
            .ToList();

        // ── New customers per month (last 12 months) ──────────────────────────

        var customersByMonth = Enumerable.Range(0, 12)
            .Select(i => new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-11 + i))
            .Select(month => new MonthlyCustomersDto
            {
                Month        = month.ToString("MMM/yy"),
                NewCustomers = allUsers.Count(u =>
                    u.CreatedAt.Year == month.Year && u.CreatedAt.Month == month.Month),
            })
            .ToList();

        // ── Orders by hour of day ─────────────────────────────────────────────

        var ordersByHour = Enumerable.Range(0, 24)
            .Select(h => new HourlyOrdersDto
            {
                Hour       = h,
                OrderCount = allOrders.Count(o => o.CreatedAt.Hour == h),
            })
            .ToList();

        // ── Product price stats (price at which each product sold most) ────────

        var productPriceStats = allOrderItems
            .GroupBy(i => new { i.ProductId, i.ProductName, i.UnitPrice })
            .Select(g => new { g.Key.ProductId, g.Key.ProductName, g.Key.UnitPrice, Count = g.Count() })
            .GroupBy(x => new { x.ProductId, x.ProductName })
            .Select(g =>
            {
                var best = g.OrderByDescending(x => x.Count).First();
                return new ProductPriceStatsDto
                {
                    ProductName = g.Key.ProductName,
                    BestPrice   = best.UnitPrice,
                    SalesCount  = best.Count,
                };
            })
            .OrderByDescending(x => x.SalesCount)
            .Take(10)
            .ToList();

        return new MetricsDto
        {
            RevenueByDay      = revenueByDay,
            OrdersByStatus    = ordersByStatus,
            TopProducts       = topProducts,
            CustomersByMonth  = customersByMonth,
            OrdersByHour      = ordersByHour,
            ProductPriceStats = productPriceStats,
        };
    }
}
