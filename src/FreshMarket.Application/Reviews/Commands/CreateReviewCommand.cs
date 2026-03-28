using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Reviews.Models;

namespace FreshMarket.Application.Reviews.Commands;

public record CreateReviewCommand(int ProductId, int UserId, int Rating, string? Comment) : IRequest<ReviewDto>;

public class CreateReviewCommandHandler : IRequestHandler<CreateReviewCommand, ReviewDto>
{
    private readonly IReviewService _reviewService;

    public CreateReviewCommandHandler(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    public async Task<ReviewDto> Handle(CreateReviewCommand request, CancellationToken ct)
        => await _reviewService.CreateAsync(request.ProductId, request.UserId, request.Rating, request.Comment, ct).ConfigureAwait(false);
}
