using FreshMarket.Application.Common.Interfaces;

namespace FreshMarket.Application.Products.Commands.Toggle;

public record ToggleProductActiveCommand(int Id) : IRequest;

public class ToggleProductActiveCommandHandler(IProductService productService)
    : IRequestHandler<ToggleProductActiveCommand>
{
    public async Task Handle(ToggleProductActiveCommand request, CancellationToken ct)
        => await productService.ToggleActiveAsync(request.Id, ct);
}