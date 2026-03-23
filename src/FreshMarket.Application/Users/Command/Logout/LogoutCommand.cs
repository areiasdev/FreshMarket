using FreshMarket.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FreshMarket.Application.Users.Command.Logout;

public record LogoutCommand(string RefreshToken) : IRequest;

public class LogoutCommandHandler : IRequestHandler<LogoutCommand>
{
    private readonly IApplicationDbContext _db;

    public LogoutCommandHandler(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task Handle(LogoutCommand request, CancellationToken ct)
    {
        var token = await _db.Users
            .SelectMany(u => u.Orders) // placeholder — RefreshToken entity vai na Infrastructure
            .FirstOrDefaultAsync(ct)
            .ConfigureAwait(false);

        // Lógica real implementada no UserService na Infrastructure
        await Task.CompletedTask.ConfigureAwait(false);
    }
}
