using FreshMarket.Application.Common.Constants;
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
    private readonly ICacheService _cache;

    public ProductService(IApplicationDbContext db, ICacheService cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<PagedResult<ProductListDto>> GetAllAsync(int page, int pageSize, int? categoryId, CancellationToken ct)
    {
        var key = categoryId.HasValue
            ? $"products:category:{categoryId.Value}:p{page}:s{pageSize}"
            : $"products:all:p{page}:s{pageSize}";

        var cached = await _cache.GetAsync<PagedResult<ProductListDto>>(key, ct);
        if (cached is not null) return cached;

        var query = _db.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive); // ← DeletedAt já filtrado pelo HasQueryFilter

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);

        var result = await query
            .OrderBy(p => p.Name)
            .Select(p => p.ToListDto())
            .ToPagedResultAsync(page, pageSize, ct)
            .ConfigureAwait(false);

        await _cache.SetAsync(key, result, TimeSpan.FromMinutes(5), ct);
        return result;
    }

    public async Task<ProductDetailDto> GetByIdAsync(int id, CancellationToken ct)
    {
        var key = CacheKeys.ProductById(id);
        var cached = await _cache.GetAsync<ProductDetailDto>(key, ct);
        if (cached is not null) return cached;

        var product = await _db.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id, ct) // ← HasQueryFilter já exclui DeletedAt
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Product), id);

        var result = product.ToDto();
        await _cache.SetAsync(key, result, TimeSpan.FromMinutes(5), ct);
        return result;
    }

    public async Task<ProductDetailDto> CreateAsync(
        int categoryId, string name, string slug, string? description,
        decimal pricePerUnit, UnitType unitType, decimal minQuantity,
        decimal stockQuantity, bool trackStock, decimal lowStockAlert,
        string? imageUrl, bool isSeasonal, CancellationToken ct)
    {
        var baseSlug = slug;
        var finalSlug = baseSlug;
        var i = 1;
        while (await _db.Products.AnyAsync(p => p.Slug == finalSlug, ct))
            finalSlug = $"{baseSlug}-{i++}";

        var product = new Product
        {
            CategoryId = categoryId,
            Name = name,
            Slug = slug,
            Description = description,
            PricePerUnit = pricePerUnit,
            UnitType = unitType,
            MinQuantity = minQuantity,
            StockQuantity = stockQuantity,
            TrackStock = trackStock,
            LowStockAlert = lowStockAlert,
            ImageUrl = imageUrl,
            IsSeasonal = isSeasonal,
            IsActive = true,
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        await _cache.RemoveByPrefixAsync("products:", ct);
        return await GetByIdAsync(product.Id, ct).ConfigureAwait(false);
    }

    public async Task<ProductDetailDto> UpdateAsync(
        int id, int categoryId, string name, string slug, string? description,
        decimal pricePerUnit, decimal minQuantity,
        decimal stockQuantity, bool trackStock, decimal lowStockAlert,
        string? imageUrl, bool isSeasonal, bool isActive, CancellationToken ct)
    {
        var product = await _db.Products
            .FirstOrDefaultAsync(p => p.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Product), id);

        if (trackStock && stockQuantity < product.ReservedStock)
            throw new BusinessException("Stock não pode ser inferior ao reservado");

        product.CategoryId = categoryId;
        product.Name = name;
        product.Slug = slug;
        product.Description = description;
        product.PricePerUnit = pricePerUnit;
        product.MinQuantity = minQuantity;
        product.StockQuantity = stockQuantity;
        product.TrackStock = trackStock;
        product.LowStockAlert = lowStockAlert;
        product.ImageUrl = imageUrl;
        product.IsSeasonal = isSeasonal;
        product.IsActive = isActive;
        product.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        await _cache.RemoveByPrefixAsync("products:", ct);
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

        await _cache.RemoveByPrefixAsync("products:", ct);
    }

    public async Task BulkUpdatePriceAsync(IEnumerable<(int ProductId, decimal NewPrice)> items, CancellationToken ct)
    {
        var itemList = items.ToList();
        var ids = itemList.Select(i => i.ProductId).ToList();
        var products = await _db.Products
            .Where(p => ids.Contains(p.Id))
            .ToListAsync(ct)
            .ConfigureAwait(false);

        foreach (var product in products)
        {
            product.PricePerUnit = itemList.First(i => i.ProductId == product.Id).NewPrice;
            product.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
        await _cache.RemoveByPrefixAsync("products:", ct);
    }

    public async Task ToggleActiveAsync(int id, CancellationToken ct)
    {
        var product = await _db.Products
            .FirstOrDefaultAsync(p => p.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Product), id);

        product.IsActive = !product.IsActive;
        product.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        await _cache.RemoveByPrefixAsync("products:", ct);
    }

    public async Task<PagedResult<ProductListDto>> GetAdminListAsync(string? search, bool? isActive, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.Products
            .Include(p => p.Category)
            .AsQueryable(); // ← HasQueryFilter já filtra DeletedAt

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Name.Contains(search) || p.Slug.Contains(search));

        if (isActive.HasValue)
            query = query.Where(p => p.IsActive == isActive.Value);

        return await query
            .OrderBy(p => p.Name)
            .Select(p => p.ToListDto())
            .ToPagedResultAsync(page, pageSize, ct)
            .ConfigureAwait(false);
    }
}