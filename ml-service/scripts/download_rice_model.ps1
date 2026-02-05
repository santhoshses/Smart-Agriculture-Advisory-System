$ErrorActionPreference = "Stop"

$RepoId = "prithivMLmods/Rice-Leaf-Disease"

function Fail($msg) {
  Write-Error $msg
  exit 1
}

try {
  # Resolve paths relative to this script location (works from anywhere)
  $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  $MlServiceDir = Resolve-Path (Join-Path $ScriptDir "..")
  $TargetDir = Join-Path $MlServiceDir "models\rice_model"

  Write-Host "=== Hugging Face Rice model download (snapshot) ==="
  Write-Host "Repo: $RepoId"
  Write-Host "Target: $TargetDir"

  # Ensure target folder exists
  New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null

  # Check python exists
  $py = Get-Command python -ErrorAction SilentlyContinue
  if (-not $py) {
    Fail "Python is not available on PATH. Install Python 3 and reopen PowerShell. Then retry."
  }

  Write-Host "Python found: $($py.Source)"
  python --version

  Write-Host "Upgrading pip..."
  python -m pip install --upgrade pip

  Write-Host "Installing/upgrading huggingface_hub..."
  python -m pip install --upgrade huggingface_hub

  # Download snapshot to local folder (Windows-friendly, no symlinks)
  $PyCode = @"
from huggingface_hub import snapshot_download

repo_id = r'''$RepoId'''
local_dir = r'''$TargetDir'''

snapshot_download(
    repo_id=repo_id,
    local_dir=local_dir,
    local_dir_use_symlinks=False,
)

print('Download complete')
print('Target folder:', local_dir)
"@

  Write-Host "Starting snapshot_download... (this may take a few minutes)"
  python -c $PyCode

  Write-Host "Download complete. Target folder: $TargetDir"
  exit 0
}
catch {
  Fail ("Download failed: " + ($_.Exception.Message))
}

