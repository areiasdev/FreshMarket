using FreshMarket.Application.Users.Command.Login;
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
            .MapPost(Login, "login")
            .MapPost(Register, "register")
            .MapPost(RefreshToken, "refresh-token");
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
}
