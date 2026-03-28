using FreshMarket.Application.Reviews.Models;

namespace FreshMarket.Application.Common.Interfaces;

public interface IReviewService
{
    Task<IEnumerable<ReviewDto>> GetByProductAsync(int productId, CancellationToken ct);
    Task<ProductRatingSummary> GetSummaryAsync(int productId, CancellationToken ct);
    Task<ReviewDto> CreateAsync(int productId, int userId, int rating, string? comment, CancellationToken ct);
    Task DeleteAsync(int id, int userId, CancellationToken ct);
}
