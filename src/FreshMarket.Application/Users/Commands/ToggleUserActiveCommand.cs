using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Users.Models;

namespace FreshMarket.Application.Users.Commands;

public record ToggleUserActiveCommand(int Id) : IRequest<UserAdminDto>;

public class ToggleUserActiveCommandHandler : IRequestHandler<ToggleUserActiveCommand, UserAdminDto>
{
    private readonly IUserAdminService _userAdminService;

    public ToggleUserActiveCommandHandler(IUserAdminService userAdminService)
    {
        _userAdminService = userAdminService;
    }

    public async Task<UserAdminDto> Handle(ToggleUserActiveCommand request, CancellationToken ct)
        => await _userAdminService.ToggleActiveAsync(request.Id, ct).ConfigureAwait(false);
}
