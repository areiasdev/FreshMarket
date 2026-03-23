using FreshMarket.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FreshMarket.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.FullName).HasMaxLength(200).IsRequired();
        builder.Property(u => u.Email).HasMaxLength(150).IsRequired();
        builder.Property(u => u.Role).HasMaxLength(50);

        builder.HasIndex(u => u.Email).IsUnique();
    }
}
