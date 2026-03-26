using FreshMarket.Application.Common.Interfaces;
using FreshMarket.Application.Common.Models;
using System.Net.Http.Json;

public class MbWayPaymentProvider : IPaymentProvider
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;

    public MbWayPaymentProvider(HttpClient http, IConfiguration config)
    {
        _http = http;
        _config = config;
    }

    public async Task<PaymentProviderResult> CreateAsync(decimal amount, string currency, string description)
    {
        var request = new
        {
            mbwayKey = _config["MbWay:Key"],
            canal = "03",
            referencia = Guid.NewGuid().ToString(),
            valor = amount,
            descricao = description
        };

        var response = await _http.PostAsJsonAsync(
            _config["MbWay:CreateUrl"],
            request
        );

        if (!response.IsSuccessStatusCode)
            throw new Exception("Erro MBWay");

        var data = await response.Content.ReadFromJsonAsync<MbWayResponse>();

        return new PaymentProviderResult
        {
            ExternalId = data!.Referencia,
            Status = "pending"
        };
    }

    public async Task<PaymentProviderResult> GetStatusAsync(string externalId)
    {
        var response = await _http.GetAsync(
            $"{_config["MbWay:StatusUrl"]}?ref={externalId}"
        );

        if (!response.IsSuccessStatusCode)
            throw new Exception("Erro MBWay status");

        var data = await response.Content.ReadFromJsonAsync<MbWayStatusResponse>();

        return new PaymentProviderResult
        {
            ExternalId = externalId,
            Status = data!.Estado switch
            {
                "pago" => "succeeded",
                "pendente" => "pending",
                _ => "failed"
            }
        };
    }

    private class MbWayResponse
    {
        public string Referencia { get; set; } = default!;
    }

    private class MbWayStatusResponse
    {
        public string Estado { get; set; } = default!;
    }
}