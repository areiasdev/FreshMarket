using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Reviews.Models;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.Reviews.Services;

public class ReviewService : IReviewService
{
    private readonly IApplicationDbContext _db;

    public ReviewService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<ReviewDto>> GetByProductAsync(int productId, CancellationToken ct)
    {
        return await _db.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto
            {
                Id = r.Id,
                ProductId = r.ProductId,
                UserId = r.UserId,
                UserFullName = r.User.FullName,
                Rating = r.Rating,
                Comment = r.Comment,
                CreatedAt = r.CreatedAt,
            })
            .ToListAsync(ct)
            .ConfigureAwait(false);
    }

    public async Task<ProductRatingSummary> GetSummaryAsync(int productId, CancellationToken ct)
    {
        var reviews = await _db.Reviews
            .Where(r => r.ProductId == productId)
            .Select(r => r.Rating)
            .ToListAsync(ct)
            .ConfigureAwait(false);

        if (reviews.Count == 0)
        {
            return new ProductRatingSummary
            {
                AverageRating = 0,
                TotalReviews = 0,
                RatingCounts = new Dictionary<int, int> { { 1, 0 }, { 2, 0 }, { 3, 0 }, { 4, 0 }, { 5, 0 } },
            };
        }

        return new ProductRatingSummary
        {
            AverageRating = reviews.Average(),
            TotalReviews = reviews.Count,
            RatingCounts = Enumerable.Range(1, 5)
                .ToDictionary(star => star, star => reviews.Count(r => r == star)),
        };
    }

    public async Task<ReviewDto> CreateAsync(int productId, int userId, int rating, string? comment, CancellationToken ct)
    {
        if (rating < 1 || rating > 5)
            throw new ArgumentOutOfRangeException(nameof(rating), "Rating must be between 1 and 5.");

        var exists = await _db.Reviews
            .AnyAsync(r => r.ProductId == productId && r.UserId == userId, ct)
            .ConfigureAwait(false);

        if (exists)
            throw new InvalidOperationException("You have already reviewed this product.");

        var review = new Review
        {
            ProductId = productId,
            UserId = userId,
            Rating = rating,
            Comment = comment,
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);

        var userName = await _db.Users
            .Where(u => u.Id == userId)
            .Select(u => u.FullName)
            .FirstOrDefaultAsync(ct)
            .ConfigureAwait(false);

        return new ReviewDto
        {
            Id = review.Id,
            ProductId = review.ProductId,
            UserId = review.UserId,
            UserFullName = userName ?? string.Empty,
            Rating = review.Rating,
            Comment = review.Comment,
            CreatedAt = review.CreatedAt,
        };
    }

    public async Task DeleteAsync(int id, int userId, CancellationToken ct)
    {
        var review = await _db.Reviews
            .FirstOrDefaultAsync(r => r.Id == id, ct)
            .ConfigureAwait(false)
            ?? throw new KeyNotFoundException($"Review {id} not found.");

        if (review.UserId != userId)
            throw new UnauthorizedAccessException("You can only delete your own reviews.");

        review.DeletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct).ConfigureAwait(false);
    }
}
