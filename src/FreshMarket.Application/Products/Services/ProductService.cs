using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Extensions;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Mapping;
using FreshMarket.Application.Products.Models;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.Products.Services;

public class ProductService : IProductService
{
    private readonly IApplicationDbContext _db;

    public ProductService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<ProductListDto>> GetAllAsync(int page, int pageSize, int? categoryId, CancellationToken ct)
    {
        var query = _db.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive && p.DeletedAt == null);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        return await query
            .Select(p => p.ToListDto())
            .ToPagedResultAsync(page, pageSize, ct)
            .ConfigureAwait(false);
    }

    public async Task<ProductDto> GetByIdAsync(int id, CancellationToken ct)
    {
        var product = await _db.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Product), id);

        return product.ToDto();
    }

    public async Task<IEnumerable<ProductListDto>> GetByCategoryAsync(int categoryId, CancellationToken ct)
        => await _db.Products
            .Include(p => p.Category)
            .Where(p => p.CategoryId == categoryId && p.IsActive && p.DeletedAt == null)
            .Select(p => p.ToListDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

    public async Task<ProductDto> CreateAsync(int categoryId, string name, string? description, decimal pricePerUnit, UnitType unitType, decimal minQuantity, decimal stockQuantity, string? imageUrl, bool isSeasonal, CancellationToken ct)
    {
        var product = new Product
        {
            CategoryId = categoryId,
            Name = name,
            Description = description,
            PricePerUnit = pricePerUnit,
            UnitType = unitType,
            MinQuantity = minQuantity,
            StockQuantity = stockQuantity,
            ImageUrl = imageUrl,
            IsSeasonal = isSeasonal
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
        return await GetByIdAsync(product.Id, ct).ConfigureAwait(false);
    }

    public async Task<ProductDto> UpdateAsync(int id, int categoryId, string name, string? description, decimal pricePerUnit, decimal minQuantity, decimal stockQuantity, string? imageUrl, bool isSeasonal, bool isActive, CancellationToken ct)
    {
        var product = await _db.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.DeletedAt == null, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Product), id);

        product.CategoryId = categoryId; product.Name = name; product.Description = description;
        product.PricePerUnit = pricePerUnit; product.MinQuantity = minQuantity;
        product.StockQuantity = stockQuantity; product.ImageUrl = imageUrl;
        product.IsSeasonal = isSeasonal; product.IsActive = isActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
        return await GetByIdAsync(product.Id, ct).ConfigureAwait(false);
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var product = await _db.Products
            .FirstOrDefaultAsync(p => p.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Product), id);

        product.IsActive = false;
        product.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
    }

    public async Task BulkUpdatePriceAsync(IEnumerable<(int ProductId, decimal NewPrice)> items, CancellationToken ct)
    {
        var itemList = items.ToList();
        var ids = itemList.Select(i => i.ProductId).ToList();
        var products = await _db.Products.Where(p => ids.Contains(p.Id)).ToListAsync(ct).ConfigureAwait(false);

        foreach (var product in products)
        {
            product.PricePerUnit = itemList.First(i => i.ProductId == product.Id).NewPrice;
            product.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
    }
}
