using FreshMarket.Application.Categories.Models;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Models;
using MediatR;

namespace FreshMarket.Application.Categories.Queries;

public record GetAdminCategoriesQuery : IRequest<PagedResult<CategoryDto>>
{
    public int Page { get; init; }
    public int PageSize { get; init; }
}

public class GetAdminCategoriesQueryHandler : IRequestHandler<GetAdminCategoriesQuery, PagedResult<CategoryDto>>
{
    private readonly ICategoryService _categoryService;

    public GetAdminCategoriesQueryHandler(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    public async Task<PagedResult<CategoryDto>> Handle(GetAdminCategoriesQuery request, CancellationToken cancellationToken)
        => await _categoryService.GetAdminListAsync(request.Page, request.PageSize, cancellationToken).ConfigureAwait(false);
}