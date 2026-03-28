using FreshMarket.Application.Reviews.Commands;
using FreshMarket.Application.Reviews.Queries;
using FreshMarket.Web.Infrastructure;
using MediatR;
using System.Security.Claims;

namespace FreshMarket.Web.Endpoints;

public class Reviews : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        // Public endpoints
        app.MapGroup(this)
            .MapGet(GetByProduct, "product/{productId:int}")
            .MapGet(GetSummary, "product/{productId:int}/summary");

        // Authenticated endpoints
        app.MapGroup(this, "CustomerPolicy")
            .MapPost(Create, "")
            .MapDelete(Delete, "{id:int}");
    }

    public async Task<IResult> GetByProduct(int productId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetProductReviewsQuery(productId), ct).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> GetSummary(int productId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetProductRatingSummaryQuery(productId), ct).ConfigureAwait(false);
        return Results.Ok(result);
    }

    public async Task<IResult> Create(CreateReviewCommand command, ClaimsPrincipal user, ISender sender, CancellationToken ct)
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await sender.Send(command with { UserId = userId }, ct).ConfigureAwait(false);
        return Results.Created($"/api/reviews/{result.Id}", result);
    }

    public async Task<IResult> Delete(int id, ClaimsPrincipal user, ISender sender, CancellationToken ct)
    {
        var userId = int.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await sender.Send(new DeleteReviewCommand(id, userId), ct).ConfigureAwait(false);
        return Results.NoContent();
    }
}
