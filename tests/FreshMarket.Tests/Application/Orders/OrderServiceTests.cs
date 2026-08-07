using FreshMarket.Application.Common.Exceptions;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Orders.Services;
using FreshMarket.Tests.Helpers;
using Microsoft.Extensions.Logging;

namespace FreshMarket.Tests.Application.Orders;

public class OrderServiceTests : IDisposable
{
    private readonly DbContextFactory _factory;
    private readonly OrderService _sut;

    private readonly ICacheService _cache             = Substitute.For<ICacheService>();
    private readonly IEmailService _email             = Substitute.For<IEmailService>();
    private readonly INotificationService _notify     = Substitute.For<INotificationService>();
    private readonly ILogger<OrderService> _logger    = Substitute.For<ILogger<OrderService>>();

    public OrderServiceTests()
    {
        _factory = new DbContextFactory();
        _cache.AcquireLockAsync(Arg.Any<string>(), Arg.Any<TimeSpan>(), Arg.Any<CancellationToken>())
              .Returns(true);
        _sut = new OrderService(_factory.Context, _cache, _email, _notify, _logger);
    }

    // ── PlaceOrder ───────────────────────────────────────────────────────────

    [Fact]
    public async Task PlaceOrder_WithSufficientStock_ReservesStock()
    {
        var catId   = _factory.SeedCategory();
        var product = _factory.SeedProduct(catId, stock: 10m, reserved: 0m);

        await _sut.PlaceOrderAsync(
            userId: _factory.DefaultUserId, deliverySlotId: null, addressId: null,
            deliveryStreet: "Rua A", deliveryPostalCode: "3810-123",
            deliveryCity: "Aveiro", deliveryCountry: "PT",
            notes: null, preferredDeliveryDate: null,
            items: [(product.Id, 3m)],
            shippingSpeed: "standard",
            ct: CancellationToken.None);

        var updated = _factory.Context.Products.Find(product.Id)!;
        updated.ReservedStock.Should().Be(3m);
        updated.StockQuantity.Should().Be(10m); // stock only deducted after payment
    }

    [Fact]
    public async Task PlaceOrder_WithInsufficientStock_ThrowsBusinessException()
    {
        var catId   = _factory.SeedCategory();
        var product = _factory.SeedProduct(catId, stock: 2m, reserved: 0m);

        var act = () => _sut.PlaceOrderAsync(
            userId: _factory.DefaultUserId, deliverySlotId: null, addressId: null,
            deliveryStreet: "Rua A", deliveryPostalCode: "3810-123",
            deliveryCity: "Aveiro", deliveryCountry: "PT",
            notes: null, preferredDeliveryDate: null,
            items: [(product.Id, 5m)],   // request 5 but only 2 available
            shippingSpeed: "standard",
            ct: CancellationToken.None);

        await act.Should().ThrowAsync<BusinessException>();
    }

    [Fact]
    public async Task PlaceOrder_AlreadyReservedStock_CountsAgainstAvailable()
    {
        var catId   = _factory.SeedCategory();
        // 10 total, 8 reserved → only 2 available
        var product = _factory.SeedProduct(catId, stock: 10m, reserved: 8m);

        var act = () => _sut.PlaceOrderAsync(
            userId: _factory.DefaultUserId, deliverySlotId: null, addressId: null,
            deliveryStreet: "Rua A", deliveryPostalCode: "3810-123",
            deliveryCity: "Aveiro", deliveryCountry: "PT",
            notes: null, preferredDeliveryDate: null,
            items: [(product.Id, 3m)],  // 3 > 2 available
            shippingSpeed: "standard",
            ct: CancellationToken.None);

        await act.Should().ThrowAsync<BusinessException>();
    }

    [Fact]
    public async Task PlaceOrder_CalculatesCorrectTotalWithShipping()
    {
        var catId   = _factory.SeedCategory();
        var product = _factory.SeedProduct(catId, stock: 10m, price: 3.00m);

        var order = await _sut.PlaceOrderAsync(
            userId: _factory.DefaultUserId, deliverySlotId: null, addressId: null,
            deliveryStreet: "Rua A", deliveryPostalCode: "3810-123",
            deliveryCity: "Aveiro", deliveryCountry: "PT",
            notes: null, preferredDeliveryDate: null,
            items: [(product.Id, 2m)],  // 2 × 3.00 = 6.00
            shippingSpeed: "standard",  // standard PT = 5.00
            ct: CancellationToken.None);

        order.TotalAmount.Should().Be(11.00m); // 6.00 + 5.00
        order.ShippingFee.Should().Be(5.00m);
    }

    [Fact]
    public async Task PlaceOrder_WithFullSlot_ThrowsBusinessException()
    {
        var catId   = _factory.SeedCategory();
        var product = _factory.SeedProduct(catId, stock: 10m);
        var slot    = _factory.SeedSlot(maxOrders: 5, currentOrders: 5); // slot is full

        var act = () => _sut.PlaceOrderAsync(
            userId: _factory.DefaultUserId, deliverySlotId: slot.Id, addressId: null,
            deliveryStreet: "Rua A", deliveryPostalCode: "3810-123",
            deliveryCity: "Aveiro", deliveryCountry: "PT",
            notes: null, preferredDeliveryDate: null,
            items: [(product.Id, 1m)],
            shippingSpeed: "standard",
            ct: CancellationToken.None);

        await act.Should().ThrowAsync<BusinessException>();
    }

    [Fact]
    public async Task PlaceOrder_WithSlot_IncrementsSlotCurrentOrders()
    {
        var catId   = _factory.SeedCategory();
        var product = _factory.SeedProduct(catId, stock: 10m);
        var slot    = _factory.SeedSlot(maxOrders: 5, currentOrders: 0);

        await _sut.PlaceOrderAsync(
            userId: _factory.DefaultUserId, deliverySlotId: slot.Id, addressId: null,
            deliveryStreet: "Rua A", deliveryPostalCode: "3810-123",
            deliveryCity: "Aveiro", deliveryCountry: "PT",
            notes: null, preferredDeliveryDate: null,
            items: [(product.Id, 1m)],
            shippingSpeed: "standard",
            ct: CancellationToken.None);

        var updatedSlot = _factory.Context.DeliverySlots.Find(slot.Id)!;
        updatedSlot.CurrentOrders.Should().Be(1);
    }

    [Fact]
    public async Task PlaceOrder_UnitProduct_RejectsNonIntegerQuantity()
    {
        var catId   = _factory.SeedCategory();
        var product = _factory.SeedProduct(catId, stock: 10m, unitType: UnitType.Unit);

        var act = () => _sut.PlaceOrderAsync(
            userId: _factory.DefaultUserId, deliverySlotId: null, addressId: null,
            deliveryStreet: "Rua A", deliveryPostalCode: "3810-123",
            deliveryCity: "Aveiro", deliveryCountry: "PT",
            notes: null, preferredDeliveryDate: null,
            items: [(product.Id, 1.5m)],  // fractional quantity for unit product
            shippingSpeed: "standard",
            ct: CancellationToken.None);

        await act.Should().ThrowAsync<BusinessException>();
    }

    // ── CancelOrder ──────────────────────────────────────────────────────────

    [Fact]
    public async Task Cancel_RestoresReservedStock()
    {
        var catId   = _factory.SeedCategory();
        var product = _factory.SeedProduct(catId, stock: 10m, reserved: 3m);

        var order = new Order
        {
            UserId = _factory.DefaultUserId,
            Status = OrderStatus.Pending,
            TotalAmount = 9.00m,
            ShippingFee = 5.00m,
            DeliveryStreet = "Rua A",
            DeliveryPostalCode = "3810-123",
            DeliveryCity = "Aveiro",
            DeliveryCountry = "PT",
            OrderNumber = "FM-TEST-0001",
            Items =
            [
                new OrderItem { ProductId = product.Id, Quantity = 3m, UnitPrice = 3m, Subtotal = 9m }
            ]
        };
        _factory.Context.Orders.Add(order);
        _factory.Context.SaveChanges();

        await _sut.CancelAsync(order.Id, CancellationToken.None);

        var updated = _factory.Context.Products.Find(product.Id)!;
        updated.ReservedStock.Should().Be(0m); // 3m restored
    }

    [Fact]
    public async Task Cancel_WithSlot_DecrementsSlotCurrentOrders()
    {
        var catId   = _factory.SeedCategory();
        var product = _factory.SeedProduct(catId, stock: 10m, reserved: 1m);
        var slot    = _factory.SeedSlot(maxOrders: 5, currentOrders: 2);

        var order = new Order
        {
            UserId = _factory.DefaultUserId,
            DeliverySlotId = slot.Id,
            Status = OrderStatus.Pending,
            TotalAmount = 3.00m,
            ShippingFee = 5.00m,
            DeliveryStreet = "Rua A",
            DeliveryPostalCode = "3810-123",
            DeliveryCity = "Aveiro",
            DeliveryCountry = "PT",
            OrderNumber = "FM-TEST-0002",
            Items =
            [
                new OrderItem { ProductId = product.Id, Quantity = 1m, UnitPrice = 3m, Subtotal = 3m }
            ]
        };
        _factory.Context.Orders.Add(order);
        _factory.Context.SaveChanges();

        await _sut.CancelAsync(order.Id, CancellationToken.None);

        var updatedSlot = _factory.Context.DeliverySlots.Find(slot.Id)!;
        updatedSlot.CurrentOrders.Should().Be(1); // decremented from 2
    }

    [Fact]
    public async Task Cancel_PaidOrder_RestoresStockQuantityInsteadOfReservedStock()
    {
        var catId   = _factory.SeedCategory();
        // Stock already deducted at payment time (ReservedStock already cleared), as ConfirmPaymentAsync would leave it.
        var product = _factory.SeedProduct(catId, stock: 7m, reserved: 0m);

        var order = new Order
        {
            UserId = _factory.DefaultUserId,
            Status = OrderStatus.Paid,
            TotalAmount = 9.00m,
            ShippingFee = 5.00m,
            DeliveryStreet = "Rua A",
            DeliveryPostalCode = "3810-123",
            DeliveryCity = "Aveiro",
            DeliveryCountry = "PT",
            OrderNumber = "FM-TEST-0003",
            Items =
            [
                new OrderItem { ProductId = product.Id, Quantity = 3m, UnitPrice = 3m, Subtotal = 9m }
            ]
        };
        _factory.Context.Orders.Add(order);
        _factory.Context.SaveChanges();

        await _sut.CancelAsync(order.Id, CancellationToken.None);

        var updated = _factory.Context.Products.Find(product.Id)!;
        updated.StockQuantity.Should().Be(10m); // 7 + 3 given back
        updated.ReservedStock.Should().Be(0m);  // untouched — already cleared at payment time
    }

    [Fact]
    public async Task Cancel_AlreadyCancelledOrder_ThrowsBusinessException()
    {
        var order = new Order
        {
            UserId = _factory.DefaultUserId,
            Status = OrderStatus.Cancelled,
            TotalAmount = 9.00m,
            ShippingFee = 5.00m,
            DeliveryStreet = "Rua A",
            DeliveryPostalCode = "3810-123",
            DeliveryCity = "Aveiro",
            DeliveryCountry = "PT",
            OrderNumber = "FM-TEST-0004",
        };
        _factory.Context.Orders.Add(order);
        _factory.Context.SaveChanges();

        var act = () => _sut.CancelAsync(order.Id, CancellationToken.None);

        await act.Should().ThrowAsync<BusinessException>();
    }

    [Fact]
    public async Task Cancel_ShippedOrder_ThrowsBusinessException()
    {
        var order = new Order
        {
            UserId = _factory.DefaultUserId,
            Status = OrderStatus.Shipped,
            TotalAmount = 9.00m,
            ShippingFee = 5.00m,
            DeliveryStreet = "Rua A",
            DeliveryPostalCode = "3810-123",
            DeliveryCity = "Aveiro",
            DeliveryCountry = "PT",
            OrderNumber = "FM-TEST-0005",
        };
        _factory.Context.Orders.Add(order);
        _factory.Context.SaveChanges();

        var act = () => _sut.CancelAsync(order.Id, CancellationToken.None);

        await act.Should().ThrowAsync<BusinessException>();
    }

    // ── UpdateStatusAsync ────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateStatus_SkippingAStep_ThrowsBusinessException()
    {
        var order = new Order
        {
            UserId = _factory.DefaultUserId,
            Status = OrderStatus.Pending,
            TotalAmount = 9.00m,
            ShippingFee = 5.00m,
            DeliveryStreet = "Rua A",
            DeliveryPostalCode = "3810-123",
            DeliveryCity = "Aveiro",
            DeliveryCountry = "PT",
            OrderNumber = "FM-TEST-0006",
        };
        _factory.Context.Orders.Add(order);
        _factory.Context.SaveChanges();

        // Pending -> Delivered would silently mark an uncollected cash payment as succeeded — must be rejected.
        var act = () => _sut.UpdateStatusAsync(order.Id, OrderStatus.Delivered, CancellationToken.None);

        await act.Should().ThrowAsync<BusinessException>();
    }

    [Fact]
    public async Task UpdateStatus_ValidTransition_Succeeds()
    {
        var order = new Order
        {
            UserId = _factory.DefaultUserId,
            Status = OrderStatus.Paid,
            TotalAmount = 9.00m,
            ShippingFee = 5.00m,
            DeliveryStreet = "Rua A",
            DeliveryPostalCode = "3810-123",
            DeliveryCity = "Aveiro",
            DeliveryCountry = "PT",
            OrderNumber = "FM-TEST-0007",
        };
        _factory.Context.Orders.Add(order);
        _factory.Context.SaveChanges();

        await _sut.UpdateStatusAsync(order.Id, OrderStatus.Preparing, CancellationToken.None);

        var updated = _factory.Context.Orders.Find(order.Id)!;
        updated.Status.Should().Be(OrderStatus.Preparing);
    }

    public void Dispose() => _factory.Dispose();
}
