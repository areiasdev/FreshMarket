using FreshMarket.Application.Common.Constants;
using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Mapping;
using FreshMarket.Application.DeliverySlots.Models;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.DeliverySlots.Services;

public class DeliverySlotService : IDeliverySlotService
{
    private readonly IApplicationDbContext _db;
    private readonly ICacheService _cache;

    public DeliverySlotService(IApplicationDbContext db, ICacheService cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<IEnumerable<DeliverySlotDto>> GetAvailableAsync(DateOnly date, CancellationToken ct)
    {
        var key = CacheKeys.SlotsAvailable(date.ToString("yyyy-MM-dd"));
        var cached = await _cache.GetAsync<IEnumerable<DeliverySlotDto>>(key, ct);
        if (cached is not null) return cached;

        var result = await _db.DeliverySlots
            .Where(s => s.DeliveryDate == date && s.IsActive && s.CurrentOrders < s.MaxOrders)
            .OrderBy(s => s.StartTime)
            .Select(s => s.ToDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

        await _cache.SetAsync(key, result, TimeSpan.FromMinutes(2), ct);
        return result;
    }

    public async Task<IEnumerable<DeliverySlotDto>> GetByDateAsync(DateOnly date, CancellationToken ct)
    {
        var key = CacheKeys.SlotsByDate(date.ToString("yyyy-MM-dd"));
        var cached = await _cache.GetAsync<IEnumerable<DeliverySlotDto>>(key, ct);
        if (cached is not null) return cached;

        var result = await _db.DeliverySlots
            .Where(s => s.DeliveryDate == date && s.IsActive)
            .OrderBy(s => s.StartTime)
            .Select(s => s.ToDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

        await _cache.SetAsync(key, result, TimeSpan.FromMinutes(2), ct);
        return result;
    }

    public async Task<DeliverySlotDto> CreateAsync(DateOnly deliveryDate, TimeOnly startTime, TimeOnly endTime, int maxOrders, decimal shippingFee, CancellationToken ct)
    {
        var slot = new DeliverySlot
        {
            DeliveryDate = deliveryDate,
            StartTime = startTime,
            EndTime = endTime,
            MaxOrders = maxOrders,
            ShippingFee = shippingFee,
            IsActive = true,
        };

        _db.DeliverySlots.Add(slot);
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        await _cache.RemoveByPrefixAsync("slots:", ct);
        return slot.ToDto();
    }

    public async Task<DeliverySlotDto> UpdateAsync(int id, int maxOrders, decimal shippingFee, bool isActive, CancellationToken ct)
    {
        var slot = await _db.DeliverySlots
            .FirstOrDefaultAsync(s => s.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(DeliverySlot), id);

        if (maxOrders < slot.CurrentOrders)
            throw new BusinessException("MaxOrders não pode ser inferior às encomendas atuais");

        slot.MaxOrders = maxOrders;
        slot.ShippingFee = shippingFee;
        slot.IsActive = isActive;
        slot.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        await _cache.RemoveByPrefixAsync("slots:", ct);
        return slot.ToDto();
    }

    public async Task DeleteAsync(int id, CancellationToken ct)
    {
        var slot = await _db.DeliverySlots
            .FirstOrDefaultAsync(s => s.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(DeliverySlot), id);

        slot.IsActive = false;
        slot.DeletedAt = DateTime.UtcNow;
        slot.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        await _cache.RemoveByPrefixAsync("slots:", ct);
    }
    public async Task<PagedResult<DeliverySlotDto>> GetAdminListAsync(int page, int pageSize, CancellationToken ct)
    {
        var query = _db.DeliverySlots
            .IgnoreQueryFilters() // ← admin vê tudo
            .OrderBy(s => s.DeliveryDate)
            .ThenBy(s => s.StartTime);

        var total = await query.CountAsync(ct).ConfigureAwait(false);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => s.ToDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

        return new PagedResult<DeliverySlotDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }
}