using FreshMarket.Application.Products.Commands.Create;
using FreshMarket.Domain.Enums;

namespace FreshMarket.Tests.Application.Products;

public class CreateProductCommandTests
{
    private readonly CreateProductCommandValidator _sut = new();

    private static CreateProductCommand Command(UnitType unitType, decimal minQuantity) =>
        new(CategoryId: 1, Name: "Banana", Description: null, Slug: "banana",
            PricePerUnit: 1.2m, UnitType: unitType, MinQuantity: minQuantity,
            StockQuantity: 10, trackStock: true, lowStockAlert: 0, ImageUrl: null, IsSeasonal: false);

    // A unit-type product ("2 bananas") can't have a fractional minimum — the cart
    // stepper uses MinQuantity as its increment, so a value like 0.1 lets a customer
    // add "0.3 un" of a whole item, which the order-placement flow then rejects anyway.
    [Fact]
    public void Unit_type_with_fractional_min_quantity_is_invalid()
    {
        var result = _sut.Validate(Command(UnitType.Unit, 0.1m));

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProductCommand.MinQuantity));
    }

    [Fact]
    public void Unit_type_with_whole_min_quantity_is_valid()
    {
        var result = _sut.Validate(Command(UnitType.Unit, 1m));

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Weight_type_with_fractional_min_quantity_is_valid()
    {
        var result = _sut.Validate(Command(UnitType.Weight, 0.1m));

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Zero_min_quantity_is_invalid_regardless_of_unit_type()
    {
        var result = _sut.Validate(Command(UnitType.Weight, 0m));

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(CreateProductCommand.MinQuantity));
    }
}
