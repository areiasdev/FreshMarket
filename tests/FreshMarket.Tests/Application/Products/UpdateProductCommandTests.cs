using FreshMarket.Application.Products.Commands.Update;
using FreshMarket.Domain.Enums;

namespace FreshMarket.Tests.Application.Products;

public class UpdateProductCommandTests
{
    private readonly UpdateProductCommandValidator _sut = new();

    private static UpdateProductCommand Command(int unitType, decimal minQuantity) =>
        new(Id: 1, CategoryId: 1, Name: "Laranja", Slug: "laranja", Description: null,
            PricePerUnit: 1.3m, UnitType: unitType, MinQuantity: minQuantity,
            StockQuantity: 10, TrackStock: true, LowStockAlert: 0, ImageUrl: null,
            IsSeasonal: true, IsActive: true);

    [Fact]
    public void Unit_type_with_fractional_min_quantity_is_invalid()
    {
        var result = _sut.Validate(Command((int)UnitType.Unit, 0.1m));

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(UpdateProductCommand.MinQuantity));
    }

    [Fact]
    public void Unit_type_with_whole_min_quantity_is_valid()
    {
        var result = _sut.Validate(Command((int)UnitType.Unit, 1m));

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Weight_type_with_fractional_min_quantity_is_valid()
    {
        var result = _sut.Validate(Command((int)UnitType.Weight, 0.1m));

        result.IsValid.Should().BeTrue();
    }
}
