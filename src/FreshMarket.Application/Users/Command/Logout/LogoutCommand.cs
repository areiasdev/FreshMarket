using FreshMarket.Application.Common.Interfaces;

namespace FreshMarket.Application.Users.Command.Logout;

public record LogoutCommand(string RefreshToken) : IRequest;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly IUserService _userService;

    public LogoutCommandHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task Handle(LogoutCommand request, CancellationToken ct)
        => await _userService.LogoutAsync(request.RefreshToken, ct).ConfigureAwait(false);
}
