using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Products.Models;

namespace FreshMarket.Application.Products.Queries;

public record GetAllProductsQuery(int Page = 1, int PageSize = 20, int? CategoryId = null)
    : IRequest<PagedResult<ProductListDto>>;

public class GetAllProductsQueryHandler : IRequestHandler<GetAllProductsQuery, PagedResult<ProductListDto>>
{
    private readonly IProductService _productService;

    public GetAllProductsQueryHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<PagedResult<ProductListDto>> Handle(GetAllProductsQuery request, CancellationToken ct)
        => await _productService.GetAllAsync(request.Page, request.PageSize, request.CategoryId, ct).ConfigureAwait(false);
}
