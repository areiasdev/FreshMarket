using FreshMarket.Application.Categories.Models;
using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Mapping;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.Categories.Services;

public class CategoryService : ICategoryService
{
    private readonly IApplicationDbContext _db;

    public CategoryService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken ct)
        => await _db.Categories
            .Where(c => c.IsActive)
            .Select(c => c.ToDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

    public async Task<CategoryDto> GetByIdAsync(int id, CancellationToken ct)
    {
        var category = await _db.Categories
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Category), id);

        return category.ToDto();
    }

    public async Task<CategoryDto> CreateAsync(string name, string slug, CancellationToken ct)
    {
        var category = new Category { Name = name, Slug = slug.ToLowerInvariant() };
        _db.Categories.Add(category);
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
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
        return category.ToDto();
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var category = await _db.Categories
            .FirstOrDefaultAsync(c => c.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Category), id);

        category.IsActive = false;
        category.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
    }
}
