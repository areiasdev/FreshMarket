using FreshMarket.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace FreshMarket.Application.Common.Behaviors;

public class LoggingBehavior<TRequest, TResponse>(ILogger<TRequest> logger)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var name = typeof(TRequest).Name;
        var isSensitive = request is ISensitiveRequest;

        if (isSensitive)
            logger.LogInformation("FreshMarket Request: {Name} (payload redacted)", name);
        else
            logger.LogInformation("FreshMarket Request: {Name} {@Request}", name, request);

        var response = await next();

        if (isSensitive)
            logger.LogInformation("FreshMarket Response: {Name} (payload redacted)", name);
        else
            logger.LogInformation("FreshMarket Response: {Name} {@Response}", name, response);

        return response;
    }
}
