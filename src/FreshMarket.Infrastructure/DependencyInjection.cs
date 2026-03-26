using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Security;
using FreshMarket.Infrastructure.Data.Context;
using FreshMarket.Infrastructure.Services;
using StackExchange.Redis;

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
        services.AddScoped<StripePaymentProvider>();
        services.AddScoped<MbWayPaymentProvider>();
        services.AddScoped<IPaymentProviderFactory, PaymentProviderFactory>();
        services.AddScoped<OrderCleanupService>();
        services.AddHostedService<OrderCleanupJob>();

        services.AddScoped<IPaymentProvider>(sp =>
        {
            var http = sp.GetRequiredService<HttpClient>();
            var config = sp.GetRequiredService<IConfiguration>();

            // escolher dinamicamente depois (melhor)
            return new StripePaymentProvider(config);
        });

        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration["Redis:ConnectionString"];
            options.InstanceName = "FreshMarket:";
        });

        services.AddSingleton<IConnectionMultiplexer>(
            ConnectionMultiplexer.Connect(configuration["Redis:ConnectionString"]!));

        services.AddSingleton<ICacheService, CacheService>();

        return services;
    }
}
