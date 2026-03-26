using FreshMarket.Application.Common.Interfaces;
using MediatR;

namespace FreshMarket.Application.Addresses.Commands;

public record SetDefaultAddressCommand(int UserId, int AddressId) : IRequest<Unit>;

public class SetDefaultAddressCommandHandler : IRequestHandler<SetDefaultAddressCommand, Unit>
{
    private readonly IAddressService _addressService;

    public SetDefaultAddressCommandHandler(IAddressService addressService)
    {
        _addressService = addressService;
    }

    public async Task<Unit> Handle(SetDefaultAddressCommand request, CancellationToken ct)
    {
        await _addressService.SetDefaultAsync(request.UserId, request.AddressId, ct).ConfigureAwait(false);
        return Unit.Value;
    }
}