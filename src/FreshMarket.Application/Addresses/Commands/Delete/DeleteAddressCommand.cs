using FreshMarket.Application.Common.Interfaces;
using MediatR;

namespace FreshMarket.Application.Addresses.Commands;

public record DeleteAddressCommand(int Id) : IRequest<Unit>;

public class DeleteAddressCommandHandler : IRequestHandler<DeleteAddressCommand, Unit>
{
    private readonly IAddressService _addressService;

    public DeleteAddressCommandHandler(IAddressService addressService)
    {
        _addressService = addressService;
    }

    public async Task<Unit> Handle(DeleteAddressCommand request, CancellationToken ct)
    {
        await _addressService.DeleteAsync(request.Id, ct).ConfigureAwait(false);
        return Unit.Value;
    }
}