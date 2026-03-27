using FreshMarket.Web.Infrastructure;

namespace FreshMarket.Web.Endpoints.Admin;

public class AdminUploads : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this, "AdminPolicy")
            .MapPost(UploadImage, "image");
    }

    public async Task<IResult> UploadImage(IFormFile file, IWebHostEnvironment env)
    {
        const long maxBytes = 5 * 1024 * 1024; // 5 MB
        var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };

        if (file.Length == 0)
            return Results.BadRequest("Ficheiro vazio.");

        if (file.Length > maxBytes)
            return Results.BadRequest("Ficheiro demasiado grande (máx. 5 MB).");

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowed.Contains(ext))
            return Results.BadRequest("Formato não suportado. Usa JPG, PNG ou WebP.");

        var folder = Path.Combine(env.WebRootPath, "uploads", "products");
        Directory.CreateDirectory(folder);

        var fileName = $"{Guid.NewGuid()}{ext}";
        var fullPath = Path.Combine(folder, fileName);

        await using var stream = File.Create(fullPath);
        await file.CopyToAsync(stream);

        // Devolve o URL relativo para guardar na BD
        return Results.Ok(new { url = $"/uploads/products/{fileName}" });
    }
}