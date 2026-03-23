using FreshMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshMarket.Infrastructure.Data.Configurations;

public class DeliverySlotConfiguration : IEntityTypeConfiguration<DeliverySlot>
{
    public void Configure(EntityTypeBuilder<DeliverySlot> builder)
    {
        builder.HasKey(s => s.Id);

        builder.HasIndex(s => new { s.DeliveryDate, s.StartTime, s.EndTime }).IsUnique();
        builder.HasIndex(s => new { s.DeliveryDate, s.IsActive });

        builder.HasOne(s => s.ShippingZone)
               .WithMany(z => z.DeliverySlots)
               .HasForeignKey(s => s.ShippingZoneId)
               .IsRequired(false);
    }
}
