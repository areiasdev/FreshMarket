using System.Reflection;

namespace FreshMarket.Web.Infrastructure;

public static class WebApplicationExtensions
{
    public static RouteGroupBuilder MapGroup(this WebApplication app, EndpointGroupBase group, string? policy = null)
    {
        var groupName = group.GetType().Name;

        string path = groupName.StartsWith("Admin", StringComparison.OrdinalIgnoreCase)
            ? $"/api/admin/{groupName["Admin".Length..].ToLowerInvariant()}"
            : $"/api/{groupName.ToLowerInvariant()}";

        var builder = app
            .MapGroup(path)
            .WithTags(groupName)
            .WithOpenApi();

        if (policy is not null)
            builder.RequireAuthorization(policy);

        return builder;
    }


    public static WebApplication MapEndpoints(this WebApplication app)
    {
        var endpointGroupType = typeof(EndpointGroupBase);
        var assembly = Assembly.GetExecutingAssembly();

        var endpointGroupTypes = assembly.GetExportedTypes()
            .Where(t => t.IsSubclassOf(endpointGroupType));

        foreach (var type in endpointGroupTypes)
        {
            if (Activator.CreateInstance(type) is EndpointGroupBase instance)
                instance.Map(app);
        }

        return app;
    }


}
