using FreshMarket.Application.Products.Models;

namespace FreshMarket.Application.Common.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductListDto>> GetAllAsync(int page, int pageSize, int? categoryId, string? search, bool? isSeasonal, CancellationToken ct);
    Task<ProductDetailDto> GetByIdAsync(int id, CancellationToken ct);
    Task<ProductDetailDto> CreateAsync(
                                           int categoryId, string name, string slug, string? description,
                                           decimal pricePerUnit, UnitType unitType, decimal minQuantity,
                                           decimal stockQuantity, bool trackStock, decimal lowStockAlert,
                                           string? imageUrl, bool isSeasonal, CancellationToken ct);
    Task<ProductDetailDto> UpdateAsync(
                                           int id, int categoryId, string name, string slug, string? description,
                                           decimal pricePerUnit, UnitType unitType, decimal minQuantity,
                                           decimal stockQuantity, bool trackStock, decimal lowStockAlert,
                                           string? imageUrl, bool isSeasonal, bool isActive, CancellationToken ct);
    Task DeleteAsync(int id, CancellationToken ct);
    Task ToggleActiveAsync(int id, CancellationToken ct);
    Task BulkUpdatePriceAsync(IEnumerable<(int ProductId, decimal NewPrice)> items, CancellationToken ct);
    Task<PagedResult<ProductListDto>> GetAdminListAsync(string? search, bool? isActive, int page, int pageSize, CancellationToken ct);
}