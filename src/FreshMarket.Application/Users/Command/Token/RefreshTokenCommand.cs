using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Users.Models;

namespace FreshMarket.Application.Users.Command.Token;

public record RefreshTokenCommand(string RefreshToken) : IRequest<AuthResponseDto?>;

public class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponseDto?>
{
    private readonly IUserService _userService;

    public RefreshTokenCommandHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<AuthResponseDto?> Handle(RefreshTokenCommand request, CancellationToken ct)
        => await _userService.RefreshTokenAsync(request.RefreshToken, ct).ConfigureAwait(false);
}
