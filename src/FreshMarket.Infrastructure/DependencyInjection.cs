using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Security;
using FreshMarket.Application.Notifications.Services;
using FreshMarket.Infrastructure.Data.Context;
using FreshMarket.Infrastructure.Email;
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
        services.AddKeyedScoped<StripePaymentProvider>("card", (sp, _) =>
            new StripePaymentProvider(sp.GetRequiredService<IConfiguration>(), ["card"]));
        services.AddKeyedScoped<StripePaymentProvider>("mb_way", (sp, _) =>
            new StripePaymentProvider(sp.GetRequiredService<IConfiguration>(), ["mb_way"]));
        services.AddScoped<MbWayPaymentProvider>();
        services.AddScoped<IPaymentProviderFactory, PaymentProviderFactory>();
        services.AddScoped<OrderCleanupService>();
        services.AddHostedService<OrderCleanupJob>();
        services.AddScoped<CashPaymentProvider>();

        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration["Redis:ConnectionString"];
            options.InstanceName = "FreshMarket:";
        });

        services.AddSingleton<IConnectionMultiplexer>(
            ConnectionMultiplexer.Connect(configuration["Redis:ConnectionString"]!));

        services.AddSingleton<ICacheService, CacheService>();

        services.AddScoped<IEmailService, SmtpEmailService>();
        services.AddScoped<INotificationService, NotificationService>();

        return services;
    }
}
