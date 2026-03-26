using FreshMarket.Application.Addresses.Models;
using FreshMarket.Application.Common.Interfaces;
using MediatR;

namespace FreshMarket.Application.Addresses.Queries;

public record GetUserAddressesQuery(int UserId) : IRequest<IEnumerable<AddressDto>>;

public class GetUserAddressesQueryHandler : IRequestHandler<GetUserAddressesQuery, IEnumerable<AddressDto>>
{
    private readonly IAddressService _addressService;

    public GetUserAddressesQueryHandler(IAddressService addressService)
    {
        _addressService = addressService;
    }

    public async Task<IEnumerable<AddressDto>> Handle(GetUserAddressesQuery request, CancellationToken ct)
        => await _addressService.GetByUserIdAsync(request.UserId, ct).ConfigureAwait(false);
}