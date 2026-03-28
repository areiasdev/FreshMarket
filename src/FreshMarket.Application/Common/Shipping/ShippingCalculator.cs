namespace FreshMarket.Application.Common.Shipping;

/// <summary>Standard shipping speed keys.</summary>
public static class ShippingSpeed
{
    public const string Standard = "standard"; // 48h
    public const string Express  = "express";  // 24h
}

/// <summary>Calculates shipping fees based on speed and destination country.</summary>
public static class ShippingCalculator
{
    private const decimal StandardLocal = 5.00m;
    private const decimal ExpressLocal  = 10.00m;
    private const decimal StandardIntl  = 12.00m;
    private const decimal ExpressIntl   = 18.00m;

    public static decimal Calculate(string speed, string country)
    {
        bool isLocal = string.Equals(country, "PT", StringComparison.OrdinalIgnoreCase);
        return speed.ToLowerInvariant() switch
        {
            ShippingSpeed.Express => isLocal ? ExpressLocal : ExpressIntl,
            _                     => isLocal ? StandardLocal : StandardIntl,
        };
    }

    public static IReadOnlyList<ShippingOptionDto> GetOptions(string country)
    {
        bool isLocal = string.Equals(country, "PT", StringComparison.OrdinalIgnoreCase);
        return
        [
            new(ShippingSpeed.Standard, "Standard", "Entrega em 48h úteis", isLocal ? StandardLocal : StandardIntl, 48),
            new(ShippingSpeed.Express,  "Express",  "Entrega em 24h úteis", isLocal ? ExpressLocal  : ExpressIntl,  24),
        ];
    }
}

public record ShippingOptionDto(
    string Key,
    string Label,
    string Description,
    decimal Fee,
    int Hours);
