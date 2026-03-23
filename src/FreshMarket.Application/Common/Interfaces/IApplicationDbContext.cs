using Microsoft.EntityFrameworkCore;
using FreshMarket.Domain.Entities;
using System.Collections.Generic;

namespace FreshMarket.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Category> Categories { get; }
    DbSet<Product> Products { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<DeliverySlot> DeliverySlots { get; }
    DbSet<ShippingZone> ShippingZones { get; }
    DbSet<User> Users { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}