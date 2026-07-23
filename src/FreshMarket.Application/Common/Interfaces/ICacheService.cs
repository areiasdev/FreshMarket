using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FreshMarket.Application.Common.Interfaces
{
    public interface ICacheService
    {
        Task<T?> GetAsync<T>(string key, CancellationToken ct = default);
        Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken ct = default);
        Task RemoveAsync(string key, CancellationToken ct = default);
        Task RemoveByPrefixAsync(string prefix, CancellationToken ct = default);

        /// <summary>Atomically acquires a short-lived lock; returns false if already held (e.g. a concurrent duplicate webhook delivery).</summary>
        Task<bool> AcquireLockAsync(string key, TimeSpan expiry, CancellationToken ct = default);
        Task ReleaseLockAsync(string key, CancellationToken ct = default);
    }
}
