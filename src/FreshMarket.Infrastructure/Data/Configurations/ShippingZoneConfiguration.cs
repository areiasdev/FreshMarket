using FreshMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshMarket.Infrastructure.Data.Configurations;

public class ShippingZoneConfiguration : IEntityTypeConfiguration<ShippingZone>
{
    public void Configure(EntityTypeBuilder<ShippingZone> builder)
    {
        builder.HasKey(z => z.Id);
        builder.Property(z => z.PostalCodePrefix).HasMaxLength(4).IsRequired();
        builder.Property(z => z.City).HasMaxLength(100).IsRequired();
        builder.Property(z => z.ShippingFee).HasPrecision(10, 2);
        builder.Property(z => z.MinOrderValue).HasPrecision(10, 2);

        builder.HasIndex(z => z.PostalCodePrefix);
    }
}
