using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Products.Models;

namespace FreshMarket.Application.Products.Queries;

public record GetProductByCategoryQuery(int CategoryId) : IRequest<IEnumerable<ProductListDto>>;

public class GetProductByCategoryQueryHandler : IRequestHandler<GetProductByCategoryQuery, IEnumerable<ProductListDto>>
{
    private readonly IProductService _productService;

    public GetProductByCategoryQueryHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<IEnumerable<ProductListDto>> Handle(GetProductByCategoryQuery request, CancellationToken ct)
        => await _productService.GetByCategoryAsync(request.CategoryId, ct).ConfigureAwait(false);
}
