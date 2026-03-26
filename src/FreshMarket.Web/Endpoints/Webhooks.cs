using FreshMarket.Application.Payments.Commands.Confirm;
using Microsoft.AspNetCore.Mvc;
using Stripe;

public static class Webhooks
{
    public static void Map(WebApplication app)
    {
        app.MapPost("/api/webhooks/stripe", HandleStripeWebhook);
    }

    public static async Task<IResult> HandleStripeWebhook(
        HttpRequest request,
        IConfiguration config,
        ISender sender)
    {
        var json = await new StreamReader(request.Body).ReadToEndAsync();

        var endpointSecret = config["Stripe:WebhookSecret"];

        Event stripeEvent;

        try
        {
            stripeEvent = EventUtility.ConstructEvent(
                json,
                request.Headers["Stripe-Signature"],
                endpointSecret
            );
        }
        catch
        {
            return Results.BadRequest();
        }

        // 🎯 Evento importante
        if (stripeEvent.Type == "checkout.session.completed")
        {
            var session = stripeEvent.Data.Object as Stripe.Checkout.Session;

            if (session?.Id != null)
            {
                await sender.Send(new ConfirmPaymentCommand(session.Id));
            }
        }

        return Results.Ok();
    }
}