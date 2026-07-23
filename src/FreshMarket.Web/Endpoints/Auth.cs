using FreshMarket.Application.Users.Command.Login;
using FreshMarket.Application.Users.Command.Logout;
using FreshMarket.Application.Users.Command.Token;
using FreshMarket.Web.Infrastructure;
using MediatR;
using Microsoft.AspNetCore.Builder;

namespace FreshMarket.Web.Endpoints;

public class Auth : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireRateLimiting("auth")
            .MapPost(Login, "login")
            .MapPost(Register, "register")
            .MapPost(RefreshToken, "refresh-token")
            .MapPost(Logout, "logout");
    }

    public async Task<IResult> Login(LoginCommand command, ISender sender)
    {
        var result = await sender.Send(command).ConfigureAwait(false);
        return result == null ? Results.Unauthorized() : Results.Ok(result);
    }

    public async Task<IResult> Register(RegisterCommand command, ISender sender)
    {
        var result = await sender.Send(command).ConfigureAwait(false);
        return Results.Created("/api/auth/login", result);
    }

    public async Task<IResult> RefreshToken(RefreshTokenCommand command, ISender sender)
    {
        var result = await sender.Send(command).ConfigureAwait(false);
        return result == null ? Results.Unauthorized() : Results.Ok(result);
    }

    public async Task<IResult> Logout(LogoutCommand command, ISender sender)
    {
        await sender.Send(command).ConfigureAwait(false);
        return Results.NoContent();
    }
}
