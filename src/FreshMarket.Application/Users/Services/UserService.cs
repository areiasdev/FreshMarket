using FreshMarket.Application.Common.Constants;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Mapping;
using FreshMarket.Application.Common.Security;
using FreshMarket.Application.Users.Models;
using FreshMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.Users.Services;

public class UserService : IUserService
{
    private readonly IApplicationDbContext _db;
    private readonly ITokenService _tokenService;
    private readonly ICacheService _cache;

    public UserService(IApplicationDbContext db, ITokenService tokenService, ICacheService cache)
    {
        _db = db;
        _tokenService = tokenService;
        _cache = cache;
    }

    public async Task<AuthResponseDto?> LoginAsync(string email, string password, CancellationToken ct)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == email.ToLowerInvariant(), ct)
            .ConfigureAwait(false);

        if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            return null;

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto> RegisterAsync(string fullName, string email, string password, string? phone, CancellationToken ct)
    {
        var user = new User
        {
            FullName = fullName,
            Email = email.ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Phone = phone
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponseDto?> RefreshTokenAsync(string refreshToken, CancellationToken ct)
    {
        await Task.CompletedTask.ConfigureAwait(false);
        return null;
    }

    public async Task<UserDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var key = CacheKeys.UserById(id);
        var cached = await _cache.GetAsync<UserDto>(key, ct);
        if (cached is not null) return cached;

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == id, ct)
            .ConfigureAwait(false);

        if (user == null) return null;

        var result = user.ToDto();
        await _cache.SetAsync(key, result, TimeSpan.FromMinutes(30), ct);
        return result;
    }

    public async Task<UserDto> UpdateProfileAsync(int id, string fullName, string? phone, string? newPassword, CancellationToken ct)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new KeyNotFoundException($"User {id} not found");

        user.FullName = fullName;
        user.Phone    = phone;

        if (!string.IsNullOrWhiteSpace(newPassword))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        var result = user.ToDto();
        await _cache.SetAsync(CacheKeys.UserById(id), result, TimeSpan.FromMinutes(30), ct);
        return result;
    }

    private AuthResponseDto GenerateAuthResponse(User user) => new()
    {
        AccessToken = _tokenService.GenerateAccessToken(user),
        RefreshToken = _tokenService.GenerateRefreshToken(),
        User = user.ToDto()
    };
}