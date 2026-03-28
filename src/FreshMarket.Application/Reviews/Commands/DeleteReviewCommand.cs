using FreshMarket.Application.Common.Interfaces;

namespace FreshMarket.Application.Reviews.Commands;

public record DeleteReviewCommand(int Id, int UserId) : IRequest;

public class DeleteReviewCommandHandler : IRequestHandler<DeleteReviewCommand>
{
    private readonly IReviewService _reviewService;

    public DeleteReviewCommandHandler(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    public async Task Handle(DeleteReviewCommand request, CancellationToken ct)
        => await _reviewService.DeleteAsync(request.Id, request.UserId, ct).ConfigureAwait(false);
}
