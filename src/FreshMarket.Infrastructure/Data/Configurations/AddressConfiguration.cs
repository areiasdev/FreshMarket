using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FreshMarket.Infrastructure.Data.Configurations
{
    public class AddressConfiguration : IEntityTypeConfiguration<Address>
    {
        public void Configure(EntityTypeBuilder<Address> builder)
        {
            builder.HasKey(a => a.Id);
            builder.Property(a => a.Street).HasMaxLength(300);
            builder.Property(a => a.PostalCode).HasMaxLength(20);
            builder.Property(a => a.City).HasMaxLength(100);
            builder.Property(a => a.Country).HasMaxLength(3);
            builder.Property(a => a.Label).HasMaxLength(50);
            builder.HasIndex(a => a.UserId);
            builder.HasIndex(a => new { a.UserId, a.IsDefault }).HasFilter("[IsDefault] = 1").IsUnique();
        }
    }
}
