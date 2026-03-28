using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Reviews.Models;

namespace FreshMarket.Application.Reviews.Queries;

public record GetProductReviewsQuery(int ProductId) : IRequest<IEnumerable<ReviewDto>>;

public class GetProductReviewsQueryHandler : IRequestHandler<GetProductReviewsQuery, IEnumerable<ReviewDto>>
{
    private readonly IReviewService _reviewService;

    public GetProductReviewsQueryHandler(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    public async Task<IEnumerable<ReviewDto>> Handle(GetProductReviewsQuery request, CancellationToken ct)
        => await _reviewService.GetByProductAsync(request.ProductId, ct).ConfigureAwait(false);
}

public record GetProductRatingSummaryQuery(int ProductId) : IRequest<ProductRatingSummary>;

public class GetProductRatingSummaryQueryHandler : IRequestHandler<GetProductRatingSummaryQuery, ProductRatingSummary>
{
    private readonly IReviewService _reviewService;

    public GetProductRatingSummaryQueryHandler(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    public async Task<ProductRatingSummary> Handle(GetProductRatingSummaryQuery request, CancellationToken ct)
        => await _reviewService.GetSummaryAsync(request.ProductId, ct).ConfigureAwait(false);
}
