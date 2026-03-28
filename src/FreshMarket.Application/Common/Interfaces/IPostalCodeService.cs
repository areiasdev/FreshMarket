namespace FreshMarket.Application.Common.Interfaces;

public interface IPostalCodeService
{
    bool IsValidFormat(string postalCode);
    bool IsInDeliveryArea(string postalCode);
    PostalCodeValidationResult Validate(string postalCode);
}

public class PostalCodeValidationResult
{
    public bool IsValid { get; set; }
    public bool IsInDeliveryArea { get; set; }
    public string? Message { get; set; }
}
