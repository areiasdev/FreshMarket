using FreshMarket.Application.Common.Interfaces;

namespace FreshMarket.Application.Common.Services;

public class PostalCodeService : IPostalCodeService
{
    private static readonly HashSet<string> DeliveryAreas = new()
    {
        // Leiria district
        "2400","2401","2402","2403","2404","2405","2406","2407","2408","2409","2410",
        "2415","2420","2425","2430","2435","2440","2445","2450","2460","2470","2480","2490",
        // Coimbra area
        "3000","3001","3004","3005","3010","3020","3025","3030","3040","3041","3044","3045",
        // Caldas da Rainha / Óbidos
        "2500","2501","2505","2510","2515","2516","2520","2524","2525","2530","2540","2550",
        // Batalha, Pombal
        "3100","3101","3105","3120","3140","3150","3160",
        // Torres Novas
        "2350","2360","2380",
        // Entroncamento, Tomar
        "2300","2304","2305","2330","2340",
        // Santarém
        "2000","2001","2005","2010","2020","2025","2030","2040","2050",
    };

    public bool IsValidFormat(string postalCode)
    {
        return System.Text.RegularExpressions.Regex.IsMatch(
            postalCode?.Trim() ?? "", @"^\d{4}-\d{3}$");
    }

    public bool IsInDeliveryArea(string postalCode)
    {
        if (!IsValidFormat(postalCode)) return false;
        var prefix = postalCode.Trim().Substring(0, 4);
        return DeliveryAreas.Contains(prefix);
    }

    public PostalCodeValidationResult Validate(string postalCode)
    {
        if (!IsValidFormat(postalCode))
            return new() { IsValid = false, IsInDeliveryArea = false, Message = "Código postal inválido. Use o formato XXXX-XXX." };

        var inArea = IsInDeliveryArea(postalCode);
        return new()
        {
            IsValid = true,
            IsInDeliveryArea = inArea,
            Message = inArea ? null : "Zona fora da área de entrega. Contacte-nos para mais informações.",
        };
    }
}
