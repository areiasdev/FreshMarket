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

    public UserService(IApplicationDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
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
        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Id == id, ct)
            .ConfigureAwait(false);

        return user == null ? null : user.ToDto();
    }

    private AuthResponseDto GenerateAuthResponse(User user) => new()
    {
        AccessToken = _tokenService.GenerateAccessToken(user),
        RefreshToken = _tokenService.GenerateRefreshToken(),
        User = user.ToDto()
    };
}
