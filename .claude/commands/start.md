# /start — Iniciar toda a stack IMOVELI

Inicia PostgreSQL, backend e frontend em sequência e verifica saúde.

```powershell
# 1. Inicia o PostgreSQL
& "C:\Program Files\PostgreSQL\17\bin\pg_ctl.exe" start -D C:\imoveli_pgdata -l C:\imoveli_pgdata\pg.log
Start-Sleep -Seconds 2

# 2. Verifica se PG está pronto
& "C:\Program Files\PostgreSQL\17\bin\pg_isready.exe" -h 127.0.0.1 -p 5432

# 3. Inicia o backend em background
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "backend/server-pg.js" -WorkingDirectory "C:\Users\SEDUC\AppData\Local\Temp\claude\imoveli-extract\imoveli-completo"

# 4. Inicia o frontend em background
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "C:\Users\SEDUC\AppData\Local\Temp\claude\serve-frontend.js"

Start-Sleep -Seconds 3

# 5. Health check
Write-Host "=== Health Check ===" -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/health"
    Write-Host "Backend: OK — $($health.version)" -ForegroundColor Green
} catch {
    Write-Host "Backend: FALHOU" -ForegroundColor Red
}

try {
    $status = (Invoke-WebRequest -Uri "http://127.0.0.1:8000" -UseBasicParsing).StatusCode
    Write-Host "Frontend: OK — HTTP $status" -ForegroundColor Green
} catch {
    Write-Host "Frontend: FALHOU" -ForegroundColor Red
}

Write-Host ""
Write-Host "Acesse: http://127.0.0.1:8000" -ForegroundColor Yellow
```
