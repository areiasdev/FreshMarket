using FreshMarket.Application.Common.Models;
using FreshMarket.Application.Users.Models;

namespace FreshMarket.Application.Common.Interfaces;

public interface IUserAdminService
{
    Task<PagedResult<UserAdminDto>> GetAllAsync(string? search, string? role, int page, int pageSize, CancellationToken ct);
    Task<UserAdminDto> GetByIdAsync(int id, CancellationToken ct);
    Task<UserAdminDto> UpdateRoleAsync(int id, string role, CancellationToken ct);
    Task<UserAdminDto> ToggleActiveAsync(int id, CancellationToken ct);
}
