using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Dashboard.Models;
using FreshMarket.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.Dashboard.Queries;

public record GetDashboardStatsQuery : IRequest<DashboardStatsDto>;

public class GetDashboardStatsQueryHandler
    : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IApplicationDbContext _db;

    public GetDashboardStatsQueryHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<DashboardStatsDto> Handle(
        GetDashboardStatsQuery request, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var todayUtc = now.Date;
        var weekStart = todayUtc.AddDays(-(int)now.DayOfWeek);
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        // ── Encomendas ────────────────────────────────────────────
        var orders = await _db.Orders
            .IgnoreQueryFilters()
            .Select(o => new {
                o.CreatedAt,
                o.Status,
                o.TotalAmount
            })
            .ToListAsync(ct);

        var ordersToday = orders.Where(o => o.CreatedAt.Date == todayUtc).ToList();
        var ordersThisWeek = orders.Where(o => o.CreatedAt >= weekStart).ToList();
        var ordersThisMonth = orders.Where(o => o.CreatedAt >= monthStart).ToList();

        // ── Produtos ──────────────────────────────────────────────
        var products = await _db.Products
            .Select(p => new { p.IsActive, p.TrackStock, p.StockQuantity, p.LowStockAlert })
            .ToListAsync(ct);

        // ── Clientes ──────────────────────────────────────────────
        var customers = await _db.Users
            .IgnoreQueryFilters()
            .Select(u => new { u.CreatedAt })
            .ToListAsync(ct);

        // ── Últimas 8 encomendas ──────────────────────────────────
        var recent = await _db.Orders
            .IgnoreQueryFilters()
            .Include(o => o.User)
            .OrderByDescending(o => o.CreatedAt)
            .Take(8)
            .Select(o => new RecentOrderDto
            {
                Id = o.Id,
                UserFullName = o.User.FullName,
                TotalAmount = o.TotalAmount,
                Status = (int)o.Status,
                CreatedAt = o.CreatedAt,
            })
            .ToListAsync(ct);

        return new DashboardStatsDto
        {
            // Encomendas
            OrdersToday = ordersToday.Count,
            OrdersThisWeek = ordersThisWeek.Count,
            OrdersThisMonth = ordersThisMonth.Count,
            OrdersPending = orders.Count(o => o.Status == OrderStatus.Pending),
            OrdersProcessing = orders.Count(o => o.Status == OrderStatus.Delivered
                                              || o.Status == OrderStatus.Preparing),
            OrdersDelivered = orders.Count(o => o.Status == OrderStatus.Delivered),
            OrdersCancelled = orders.Count(o => o.Status == OrderStatus.Cancelled),

            // Receita
            RevenueToday = ordersToday.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.TotalAmount),
            RevenueThisWeek = ordersThisWeek.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.TotalAmount),
            RevenueThisMonth = ordersThisMonth.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.TotalAmount),

            // Produtos
            ProductsTotal = products.Count,
            ProductsActive = products.Count(p => p.IsActive),
            ProductsLowStock = products.Count(p => p.IsActive && p.TrackStock
                                               && p.StockQuantity <= p.LowStockAlert),

            // Clientes
            CustomersTotal = customers.Count,
            CustomersNewMonth = customers.Count(u => u.CreatedAt >= monthStart),

            RecentOrders = recent,
        };
    }
}