using FreshMarket.Application.Common.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace FreshMarket.Web.Infrastructure;

public class CustomExceptionHandler : IExceptionHandler
{
    private readonly Dictionary<Type, Func<HttpContext, Exception, Task>> _exceptionHandlers;

    public CustomExceptionHandler()
    {
        _exceptionHandlers = new Dictionary<Type, Func<HttpContext, Exception, Task>>
        {
            { typeof(NotFoundException), HandleNotFoundException },
            { typeof(FluentValidation.ValidationException), HandleValidationException },
            { typeof(ForbiddenAccessException), HandleForbiddenAccessException },
            { typeof(BusinessException), HandleBusinessException },
        };
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken ct)
    {
        var type = exception.GetType();

        if (_exceptionHandlers.TryGetValue(type, out var handler))
        {
            await handler.Invoke(context, exception);
            return true;
        }

        return false;
    }

    private async Task HandleNotFoundException(HttpContext context, Exception ex)
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        await context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = StatusCodes.Status404NotFound,
            Title = "Recurso n�o encontrado",
            Detail = ex.Message
        });
    }

    private async Task HandleValidationException(HttpContext context, Exception ex)
    {
        var exception = (FluentValidation.ValidationException)ex;
        context.Response.StatusCode = StatusCodes.Status400BadRequest;

        await context.Response.WriteAsJsonAsync(new ValidationProblemDetails(
            exception.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray()))
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Erro de valida��o"
        });
    }

    private async Task HandleForbiddenAccessException(HttpContext context, Exception ex)
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        await context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = StatusCodes.Status403Forbidden,
            Title = "Acesso negado"
        });
    }

    private async Task HandleBusinessException(HttpContext context, Exception ex)
    {
        context.Response.StatusCode = StatusCodes.Status422UnprocessableEntity;
        await context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = StatusCodes.Status422UnprocessableEntity,
            Title = "Operação inválida",
            Detail = ex.Message
        });
    }
}
