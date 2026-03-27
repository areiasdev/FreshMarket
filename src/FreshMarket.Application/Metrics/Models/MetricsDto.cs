namespace FreshMarket.Application.Metrics.Models;

public class MetricsDto
{
    public List<DailyRevenueDto> RevenueByDay { get; set; } = [];
    public List<OrdersByStatusDto> OrdersByStatus { get; set; } = [];
    public List<TopProductDto> TopProducts { get; set; } = [];
    public List<MonthlyCustomersDto> CustomersByMonth { get; set; } = [];
    public List<HourlyOrdersDto> OrdersByHour { get; set; } = [];
    public List<ProductPriceStatsDto> ProductPriceStats { get; set; } = [];
}

public class DailyRevenueDto
{
    public string Date { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
    public int OrderCount { get; set; }
}

public class OrdersByStatusDto
{
    public string Status { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class TopProductDto
{
    public string ProductName { get; set; } = string.Empty;
    public decimal TotalRevenue { get; set; }
    public decimal TotalQuantity { get; set; }
}

public class MonthlyCustomersDto
{
    public string Month { get; set; } = string.Empty;
    public int NewCustomers { get; set; }
}

public class HourlyOrdersDto
{
    public int Hour { get; set; }
    public int OrderCount { get; set; }
}

public class ProductPriceStatsDto
{
    public string ProductName { get; set; } = string.Empty;
    public decimal BestPrice { get; set; }
    public int SalesCount { get; set; }
}
