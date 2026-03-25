using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Mapping;
using FreshMarket.Application.DeliverySlots.Models;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.DeliverySlots.Services;

public class DeliverySlotService : IDeliverySlotService
{
    private readonly IApplicationDbContext _db;

    public DeliverySlotService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<DeliverySlotDto>> GetAvailableAsync(DateOnly date, string postalCodePrefix, CancellationToken ct)
    {
        var zone = await _db.ShippingZones
            .FirstOrDefaultAsync(z => z.PostalCodePrefix == postalCodePrefix && z.IsActive, ct)
            .ConfigureAwait(false);

        return await _db.DeliverySlots
            .Where(s => s.DeliveryDate == date && s.IsActive && s.CurrentOrders < s.MaxOrders
                && (s.ShippingZoneId == null || s.ShippingZoneId == zone!.Id))
            .Select(s => s.ToDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);
    }

    public async Task<IEnumerable<DeliverySlotDto>> GetByDateAsync(DateOnly date, CancellationToken ct)
        => await _db.DeliverySlots
            .Where(s => s.DeliveryDate == date && s.IsActive)
            .Select(s => s.ToDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

    public async Task<DeliverySlotDto> CreateAsync(DateOnly deliveryDate, TimeOnly startTime, TimeOnly endTime, int maxOrders, int? shippingZoneId, CancellationToken ct)
    {
        var slot = new DeliverySlot
        {
            DeliveryDate = deliveryDate,
            StartTime = startTime,
            EndTime = endTime,
            MaxOrders = maxOrders,
            ShippingZoneId = shippingZoneId
        };

        _db.DeliverySlots.Add(slot);
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
        return slot.ToDto();
    }

    public async Task<DeliverySlotDto> UpdateAsync(int id, int maxOrders, bool isActive, CancellationToken ct)
    {
        var slot = await _db.DeliverySlots
            .FirstOrDefaultAsync(s => s.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(DeliverySlot), id);

        slot.MaxOrders = maxOrders;
        slot.IsActive = isActive;
        slot.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
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
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
    }

    public async Task<PagedResult<DeliverySlotDto>> GetAdminListAsync(int page, int pageSize, CancellationToken ct)
    {
        var query = _db.DeliverySlots
            .Where(s => s.DeletedAt == null)
            .OrderBy(s => s.CreatedAt)
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
