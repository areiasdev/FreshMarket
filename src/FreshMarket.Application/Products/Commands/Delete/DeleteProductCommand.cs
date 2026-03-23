using FreshMarket.Application.Common.Interfaces;

namespace FreshMarket.Application.Products.Commands.Delete;

public record DeleteProductCommand(int Id) : IRequest;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand>
{
    private readonly IProductService _productService;

    public DeleteProductCommandHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task Handle(DeleteProductCommand request, CancellationToken ct)
        => await _productService.DeleteAsync(request.Id, ct).ConfigureAwait(false);
}
