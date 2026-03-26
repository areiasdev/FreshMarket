using FreshMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshMarket.Infrastructure.Data.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.HasKey(o => o.Id);
        builder.Property(o => o.TotalAmount).HasPrecision(10, 2);
        builder.Property(o => o.ShippingFee).HasPrecision(10, 2);
        builder.Property(o => o.Status).HasConversion<int>();
        builder.Property(o => o.DeliveryPostalCode).HasMaxLength(8);

        builder.HasIndex(o => o.UserId);
        builder.HasIndex(o => o.DeliverySlotId);

        builder.HasOne(o => o.User)
               .WithMany(u => u.Orders)
               .HasForeignKey(o => o.UserId);

        builder.HasOne(o => o.DeliverySlot)
               .WithMany(s => s.Orders)
               .HasForeignKey(o => o.DeliverySlotId);
        builder.HasIndex(o => o.UserId);
        builder.HasIndex(o => o.DeliverySlotId);
        builder.HasIndex(o => o.Status);
    }
}
