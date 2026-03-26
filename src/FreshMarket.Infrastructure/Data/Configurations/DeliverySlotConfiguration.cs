using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshMarket.Infrastructure.Data.Configurations;

public class DeliverySlotConfiguration : IEntityTypeConfiguration<DeliverySlot>
{
    public void Configure(EntityTypeBuilder<DeliverySlot> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.ShippingFee).HasPrecision(10, 2);
        builder.HasIndex(s => new { s.DeliveryDate, s.StartTime, s.EndTime }).IsUnique();
        builder.HasIndex(s => new { s.DeliveryDate, s.IsActive });
        builder.HasQueryFilter(s => s.DeletedAt == null);
        builder.Property(s => s.RowVersion).IsRowVersion();
    }
}
