using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Reviews.Services;
using FreshMarket.Tests.Helpers;

namespace FreshMarket.Tests.Application.Reviews;

public class ReviewServiceTests : IDisposable
{
    private readonly DbContextFactory _factory;
    private readonly ReviewService _sut;

    public ReviewServiceTests()
    {
        _factory = new DbContextFactory();
        _sut = new ReviewService(_factory.Context);
    }

    private Product SeedDeliveredPurchase(int userId)
    {
        var catId = _factory.SeedCategory();
        var product = _factory.SeedProduct(catId);

        var order = new Order
        {
            UserId = userId,
            Status = OrderStatus.Delivered,
            TotalAmount = 9.00m,
            ShippingFee = 5.00m,
            DeliveryStreet = "Rua A",
            DeliveryPostalCode = "3810-123",
            DeliveryCity = "Aveiro",
            DeliveryCountry = "PT",
            OrderNumber = "FM-TEST-0001",
            Items =
            [
                new OrderItem { ProductId = product.Id, Quantity = 1m, UnitPrice = product.PricePerUnit, Subtotal = product.PricePerUnit }
            ]
        };
        _factory.Context.Orders.Add(order);
        _factory.Context.SaveChanges();

        return product;
    }

    [Fact]
    public async Task Create_WithoutDeliveredPurchase_ThrowsBusinessException()
    {
        var catId = _factory.SeedCategory();
        var product = _factory.SeedProduct(catId);

        var act = () => _sut.CreateAsync(product.Id, _factory.DefaultUserId, 5, "Ótimo!", CancellationToken.None);

        await act.Should().ThrowAsync<BusinessException>();
    }

    [Fact]
    public async Task Create_WithDeliveredPurchase_Succeeds()
    {
        var product = SeedDeliveredPurchase(_factory.DefaultUserId);

        var review = await _sut.CreateAsync(product.Id, _factory.DefaultUserId, 5, "Ótimo!", CancellationToken.None);

        review.Rating.Should().Be(5);
    }

    [Fact]
    public async Task Create_DuplicateReview_ThrowsInvalidOperationException()
    {
        var product = SeedDeliveredPurchase(_factory.DefaultUserId);
        await _sut.CreateAsync(product.Id, _factory.DefaultUserId, 5, null, CancellationToken.None);

        var act = () => _sut.CreateAsync(product.Id, _factory.DefaultUserId, 3, null, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    public void Dispose() => _factory.Dispose();
}
