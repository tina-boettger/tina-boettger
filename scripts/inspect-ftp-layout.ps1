param(
  [string]$SettingsPath = (Join-Path $PSScriptRoot "deploy-settings.local.psd1"),
  [string]$OutputPath = (Join-Path (Split-Path -Parent $PSScriptRoot) ".ftp-layout-check.log"),
  [switch]$OriginalMedia
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$previousCertificateCallback = $null

if (-not (Test-Path -LiteralPath $SettingsPath)) {
  throw "Missing settings file '$SettingsPath'."
}

$settings = Import-PowerShellDataFile -LiteralPath $SettingsPath
$hostName = [string]$settings.HostName
$liveDir = [string]$settings.LiveDir
$originalMediaDir = [string]$settings.OriginalMediaDir
$credentialTarget = [string]$settings.CredentialTarget
$useSsl = if ($null -eq $settings.UseSsl) { $true } else { [bool]$settings.UseSsl }
$acceptInvalidCertificate = if ($null -eq $settings.AcceptInvalidCertificate) { $false } else { [bool]$settings.AcceptInvalidCertificate }

foreach ($required in @("hostName", "liveDir", "credentialTarget")) {
  if ([string]::IsNullOrWhiteSpace((Get-Variable -Name $required -ValueOnly))) {
    throw "Deployment setting '$required' is required for FTP layout inspection."
  }
}

if ($OriginalMedia) {
  if ([string]::IsNullOrWhiteSpace($originalMediaDir)) {
    throw "Deployment setting 'OriginalMediaDir' is required for protected-media inspection."
  }
  $liveDir = $originalMediaDir
}

if (-not $liveDir.StartsWith("/")) {
  $liveDir = "/$liveDir"
}
if (-not $liveDir.EndsWith("/")) {
  $liveDir = "$liveDir/"
}

. (Join-Path $PSScriptRoot "windows-credential.ps1")
$credential = Get-WebsiteWindowsCredential -Target $credentialTarget

if ($useSsl -and $acceptInvalidCertificate) {
  $previousCertificateCallback = [Net.ServicePointManager]::ServerCertificateValidationCallback
  [Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
}

try {
  $uri = "ftp://$hostName$liveDir"
  $request = [System.Net.FtpWebRequest]::Create($uri)
  $request.Credentials = $credential.GetNetworkCredential()
  $request.Method = [System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails
  $request.EnableSsl = $useSsl
  $request.UseBinary = $true
  $request.KeepAlive = $false
  $request.UsePassive = $true

  $response = $request.GetResponse()
  $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
  try {
    $listing = $reader.ReadToEnd().TrimEnd()
  }
  finally {
    $reader.Dispose()
    $response.Dispose()
  }

  $report = @(
    "FTP layout inspection (read only)"
    "Host: $hostName"
    "LiveDir: $liveDir"
    "FTPS: $useSsl"
    ""
    "Contents:"
    $listing
  ) -join [Environment]::NewLine

  Set-Content -LiteralPath $OutputPath -Value $report -Encoding UTF8
  Write-Host $report
  Write-Host ""
  Write-Host "Saved non-secret listing to $OutputPath"
}
finally {
  if ($null -ne $previousCertificateCallback) {
    [Net.ServicePointManager]::ServerCertificateValidationCallback = $previousCertificateCallback
  }
}
