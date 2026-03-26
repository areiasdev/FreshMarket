using FreshMarket.Application.Categories.Models;
using FreshMarket.Application.Common.Constants;
using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Mapping;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.Categories.Services;

public class CategoryService : ICategoryService
{
    private readonly IApplicationDbContext _db;
    private readonly ICacheService _cache;

    public CategoryService(IApplicationDbContext db, ICacheService cache)
    {
        _db = db;
        _cache = cache;
    }
    public async Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken ct)
    {
        var cached = await _cache.GetAsync<IEnumerable<CategoryDto>>(CacheKeys.Categories, ct);
        if (cached is not null) return cached;

        var result = await _db.Categories
            .Where(c => c.IsActive)
            .Include(c => c.Products)
            .OrderBy(c => c.Name)
            .Select(c => c.ToDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

        await _cache.SetAsync(CacheKeys.Categories, result, TimeSpan.FromMinutes(10), ct);
        return result;
    }

    public async Task<CategoryDto> GetByIdAsync(int id, CancellationToken ct)
    {
        var key = CacheKeys.CategoryById(id);
        var cached = await _cache.GetAsync<CategoryDto>(key, ct);
        if (cached is not null) return cached;

        var category = await _db.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Category), id);

        var result = category.ToDto();
        await _cache.SetAsync(key, result, TimeSpan.FromMinutes(10), ct);
        return result;
    }

    public async Task<CategoryDto> CreateAsync(string name, string slug, CancellationToken ct)
    {
        var category = new Category
        {
            Name = name,
            Slug = slug.ToLowerInvariant(),
            IsActive = true,
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        await _cache.RemoveAsync(CacheKeys.Categories, ct);
        return category.ToDto();
    }

    public async Task<CategoryDto> UpdateAsync(int id, string name, string slug, bool isActive, CancellationToken ct)
    {
        var category = await _db.Categories
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Category), id);

        category.Name = name;
        category.Slug = slug.ToLowerInvariant();
        category.IsActive = isActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        await _cache.RemoveAsync(CacheKeys.Categories, ct);
        await _cache.RemoveAsync(CacheKeys.CategoryById(id), ct);
        return category.ToDto();
    }

    public async Task ToggleActiveAsync(int id, CancellationToken ct)
    {
        var category = await _db.Categories
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Category), id);

        category.IsActive = !category.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        await _cache.RemoveAsync(CacheKeys.Categories, ct);
        await _cache.RemoveAsync(CacheKeys.CategoryById(id), ct);
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var category = await _db.Categories
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Category), id);

        category.IsActive = false;
        category.DeletedAt = DateTime.UtcNow;
        category.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        await _cache.RemoveAsync(CacheKeys.Categories, ct);
        await _cache.RemoveAsync(CacheKeys.CategoryById(id), ct);
    }
    public async Task<PagedResult<CategoryDto>> GetAdminListAsync(int page, int pageSize, CancellationToken ct)
    {
        var query = _db.Categories
            .IgnoreQueryFilters()
            .Include(c => c.Products)
            .OrderBy(c => c.Name);

        var total = await query.CountAsync(ct).ConfigureAwait(false);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => c.ToDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

        return new PagedResult<CategoryDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }
}