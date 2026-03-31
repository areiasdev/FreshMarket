using FreshMarket.Application.Common.Services;

namespace FreshMarket.Tests.Common;

public class PostalCodeServiceTests
{
    private readonly PostalCodeService _sut = new();

    // ── IsValidFormat ────────────────────────────────────────────────────────

    [Theory]
    [InlineData("3810-123")]
    [InlineData("1000-001")]
    [InlineData("0000-000")]
    public void IsValidFormat_ValidPattern_ReturnsTrue(string code)
        => _sut.IsValidFormat(code).Should().BeTrue();

    [Theory]
    [InlineData("381-123")]     // too short
    [InlineData("38100-123")]   // too long
    [InlineData("3810123")]     // missing dash
    [InlineData("XXXX-123")]    // letters
    [InlineData("")]
    [InlineData("   ")]
    public void IsValidFormat_InvalidPattern_ReturnsFalse(string code)
        => _sut.IsValidFormat(code).Should().BeFalse();

    // ── IsInDeliveryArea ─────────────────────────────────────────────────────

    [Theory]
    [InlineData("3810-123")]   // Aveiro city
    [InlineData("3000-001")]   // Coimbra
    [InlineData("2400-001")]   // Leiria
    public void IsInDeliveryArea_CoveredPrefix_ReturnsTrue(string code)
        => _sut.IsInDeliveryArea(code).Should().BeTrue();

    [Theory]
    [InlineData("1000-001")]   // Lisboa
    [InlineData("4000-001")]   // Porto
    [InlineData("8000-001")]   // Faro
    public void IsInDeliveryArea_UncoveredPrefix_ReturnsFalse(string code)
        => _sut.IsInDeliveryArea(code).Should().BeFalse();

    [Fact]
    public void IsInDeliveryArea_InvalidFormat_ReturnsFalse()
        => _sut.IsInDeliveryArea("invalid").Should().BeFalse();

    // ── Validate ─────────────────────────────────────────────────────────────

    [Fact]
    public void Validate_ValidFormatAndInArea_ReturnsValidAndInArea()
    {
        var result = _sut.Validate("3810-123");

        result.IsValid.Should().BeTrue();
        result.IsInDeliveryArea.Should().BeTrue();
        result.Message.Should().BeNull();
    }

    [Fact]
    public void Validate_ValidFormatButOutsideArea_ReturnsValidButNotInArea()
    {
        var result = _sut.Validate("1000-001");

        result.IsValid.Should().BeTrue();
        result.IsInDeliveryArea.Should().BeFalse();
        result.Message.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public void Validate_InvalidFormat_ReturnsInvalid()
    {
        var result = _sut.Validate("abc");

        result.IsValid.Should().BeFalse();
        result.IsInDeliveryArea.Should().BeFalse();
        result.Message.Should().NotBeNullOrEmpty();
    }
}
