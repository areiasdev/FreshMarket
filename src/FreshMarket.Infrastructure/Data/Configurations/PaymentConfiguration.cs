using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FreshMarket.Infrastructure.Data.Configurations
{
    public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            builder.HasKey(p => p.Id);
            builder.Property(p => p.Amount).HasPrecision(10, 2);
            builder.Property(p => p.RefundedAmount).HasPrecision(10, 2);
            builder.Property(p => p.Status).HasConversion<int>();
            builder.Property(p => p.Method).HasConversion<int>();
            builder.Property(p => p.ExternalTransactionId).HasMaxLength(200);
            builder.Property(p => p.Provider).HasMaxLength(50);
            builder.HasIndex(p => p.OrderId);
            builder.HasOne(p => p.Order).WithMany(o => o.Payments).HasForeignKey(p => p.OrderId);
        }
    }
}
