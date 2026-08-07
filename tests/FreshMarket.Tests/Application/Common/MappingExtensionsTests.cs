using FreshMarket.Application.Common.Mapping;

namespace FreshMarket.Tests.Application.Common;

public class MappingExtensionsTests
{
    // Regression test: ToDto()/ToListDto() used to omit LowStockAlert entirely, so the admin
    // product-edit form always received 0 and every save silently zeroed out a real alert value.

    [Fact]
    public void ToListDto_CarriesLowStockAlert()
    {
        var product = new Product { LowStockAlert = 12m };

        var dto = product.ToListDto();

        dto.LowStockAlert.Should().Be(12m);
    }

    [Fact]
    public void ToDto_CarriesLowStockAlert()
    {
        var product = new Product { LowStockAlert = 8m };

        var dto = product.ToDto();

        dto.LowStockAlert.Should().Be(8m);
    }
}
