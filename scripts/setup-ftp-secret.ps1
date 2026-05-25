param(
  [string]$SettingsPath = (Join-Path $PSScriptRoot "deploy-settings.local.psd1")
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $SettingsPath)) {
  throw "Missing settings file '$SettingsPath'. Copy deploy-settings.example.psd1 to deploy-settings.local.psd1 after confirming the FTP folders."
}

$settings = Import-PowerShellDataFile -LiteralPath $SettingsPath
$vaultName = [string]$settings.VaultName
$secretName = [string]$settings.SecretName
if ([string]::IsNullOrWhiteSpace($vaultName) -or [string]::IsNullOrWhiteSpace($secretName)) {
  throw "VaultName and SecretName are required in deploy-settings.local.psd1."
}

Import-Module Microsoft.PowerShell.SecretManagement -ErrorAction Stop
Import-Module Microsoft.PowerShell.SecretStore -ErrorAction Stop

if (-not (Get-SecretVault -Name $vaultName -ErrorAction SilentlyContinue)) {
  Register-SecretVault -Name $vaultName -ModuleName Microsoft.PowerShell.SecretStore -DefaultVault
}

Set-SecretStoreConfiguration -Scope CurrentUser -Authentication Password -Interaction Prompt -PasswordTimeout 900 -Confirm:$false
$credential = Get-Credential -Message "Enter the FTP username and password for tina-boettger.com. These will be encrypted in SecretStore."
Set-Secret -Vault $vaultName -Name $secretName -Secret $credential

if (-not (Test-SecretVault -Name $vaultName)) {
  throw "SecretStore validation failed."
}

Write-Host "Stored FTP credentials in the password-protected '$vaultName' vault as '$secretName'."
