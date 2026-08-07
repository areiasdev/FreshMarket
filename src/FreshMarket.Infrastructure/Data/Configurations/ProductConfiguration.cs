using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.PricePerUnit).HasPrecision(10, 2);
        builder.Property(p => p.MinQuantity).HasPrecision(10, 3);
        builder.Property(p => p.StockQuantity).HasPrecision(10, 3);
        builder.Property(p => p.LowStockAlert).HasPrecision(10, 3);
        builder.Property(p => p.UnitType).HasConversion<int>();
        builder.Property(p => p.Name).HasMaxLength(200);
        builder.Property(p => p.Slug).HasMaxLength(200);
        builder.HasIndex(p => p.Slug).IsUnique();
        builder.HasIndex(p => new { p.IsActive, p.CategoryId });
        builder.HasIndex(p => new { p.IsActive, p.IsSeasonal });
        builder.HasQueryFilter(p => p.DeletedAt == null);
        builder.Property(p => p.ReservedStock).HasPrecision(10, 3);
        builder.Property(p => p.RowVersion).IsRowVersion();
    }
}
