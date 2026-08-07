using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Security;
using FreshMarket.Application.Users.Services;
using FreshMarket.Tests.Helpers;

namespace FreshMarket.Tests.Application.Users;

public class UserServiceTests : IDisposable
{
    private readonly DbContextFactory _factory;
    private readonly ITokenService _tokenService = Substitute.For<ITokenService>();
    private readonly ICacheService _cache        = Substitute.For<ICacheService>();
    private readonly UserService _sut;

    public UserServiceTests()
    {
        _factory = new DbContextFactory();
        _tokenService.GenerateAccessToken(Arg.Any<User>()).Returns("access-token");
        _tokenService.GenerateRefreshToken().Returns("refresh-token");
        _sut = new UserService(_factory.Context, _tokenService, _cache);
    }

    [Fact]
    public async Task GuestCheckout_NewEmail_CreatesGuestUser()
    {
        var result = await _sut.GuestCheckoutAsync("Maria Silva", "maria@example.com", "912345678", CancellationToken.None);

        result.AccessToken.Should().Be("access-token");
        result.User.Email.Should().Be("maria@example.com");

        var stored = _factory.Context.Users.First(u => u.Email == "maria@example.com");
        stored.IsGuest.Should().BeTrue();
        stored.Role.Should().Be("Customer"); // same authorization surface as a real customer
    }

    [Fact]
    public async Task GuestCheckout_RepeatGuestEmail_ReusesSameUserAndUpdatesDetails()
    {
        await _sut.GuestCheckoutAsync("Maria Silva", "maria@example.com", "912345678", CancellationToken.None);
        var firstCount = _factory.Context.Users.Count(u => u.Email == "maria@example.com");

        await _sut.GuestCheckoutAsync("Maria S. Silva", "maria@example.com", "911111111", CancellationToken.None);

        _factory.Context.Users.Count(u => u.Email == "maria@example.com").Should().Be(firstCount); // no duplicate row
        var updated = _factory.Context.Users.First(u => u.Email == "maria@example.com");
        updated.FullName.Should().Be("Maria S. Silva");
        updated.Phone.Should().Be("911111111");
    }

    [Fact]
    public async Task GuestCheckout_EmailBelongsToRealAccount_ThrowsBusinessException()
    {
        _factory.SeedUser(email: "real@example.com", name: "Real Customer"); // IsGuest defaults to false

        var act = () => _sut.GuestCheckoutAsync("Someone Else", "real@example.com", null, CancellationToken.None);

        await act.Should().ThrowAsync<BusinessException>();
    }

    public void Dispose() => _factory.Dispose();
}
