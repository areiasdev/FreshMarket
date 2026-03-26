using FreshMarket.Application.Addresses.Services;
using FreshMarket.Application.Categories.Services;
using FreshMarket.Application.Common.Behaviors;
using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.DeliverySlots.Services;
using FreshMarket.Application.Orders.Services;
using FreshMarket.Application.Products.Services;
using FreshMarket.Application.Users.Services;
using Microsoft.Extensions.DependencyInjection;

namespace FreshMarket.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(
        this IServiceCollection services)
    {
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly);
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
        });

        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IDeliverySlotService, DeliverySlotService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IAddressService, AddressService>();

        return services;
    }
}
