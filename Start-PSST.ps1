$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCommand) { $node = $nodeCommand.Source }
else {
  $runtime = Get-AppxPackage 'OpenAI.CodexPrimaryRuntime*' | Sort-Object Version -Descending | Select-Object -First 1
  $node = if ($runtime) { Join-Path $runtime.InstallLocation 'dependencies\node\bin\node.exe' }
  if (!$node -or !(Test-Path -LiteralPath $node)) { throw 'Install Node.js 24 and pnpm 11, then rerun this script.' }
}
$env:Path = "$(Split-Path $node);$env:Path"
$pnpmCommand = Get-Command pnpm -ErrorAction SilentlyContinue
if (!$pnpmCommand) {
  $bundled = Join-Path (Split-Path $node) '..\node_modules\pnpm\bin\pnpm.cjs'
  if (!(Test-Path -LiteralPath $bundled)) { throw 'Install pnpm 11, then rerun this script.' }
  # A checkout-local shim lets nested workspace scripts find bundled pnpm.
  # It affects this process only and does not change the system PATH.
  $bin = Join-Path $PSScriptRoot '.local\bin'
  New-Item -ItemType Directory -Force -Path $bin | Out-Null
  "@echo off`r`n`"$node`" `"$bundled`" %*" | Set-Content -LiteralPath (Join-Path $bin 'pnpm.cmd')
  $env:Path = "$bin;$env:Path"
}
pnpm install --frozen-lockfile
if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed. Review the error above before starting.' }
Write-Host 'PSST preview: http://127.0.0.1:5173/'
pnpm dev
