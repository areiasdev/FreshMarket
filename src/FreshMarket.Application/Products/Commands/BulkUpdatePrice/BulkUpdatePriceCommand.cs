using FreshMarket.Application.Common.Interfaces;

namespace FreshMarket.Application.Products.Commands.BulkUpdatePrice;

public record BulkUpdatePriceItem(int ProductId, decimal NewPrice);
public record BulkUpdatePriceCommand(IEnumerable<BulkUpdatePriceItem> Items) : IRequest;

public class BulkUpdatePriceCommandHandler : IRequestHandler<BulkUpdatePriceCommand>
{
    private readonly IProductService _productService;

    public BulkUpdatePriceCommandHandler(IProductService productService)
    {
        _productService = productService;
    }

    public async Task Handle(BulkUpdatePriceCommand request, CancellationToken ct)
        => await _productService.BulkUpdatePriceAsync(
            request.Items.Select(i => (i.ProductId, i.NewPrice)), ct
        ).ConfigureAwait(false);
}
