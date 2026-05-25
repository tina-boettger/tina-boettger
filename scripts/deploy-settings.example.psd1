@{
  # Copy this file to deploy-settings.local.psd1 after confirming server folders.
  HostName                 = "frog.schelm-net.de"
  LiveDir                  = "/"
  OriginalMediaDir         = "" # Must be a protected folder that routine releases never replace.
  UseSsl                   = $true
  AcceptInvalidCertificate = $false
  CredentialTarget         = "tina-boettger.com/ftp"
}
