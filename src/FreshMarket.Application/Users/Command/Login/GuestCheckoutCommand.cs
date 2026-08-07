using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Users.Models;

namespace FreshMarket.Application.Users.Command.Login;

public record GuestCheckoutCommand(string FullName, string Email, string? Phone) : IRequest<AuthResponseDto>, ISensitiveRequest;

public class GuestCheckoutCommandHandler : IRequestHandler<GuestCheckoutCommand, AuthResponseDto>
{
    private readonly IUserService _userService;

    public GuestCheckoutCommandHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<AuthResponseDto> Handle(GuestCheckoutCommand request, CancellationToken ct)
        => await _userService.GuestCheckoutAsync(request.FullName, request.Email, request.Phone, ct).ConfigureAwait(false);
}
