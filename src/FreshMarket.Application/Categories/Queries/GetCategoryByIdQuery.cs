using FreshMarket.Application.Categories.Models;
using FreshMarket.Application.Common.Interfaces;

namespace FreshMarket.Application.Categories.Queries;

public record GetCategoryByIdQuery(int Id) : IRequest<CategoryDto>;

public class GetCategoryByIdQueryHandler : IRequestHandler<GetCategoryByIdQuery, CategoryDto>
{
    private readonly ICategoryService _categoryService;

    public GetCategoryByIdQueryHandler(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    public async Task<CategoryDto> Handle(GetCategoryByIdQuery request, CancellationToken ct)
        => await _categoryService.GetByIdAsync(request.Id, ct).ConfigureAwait(false);
}
