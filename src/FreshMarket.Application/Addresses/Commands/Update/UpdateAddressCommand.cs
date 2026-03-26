using FreshMarket.Application.Addresses.Models;
using FreshMarket.Application.Common.Interfaces;
using MediatR;

namespace FreshMarket.Application.Addresses.Commands;

public record UpdateAddressCommand(int Id, SaveAddressRequest Request) : IRequest<AddressDto>;

public class UpdateAddressCommandHandler : IRequestHandler<UpdateAddressCommand, AddressDto>
{
    private readonly IAddressService _addressService;

    public UpdateAddressCommandHandler(IAddressService addressService)
    {
        _addressService = addressService;
    }

    public async Task<AddressDto> Handle(UpdateAddressCommand request, CancellationToken ct)
        => await _addressService.UpdateAsync(request.Id, request.Request, ct).ConfigureAwait(false);
}