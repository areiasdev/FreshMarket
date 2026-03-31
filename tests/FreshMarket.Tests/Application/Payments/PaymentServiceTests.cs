using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Models;
using FreshMarket.Tests.Helpers;

namespace FreshMarket.Tests.Application.Payments;

public class PaymentServiceTests : IDisposable
{
    private readonly DbContextFactory _factory;
    private readonly IPaymentProviderFactory _providerFactory = Substitute.For<IPaymentProviderFactory>();
    private readonly IOrderService _orderService             = Substitute.For<IOrderService>();
    private readonly PaymentService _sut;

    public PaymentServiceTests()
    {
        _factory = new DbContextFactory();
        _sut = new PaymentService(_factory.Context, _providerFactory, _orderService);

        // Default provider stub: always returns "paid"
        var provider = Substitute.For<IPaymentProvider>();
        provider.GetStatusAsync(Arg.Any<string>())
                .Returns(Task.FromResult(new PaymentProviderResult { ExternalId = "sess_1", Status = "paid" }));
        _providerFactory.Get(Arg.Any<PaymentMethodEnum>()).Returns(provider);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private (Order order, Payment payment, Product product) SeedPendingStripePayment(
        decimal stock = 10m, decimal reserved = 3m)
    {
        var catId   = _factory.SeedCategory();
        var product = _factory.SeedProduct(catId, stock: stock, reserved: reserved);

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

        var payment = new Payment
        {
            OrderId = order.Id,
            Method  = PaymentMethodEnum.Card,
            Status  = PaymentStatusEnum.Pending,
            Amount  = 9.00m,
            ExternalTransactionId = "sess_1",
            Provider = "Stripe",
        };
        _factory.Context.Payments.Add(payment);
        _factory.Context.SaveChanges();

        return (order, payment, product);
    }

    // ── ConfirmPaymentAsync ──────────────────────────────────────────────────

    [Fact]
    public async Task ConfirmPayment_DecrementsStockQuantityAndReservedStock()
    {
        var (_, _, product) = SeedPendingStripePayment(stock: 10m, reserved: 3m);

        await _sut.ConfirmPaymentAsync("sess_1", CancellationToken.None);

        var updated = _factory.Context.Products.Find(product.Id)!;
        updated.StockQuantity.Should().Be(7m);   // 10 - 3
        updated.ReservedStock.Should().Be(0m);   // 3 - 3
    }

    [Fact]
    public async Task ConfirmPayment_SetsPaymentStatusToSucceeded()
    {
        var (_, payment, _) = SeedPendingStripePayment();

        await _sut.ConfirmPaymentAsync("sess_1", CancellationToken.None);

        var updated = _factory.Context.Payments.Find(payment.Id)!;
        updated.Status.Should().Be(PaymentStatusEnum.Succeeded);
        updated.PaidAt.Should().NotBeNull();
    }

    [Fact]
    public async Task ConfirmPayment_SetsOrderPaidAt()
    {
        var (order, _, _) = SeedPendingStripePayment();

        await _sut.ConfirmPaymentAsync("sess_1", CancellationToken.None);

        var updated = _factory.Context.Orders.Find(order.Id)!;
        updated.PaidAt.Should().NotBeNull();
    }

    [Fact]
    public async Task ConfirmPayment_CallsUpdateStatusWithPaid()
    {
        SeedPendingStripePayment();

        await _sut.ConfirmPaymentAsync("sess_1", CancellationToken.None);

        await _orderService.Received(1)
            .UpdateStatusAsync(Arg.Any<int>(), OrderStatus.Paid, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ConfirmPayment_Idempotent_WhenAlreadySucceeded()
    {
        var catId   = _factory.SeedCategory();
        var product = _factory.SeedProduct(catId, stock: 10m);

        var order = new Order
        {
            UserId = _factory.DefaultUserId, Status = OrderStatus.Paid,
            TotalAmount = 9m, ShippingFee = 5m,
            DeliveryStreet = "Rua A", DeliveryPostalCode = "3810-123",
            DeliveryCity = "Aveiro", DeliveryCountry = "PT",
            OrderNumber = "FM-TEST-0002",
        };
        _factory.Context.Orders.Add(order);
        _factory.Context.SaveChanges();

        // Payment already succeeded
        var payment = new Payment
        {
            OrderId = order.Id,
            Method  = PaymentMethodEnum.Card,
            Status  = PaymentStatusEnum.Succeeded,   // already done
            Amount  = 9m,
            ExternalTransactionId = "sess_already",
            Provider = "Stripe",
            PaidAt   = DateTime.UtcNow.AddMinutes(-5),
        };
        _factory.Context.Payments.Add(payment);
        _factory.Context.SaveChanges();

        var result = await _sut.ConfirmPaymentAsync("sess_already", CancellationToken.None);

        // Should return early — UpdateStatus must NOT be called again
        result.Status.Should().Be(PaymentStatusEnum.Succeeded);
        await _orderService.DidNotReceive()
            .UpdateStatusAsync(Arg.Any<int>(), Arg.Any<OrderStatus>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task ConfirmPayment_WhenOrderAlreadyPaid_DoesNotDuplicateStockDeduction()
    {
        // Scenario: webhook fires twice — second call should be fully idempotent
        var (_, payment, product) = SeedPendingStripePayment(stock: 10m, reserved: 3m);

        // Simulate first call already having set the payment to Succeeded
        payment.Status = PaymentStatusEnum.Succeeded;
        payment.PaidAt = DateTime.UtcNow;
        _factory.Context.SaveChanges();

        var stockBefore = _factory.Context.Products.Find(product.Id)!.StockQuantity;

        await _sut.ConfirmPaymentAsync("sess_1", CancellationToken.None);

        var stockAfter = _factory.Context.Products.Find(product.Id)!.StockQuantity;
        stockAfter.Should().Be(stockBefore); // no double deduction
    }

    public void Dispose() => _factory.Dispose();
}
