using FreshMarket.Application.Addresses.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FreshMarket.Application.Common.Interfaces
{
    public interface IAddressService
    {
        Task<IEnumerable<AddressDto>> GetByUserIdAsync(int userId, CancellationToken ct);
        Task<AddressDto> GetByIdAsync(int id, CancellationToken ct);
        Task<AddressDto> CreateAsync(SaveAddressRequest request, CancellationToken ct);
        Task<AddressDto> UpdateAsync(int id, SaveAddressRequest request, CancellationToken ct);
        Task DeleteAsync(int id, CancellationToken ct);
        Task SetDefaultAsync(int userId, int addressId, CancellationToken ct);
    }
}
