using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FreshMarket.Application.Common.Constants
{
    public static class CacheKeys
    {
        // Categories
        public const string Categories = "categories:all";
        public static string CategoryById(int id) => $"categories:{id}";

        // Products
        public static string ProductById(int id) => $"products:{id}";
        public static string ProductsByCategory(int id) => $"products:category:{id}";
        public static string Products(int page, int pageSize) => $"products:all:p{page}:s{pageSize}";
        public static string ProductsByCategory(int categoryId, int page, int pageSize) => $"products:category:{categoryId}:p{page}:s{pageSize}";

        // Delivery Slots

        public const string DeliverySlots = "slots:all";
        public static string SlotsAvailable(string date) => $"slots:available:{date}";
        public static string SlotsByDate(string date) => $"slots:date:{date}";
        public static string SlotsAvailable(string date, string postalPrefix) => $"slots:available:{date}:{postalPrefix}";

        // Orders
        public static string OrderById(int id) => $"orders:{id}";
        public static string OrdersByUser(int userId) => $"orders:user:{userId}";

        // Users
        public static string UserById(int id) => $"users:{id}";
    }
}
