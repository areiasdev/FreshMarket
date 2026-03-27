namespace FreshMarket.Application.Dashboard.Models;

public class DashboardStatsDto
{
    // ─── Encomendas ───────────────────────────────────────────────
    public int OrdersToday { get; set; }
    public int OrdersThisWeek { get; set; }
    public int OrdersThisMonth { get; set; }
    public int OrdersPending { get; set; }  // status 0
    public int OrdersProcessing { get; set; }  // status 1+2
    public int OrdersDelivered { get; set; }  // status 4
    public int OrdersCancelled { get; set; }  // status 5

    // ─── Receita ──────────────────────────────────────────────────
    public decimal RevenueToday { get; set; }
    public decimal RevenueThisWeek { get; set; }
    public decimal RevenueThisMonth { get; set; }

    // ─── Produtos ─────────────────────────────────────────────────
    public int ProductsTotal { get; set; }
    public int ProductsActive { get; set; }
    public int ProductsLowStock { get; set; }  // StockQuantity <= LowStockAlert

    // ─── Clientes ─────────────────────────────────────────────────
    public int CustomersTotal { get; set; }
    public int CustomersNewMonth { get; set; }  // registados este mês

    // ─── Últimas encomendas (tabela) ──────────────────────────────
    public List<RecentOrderDto> RecentOrders { get; set; } = [];
}

public class RecentOrderDto
{
    public int Id { get; set; }
    public string UserFullName { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int Status { get; set; }
    public DateTime CreatedAt { get; set; }
}