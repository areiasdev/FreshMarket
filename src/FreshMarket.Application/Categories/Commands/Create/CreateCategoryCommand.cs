using FreshMarket.Application.Categories.Models;
using FreshMarket.Application.Common.Interfaces;

namespace FreshMarket.Application.Categories.Commands.Create;

public record CreateCategoryCommand(string Name, string Slug) : IRequest<CategoryDto>;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, CategoryDto>
{
    private readonly ICategoryService _categoryService;

    public CreateCategoryCommandHandler(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    public async Task<CategoryDto> Handle(CreateCategoryCommand request, CancellationToken ct)
        => await _categoryService.CreateAsync(request.Name, request.Slug, ct).ConfigureAwait(false);
}