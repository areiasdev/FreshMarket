using FreshMarket.Application;
using FreshMarket.Infrastructure;
using FreshMarket.Web.Infrastructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, config) =>
    config.ReadFrom.Configuration(ctx.Configuration)
          .WriteTo.Console()
          .WriteTo.File("logs/freshmarket-.txt", rollingInterval: RollingInterval.Day));

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddExceptionHandler<CustomExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();



builder.Services.AddCors(options =>
{
    options.AddPolicy("FreshMarketCors", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();
Console.WriteLine(">> App built");

if (app.Environment.IsDevelopment())
{
    Console.WriteLine(">> Mapping OpenApi...");
    app.MapOpenApi();
    Console.WriteLine(">> Mapping Scalar...");
    app.MapScalarApiReference(options =>
    {
        options.Title = "FreshMarket API";
        options.Theme = ScalarTheme.DeepSpace;
    });
}

Console.WriteLine(">> Adding middlewares...");
//app.UseSerilogRequestLogging();
app.UseExceptionHandler();
app.UseCors("FreshMarketCors");
app.UseAuthentication();
app.UseAuthorization();

Console.WriteLine(">> Mapping endpoints...");
app.MapEndpoints();
Console.WriteLine(">> Endpoints mapped, running app...");

app.Run();
Console.WriteLine(">> AFTER RUN"); // nunca deve chegar aqui
