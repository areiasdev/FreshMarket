using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Products.Models;

namespace FreshMarket.Application.Products.Commands.Create;

public record CreateProductCommand(
    int CategoryId, string Name, string? Description,string Slug,
    decimal PricePerUnit, UnitType UnitType, decimal MinQuantity,
    decimal StockQuantity,bool trackStock, decimal lowStockAlert,  string? ImageUrl, bool IsSeasonal
) : IRequest<ProductDetailDto>;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ProductDetailDto>
{
    private readonly IProductService _productService;

    public CreateProductCommandHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<ProductDetailDto> Handle(CreateProductCommand request, CancellationToken ct)
    {
        return await _productService.CreateAsync(
                request.CategoryId, request.Name, request.Slug, request.Description,
                request.PricePerUnit, request.UnitType, request.MinQuantity,
                request.StockQuantity, request.trackStock, request.lowStockAlert, request.ImageUrl, request.IsSeasonal, ct
            ).ConfigureAwait(false);
    }
}
