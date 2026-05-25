param(
  [string]$SettingsPath = (Join-Path $PSScriptRoot "deploy-settings.local.psd1")
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $SettingsPath)) {
  throw "Missing settings file '$SettingsPath'. Copy deploy-settings.example.psd1 to deploy-settings.local.psd1 after confirming the FTP folders."
}

$settings = Import-PowerShellDataFile -LiteralPath $SettingsPath
$credentialTarget = [string]$settings.CredentialTarget
if ([string]::IsNullOrWhiteSpace($credentialTarget)) {
  throw "CredentialTarget is required in deploy-settings.local.psd1."
}

. (Join-Path $PSScriptRoot "windows-credential.ps1")

$credential = Get-Credential -Message "Enter the FTP username and password for tina-boettger.com. Windows will encrypt them for your signed-in user account."
Set-WebsiteWindowsCredential -Target $credentialTarget -Credential $credential
$stored = Get-WebsiteWindowsCredential -Target $credentialTarget

if ($stored.UserName -ne $credential.UserName) {
  throw "Windows Credential Manager validation failed."
}

Write-Host "Stored FTP credentials in Windows Credential Manager as '$credentialTarget'."
Write-Host "Publishing can now retrieve them while you are signed in to this Windows account without a separate vault password."
