using FreshMarket.Infrastructure.Data.Context;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Tests.Helpers;

/// <summary>
/// Creates a real ApplicationDbContext backed by SQLite :memory:
/// SQLite is used (not InMemory provider) because it supports transactions,
/// which OrderService.PlaceOrderAsync requires.
/// </summary>
public sealed class DbContextFactory : IDisposable
{
    private readonly SqliteConnection _connection;

    public ApplicationDbContext Context { get; }

    /// <summary>Id of the default test user seeded on creation.</summary>
    public int DefaultUserId { get; private set; }

    public DbContextFactory()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(_connection)
            .Options;

        Context = new ApplicationDbContext(options);
        Context.Database.EnsureCreated();

        // Seed a default user so Orders.UserId FK is always satisfiable
        DefaultUserId = SeedUser();
    }

    public int SeedUser(string email = "test@freshmarket.pt", string name = "Test User")
    {
        var user = new User
        {
            Email    = email,
            FullName = name,
            Role     = "SuperAdmin",
            IsActive = true,
            PasswordHash = "hash",
        };
        Context.Users.Add(user);
        Context.SaveChanges();
        return user.Id;
    }

    /// <summary>Seeds a Category and returns its Id.</summary>
    public int SeedCategory(string name = "Legumes")
    {
        var category = new Category { Name = name, IsActive = true };
        Context.Categories.Add(category);
        Context.SaveChanges();
        return category.Id;
    }

    /// <summary>Seeds a Product with the given stock and returns it.</summary>
    public Product SeedProduct(int categoryId, decimal stock = 10m, decimal reserved = 0m,
        decimal price = 2.50m, UnitType unitType = UnitType.Weight, bool trackStock = true)
    {
        var product = new Product
        {
            Name        = "Cenouras",
            Slug        = $"cenouras-{Guid.NewGuid():N}",
            CategoryId  = categoryId,
            PricePerUnit = price,
            StockQuantity = stock,
            ReservedStock = reserved,
            MinQuantity = 0.5m,
            UnitType    = unitType,
            IsActive    = true,
            TrackStock  = trackStock,
        };
        Context.Products.Add(product);
        Context.SaveChanges();
        return product;
    }

    /// <summary>Seeds a DeliverySlot and returns it.
    /// Uses raw SQL because EF Core marks RowVersion as ValueGeneratedOnAddOrUpdate,
    /// so it won't include it in the INSERT — and SQLite has no auto-generator for it.
    /// </summary>
    public DeliverySlot SeedSlot(int maxOrders = 10, int currentOrders = 0)
    {
        var date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)).ToString("yyyy-MM-dd");

        using var cmd = _connection.CreateCommand();
        cmd.CommandText =
            $"INSERT INTO DeliverySlots " +
            $"(DeliveryDate, StartTime, EndTime, MaxOrders, CurrentOrders, ShippingFee, IsActive, RowVersion, CreatedAt) " +
            $"VALUES ('{date}', '09:00:00', '12:00:00', {maxOrders}, {currentOrders}, 0.0, 1, randomblob(8), datetime('now'))";
        cmd.ExecuteNonQuery();

        cmd.CommandText = "SELECT last_insert_rowid()";
        var id = (int)(long)cmd.ExecuteScalar()!;

        Context.ChangeTracker.Clear();
        return Context.DeliverySlots.IgnoreQueryFilters().First(s => s.Id == id);
    }

    public void Dispose()
    {
        Context.Dispose();
        _connection.Dispose();
    }
}
