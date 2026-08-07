namespace FreshMarket.Application.Common.Interfaces;

/// <summary>
/// Marker for MediatR requests carrying credentials or tokens.
/// LoggingBehavior redacts the payload for these instead of logging it in full.
/// </summary>
public interface ISensitiveRequest
{
}
