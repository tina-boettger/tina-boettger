# Tina Boettger Website

Personal website for Tina Boettger with routed Inner Compass and blog pages, agent-readable metadata assets, and a guarded FTP release workflow.

## First-Time Computer Setup

Required local tools:

- Git for Windows with Git Credential Manager
- Node.js 24 LTS and npm
- Visual Studio Code if editing files manually
- PowerShell modules `Microsoft.PowerShell.SecretManagement` and `Microsoft.PowerShell.SecretStore`

Install project dependencies and confirm the project builds:

```powershell
npm ci
npm run lint
npm run build
```

Start the local site:

```powershell
npm run dev
```

Open `http://localhost:3000/`.

This checkout currently lives in OneDrive. `node_modules` and `dist` are generated working folders and are excluded from Git. Do not keep original media archives or other permanent large files in this project folder.

## Normal Change Workflow

1. Create a branch for changes rather than editing directly on `main`.
2. Edit and preview locally.
3. Run `npm run lint` and `npm run build`.
4. Push the branch and use GitHub checks before merging to `main`.
5. Publish to FTP only after an explicit publish request.

GitHub builds pull requests for verification. Pushes to `main` also produce a `site-dist.zip` workflow artifact; they do not deploy the live site automatically.

## Secure FTP Setup

FTP credentials must be stored in the password-protected PowerShell SecretStore vault. Do not use plaintext `.env`, `.env.deploy.ps1`, password text files, GitHub Actions secrets, or committed credentials for this deployment.

1. Confirm two FTP directories with the hosting setup:

   - `LiveDir`: the public website folder replaced during publication.
   - `OriginalMediaDir`: a protected source-image folder that is retained across releases and is not publicly served where the host supports that.

2. Copy `scripts/deploy-settings.example.psd1` to `scripts/deploy-settings.local.psd1` and fill in only non-secret settings. The local settings file is ignored by Git.

3. Store the FTP login in the local encrypted vault:

```powershell
npm run ftp:setup-secret
```

You will choose a SecretStore vault password and enter the FTP credentials. The vault is configured to request its password again for later publishing sessions.

Deleting an old plaintext credential file does not invalidate the password. Ask the hosting administrator to rotate the FTP password when possible.

## Permanent Original Media Storage

The project contains a one-time manifest at `scripts/original-media-manifest.txt` for source-quality images that should be preserved on FTP but not shipped with every site release.

Only after `OriginalMediaDir` has been confirmed as a suitable protected location, upload and verify those originals:

```powershell
npm run ftp:archive-originals
```

After successful verification, unused originals can be removed from `public`; routine site deployments will then contain only visitor-facing optimized assets. The deployment script protects `OriginalMediaDir` from release archival and replacement.

## Publishing

Build and perform a non-mutating FTP preflight first:

```powershell
npm run deploy:ftp:dry-run
```

Publish the current checked-out code:

```powershell
npm run deploy:ftp
```

The publish script:

- unlocks and reads FTP credentials from SecretStore
- verifies `LiveDir` and `OriginalMediaDir` are separate
- builds the site before looking for `dist`
- archives current live files in `LiveDir/_archives/<timestamp>/`
- leaves the protected original-media directory untouched
- uploads the new build and uploads `index.html` last

If an upload fails after archival begins, the command reports the archive identifier needed for rollback.

## Rollback

Restore one live-site archive without changing the protected original-media directory:

```powershell
npm run deploy:ftp:rollback -- -RollbackArchive 20260525-140000
```

Rollback first creates a safety archive of the current live files, then moves the selected archive back into place.

## Routes And Hosting

The build creates static entry files for public routes and includes an Apache `.htaccess` fallback so direct links such as `/inner-compass` work on standard Apache FTP hosting. Keep `.htaccess` in deployed output.
