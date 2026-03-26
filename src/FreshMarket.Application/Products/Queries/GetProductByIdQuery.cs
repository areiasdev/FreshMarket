using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Products.Models;

namespace FreshMarket.Application.Products.Queries;

public record GetProductByIdQuery(int Id) : IRequest<ProductDetailDto>;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDetailDto>
{
    private readonly IProductService _productService;

    public GetProductByIdQueryHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<ProductDetailDto> Handle(GetProductByIdQuery request, CancellationToken ct)
        => await _productService.GetByIdAsync(request.Id, ct).ConfigureAwait(false);
}
