using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Users.Models;
using MediatR;

namespace FreshMarket.Application.Users.Command.UpdateProfile;

public record UpdateUserProfileCommand(
    int UserId,
    string FullName,
    string? Phone,
    string? NewPassword
) : IRequest<UserDto>;

public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, UserDto>
{
    private readonly IUserService _userService;

    public UpdateUserProfileCommandHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<UserDto> Handle(UpdateUserProfileCommand request, CancellationToken ct)
        => await _userService.UpdateProfileAsync(
            request.UserId, request.FullName, request.Phone, request.NewPassword, ct
        ).ConfigureAwait(false);
}
