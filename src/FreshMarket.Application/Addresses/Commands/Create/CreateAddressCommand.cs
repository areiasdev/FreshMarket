using FreshMarket.Application.Addresses.Models;
using FreshMarket.Application.Common.Interfaces;
using MediatR;

namespace FreshMarket.Application.Addresses.Commands;

public record CreateAddressCommand(SaveAddressRequest Request) : IRequest<AddressDto>;

public class CreateAddressCommandHandler : IRequestHandler<CreateAddressCommand, AddressDto>
{
    private readonly IAddressService _addressService;

    public CreateAddressCommandHandler(IAddressService addressService)
    {
        _addressService = addressService;
    }

    public async Task<AddressDto> Handle(CreateAddressCommand request, CancellationToken ct)
        => await _addressService.CreateAsync(request.Request, ct).ConfigureAwait(false);
}