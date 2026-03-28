using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Users.Models;

namespace FreshMarket.Application.Users.Queries;

public record GetUserByIdAdminQuery(int Id) : IRequest<UserAdminDto>;

public class GetUserByIdAdminQueryHandler : IRequestHandler<GetUserByIdAdminQuery, UserAdminDto>
{
    private readonly IUserAdminService _userAdminService;

    public GetUserByIdAdminQueryHandler(IUserAdminService userAdminService)
    {
        _userAdminService = userAdminService;
    }

    public async Task<UserAdminDto> Handle(GetUserByIdAdminQuery request, CancellationToken ct)
        => await _userAdminService.GetByIdAsync(request.Id, ct).ConfigureAwait(false);
}
