using FreshMarket.Application.Addresses.Models;
using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Mapping;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FreshMarket.Application.Addresses.Services
{
    // AddressService.cs
    public class AddressService : IAddressService
    {
        private readonly IApplicationDbContext _db;

        public AddressService(IApplicationDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<AddressDto>> GetByUserIdAsync(int userId, CancellationToken ct)
            => await _db.Addresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ThenBy(a => a.Label)
                .Select(a => a.ToDto())
                .ToListAsync(ct);
        public async Task<AddressDto> GetByIdAsync(int id, CancellationToken ct)
        {
            var address = await _db.Addresses
                .FirstOrDefaultAsync(a => a.Id == id, ct)
                ?? throw new NotFoundException(nameof(Address), id);
            return address.ToDto();
        }

        public async Task<AddressDto> CreateAsync(SaveAddressRequest request, CancellationToken ct)
        {
            var address = new Address
            {
                UserId = request.UserId,
                Label = request.Label,
                Street = request.Street,
                PostalCode = request.PostalCode,
                City = request.City,
                Country = request.Country,
                IsDefault = request.IsDefault,
            };

            _db.Addresses.Add(address);

            if (request.IsDefault)
                await ClearOtherDefaultsAsync(address.UserId, ct);

            return address.ToDto();
        }

        public async Task<AddressDto> UpdateAsync(int id, SaveAddressRequest request, CancellationToken ct)
        {
            var address = await _db.Addresses
                .FirstOrDefaultAsync(a => a.Id == id, ct)
                ?? throw new NotFoundException(nameof(Address), id);

            address.Label = request.Label;
            address.Street = request.Street;
            address.PostalCode = request.PostalCode;
            address.City = request.City;
            address.Country = request.Country;
            address.IsDefault = request.IsDefault;
            address.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync(ct);

            if (request.IsDefault)
                await ClearOtherDefaultsAsync(address.UserId, ct);

            return address.ToDto();
        }

        public async Task DeleteAsync(int id, CancellationToken ct)
        {
            var address = await _db.Addresses
                .FirstOrDefaultAsync(a => a.Id == id, ct)
                ?? throw new NotFoundException(nameof(Address), id);

            address.DeletedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }

        public async Task SetDefaultAsync(int userId, int addressId, CancellationToken ct)
        {
            await ClearOtherDefaultsAsync(userId, ct);

            var address = await _db.Addresses
                .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId, ct)
                ?? throw new NotFoundException(nameof(Address), addressId);

            address.IsDefault = true;
            address.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
        }

        private async Task ClearOtherDefaultsAsync(int userId, CancellationToken ct)
        {
            var defaults = await _db.Addresses
                .Where(a => a.UserId == userId && a.IsDefault)
                .ToListAsync(ct);

            foreach (var address in defaults)
            {
                address.IsDefault = false;
                address.UpdatedAt = DateTime.UtcNow;
            }

            await _db.SaveChangesAsync(ct);
        }
    }
}
