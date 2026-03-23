using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Products.Models;

namespace FreshMarket.Application.Products.Queries;

public record GetProductByIdQuery(int Id) : IRequest<ProductDto>;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDto>
{
    private readonly IProductService _productService;

    public GetProductByIdQueryHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<ProductDto> Handle(GetProductByIdQuery request, CancellationToken ct)
        => await _productService.GetByIdAsync(request.Id, ct).ConfigureAwait(false);
}
