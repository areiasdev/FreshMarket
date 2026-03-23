using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Users.Models;

namespace FreshMarket.Application.Users.Command.Login;

public record RegisterCommand(string FullName, string Email, string Password, string? Phone) : IRequest<AuthResponseDto>;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IUserService _userService;

    public RegisterCommandHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken ct)
        => await _userService.RegisterAsync(request.FullName, request.Email, request.Password, request.Phone, ct).ConfigureAwait(false);
}
