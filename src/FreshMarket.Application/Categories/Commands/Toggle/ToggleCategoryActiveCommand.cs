using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.Categories.Commands.Toggle;

public record ToggleCategoryActiveCommand(int Id) : IRequest;

public class ToggleCategoryActiveCommandHandler : IRequestHandler<ToggleCategoryActiveCommand>
{
    private readonly IApplicationDbContext _db;

    public ToggleCategoryActiveCommandHandler(IApplicationDbContext db)
    {
        _db = db;
    }
    public async Task Handle(ToggleCategoryActiveCommand request, CancellationToken cancellationToken)
    {
        var category = await _db.Categories
            .FirstOrDefaultAsync(c => c.Id == request.Id && c.DeletedAt == null, cancellationToken)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(Category), request.Id);

        category.IsActive = !category.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }
}