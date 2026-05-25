param(
  [string]$SettingsPath = (Join-Path $PSScriptRoot "deploy-settings.local.psd1"),
  [string]$BuildDir = "dist",
  [switch]$SkipBuild,
  [switch]$UploadOnly,
  [switch]$WhatIf,
  [switch]$UploadOriginalMedia,
  [string]$OriginalMediaManifest = (Join-Path $PSScriptRoot "original-media-manifest.txt"),
  [string]$RollbackArchive
)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$script:PreviousCertificateValidationCallback = $null

function Ensure-Value {
  param(
    [string]$Value,
    [string]$Name
  )

  if ([string]::IsNullOrWhiteSpace($Value)) {
    throw "Missing required value for $Name."
  }
}

function Normalize-RemoteDir {
  param([string]$Value)

  if ($null -eq $Value) {
    return "/"
  }

  $trimmed = $Value.Trim() -replace "\\", "/"
  if ([string]::IsNullOrWhiteSpace($trimmed)) {
    return "/"
  }

  if (-not $trimmed.StartsWith("/")) {
    $trimmed = "/$trimmed"
  }

  if (-not $trimmed.EndsWith("/")) {
    $trimmed = "$trimmed/"
  }

  return $trimmed
}

function ConvertTo-Bool {
  param(
    [string]$Value,
    [bool]$Default,
    [string]$Name = "boolean setting"
  )

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return $Default
  }

  switch ($Value.Trim().ToLowerInvariant()) {
    "1" { return $true }
    "true" { return $true }
    "yes" { return $true }
    "on" { return $true }
    "0" { return $false }
    "false" { return $false }
    "no" { return $false }
    "off" { return $false }
    default { throw "Invalid $Name value '$Value'. Use true or false." }
  }
}

function Join-RemotePath {
  param(
    [string]$Base,
    [string]$Child
  )

  $normalizedBase = Normalize-RemoteDir $Base
  $normalizedChild = ($Child -replace "\\", "/").TrimStart("/")
  if ([string]::IsNullOrWhiteSpace($normalizedChild)) {
    return $normalizedBase.TrimEnd("/")
  }

  return ($normalizedBase.TrimEnd("/") + "/" + $normalizedChild)
}

function Get-RemoteParentPath {
  param([string]$Path)

  $normalizedPath = ($Path -replace "\\", "/").TrimEnd("/")
  $lastSlash = $normalizedPath.LastIndexOf("/")
  if ($lastSlash -le 0) {
    return "/"
  }

  return $normalizedPath.Substring(0, $lastSlash)
}

function ConvertTo-FtpUriPath {
  param([string]$Path)

  if ([string]::IsNullOrWhiteSpace($Path) -or $Path -eq "/") {
    return "/"
  }

  $Path = $Path -replace "\\", "/"
  $hasTrailingSlash = $Path.EndsWith("/")
  $segments = $Path.Trim("/") -split "/" | Where-Object { $_ -ne "" }
  $encoded = ($segments | ForEach-Object { [System.Uri]::EscapeDataString($_) }) -join "/"
  $result = "/$encoded"

  if ($hasTrailingSlash) {
    return "$result/"
  }

  return $result
}

function New-FtpRequest {
  param(
    [string]$Path,
    [string]$Method
  )

  $uri = "ftp://$script:HostName$(ConvertTo-FtpUriPath $Path)"
  $request = [System.Net.FtpWebRequest]::Create($uri)
  $request.Credentials = New-Object System.Net.NetworkCredential($script:Username, $script:Password)
  $request.Method = $Method
  $request.EnableSsl = $script:UseSsl
  $request.UseBinary = $true
  $request.KeepAlive = $false
  $request.UsePassive = $true
  return $request
}

function ConvertFrom-FtpListingLine {
  param([string]$Line)

  $trimmed = $Line.Trim()
  if ([string]::IsNullOrWhiteSpace($trimmed)) {
    return $null
  }

  $windowsMatch = [regex]::Match($trimmed, "^\d{2}-\d{2}-\d{2}\s+\d{2}:\d{2}[AP]M\s+(?<marker><DIR>|\d+)\s+(?<name>.+)$", "IgnoreCase")
  if ($windowsMatch.Success) {
    return [pscustomobject]@{
      Name = $windowsMatch.Groups["name"].Value
      IsDirectory = $windowsMatch.Groups["marker"].Value.ToUpperInvariant() -eq "<DIR>"
      Size = if ($windowsMatch.Groups["marker"].Value -match "^\d+$") { [long]$windowsMatch.Groups["marker"].Value } else { $null }
    }
  }

  $unixMatch = [regex]::Match($trimmed, "^(?<type>[dl-])[rwxstST-]{9}\s+\d+\s+\S+\s+\S+\s+(?<size>\d+)\s+\S+\s+\d+\s+(?:[\d:]{4,5}|\d{4})\s+(?<name>.+)$")
  if ($unixMatch.Success) {
    return [pscustomobject]@{
      Name = $unixMatch.Groups["name"].Value
      IsDirectory = $unixMatch.Groups["type"].Value -eq "d"
      Size = [long]$unixMatch.Groups["size"].Value
    }
  }

  $name = $trimmed
  return [pscustomobject]@{
    Name = $name
    IsDirectory = $false
    Size = $null
  }
}

function Invoke-Ftp {
  param(
    [string]$Path,
    [string]$Method,
    [byte[]]$Body = $null
  )

  $request = New-FtpRequest -Path $Path -Method $Method
  if ($null -ne $Body) {
    $request.ContentLength = $Body.Length
    $stream = $request.GetRequestStream()
    try {
      $stream.Write($Body, 0, $Body.Length)
    }
    finally {
      $stream.Dispose()
    }
  }

  try {
    $response = $request.GetResponse()
    $status = $response.StatusDescription
    $response.Dispose()
    return $status
  }
  catch [System.Net.WebException] {
    $ftpResponse = $_.Exception.Response
    if ($null -ne $ftpResponse) {
      $message = $ftpResponse.StatusDescription.Trim()
      $ftpResponse.Dispose()
      throw "FTP $Method failed for '$Path': $message"
    }

    throw
  }
}

function Get-FtpListing {
  param([string]$Path)

  $request = New-FtpRequest -Path $Path -Method ([System.Net.WebRequestMethods+Ftp]::ListDirectoryDetails)
  try {
    $response = $request.GetResponse()
    $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
    try {
      $raw = $reader.ReadToEnd()
    }
    finally {
      $reader.Dispose()
      $response.Dispose()
    }
  }
  catch [System.Net.WebException] {
    $ftpResponse = $_.Exception.Response
    if ($null -ne $ftpResponse) {
      $message = $ftpResponse.StatusDescription.Trim()
      $ftpResponse.Dispose()
      throw "FTP listing failed for '$Path': $message"
    }

    throw
  }

  $items = @()
  foreach ($line in ($raw -split "(`r`n|`n)" | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })) {
    $item = ConvertFrom-FtpListingLine -Line $line
    if ($null -eq $item -or [string]::IsNullOrWhiteSpace($item.Name) -or $item.Name -eq "." -or $item.Name -eq "..") {
      continue
    }

    $items += $item
  }

  return $items
}

function Ensure-RemoteDirectory {
  param([string]$Path)

  $segments = ($Path.Trim("/") -split "/") | Where-Object { $_ }
  if ($segments.Count -eq 0) {
    return
  }

  $current = ""
  foreach ($segment in $segments) {
    $current = "$current/$segment"
    try {
      Invoke-Ftp -Path $current -Method ([System.Net.WebRequestMethods+Ftp]::MakeDirectory) | Out-Null
    }
    catch {
      if ($_.Exception.Message -notmatch "exists|exist|File unavailable") {
        throw
      }
    }
  }
}

function Move-RemoteItem {
  param(
    [string]$SourcePath,
    [string]$DestinationPath
  )

  if ($WhatIf) {
    Write-Host "[whatif] move $SourcePath -> $DestinationPath"
    return
  }

  $request = New-FtpRequest -Path $SourcePath -Method ([System.Net.WebRequestMethods+Ftp]::Rename)
  $request.RenameTo = $DestinationPath
  try {
    $response = $request.GetResponse()
    $response.Dispose()
  }
  catch [System.Net.WebException] {
    $ftpResponse = $_.Exception.Response
    if ($null -ne $ftpResponse) {
      $message = $ftpResponse.StatusDescription.Trim()
      $ftpResponse.Dispose()
      throw "FTP move failed for '$SourcePath' -> '$DestinationPath': $message"
    }

    throw
  }
}

function Test-MissingRemoteItemError {
  param([string]$Message)

  return $Message -match "550" -and $Message -match "No such file|not found|not available|nicht gefunden|Datei nicht"
}

function Upload-File {
  param(
    [string]$LocalPath,
    [string]$RemotePath
  )

  if ($WhatIf) {
    Write-Host "[whatif] upload $LocalPath -> $RemotePath"
    return
  }

  $bytes = [System.IO.File]::ReadAllBytes($LocalPath)
  try {
    Invoke-Ftp -Path $RemotePath -Method ([System.Net.WebRequestMethods+Ftp]::UploadFile) -Body $bytes | Out-Null
  }
  catch {
    throw "Upload failed for '$LocalPath' -> '$RemotePath'. $($_.Exception.Message)"
  }
}

function Get-ProtectedLiveNames {
  $protectedNames = @("_archives")
  if ($OriginalMediaDir -eq $RemoteDir) {
    throw "OriginalMediaDir must not be the same as LiveDir."
  }

  if ($OriginalMediaDir.StartsWith($RemoteDir, [StringComparison]::OrdinalIgnoreCase)) {
    $relativePath = $OriginalMediaDir.Substring($RemoteDir.Length).Trim("/")
    if ([string]::IsNullOrWhiteSpace($relativePath)) {
      throw "OriginalMediaDir must not be the same as LiveDir."
    }

    $protectedNames += ($relativePath -split "/")[0]
  }
  elseif ($RemoteDir.StartsWith($OriginalMediaDir, [StringComparison]::OrdinalIgnoreCase)) {
    throw "LiveDir must not be inside OriginalMediaDir."
  }

  return $protectedNames | Select-Object -Unique
}

function Move-LiveItemsToArchive {
  param([string]$ArchiveDir)

  if (-not $WhatIf) {
    Ensure-RemoteDirectory -Path $ArchiveDir
  }

  $protectedNames = Get-ProtectedLiveNames
  # Some FTP servers include descendant or slash-prefixed legacy entries in a root listing.
  # Archive only immediate live children; descendants move with their parent directory.
  $itemsToArchive = Get-FtpListing -Path $RemoteDir |
    Where-Object { $_.Name -notin $protectedNames -and $_.Name -notmatch "[/\\]" } |
    Sort-Object -Property Name -Unique
  foreach ($item in $itemsToArchive) {
    $source = Join-RemotePath -Base $RemoteDir -Child $item.Name
    $destination = Join-RemotePath -Base $ArchiveDir -Child $item.Name
    try {
      Move-RemoteItem -SourcePath $source -DestinationPath $destination
    }
    catch {
      if (Test-MissingRemoteItemError -Message $_.Exception.Message) {
        Write-Warning "Skipping '$source' because the FTP server listed it but then reported it missing."
        continue
      }

      throw
    }
  }
}

function Upload-BuildOutput {
  param([string]$ResolvedBuildDir)

  Write-Host "Uploading build output from $ResolvedBuildDir"
  $localItems = Get-ChildItem -Path $ResolvedBuildDir -Force
  $protectedNames = Get-ProtectedLiveNames
  $protectedBuildItems = $localItems | Where-Object { $_.Name -in $protectedNames }
  if ($protectedBuildItems) {
    throw "Build output contains a protected remote directory name and cannot be uploaded: $($protectedBuildItems.Name -join ', ')."
  }
  $indexFile = $localItems | Where-Object { -not $_.PSIsContainer -and $_.Name -eq "index.html" }
  $orderedItems = @(
    $localItems | Where-Object { -not ($_.PSIsContainer -or $_.Name -eq "index.html") }
  ) + @(
    $localItems | Where-Object { $_.PSIsContainer }
  )

  foreach ($item in $orderedItems) {
    $remotePath = Join-RemotePath -Base $RemoteDir -Child $item.Name
    if ($item.PSIsContainer) {
      if (-not $WhatIf) {
        Ensure-RemoteDirectory -Path $remotePath
      }

      Get-ChildItem -Path $item.FullName -Recurse -File | ForEach-Object {
        $relative = $_.FullName.Substring($ResolvedBuildDir.Length).TrimStart("\")
        $destination = Join-RemotePath -Base $RemoteDir -Child ($relative -replace "\\", "/")
        if (-not $WhatIf) {
          Ensure-RemoteDirectory -Path (Get-RemoteParentPath -Path $destination)
        }
        Upload-File -LocalPath $_.FullName -RemotePath $destination
      }
    }
    else {
      Upload-File -LocalPath $item.FullName -RemotePath $remotePath
    }
  }

  if ($indexFile) {
    Upload-File -LocalPath $indexFile.FullName -RemotePath (Join-RemotePath -Base $RemoteDir -Child "index.html")
  }
}

function Upload-OriginalMediaFiles {
  param([string]$ManifestPath)

  if (-not (Test-Path -LiteralPath $ManifestPath)) {
    throw "Original media manifest '$ManifestPath' does not exist."
  }

  $files = Get-Content -LiteralPath $ManifestPath |
    Where-Object { -not [string]::IsNullOrWhiteSpace($_) -and -not $_.TrimStart().StartsWith("#") }
  if (-not $files) {
    throw "Original media manifest is empty."
  }

  if (-not $WhatIf) {
    Ensure-RemoteDirectory -Path $OriginalMediaDir
  }

  $protectionFile = Join-Path $projectRoot "scripts\protected-originals.htaccess"
  if (-not (Test-Path -LiteralPath $protectionFile)) {
    throw "Missing protected-originals access control file '$protectionFile'."
  }
  Upload-File -LocalPath $protectionFile -RemotePath (Join-RemotePath -Base $OriginalMediaDir -Child ".htaccess")

  foreach ($fileName in $files) {
    $localPath = Join-Path (Join-Path $projectRoot "public") $fileName
    if (-not (Test-Path -LiteralPath $localPath)) {
      throw "Original media file '$localPath' does not exist."
    }
    Upload-File -LocalPath $localPath -RemotePath (Join-RemotePath -Base $OriginalMediaDir -Child $fileName)
  }

  if (-not $WhatIf) {
    $remoteItems = Get-FtpListing -Path $OriginalMediaDir
    foreach ($fileName in $files) {
      $localFile = Get-Item -LiteralPath (Join-Path (Join-Path $projectRoot "public") $fileName)
      $remoteFile = $remoteItems | Where-Object { $_.Name -eq $fileName } | Select-Object -First 1
      if (-not $remoteFile) {
        throw "Original media verification failed: '$fileName' was not found remotely."
      }
      if ($null -ne $remoteFile.Size -and $remoteFile.Size -ne $localFile.Length) {
        throw "Original media verification failed: size differs for '$fileName'."
      }
    }
  }

  Write-Host "Protected original media upload verified for $($files.Count) files in $OriginalMediaDir."
  Write-Host "FTP listings may hide .htaccess files; verify browser access to an archived image is denied before removing public originals."
}

if ($UploadOriginalMedia -and -not [string]::IsNullOrWhiteSpace($RollbackArchive)) {
  throw "UploadOriginalMedia and RollbackArchive cannot be used together."
}
if ($UploadOriginalMedia -and $UploadOnly) {
  throw "UploadOriginalMedia and UploadOnly cannot be used together."
}

if (-not (Test-Path -LiteralPath $SettingsPath)) {
  throw "Missing deployment settings '$SettingsPath'. Copy deploy-settings.example.psd1 to deploy-settings.local.psd1 and confirm the protected FTP folder before publishing."
}

$settings = Import-PowerShellDataFile -LiteralPath $SettingsPath
$HostName = [string]$settings.HostName
$RemoteDirValue = [string]$settings.LiveDir
$OriginalMediaDirValue = [string]$settings.OriginalMediaDir
$UseSsl = [string]$settings.UseSsl
$AcceptInvalidCert = [string]$settings.AcceptInvalidCertificate
$vaultName = [string]$settings.VaultName
$secretName = [string]$settings.SecretName

Ensure-Value -Value $HostName -Name "HostName"
Ensure-Value -Value $RemoteDirValue -Name "LiveDir"
Ensure-Value -Value $OriginalMediaDirValue -Name "OriginalMediaDir"
Ensure-Value -Value $vaultName -Name "VaultName"
Ensure-Value -Value $secretName -Name "SecretName"
$RemoteDir = Normalize-RemoteDir $RemoteDirValue
$OriginalMediaDir = Normalize-RemoteDir $OriginalMediaDirValue
$UseSsl = ConvertTo-Bool -Value $UseSsl -Default $true -Name "UseSsl"
$AcceptInvalidCert = ConvertTo-Bool -Value $AcceptInvalidCert -Default $false -Name "AcceptInvalidCertificate"
$null = Get-ProtectedLiveNames

Import-Module Microsoft.PowerShell.SecretManagement -ErrorAction Stop
$ftpCredential = Get-Secret -Name $secretName -Vault $vaultName -ErrorAction Stop
if ($ftpCredential -isnot [System.Management.Automation.PSCredential]) {
  throw "Secret '$secretName' in vault '$vaultName' must be stored as a PSCredential."
}
$script:Username = $ftpCredential.UserName
$script:Password = $ftpCredential.GetNetworkCredential().Password

if ($UseSsl -and $AcceptInvalidCert) {
  Write-Warning "AcceptInvalidCertificate is true. TLS remains enabled, but certificate validation is bypassed for this deploy."
  $script:PreviousCertificateValidationCallback = [Net.ServicePointManager]::ServerCertificateValidationCallback
  [Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archiveRoot = Join-RemotePath -Base $RemoteDir -Child "_archives"

try {
  Write-Host "Preflight: FTPS target $HostName, live directory $RemoteDir, protected originals directory $OriginalMediaDir"
  $null = Get-FtpListing -Path $RemoteDir

  if ($UploadOriginalMedia) {
    Upload-OriginalMediaFiles -ManifestPath $OriginalMediaManifest
    return
  }

  $null = Get-FtpListing -Path $OriginalMediaDir

  if (-not [string]::IsNullOrWhiteSpace($RollbackArchive)) {
    if ($RollbackArchive -match "[/\\]") {
      throw "RollbackArchive must be one archive folder name, such as 20260525-140000."
    }
    $sourceArchive = Join-RemotePath -Base $archiveRoot -Child $RollbackArchive
    $sourceItems = Get-FtpListing -Path $sourceArchive
    if (-not $sourceItems) {
      throw "Rollback archive '$sourceArchive' is empty or unavailable."
    }
    $safetyArchive = Join-RemotePath -Base $archiveRoot -Child "before-rollback-$timestamp"
    Write-Host "Archiving current live files to $safetyArchive before rollback."
    Move-LiveItemsToArchive -ArchiveDir $safetyArchive
    foreach ($item in $sourceItems) {
      Move-RemoteItem -SourcePath (Join-RemotePath -Base $sourceArchive -Child $item.Name) -DestinationPath (Join-RemotePath -Base $RemoteDir -Child $item.Name)
    }
    Write-Host "Rollback completed from $sourceArchive. Pre-rollback live files are in $safetyArchive."
    return
  }

  $resolvedBuildDir = Join-Path $projectRoot $BuildDir
  if (-not $SkipBuild) {
    Write-Host "Building project..."
    Push-Location $projectRoot
    try {
      npm run build
      if ($LASTEXITCODE -ne 0) {
        throw "Build failed."
      }
    }
    finally {
      Pop-Location
    }
  }

  if (-not (Test-Path -LiteralPath $resolvedBuildDir)) {
    throw "Build directory '$resolvedBuildDir' does not exist after build."
  }

  $archiveDir = Join-RemotePath -Base $archiveRoot -Child $timestamp
  if ($UploadOnly) {
    Write-Warning "UploadOnly is enabled. Existing remote files will not be archived before upload."
  }
  else {
    Write-Host "Preparing remote archive folder $archiveDir"
    Move-LiveItemsToArchive -ArchiveDir $archiveDir
  }

  try {
    Upload-BuildOutput -ResolvedBuildDir $resolvedBuildDir
  }
  catch {
    if (-not $UploadOnly) {
      Write-Error "Upload failed after archival began. Recovery archive: $archiveDir. Roll back with: npm run deploy:ftp:rollback -- -RollbackArchive $timestamp"
    }
    throw
  }

  if ($UploadOnly) {
    Write-Host "FTP upload completed. Existing remote files were not archived."
  }
  else {
    Write-Host "FTP deployment completed. Archived previous live files to $archiveDir"
  }
}
finally {
  $script:Password = $null
  if ($null -ne $script:PreviousCertificateValidationCallback) {
    [Net.ServicePointManager]::ServerCertificateValidationCallback = $script:PreviousCertificateValidationCallback
  }
}
