using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Models;
using FreshMarket.Application.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.Users.Services;

public class UserAdminService : IUserAdminService
{
    private readonly IApplicationDbContext _db;

    public UserAdminService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<UserAdminDto>> GetAllAsync(string? search, string? role, int page, int pageSize, CancellationToken ct)
    {
        var query = _db.Users.Include(u => u.Orders).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var lower = search.ToLowerInvariant();
            query = query.Where(u => u.FullName.ToLower().Contains(lower) || u.Email.ToLower().Contains(lower));
        }

        if (!string.IsNullOrWhiteSpace(role))
            query = query.Where(u => u.Role == role);

        var totalCount = await query.CountAsync(ct).ConfigureAwait(false);

        var items = await query
            .OrderBy(u => u.FullName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserAdminDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Phone = u.Phone,
                Role = u.Role,
                IsActive = u.IsActive,
                IsGuest = u.IsGuest,
                OrderCount = u.Orders.Count,
                CreatedAt = u.CreatedAt,
            })
            .ToListAsync(ct)
            .ConfigureAwait(false);

        return new PagedResult<UserAdminDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
        };
    }

    public async Task<UserAdminDto> GetByIdAsync(int id, CancellationToken ct)
    {
        var user = await _db.Users
            .Include(u => u.Orders)
            .FirstOrDefaultAsync(u => u.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new KeyNotFoundException($"User {id} not found");

        return MapToDto(user);
    }

    public async Task<UserAdminDto> UpdateRoleAsync(int id, string role, CancellationToken ct)
    {
        if (role != "Customer" && role != "Admin" && role != "SuperAdmin")
            throw new ArgumentException("Role must be 'Customer', 'Admin' or 'SuperAdmin'.", nameof(role));

        var user = await _db.Users
            .Include(u => u.Orders)
            .FirstOrDefaultAsync(u => u.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new KeyNotFoundException($"User {id} not found");

        if (user.Role == "SuperAdmin" && role != "SuperAdmin")
            throw new InvalidOperationException("Cannot demote a SuperAdmin.");

        user.Role = role;
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        return MapToDto(user);
    }

    public async Task<UserAdminDto> ToggleActiveAsync(int id, CancellationToken ct)
    {
        var user = await _db.Users
            .Include(u => u.Orders)
            .FirstOrDefaultAsync(u => u.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new KeyNotFoundException($"User {id} not found");

        user.IsActive = !user.IsActive;
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        return MapToDto(user);
    }

    private static UserAdminDto MapToDto(User user) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email,
        Phone = user.Phone,
        Role = user.Role,
        IsActive = user.IsActive,
        IsGuest = user.IsGuest,
        OrderCount = user.Orders?.Count ?? 0,
        CreatedAt = user.CreatedAt,
    };
}
