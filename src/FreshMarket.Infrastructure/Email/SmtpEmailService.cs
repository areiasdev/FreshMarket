using System.Net;
using System.Net.Mail;
using FreshMarket.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace FreshMarket.Infrastructure.Email;

public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration config, ILogger<SmtpEmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendAsync(string to, string subject, string htmlBody, CancellationToken ct = default)
    {
        var section = _config.GetSection("Email");
        if (!section.GetValue<bool>("Enabled"))
        {
            _logger.LogInformation("Email disabled. Would send '{Subject}' to {To}", subject, to);
            return;
        }

        var host     = section["Smtp:Host"]!;
        var port     = section.GetValue<int>("Smtp:Port");
        var user     = section["Smtp:Username"]!;
        var pass     = section["Smtp:Password"]!;
        var fromAddr = section["From:Address"]!;
        var fromName = section["From:Name"] ?? "Horto Píncaro";

        using var client = new SmtpClient(host, port)
        {
            Credentials = new NetworkCredential(user, pass),
            EnableSsl   = true,
        };

        using var message = new MailMessage
        {
            From       = new MailAddress(fromAddr, fromName),
            Subject    = subject,
            Body       = htmlBody,
            IsBodyHtml = true,
        };
        message.To.Add(to);

        try
        {
            await client.SendMailAsync(message, ct);
            _logger.LogInformation("Email sent: '{Subject}' → {To}", subject, to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email '{Subject}' to {To}", subject, to);
            throw;
        }
    }
}
