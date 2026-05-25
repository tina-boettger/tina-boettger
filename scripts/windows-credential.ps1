if (-not ("WebsiteWindowsCredential" -as [type])) {
  Add-Type -TypeDefinition @"
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Text;

public static class WebsiteWindowsCredential
{
    private const int GenericCredential = 1;
    private const int PersistLocalMachine = 2;

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    private struct CREDENTIAL
    {
        public int Flags;
        public int Type;
        public string TargetName;
        public string Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public int CredentialBlobSize;
        public IntPtr CredentialBlob;
        public int Persist;
        public int AttributeCount;
        public IntPtr Attributes;
        public string TargetAlias;
        public string UserName;
    }

    [DllImport("Advapi32.dll", EntryPoint = "CredWriteW", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool CredWrite([In] ref CREDENTIAL credential, int flags);

    [DllImport("Advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool CredRead(string target, int type, int flags, out IntPtr credentialPtr);

    [DllImport("Advapi32.dll", EntryPoint = "CredDeleteW", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern bool CredDelete(string target, int type, int flags);

    [DllImport("Advapi32.dll", SetLastError = true)]
    private static extern void CredFree(IntPtr credentialPtr);

    public static void Write(string target, string userName, string password)
    {
        byte[] secret = Encoding.Unicode.GetBytes(password);
        if (secret.Length > 5120) {
            throw new ArgumentException("Credential password exceeds the Windows Credential Manager size limit.");
        }

        IntPtr blob = Marshal.AllocCoTaskMem(secret.Length);
        try {
            Marshal.Copy(secret, 0, blob, secret.Length);
            CREDENTIAL credential = new CREDENTIAL {
                Type = GenericCredential,
                TargetName = target,
                CredentialBlobSize = secret.Length,
                CredentialBlob = blob,
                Persist = PersistLocalMachine,
                UserName = userName
            };
            if (!CredWrite(ref credential, 0)) {
                throw new Win32Exception(Marshal.GetLastWin32Error());
            }
        }
        finally {
            Array.Clear(secret, 0, secret.Length);
            Marshal.FreeCoTaskMem(blob);
        }
    }

    public static string[] Read(string target)
    {
        IntPtr credentialPtr;
        if (!CredRead(target, GenericCredential, 0, out credentialPtr)) {
            int error = Marshal.GetLastWin32Error();
            if (error == 1168) {
                return null;
            }
            throw new Win32Exception(error);
        }

        try {
            CREDENTIAL credential = (CREDENTIAL)Marshal.PtrToStructure(credentialPtr, typeof(CREDENTIAL));
            string password = Marshal.PtrToStringUni(credential.CredentialBlob, credential.CredentialBlobSize / 2);
            return new string[] { credential.UserName, password };
        }
        finally {
            CredFree(credentialPtr);
        }
    }

    public static void Delete(string target)
    {
        if (!CredDelete(target, GenericCredential, 0)) {
            int error = Marshal.GetLastWin32Error();
            if (error != 1168) {
                throw new Win32Exception(error);
            }
        }
    }
}
"@
}

function Get-WebsiteWindowsCredential {
  param([Parameter(Mandatory = $true)][string]$Target)

  $values = [WebsiteWindowsCredential]::Read($Target)
  if ($null -eq $values) {
    throw "No Windows credential was found for '$Target'. Run npm run ftp:setup-credential first."
  }

  $securePassword = ConvertTo-SecureString -String $values[1] -AsPlainText -Force
  try {
    return New-Object System.Management.Automation.PSCredential($values[0], $securePassword)
  }
  finally {
    $values[1] = $null
  }
}

function Set-WebsiteWindowsCredential {
  param(
    [Parameter(Mandatory = $true)][string]$Target,
    [Parameter(Mandatory = $true)][System.Management.Automation.PSCredential]$Credential
  )

  $password = $Credential.GetNetworkCredential().Password
  try {
    [WebsiteWindowsCredential]::Write($Target, $Credential.UserName, $password)
  }
  finally {
    $password = $null
  }
}

function Remove-WebsiteWindowsCredential {
  param([Parameter(Mandatory = $true)][string]$Target)

  [WebsiteWindowsCredential]::Delete($Target)
}
