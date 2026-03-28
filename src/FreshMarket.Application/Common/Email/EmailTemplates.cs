namespace FreshMarket.Application.Common.Email;

public static class EmailTemplates
{
    private static string Wrap(string title, string body) => $"""
        <!DOCTYPE html>
        <html lang="pt">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{title}</title>
        </head>
        <body style="margin:0;padding:0;background:#f5f5f0;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:32px 16px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e2d9;">
                  <!-- Header -->
                  <tr>
                    <td style="background:#166534;padding:24px 32px;">
                      <span style="color:#86efac;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Horto Píncaro</span>
                      <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;font-weight:700;">{title}</h1>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:28px 32px;color:#3a3530;">
                      {body}
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="background:#f5f5f0;padding:20px 32px;border-top:1px solid #e8e2d9;">
                      <p style="margin:0;font-size:12px;color:#9c8f83;line-height:1.6;">
                        Horto Píncaro · Produtos frescos da quinta à tua porta<br/>
                        Tens dúvidas? Responde a este email ou contacta-nos.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """;

    private static string OrderSummaryRows(IEnumerable<(string Name, decimal Qty, string Unit, decimal UnitPrice, decimal Subtotal)> items)
    {
        var rows = string.Join("", items.Select(i => $"""
            <tr>
              <td style="padding:8px 0;font-size:14px;color:#3a3530;border-bottom:1px solid #f0ebe4;">{i.Name}</td>
              <td style="padding:8px 0;font-size:14px;color:#78716c;text-align:right;border-bottom:1px solid #f0ebe4;">{i.Qty:0.##} {i.Unit} × {i.UnitPrice:0.00}€</td>
              <td style="padding:8px 0;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #f0ebe4;">{i.Subtotal:0.00}€</td>
            </tr>
            """));
        return $"""
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
              {rows}
            </table>
            """;
    }

    public static string OrderPlaced(
        string customerName,
        string orderNumber,
        decimal total,
        decimal shippingFee,
        string deliveryAddress,
        string? estimatedDelivery,
        IEnumerable<(string Name, decimal Qty, string Unit, decimal UnitPrice, decimal Subtotal)> items)
    {
        var rows = OrderSummaryRows(items);
        var deliveryNote = estimatedDelivery is not null
            ? $"<p style='margin:6px 0 0;font-size:13px;color:#78716c;'>Entrega estimada: <strong>{estimatedDelivery}</strong></p>"
            : "";

        var body = $"""
            <p style="font-size:15px;margin:0 0 16px;">Olá <strong>{customerName}</strong>,</p>
            <p style="font-size:15px;margin:0 0 24px;color:#57534e;">
              Recebemos a tua encomenda com sucesso! Vamos preparar tudo com cuidado.
            </p>

            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#166534;letter-spacing:0.5px;text-transform:uppercase;">Encomenda</p>
              <p style="margin:4px 0 0;font-size:22px;font-weight:700;color:#14532d;">{orderNumber}</p>
            </div>

            {rows}

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
              <tr>
                <td style="font-size:13px;color:#78716c;padding:6px 0;">Envio</td>
                <td style="font-size:13px;text-align:right;padding:6px 0;">{shippingFee:0.00}€</td>
              </tr>
              <tr>
                <td style="font-size:16px;font-weight:700;padding:8px 0;border-top:2px solid #e8e2d9;">Total</td>
                <td style="font-size:16px;font-weight:700;color:#166534;text-align:right;padding:8px 0;border-top:2px solid #e8e2d9;">{total:0.00}€</td>
              </tr>
            </table>

            <div style="background:#fafaf8;border:1px solid #e8e2d9;border-radius:8px;padding:14px 18px;margin-top:24px;">
              <p style="margin:0;font-size:13px;font-weight:600;color:#57534e;">Morada de entrega</p>
              <p style="margin:4px 0 0;font-size:14px;color:#3a3530;">{deliveryAddress}</p>
              {deliveryNote}
            </div>
            """;

        return Wrap("Encomenda recebida!", body);
    }

    public static string OrderStatusUpdate(
        string customerName,
        string orderNumber,
        string statusLabel,
        string statusMessage,
        string statusColor)
    {
        var body = $"""
            <p style="font-size:15px;margin:0 0 16px;">Olá <strong>{customerName}</strong>,</p>

            <div style="background:{statusColor}1a;border:1px solid {statusColor}4d;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
              <p style="margin:0;font-size:13px;font-weight:700;color:{statusColor};letter-spacing:0.5px;text-transform:uppercase;">Estado</p>
              <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:{statusColor};">{statusLabel}</p>
            </div>

            <p style="font-size:15px;color:#57534e;margin:0 0 16px;">{statusMessage}</p>

            <p style="font-size:13px;color:#9c8f83;margin:0;">
              Encomenda: <strong>{orderNumber}</strong>
            </p>
            """;

        return Wrap(statusLabel, body);
    }

    public static string OrderCancelled(
        string customerName,
        string orderNumber,
        decimal totalRefund)
    {
        var body = $"""
            <p style="font-size:15px;margin:0 0 16px;">Olá <strong>{customerName}</strong>,</p>
            <p style="font-size:15px;color:#57534e;margin:0 0 24px;">
              A tua encomenda <strong>{orderNumber}</strong> foi cancelada.
            </p>
            <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;margin-bottom:20px;">
              <p style="margin:0;font-size:13px;color:#991b1b;">
                Valor da encomenda: <strong>{totalRefund:0.00}€</strong>. Se efetuaste pagamento, o reembolso será processado em 3–5 dias úteis.
              </p>
            </div>
            <p style="font-size:13px;color:#9c8f83;margin:0;">
              Se não pediste o cancelamento, responde a este email e contactamos de imediato.
            </p>
            """;

        return Wrap("Encomenda cancelada", body);
    }

    public static (string Label, string Message, string Color) StatusInfo(OrderStatus status) => status switch
    {
        OrderStatus.Paid      => ("Pagamento confirmado",     "O teu pagamento foi recebido e a encomenda está confirmada. Vamos começar a preparar tudo!", "#166534"),
        OrderStatus.Preparing => ("A preparar a tua encomenda", "A nossa equipa está a colher e a embalar os teus produtos com todo o cuidado.", "#92400e"),
        OrderStatus.Shipped   => ("Encomenda a caminho!",     "A tua encomenda saiu das nossas instalações e está a caminho. Fica atento!", "#1e40af"),
        OrderStatus.Delivered => ("Entregue com sucesso!",    "A tua encomenda foi entregue. Esperamos que gostes de tudo. Bom proveito!", "#166534"),
        _                     => ("Estado atualizado",        "O estado da tua encomenda foi atualizado.", "#57534e"),
    };
}
