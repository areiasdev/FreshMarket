using FreshMarket.Application.Common.Interfaces;

namespace FreshMarket.Application.Categories.Commands.Delete;

public record DeleteCategoryCommand(int Id) : IRequest;

public class DeleteCategoryCommandHandler : IRequestHandler<DeleteCategoryCommand>
{
    private readonly ICategoryService _categoryService;

    public DeleteCategoryCommandHandler(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    public async Task Handle(DeleteCategoryCommand request, CancellationToken ct)
        => await _categoryService.DeleteAsync(request.Id, ct).ConfigureAwait(false);
}
