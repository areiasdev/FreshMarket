using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.DeliverySlots.Commands.Toggle;

public record ToggleDeliverySlotActiveCommand(int Id) : IRequest;

public class ToggleDeliverySlotActiveCommandHandler : IRequestHandler<ToggleDeliverySlotActiveCommand>
{
    private readonly IApplicationDbContext _db;

    public ToggleDeliverySlotActiveCommandHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task Handle(ToggleDeliverySlotActiveCommand request, CancellationToken cancellationToken)
    {
        var slot = await _db.DeliverySlots
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.DeletedAt == null, cancellationToken)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(DeliverySlot), request.Id);

        slot.IsActive = !slot.IsActive;
        slot.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }
}