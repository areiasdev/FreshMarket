using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Products.Models;

namespace FreshMarket.Application.Products.Commands.Create;

public record CreateProductCommand(
    int CategoryId, string Name, string? Description,
    decimal PricePerUnit, UnitType UnitType, decimal MinQuantity,
    decimal StockQuantity, string? ImageUrl, bool IsSeasonal
) : IRequest<ProductDto>;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    private readonly IProductService _productService;

    public CreateProductCommandHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken ct)
        => await _productService.CreateAsync(
            request.CategoryId, request.Name, request.Description,
            request.PricePerUnit, request.UnitType, request.MinQuantity,
            request.StockQuantity, request.ImageUrl, request.IsSeasonal, ct
        ).ConfigureAwait(false);
}
