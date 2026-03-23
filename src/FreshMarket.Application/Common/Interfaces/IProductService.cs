using FreshMarket.Application.Products.Models;

namespace FreshMarket.Application.Common.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductListDto>> GetAllAsync(int page, int pageSize, int? categoryId, CancellationToken ct);
    Task<ProductDto?> GetByIdAsync(int id, CancellationToken ct);
    Task DeleteAsync(int id, CancellationToken ct);
}
