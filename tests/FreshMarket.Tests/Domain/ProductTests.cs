namespace FreshMarket.Tests.Domain;

public class ProductTests
{
    [Fact]
    public void AvailableStock_IsStockMinusReserved()
    {
        var product = new Product { StockQuantity = 10m, ReservedStock = 3m };
        var available = product.StockQuantity - product.ReservedStock;
        available.Should().Be(7m);
    }

    [Fact]
    public void Product_DefaultIsActive_True()
    {
        var product = new Product();
        product.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Product_DefaultUnitType_IsUnit()
    {
        var product = new Product();
        product.UnitType.Should().Be(UnitType.Unit);
    }

    [Fact]
    public void Product_DefaultTrackStock_True()
    {
        var product = new Product();
        product.TrackStock.Should().BeTrue();
    }

    [Theory]
    [InlineData(UnitType.Unit, 0)]
    [InlineData(UnitType.Weight, 1)]
    public void UnitType_EnumValues_MatchBackendFrontendContract(UnitType type, int expectedValue)
    {
        // Unit=0 and Weight=1 are hardcoded in the frontend TypeScript enum.
        // If these change, the frontend breaks silently.
        ((int)type).Should().Be(expectedValue);
    }
}
