using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).HasMaxLength(150).IsRequired();
        builder.Property(p => p.PricePerUnit).HasPrecision(10, 2);
        builder.Property(p => p.MinQuantity).HasPrecision(10, 2);
        builder.Property(p => p.StockQuantity).HasPrecision(10, 2);
        builder.Property(p => p.UnitType).HasConversion<int>();

        builder.HasIndex(p => p.CategoryId);

        builder.HasMany(p => p.OrderItems)
               .WithOne(i => i.Product)
               .HasForeignKey(i => i.ProductId)
               .IsRequired(false);

        builder.HasQueryFilter(p => p.DeletedAt == null);
    }
}
