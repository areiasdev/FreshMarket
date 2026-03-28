using FreshMarket.Application.Common.Interfaces;

namespace FreshMarket.Application.Common.Services;

public class PostalCodeService : IPostalCodeService
{
    private static readonly HashSet<string> DeliveryAreas = new()
    {
        // ── Aveiro district (primary area) ───────────────────────────────────
        // Aveiro city
        "3800","3801","3804","3810","3811","3814","3820","3825",
        // Águeda
        "3750","3751","3754","3755",
        // Albergaria-a-Velha
        "3850","3851",
        // Anadia
        "3780","3781","3784","3785",
        // Estarreja / Murtosa
        "3860","3870","3871",
        // Ílhavo / Vagos
        "3830","3831","3834","3840","3841",
        // Mealhada
        "3050","3053","3054",
        // Oliveira de Azeméis
        "3720","3721","3723","3724","3725","3726",
        // Oliveira do Bairro
        "3770","3771",
        // Ovar
        "3880","3881","3884","3885",
        // São João da Madeira
        "3700","3701",
        // Sever do Vouga / Vale de Cambra
        "3740","3730","3731","3732",
        // Santa Maria da Feira
        "4520","4521","4524","4525",
        // Espinho
        "4500","4501",
        // ── Coimbra district ─────────────────────────────────────────────────
        "3000","3001","3004","3005","3010","3020","3025","3030","3040","3041","3044","3045",
        // Cantanhede, Mira, Figueira da Foz
        "3060","3061","3064","3070","3071","3080","3083","3085",
        // ── Leiria district ──────────────────────────────────────────────────
        "2400","2401","2402","2403","2404","2405","2406","2407","2408","2409","2410",
        "2415","2420","2425","2430","2435","2440","2445","2450","2460","2470","2480","2490",
        // Batalha, Pombal
        "3100","3101","3105","3120","3140","3150","3160",
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
