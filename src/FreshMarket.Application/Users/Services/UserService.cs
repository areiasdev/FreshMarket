using FreshMarket.Application.Common.Constants;
using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Mapping;
using FreshMarket.Application.Common.Security;
using FreshMarket.Application.Users.Models;
using FreshMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.Users.Services;

public class UserService : IUserService
{
    private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(7);

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

        return await GenerateAuthResponseAsync(user, ct).ConfigureAwait(false);
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

        return await GenerateAuthResponseAsync(user, ct).ConfigureAwait(false);
    }

    public async Task<AuthResponseDto> GuestCheckoutAsync(string fullName, string email, string? phone, CancellationToken ct)
    {
        var normalizedEmail = email.ToLowerInvariant();
        var existing = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == normalizedEmail, ct)
            .ConfigureAwait(false);

        // A real registered account already owns this email — don't silently issue a session
        // for it without a password. Point them at login instead.
        if (existing is not null && !existing.IsGuest)
            throw new BusinessException("Já existe uma conta com este email. Inicia sessão para continuar.");

        User user;
        if (existing is not null)
        {
            existing.FullName = fullName;
            existing.Phone = phone;
            user = existing;
        }
        else
        {
            user = new User
            {
                FullName = fullName,
                Email = normalizedEmail,
                // Random, never handed back — a guest account has no password to log in with.
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString("N")),
                Phone = phone,
                IsGuest = true,
            };
            _db.Users.Add(user);
        }

        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        return await GenerateAuthResponseAsync(user, ct).ConfigureAwait(false);
    }

    public async Task<AuthResponseDto?> RefreshTokenAsync(string refreshToken, CancellationToken ct)
    {
        var userId = await _cache.GetAsync<int?>(CacheKeys.RefreshToken(refreshToken), ct).ConfigureAwait(false);
        if (userId is null) return null;

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == userId.Value, ct)
            .ConfigureAwait(false);
        if (user == null) return null;

        // Rotate: invalidate the used refresh token before issuing a new one.
        await _cache.RemoveAsync(CacheKeys.RefreshToken(refreshToken), ct).ConfigureAwait(false);

        return await GenerateAuthResponseAsync(user, ct).ConfigureAwait(false);
    }

    public async Task LogoutAsync(string refreshToken, CancellationToken ct)
        => await _cache.RemoveAsync(CacheKeys.RefreshToken(refreshToken), ct).ConfigureAwait(false);

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

    private async Task<AuthResponseDto> GenerateAuthResponseAsync(User user, CancellationToken ct)
    {
        var refreshToken = _tokenService.GenerateRefreshToken();
        await _cache.SetAsync(CacheKeys.RefreshToken(refreshToken), user.Id, RefreshTokenLifetime, ct)
            .ConfigureAwait(false);

        return new AuthResponseDto
        {
            AccessToken = _tokenService.GenerateAccessToken(user),
            RefreshToken = refreshToken,
            User = user.ToDto()
        };
    }
}