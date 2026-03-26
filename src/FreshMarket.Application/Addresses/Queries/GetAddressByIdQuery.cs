using FreshMarket.Application.Addresses.Models;
using FreshMarket.Application.Common.Interfaces;
using MediatR;

namespace FreshMarket.Application.Addresses.Queries;

public record GetAddressByIdQuery(int Id) : IRequest<AddressDto>;

public class GetAddressByIdQueryHandler : IRequestHandler<GetAddressByIdQuery, AddressDto>
{
    private readonly IAddressService _addressService;

    public GetAddressByIdQueryHandler(IAddressService addressService)
    {
        _addressService = addressService;
    }

    public async Task<AddressDto> Handle(GetAddressByIdQuery request, CancellationToken ct)
        => await _addressService.GetByIdAsync(request.Id, ct).ConfigureAwait(false);
}