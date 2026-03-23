using FreshMarket.Application.Users.Models;

namespace FreshMarket.Application.Common.Interfaces;

public interface IUserService
{
    Task<AuthResponseDto?> LoginAsync(string email, string password, CancellationToken ct);
    Task<AuthResponseDto?> RegisterAsync(string fullName, string email, string password, string? phone, CancellationToken ct);
    Task<AuthResponseDto?> RefreshTokenAsync(string refreshToken, CancellationToken ct);
    Task<UserDto?> GetByIdAsync(int id, CancellationToken ct);
}
