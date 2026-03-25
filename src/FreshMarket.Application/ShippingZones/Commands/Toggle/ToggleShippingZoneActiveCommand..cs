using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.ShippingZones.Commands.Toggle;

public record ToggleShippingZoneActiveCommand(int Id) : IRequest;

public class ToggleShippingZoneActiveCommandHandler : IRequestHandler<ToggleShippingZoneActiveCommand>
{
    private readonly IApplicationDbContext _db;

    public ToggleShippingZoneActiveCommandHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task Handle(ToggleShippingZoneActiveCommand request, CancellationToken cancellationToken)
    {
        var zone = await _db.ShippingZones
            .FirstOrDefaultAsync(z => z.Id == request.Id && z.DeletedAt == null, cancellationToken)
            .ConfigureAwait(false)
            ?? throw new NotFoundException(nameof(ShippingZone), request.Id);

        zone.IsActive = !zone.IsActive;
        zone.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
    }
}