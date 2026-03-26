using FreshMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshMarket.Infrastructure.Data.Configurations;

public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
{
    public void Configure(EntityTypeBuilder<OrderItem> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Quantity).HasPrecision(10, 3);  // ← era (10,2) — suporta 0.250 kg
        builder.Property(i => i.UnitPrice).HasPrecision(10, 2);
        builder.Property(i => i.Subtotal).HasPrecision(10, 2);

        builder.HasIndex(i => i.OrderId);
        builder.HasIndex(i => i.ProductId);

        builder.HasOne(i => i.Order)
               .WithMany(o => o.Items)
               .HasForeignKey(i => i.OrderId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(i => i.Product)
               .WithMany(p => p.Items)
               .HasForeignKey(i => i.ProductId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}