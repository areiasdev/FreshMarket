using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Security;
using FreshMarket.Infrastructure.Data.Context;
using FreshMarket.Infrastructure.Services;

namespace FreshMarket.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<ApplicationDbContext>());

        services.AddScoped<ITokenService, TokenService>();

        return services;
    }
}
