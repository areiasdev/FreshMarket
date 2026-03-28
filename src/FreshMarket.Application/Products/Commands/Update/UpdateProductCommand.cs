using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Products.Models;

namespace FreshMarket.Application.Products.Commands.Update;

public record UpdateProductCommand(
    int Id,
    int CategoryId,
    string Name,
    string Slug,
    string? Description,
    decimal PricePerUnit,
    int UnitType,
    decimal MinQuantity,
    decimal StockQuantity,
    bool TrackStock,
    decimal LowStockAlert,
    string? ImageUrl,
    bool IsSeasonal,
    bool IsActive
) : IRequest<ProductDetailDto>;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, ProductDetailDto>
{
    private readonly IProductService _productService;

    public UpdateProductCommandHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<ProductDetailDto> Handle(UpdateProductCommand request, CancellationToken ct)
        => await _productService.UpdateAsync(
            request.Id,
            request.CategoryId,
            request.Name,
            request.Slug,
            request.Description,
            request.PricePerUnit,
            (UnitType)request.UnitType,
            request.MinQuantity,
            request.StockQuantity,
            request.TrackStock,
            request.LowStockAlert,
            request.ImageUrl,
            request.IsSeasonal,
            request.IsActive,
            ct
        ).ConfigureAwait(false);
}