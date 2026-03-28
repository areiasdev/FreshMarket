using FreshMarket.Application.Addresses.Models;
using FreshMarket.Application.Categories.Models;
using FreshMarket.Application.DeliverySlots.Models;
using FreshMarket.Application.Orders.Models;
using FreshMarket.Application.Products.Models;
using FreshMarket.Application.Users.Models;

namespace FreshMarket.Application.Common.Mapping;

public static class MappingExtensions
{
    // ─── Product ────────────────────────────────────────────────

    public static ProductDetailDto ToDto(this Product p) => new()
    {
        Id = p.Id,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name ?? string.Empty,
        Name = p.Name,
        Slug = p.Slug,
        Description = p.Description,
        PricePerUnit = p.PricePerUnit,
        UnitType = p.UnitType,
        MinQuantity = p.MinQuantity,
        StockQuantity = p.StockQuantity,
        TrackStock = p.TrackStock,
        ImageUrl = p.ImageUrl,
        IsSeasonal = p.IsSeasonal,
        IsActive = p.IsActive
    };

    public static ProductListDto ToListDto(this Product p) => new()
    {
        Id = p.Id,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name ?? string.Empty,
        Name = p.Name,
        Slug = p.Slug,
        PricePerUnit = p.PricePerUnit,
        MinQuantity = p.MinQuantity,
        UnitType = p.UnitType,
        StockQuantity = p.StockQuantity,
        TrackStock = p.TrackStock,
        ImageUrl = p.ImageUrl,
        IsSeasonal = p.IsSeasonal,
        IsActive = p.IsActive,
    };

    // ─── Category ───────────────────────────────────────────────

    public static CategoryDto ToDto(this Category c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Slug = c.Slug,
        IsActive = c.IsActive,
        ProductCount = c.Products?.Count(p => p.DeletedAt == null) ?? 0,
    };

    // ─── DeliverySlot ───────────────────────────────────────────

    public static DeliverySlotDto ToDto(this DeliverySlot s) => new()
    {
        Id = s.Id,
        DeliveryDate = s.DeliveryDate,  // ← era s.Date
        StartTime = s.StartTime,
        EndTime = s.EndTime,
        MaxOrders = s.MaxOrders,
        CurrentOrders = s.CurrentOrders,
        ShippingFee = s.ShippingFee,
        IsActive = s.IsActive,
        // AvailableSpots é computed property no DTO, não precisa de set
    };

    // ─── Order ──────────────────────────────────────────────────

    public static OrderSummaryDto ToSummaryDto(this Order o) => new()
    {
        Id = o.Id,
        OrderNumber = o.OrderNumber,
        Status = o.Status,
        TotalAmount = o.TotalAmount,
        ShippingFee = o.ShippingFee,
        CreatedAt = o.CreatedAt,
        DeliveryCity = o.DeliveryCity,  
        DeliveryPostalCode = o.DeliveryPostalCode,
        ItemCount = o.Items?.Count ?? 0,
        UserFullName = o.User?.FullName ?? "—",
        DeliverySlot = o.DeliverySlot == null ? null : new DeliverySlotInfo
        {
            DeliveryDate = o.DeliverySlot.DeliveryDate,
            StartTime = o.DeliverySlot.StartTime,
            EndTime = o.DeliverySlot.EndTime,
        },
        PreferredDeliveryDate = o.PreferredDeliveryDate,
    };

    // ─── Address ────────────────────────────────────────────────

    public static AddressDto ToDto(this Address a) => new()
    {
        Id = a.Id,
        Label = a.Label,
        Street = a.Street,
        PostalCode = a.PostalCode,
        City = a.City,
        Country = a.Country,
        IsDefault = a.IsDefault,
    };

    // ─── User ───────────────────────────────────────────────────

    public static UserDto ToDto(this User u) => new()
    {
        Id = u.Id,
        FullName = u.FullName,
        Email = u.Email,
        Phone = u.Phone,
        Role = u.Role,
    };
}