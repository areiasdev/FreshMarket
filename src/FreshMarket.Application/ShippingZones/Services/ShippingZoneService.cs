using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Mapping;
using FreshMarket.Application.DeliverySlots.Models;
using FreshMarket.Application.ShippingZones.Models;
using Mapster;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.ShippingZones.Services;

public class ShippingZoneService : IShippingZoneService
{
    private readonly IApplicationDbContext _db;

    public ShippingZoneService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<ShippingZoneDto>> GetAllAsync(CancellationToken ct)
        => await _db.ShippingZones
            .Where(z => z.IsActive)
            .Select(z => z.ToDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

    public async Task<ShippingZoneDto> GetByPostalCodeAsync(string postalCodePrefix, CancellationToken ct)
    {
        var zone = await _db.ShippingZones
            .FirstOrDefaultAsync(z => z.PostalCodePrefix == postalCodePrefix && z.IsActive, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(ShippingZone), postalCodePrefix);

        return zone.ToDto();
    }

    public async Task<ShippingZoneDto> CreateAsync(string postalCodePrefix, string city, decimal shippingFee, decimal minOrderValue, CancellationToken ct)
    {
        var zone = new ShippingZone
        {
            PostalCodePrefix = postalCodePrefix,
            City = city,
            ShippingFee = shippingFee,
            MinOrderValue = minOrderValue
        };

        _db.ShippingZones.Add(zone);
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
        return zone.ToDto();
    }

    public async Task<ShippingZoneDto> UpdateAsync(int id, string city, string postalCodePrefix,decimal shippingFee, decimal minOrderValue, bool isActive, CancellationToken ct)
    {
        var zone = await _db.ShippingZones
            .FirstOrDefaultAsync(z => z.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(ShippingZone), id);

        zone.City = city;
        zone.PostalCodePrefix = postalCodePrefix;
        zone.ShippingFee = shippingFee;
        zone.MinOrderValue = minOrderValue;
        zone.IsActive = isActive;
        zone.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
        return zone.ToDto();
    }

    public async Task<PagedResult<ShippingZoneDto>> GetAdminListAsync(int page, int pageSize, CancellationToken ct)
    {
        var query = _db.ShippingZones
            .Where(z => z.DeletedAt == null)
            .OrderBy(z => z.City);

        var total = await query.CountAsync(ct).ConfigureAwait(false);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(z => z.ToDto())
            .ToListAsync(ct)
            .ConfigureAwait(false);

        return new PagedResult<ShippingZoneDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }
}
