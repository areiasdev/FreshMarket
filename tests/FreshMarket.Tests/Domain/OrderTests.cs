namespace FreshMarket.Tests.Domain;

public class OrderTests
{
    [Theory]
    [InlineData(OrderStatus.Pending,   0)]
    [InlineData(OrderStatus.Paid,      1)]
    [InlineData(OrderStatus.Preparing, 2)]
    [InlineData(OrderStatus.Shipped,   3)]
    [InlineData(OrderStatus.Delivered, 4)]
    [InlineData(OrderStatus.Cancelled, 5)]
    public void OrderStatus_EnumValues_MatchFrontendContract(OrderStatus status, int expectedValue)
    {
        // The frontend TypeScript enum mirrors these exact int values.
        // Changing them without updating the frontend breaks order status display.
        ((int)status).Should().Be(expectedValue);
    }

    [Fact]
    public void Order_DefaultStatus_IsPending()
    {
        var order = new Order();
        order.Status.Should().Be(OrderStatus.Pending);
    }

    [Fact]
    public void Order_DefaultCountry_IsPT()
    {
        var order = new Order();
        order.DeliveryCountry.Should().Be("PT");
    }

    [Fact]
    public void Order_Items_DefaultsToEmptyCollection()
    {
        var order = new Order();
        order.Items.Should().NotBeNull();
        order.Items.Should().BeEmpty();
    }
}
