using Microsoft.Extensions.Logging;

namespace FreshMarket.Application.Common.Behaviors;

public class LoggingBehavior<TRequest, TResponse>(ILogger<TRequest> logger)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        var name = typeof(TRequest).Name;
        logger.LogInformation("FreshMarket Request: {Name} {@Request}", name, request);

        var response = await next();

        logger.LogInformation("FreshMarket Response: {Name} {@Response}", name, response);
        return response;
    }
}
