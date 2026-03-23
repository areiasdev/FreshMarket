using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Products.Models;

namespace FreshMarket.Application.Products.Commands.Update;

public record UpdateProductCommand(
    int Id, int CategoryId, string Name, string? Description,
    decimal PricePerUnit, decimal MinQuantity, decimal StockQuantity,
    string? ImageUrl, bool IsSeasonal, bool IsActive
) : IRequest<ProductDto>;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, ProductDto>
{
    private readonly IProductService _productService;

    public UpdateProductCommandHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task<ProductDto> Handle(UpdateProductCommand request, CancellationToken ct)
        => await _productService.UpdateAsync(
            request.Id, request.CategoryId, request.Name, request.Description,
            request.PricePerUnit, request.MinQuantity, request.StockQuantity,
            request.ImageUrl, request.IsSeasonal, request.IsActive, ct
        ).ConfigureAwait(false);
}
