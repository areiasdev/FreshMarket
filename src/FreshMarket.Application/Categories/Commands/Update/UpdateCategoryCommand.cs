using FreshMarket.Application.Categories.Models;
using FreshMarket.Application.Common.Interfaces;

namespace FreshMarket.Application.Categories.Commands.Update;

public record UpdateCategoryCommand(int Id, string Name, string Slug, bool IsActive) : IRequest<CategoryDto>;

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, CategoryDto>
{
    private readonly ICategoryService _categoryService;

    public UpdateCategoryCommandHandler(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    public async Task<CategoryDto> Handle(UpdateCategoryCommand request, CancellationToken ct)
        => await _categoryService.UpdateAsync(request.Id, request.Name, request.Slug, request.IsActive, ct).ConfigureAwait(false);
}
