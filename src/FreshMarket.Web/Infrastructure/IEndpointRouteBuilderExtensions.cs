using Ardalis.GuardClauses;
using System.Diagnostics.CodeAnalysis;

namespace FreshMarket.Web.Infrastructure;

public static class IEndpointRouteBuilderExtensions
{
    public static IEndpointRouteBuilder MapGet(this IEndpointRouteBuilder builder, Delegate handler, [StringSyntax("Route")] string pattern = "")
    {
        Guard.Against.AnonymousMethod(handler);
        builder.MapGet(pattern, handler).WithName(GetEndpointName(handler)).WithOpenApi();
        return builder;
    }

    public static IEndpointRouteBuilder MapPost(this IEndpointRouteBuilder builder, Delegate handler, [StringSyntax("Route")] string pattern = "")
    {
        Guard.Against.AnonymousMethod(handler);
        builder.MapPost(pattern, handler).WithName(GetEndpointName(handler)).WithOpenApi();
        return builder;
    }

    public static IEndpointRouteBuilder MapPut(this IEndpointRouteBuilder builder, Delegate handler, [StringSyntax("Route")] string pattern)
    {
        Guard.Against.AnonymousMethod(handler);
        builder.MapPut(pattern, handler).WithName(GetEndpointName(handler)).WithOpenApi();
        return builder;
    }

    public static IEndpointRouteBuilder MapDelete(this IEndpointRouteBuilder builder, Delegate handler, [StringSyntax("Route")] string pattern)
    {
        Guard.Against.AnonymousMethod(handler);
        builder.MapDelete(pattern, handler).WithName(GetEndpointName(handler)).WithOpenApi();
        return builder;
    }

    public static IEndpointRouteBuilder MapPatch(this IEndpointRouteBuilder builder, Delegate handler, [StringSyntax("Route")] string pattern)
    {
        Guard.Against.AnonymousMethod(handler);
        builder.MapPatch(pattern, handler).WithName(GetEndpointName(handler)).WithOpenApi();
        return builder;
    }

    private static string GetEndpointName(Delegate handler) =>
        $"{handler.Method.DeclaringType?.Name}_{handler.Method.Name}";
}
