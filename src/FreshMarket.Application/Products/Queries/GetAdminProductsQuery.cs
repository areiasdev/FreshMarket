// FreshMarket.Application/Products/Queries/GetAdminProductsQuery.cs
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Models;
using FreshMarket.Application.Products.Models;
using Mapster;
using MediatR;

namespace FreshMarket.Application.Products.Queries;

public record GetAdminProductsQuery : IRequest<PagedResult<ProductListDto>>
{
    public int Page { get; init; }
    public int PageSize { get; init; }
    public string? Search { get; init; }
    public bool? IsActive { get; init; }
}

public class GetAdminProductsQueryHandler : IRequestHandler<GetAdminProductsQuery, PagedResult<ProductListDto>>
{
    private readonly IProductService _productService;

    public GetAdminProductsQueryHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<PagedResult<ProductListDto>> Handle(GetAdminProductsQuery request, CancellationToken cancellationToken)
    {
        var products = await _productService.GetAdminListAsync(request.Search, request.IsActive, request.Page, request.PageSize, cancellationToken);
        return products.Adapt<PagedResult<ProductListDto>>();
    }
}