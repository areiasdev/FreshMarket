using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Models;
using FreshMarket.Application.Users.Models;

namespace FreshMarket.Application.Users.Queries;

public record GetAllUsersQuery : IRequest<PagedResult<UserAdminDto>>
{
    public string? Search { get; init; }
    public string? Role { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, PagedResult<UserAdminDto>>
{
    private readonly IUserAdminService _userAdminService;

    public GetAllUsersQueryHandler(IUserAdminService userAdminService)
    {
        _userAdminService = userAdminService;
    }

    public async Task<PagedResult<UserAdminDto>> Handle(GetAllUsersQuery request, CancellationToken ct)
        => await _userAdminService.GetAllAsync(request.Search, request.Role, request.Page, request.PageSize, ct).ConfigureAwait(false);
}
