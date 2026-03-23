using FreshMarket.Application.Categories.Models;
using FreshMarket.Application.DeliverySlots.Models;
using FreshMarket.Application.Orders.Models;
using FreshMarket.Application.Products.Models;
using FreshMarket.Application.ShippingZones.Models;
using FreshMarket.Application.Users.Models;

namespace FreshMarket.Application.Common.Mapping;

public static class MappingExtensions
{
    public static ProductDto ToDto(this Product p) => new()
    {
        Id = p.Id,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name ?? string.Empty,
        Name = p.Name,
        Description = p.Description,
        PricePerUnit = p.PricePerUnit,
        UnitType = p.UnitType,
        MinQuantity = p.MinQuantity,
        StockQuantity = p.StockQuantity,
        ImageUrl = p.ImageUrl,
        IsSeasonal = p.IsSeasonal,
        IsActive = p.IsActive
    };

    public static ProductListDto ToListDto(this Product p) => new()
    {
        Id = p.Id,
        Name = p.Name,
        PricePerUnit = p.PricePerUnit,
        UnitType = p.UnitType,
        StockQuantity = p.StockQuantity,
        ImageUrl = p.ImageUrl,
        IsSeasonal = p.IsSeasonal,
        CategoryName = p.Category?.Name ?? string.Empty
    };

    public static CategoryDto ToDto(this Category c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Slug = c.Slug,
        IsActive = c.IsActive
    };

    public static DeliverySlotDto ToDto(this DeliverySlot s) => new()
    {
        Id = s.Id,
        DeliveryDate = s.DeliveryDate,
        StartTime = s.StartTime,
        EndTime = s.EndTime,
        MaxOrders = s.MaxOrders,
        CurrentOrders = s.CurrentOrders,
        AvailableSlots = s.MaxOrders - s.CurrentOrders,
        ShippingZoneId = s.ShippingZoneId,
        IsActive = s.IsActive
    };

    public static ShippingZoneDto ToDto(this ShippingZone z) => new()
    {
        Id = z.Id,
        PostalCodePrefix = z.PostalCodePrefix,
        City = z.City,
        ShippingFee = z.ShippingFee,
        MinOrderValue = z.MinOrderValue,
        IsActive = z.IsActive
    };

    public static OrderSummaryDto ToSummaryDto(this Order o) => new()
    {
        Id = o.Id,
        Status = o.Status,
        TotalAmount = o.TotalAmount,
        ShippingFee = o.ShippingFee,
        PaymentMethod = o.PaymentMethod,
        PaymentStatus = o.PaymentStatus,
        CreatedAt = o.CreatedAt,
        DeliveryDate = o.DeliverySlot?.DeliveryDate,
        ItemCount = o.Items?.Count ?? 0
    };

    public static UserDto ToDto(this User u) => new()
    {
        Id = u.Id,
        FullName = u.FullName,
        Email = u.Email,
        Phone = u.Phone,
        Address = u.Address,
        PostalCode = u.PostalCode,
        Role = u.Role
    };
}
