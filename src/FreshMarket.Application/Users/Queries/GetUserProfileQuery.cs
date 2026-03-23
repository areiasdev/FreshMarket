using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Users.Models;

namespace FreshMarket.Application.Users.Queries;

public record GetUserProfileQuery(int UserId) : IRequest<UserDto?>;

public class GetUserProfileQueryHandler : IRequestHandler<GetUserProfileQuery, UserDto?>
{
    private readonly IUserService _userService;

    public GetUserProfileQueryHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<UserDto?> Handle(GetUserProfileQuery request, CancellationToken ct)
        => await _userService.GetByIdAsync(request.UserId, ct).ConfigureAwait(false);
}
