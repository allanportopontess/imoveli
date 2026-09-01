# /test-api — Testar todos os endpoints da API IMOVELI

Executa suite de testes rápidos contra 127.0.0.1:3001 e reporta o resultado.

```powershell
$base = "http://127.0.0.1:3001"
$ok = 0; $fail = 0

function Test-Endpoint($label, $method, $url, $body = $null, $headers = @{}) {
    try {
        $params = @{ Uri = $url; Method = $method; ContentType = "application/json"; Headers = $headers }
        if ($body) { $params.Body = $body | ConvertTo-Json }
        $r = Invoke-RestMethod @params
        if ($r.success -eq $true -or $r.status -eq "OK") {
            Write-Host "  ✅ $label" -ForegroundColor Green
            $global:ok++
        } else {
            Write-Host "  ⚠️  $label — success=false: $($r.error)" -ForegroundColor Yellow
            $global:fail++
        }
    } catch {
        Write-Host "  ❌ $label — $($_.Exception.Message)" -ForegroundColor Red
        $global:fail++
    }
}

Write-Host "=== IMOVELI API Test Suite ===" -ForegroundColor Cyan

# Health
Test-Endpoint "GET /api/health" GET "$base/api/health"

# Login
try {
    $login = Invoke-RestMethod -Uri "$base/api/login" -Method POST -ContentType "application/json" -Body '{"email":"carlos@eng.com.br","senha":"123456"}'
    if ($login.token) {
        Write-Host "  ✅ POST /api/login — JWT recebido" -ForegroundColor Green
        $ok++
        $token = $login.token
        $authHeader = @{ Authorization = "Bearer $token" }

        # Auth me
        Test-Endpoint "GET /api/auth/me" GET "$base/api/auth/me" $null $authHeader

        # Listar fiadores
        Test-Endpoint "GET /api/fiadores" GET "$base/api/fiadores"

        # Chat IA
        Test-Endpoint "POST /api/chat" POST "$base/api/chat" @{ mensagens = @(@{ role = "user"; content = "Olá" }) }

    } else {
        Write-Host "  ❌ POST /api/login — sem token" -ForegroundColor Red
        $fail++
    }
} catch {
    Write-Host "  ❌ POST /api/login — $($_.Exception.Message)" -ForegroundColor Red
    $fail++
}

Write-Host ""
Write-Host "Resultado: $ok OK / $fail falha(s)" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Yellow" })
```
