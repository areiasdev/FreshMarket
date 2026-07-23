using FreshMarket.Application.Payments.Commands.Confirm;
using FreshMarket.Application.Payments.Commands.Fail;
using FreshMarket.Web.Infrastructure;
using Stripe;

public class Webhooks : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
           .MapPost(HandleStripeWebhook, "stripe");
    }

    public static async Task<IResult> HandleStripeWebhook(
        HttpRequest request,
        IConfiguration config,
        ISender sender)
    {
        var json = await new StreamReader(request.Body).ReadToEndAsync();
        var webhookSecret = config["Stripe:WebhookSecret"];

        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(
                json,
                request.Headers["Stripe-Signature"],
                webhookSecret
            );
        }
        catch (StripeException)
        {
            return Results.BadRequest("Invalid Stripe signature.");
        }

        // Card: session.completed fires with payment_status=paid
        // MBWay: session.completed fires with payment_status=unpaid, then async_payment_succeeded fires when OTP confirmed
        if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted)
        {
            var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
            if (session?.Id != null && session.PaymentStatus == "paid")
                await sender.Send(new ConfirmPaymentCommand(session.Id));
        }
        else if (stripeEvent.Type == EventTypes.CheckoutSessionAsyncPaymentSucceeded)
        {
            var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
            if (session?.Id != null)
                await sender.Send(new ConfirmPaymentCommand(session.Id));
        }
        else if (stripeEvent.Type is EventTypes.CheckoutSessionAsyncPaymentFailed or EventTypes.CheckoutSessionExpired)
        {
            // MB WAY declined/timed-out, or the checkout session simply expired unused —
            // mark the payment failed now instead of leaving it Pending until the 15-minute cleanup job.
            var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
            if (session?.Id != null)
                await sender.Send(new MarkPaymentFailedCommand(session.Id));
        }

        return Results.Ok();
    }
}
