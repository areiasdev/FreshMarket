using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Users.Models;

namespace FreshMarket.Application.Users.Command.Login;

public record LoginCommand(string Email, string Password) : IRequest<AuthResponseDto?>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto?>
{
    private readonly IUserService _userService;

    public LoginCommandHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<AuthResponseDto?> Handle(LoginCommand request, CancellationToken ct)
        => await _userService.LoginAsync(request.Email, request.Password, ct).ConfigureAwait(false);
}
