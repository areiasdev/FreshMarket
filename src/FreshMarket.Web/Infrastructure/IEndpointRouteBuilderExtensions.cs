using System.Reflection;

namespace FreshMarket.Web.Infrastructure;

public static class IEndpointRouteBuilderExtensions
{
    public static RouteGroupBuilder MapGroup(this WebApplication app, EndpointGroupBase group)
    {
        var groupName = group.GetType().Name;

        return app.MapGroup($"/api/{groupName}")
                  .WithGroupName(groupName)
                  .WithTags(groupName)
                  .WithOpenApi();
    }

    public static RouteGroupBuilder MapGet(this RouteGroupBuilder builder, Delegate handler, string pattern = "")
    {
        builder.MapGet(pattern, handler);
        return builder;
    }

    public static RouteGroupBuilder MapPost(this RouteGroupBuilder builder, Delegate handler, string pattern = "")
    {
        builder.MapPost(pattern, handler);
        return builder;
    }

    public static RouteGroupBuilder MapPut(this RouteGroupBuilder builder, Delegate handler, string pattern = "")
    {
        builder.MapPut(pattern, handler);
        return builder;
    }

    public static RouteGroupBuilder MapDelete(this RouteGroupBuilder builder, Delegate handler, string pattern = "")
    {
        builder.MapDelete(pattern, handler);
        return builder;
    }
}
