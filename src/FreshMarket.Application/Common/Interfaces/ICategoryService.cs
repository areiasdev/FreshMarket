using FreshMarket.Application.Categories.Models;

namespace FreshMarket.Application.Common.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken ct);
    Task<CategoryDto> GetByIdAsync(int id, CancellationToken ct);
    Task<CategoryDto> CreateAsync(string name, string slug, CancellationToken ct);
    Task<CategoryDto> UpdateAsync(int id, string name, string slug, bool isActive, CancellationToken ct);
    Task DeleteAsync(int id, CancellationToken ct);
    Task<PagedResult<CategoryDto>> GetAdminListAsync(int page, int pageSize, CancellationToken ct);
}
