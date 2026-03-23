using FreshMarket.Application.Products.Models;

namespace FreshMarket.Application.Common.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductListDto>> GetAllAsync(int page, int pageSize, int? categoryId, CancellationToken ct);
    Task<ProductDto> GetByIdAsync(int id, CancellationToken ct);
    Task<IEnumerable<ProductListDto>> GetByCategoryAsync(int categoryId, CancellationToken ct);
    Task<ProductDto> CreateAsync(int categoryId, string name, string? description, decimal pricePerUnit, UnitType unitType, decimal minQuantity, decimal stockQuantity, string? imageUrl, bool isSeasonal, CancellationToken ct);
    Task<ProductDto> UpdateAsync(int id, int categoryId, string name, string? description, decimal pricePerUnit, decimal minQuantity, decimal stockQuantity, string? imageUrl, bool isSeasonal, bool isActive, CancellationToken ct);
    Task DeleteAsync(int id, CancellationToken ct);
    Task BulkUpdatePriceAsync(IEnumerable<(int ProductId, decimal NewPrice)> items, CancellationToken ct);
}
