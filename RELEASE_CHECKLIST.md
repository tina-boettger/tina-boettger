# Release Checklist

Use this checklist whenever the live site is updated.

## Before Release

1. Confirm the intended changes are committed or clearly identified on the current branch.
2. Run `npm run lint` and `npm run build`.
3. Preview changed routes locally, especially pages affected by content, links, downloads, or layout changes.
4. Confirm the deployment targets the configured `LiveDir` and excludes `OriginalMediaDir`.
5. Confirm you are signed in to your Windows account; FTP credentials are retrieved through Windows Credential Manager without a separate publishing password.

## Dry Run

Run this after credential, folder, or deployment-script changes and before the first live release from a new computer:

```powershell
.\scripts\deploy-ftp.ps1 -WhatIf
```

It builds and checks the FTP target while reporting planned moves/uploads without altering live files.

## Real Release

A direct request to publish authorizes a live deployment after validation.

```powershell
.\scripts\deploy-ftp.ps1
```

Record the reported `_archives/<timestamp>` backup folder, then verify:

- `https://tina-boettger.com/`
- `/inner-compass`, `/for-agents`, `/blog`, and the changed page routes
- `/sitemap.xml` and `/robots.txt`
- any changed images or public downloads

## Rollback

If live verification fails, restore the archive reported by the release:

```powershell
.\scripts\deploy-ftp.ps1 -RollbackArchive <timestamp>
```

The rollback preserves the permanent original-media folder and creates its own safety backup of the replaced live files.

The permanent original-media folder is protected from ordinary HTTP access using its own `.htaccess`; verify access remains denied after any hosting configuration change.

## Credential Safety

- Credentials belong only in Windows Credential Manager for the signed-in Windows account.
- Never paste FTP passwords into repository files, GitHub Actions, commit messages, or release logs.
- Delete legacy plaintext credential files and remove the obsolete SecretStore credential after Windows Credential Manager deployment has been validated.
- Request FTP password rotation from the hosting administrator when possible; deleting a saved password alone does not revoke access.
