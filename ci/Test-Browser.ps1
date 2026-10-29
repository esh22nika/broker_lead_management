param(
    [int]$BackendPort = 18081,
    [int]$FrontendPort = 15173,
    [switch]$Offline
)

$ErrorActionPreference = 'Stop'
$projectDir = Split-Path $PSScriptRoot -Parent
$backendDir = Join-Path $projectDir 'backend'
$frontendDir = Join-Path $projectDir 'frontend'
$reportPath = Join-Path $backendDir 'target/surefire-reports/TEST-com.blms.controller.LeadControllerIntegrationTest.xml'
if (-not (Test-Path $reportPath)) { throw 'Run mvn verify in backend before running the browser gate.' }
if (-not (Test-Path (Join-Path $frontendDir 'dist/index.html'))) { throw 'Run npm run build in frontend first.' }
[xml]$report = Get-Content -LiteralPath $reportPath -Raw
$classpath = ($report.testsuite.properties.property | Where-Object { $_.name -eq 'java.class.path' }).value
if (-not $classpath) { throw 'The backend test report does not contain a runtime classpath.' }

# Use a fresh in-memory database and temporary credentials, separate from deployment.
$env:BLMS_ADMIN_EMAIL = 'ci-admin@blms.invalid'
$env:BLMS_ADMIN_PASSWORD = [guid]::NewGuid().ToString('N')
$env:SELENIUM_EMAIL = $env:BLMS_ADMIN_EMAIL
$env:SELENIUM_PASSWORD = $env:BLMS_ADMIN_PASSWORD
$env:BLMS_BACKEND_URL = "http://127.0.0.1:$BackendPort"
$env:BASE_URL = "http://127.0.0.1:$FrontendPort"
$env:SE_CACHE_PATH = Join-Path $backendDir 'target/selenium-cache'
$env:SESSION_COOKIE_SECURE = 'false'
$apiProcess = $null
$uiProcess = $null
$testExitCode = 1

try {
    # Fail if either port is occupied. Never reuse or terminate an unrelated service.
    foreach ($port in @($BackendPort, $FrontendPort)) {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
        try { $listener.Start() } finally { $listener.Stop() }
    }
    $apiProcess = Start-Process -FilePath (Get-Command java.exe).Source -ArgumentList @(
        '-cp', ('"' + $classpath + '"'), 'com.blms.BlmsApplication',
        '--spring.profiles.active=test', '--server.address=127.0.0.1', "--server.port=$BackendPort",
        '--blms.demo-data=false'
    ) -WorkingDirectory $backendDir -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $backendDir 'target/browser-api.log') `
        -RedirectStandardError (Join-Path $backendDir 'target/browser-api-error.log')
    $vitePath = Join-Path $frontendDir 'node_modules/vite/bin/vite.js'
    $uiProcess = Start-Process -FilePath (Get-Command node.exe).Source -ArgumentList @(
        ('"' + $vitePath + '"'), 'preview', '--host', '127.0.0.1', '--port', "$FrontendPort", '--strictPort'
    ) -WorkingDirectory $frontendDir -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $backendDir 'target/browser-ui.log') `
        -RedirectStandardError (Join-Path $backendDir 'target/browser-ui-error.log')

    $ready = $false
    for ($attempt = 0; $attempt -lt 240; $attempt++) {
        if ($apiProcess.HasExited -or $uiProcess.HasExited) { throw 'Browser-test service exited; inspect target/browser-*.log.' }
        try {
            $health = Invoke-RestMethod "$env:BASE_URL/api/v1/health" -TimeoutSec 2
            if ($health.status -eq 'UP') { $ready = $true; break }
        } catch {}
        if ($attempt -gt 0 -and $attempt % 15 -eq 0) {
            Write-Host "Waiting for browser-test services to become ready ($attempt s)..."
        }
        Start-Sleep -Seconds 1
    }
    if (-not $ready) { throw 'Browser-test services did not become healthy; inspect target/browser-*.log.' }
    Push-Location $backendDir
    try {
        $mavenArgs = @('test', '-Pselenium', '-B')
        if ($Offline) { $mavenArgs += '-o' }
        & mvn.cmd @mavenArgs
        $testExitCode = $LASTEXITCODE
    } finally { Pop-Location }
} finally {
    if ($null -ne $uiProcess) { Stop-Process -Id $uiProcess.Id -Force -ErrorAction SilentlyContinue }
    if ($null -ne $apiProcess) { Stop-Process -Id $apiProcess.Id -Force -ErrorAction SilentlyContinue }
    Remove-Item Env:BLMS_ADMIN_PASSWORD, Env:SELENIUM_PASSWORD -ErrorAction SilentlyContinue
}
exit $testExitCode
