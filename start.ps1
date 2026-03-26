Write-Host "🐳 A iniciar Redis..." -ForegroundColor Cyan
docker start redis-freshmarket 2>$null

Write-Host "🌱 A iniciar Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\joa52\source\repos\areiasdev\FreshMarket\src\FreshMarket.Web'; dotnet watch run"

Write-Host "⚡ A iniciar Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\joa52\source\repos\areiasdev\FreshMarket\freshmarket-web'; npm run dev"

Write-Host "✅ Tudo iniciado!" -ForegroundColor Green