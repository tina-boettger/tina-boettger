param(
  [string]$HostName = $env:FTP_HOST,
  [string]$Username = $env:FTP_USERNAME,
  [string]$Password = $env:FTP_PASSWORD,
  [string]$RemoteDir = $env:FTP_REMOTE_DIR,
  [string]$UseSsl = $env:FTP_USE_SSL,
  [string]$AcceptInvalidCert = $env:FTP_ACCEPT_INVALID_CERT,
  [string]$BuildDir = "dist",
  [switch]$SkipBuild,
  [switch]$WhatIf
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

  $trimmed = $Value.Trim()
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
    [bool]$Default
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
    default { throw "Invalid FTP_USE_SSL value '$Value'. Use true or false." }
  }
}

function Join-RemotePath {
  param(
    [string]$Base,
    [string]$Child
  )

  $normalizedBase = Normalize-RemoteDir $Base
  $normalizedChild = $Child.TrimStart("/")
  if ([string]::IsNullOrWhiteSpace($normalizedChild)) {
    return $normalizedBase.TrimEnd("/")
  }

  return ($normalizedBase.TrimEnd("/") + "/" + $normalizedChild)
}

function ConvertTo-FtpUriPath {
  param([string]$Path)

  if ([string]::IsNullOrWhiteSpace($Path) -or $Path -eq "/") {
    return "/"
  }

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
    }
  }

  $unixMatch = [regex]::Match($trimmed, "^(?<type>[dl-])[rwxstST-]{9}\s+\d+\s+\S+\s+\S+\s+\d+\s+\S+\s+\d+\s+(?:[\d:]{4,5}|\d{4})\s+(?<name>.+)$")
  if ($unixMatch.Success) {
    return [pscustomobject]@{
      Name = $unixMatch.Groups["name"].Value
      IsDirectory = $unixMatch.Groups["type"].Value -eq "d"
    }
  }

  $name = $trimmed
  return [pscustomobject]@{
    Name = $name
    IsDirectory = $false
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
  Invoke-Ftp -Path $RemotePath -Method ([System.Net.WebRequestMethods+Ftp]::UploadFile) -Body $bytes | Out-Null
}

Ensure-Value -Value $HostName -Name "FTP_HOST"
Ensure-Value -Value $Username -Name "FTP_USERNAME"
Ensure-Value -Value $Password -Name "FTP_PASSWORD"
$RemoteDir = Normalize-RemoteDir $RemoteDir
$UseSsl = ConvertTo-Bool -Value $UseSsl -Default $true
$AcceptInvalidCert = ConvertTo-Bool -Value $AcceptInvalidCert -Default $false

if ($UseSsl -and $AcceptInvalidCert) {
  Write-Warning "FTP_ACCEPT_INVALID_CERT is true. TLS encryption remains enabled, but certificate trust/hostname validation is bypassed for this deploy."
  $script:PreviousCertificateValidationCallback = [Net.ServicePointManager]::ServerCertificateValidationCallback
  [Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
}

$projectRoot = Split-Path -Parent $PSScriptRoot

try {
  $resolvedBuildDir = Join-Path $projectRoot $BuildDir
  if (-not (Test-Path $resolvedBuildDir)) {
    throw "Build directory '$resolvedBuildDir' does not exist."
  }

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

  if (-not (Test-Path $resolvedBuildDir)) {
    throw "Build directory '$resolvedBuildDir' does not exist after build."
  }

  $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $archiveRoot = Join-RemotePath -Base $RemoteDir -Child "_archives"
  $archiveDir = Join-RemotePath -Base $archiveRoot -Child $timestamp

  Write-Host "Preparing remote archive folder $archiveDir"
  if (-not $WhatIf) {
    Ensure-RemoteDirectory -Path $archiveDir
  }

  $rootItems = Get-FtpListing -Path $RemoteDir
  $itemsToArchive = $rootItems | Where-Object { $_.Name -notin @("_archives", ".", "..") }
  foreach ($item in $itemsToArchive) {
    $source = Join-RemotePath -Base $RemoteDir -Child $item.Name
    $destination = Join-RemotePath -Base $archiveDir -Child $item.Name
    Move-RemoteItem -SourcePath $source -DestinationPath $destination
  }

  Write-Host "Uploading build output from $resolvedBuildDir"
  $localItems = Get-ChildItem -Path $resolvedBuildDir -Force
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
        $relative = $_.FullName.Substring($resolvedBuildDir.Length).TrimStart("\")
        $relativeRemote = ($relative -replace "\\", "/")
        $destination = Join-RemotePath -Base $RemoteDir -Child $relativeRemote
        $destinationDir = Split-Path $destination -Parent
        if (-not $WhatIf) {
          Ensure-RemoteDirectory -Path $destinationDir
        }
        Upload-File -LocalPath $_.FullName -RemotePath $destination
      }
    }
    else {
      Upload-File -LocalPath $item.FullName -RemotePath $remotePath
    }
  }

  if ($indexFile) {
    $remoteIndex = Join-RemotePath -Base $RemoteDir -Child "index.html"
    Upload-File -LocalPath $indexFile.FullName -RemotePath $remoteIndex
  }

  Write-Host "FTP deployment completed. Archived previous live files to $archiveDir"
}
finally {
  if ($null -ne $script:PreviousCertificateValidationCallback) {
    [Net.ServicePointManager]::ServerCertificateValidationCallback = $script:PreviousCertificateValidationCallback
  }
}
