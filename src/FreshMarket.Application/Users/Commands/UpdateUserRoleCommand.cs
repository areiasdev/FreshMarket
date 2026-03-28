using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Users.Models;

namespace FreshMarket.Application.Users.Commands;

public record UpdateUserRoleCommand(int Id, string Role) : IRequest<UserAdminDto>;

public class UpdateUserRoleCommandHandler : IRequestHandler<UpdateUserRoleCommand, UserAdminDto>
{
    private readonly IUserAdminService _userAdminService;

    public UpdateUserRoleCommandHandler(IUserAdminService userAdminService)
    {
        _userAdminService = userAdminService;
    }

    public async Task<UserAdminDto> Handle(UpdateUserRoleCommand request, CancellationToken ct)
        => await _userAdminService.UpdateRoleAsync(request.Id, request.Role, ct).ConfigureAwait(false);
}
