# Tina Boettger Website

Personal website for Tina Boettger with a routed Inner Compass subpage and agent-readable metadata assets.

## Local Development

1. Install dependencies:
   `npm.cmd install`

2. Start the development server:
   `npm.cmd run dev`

3. Open:
   `http://localhost:3000/`

## Build For FTP Upload

1. Build the static site:
   `npm.cmd run build`

2. Upload only the contents of the `dist` folder to the web root of the FTP server.

Do not upload `src`, `node_modules`, old source folders, scan files, or the project root itself. The server only needs the built HTML, CSS, JavaScript, images, and public files inside `dist`.

## Direct FTP Deploy From Codex

This repo now includes a local deployment script that can run from Codex on this machine and deploy straight to your FTP folder while archiving the current live files inside that same remote folder.

1. Set these environment variables in PowerShell:
   `$env:FTP_HOST = "frog.schelm-net.de"`
   `$env:FTP_USERNAME = "..."`
   `$env:FTP_PASSWORD = '...'`
   `$env:FTP_REMOTE_DIR = "/"`
   `$env:FTP_USE_SSL = "true"`
   `$env:FTP_ACCEPT_INVALID_CERT = "false"`

2. Run:
   `npm run deploy:ftp`

The script will:
- build the site
- create a remote `_archives/<timestamp>/` folder
- move everything in the current remote root except `_archives` into that archive folder
- upload the fresh `dist` contents back into the live folder
- upload `index.html` last to reduce half-deployed moments

`FTP_USE_SSL` defaults to `true` because many hosts require explicit FTPS. The script still uses `ftp://` URLs; it enables TLS on the FTP control channel instead of switching to SFTP.

If your host presents a certificate Windows cannot validate, first check whether the FTP host name should be changed to the certificate's real host name. If the host confirms this is expected, you can opt in with `$env:FTP_ACCEPT_INVALID_CERT = "true"`. This keeps FTPS encryption enabled but skips certificate trust and hostname validation for the deploy process.

Use this dry-run command first if you want to verify the flow without making remote changes:
`powershell -ExecutionPolicy Bypass -File .\scripts\deploy-ftp.ps1 -SkipBuild -WhatIf`

If a deploy was interrupted after archiving, use upload-only recovery to put the current `dist` files back into the live folder without archiving the partial state again:
`powershell -ExecutionPolicy Bypass -File .\scripts\deploy-ftp.ps1 -UploadOnly`

## GitHub Build Artifact

The repo now includes a GitHub Actions workflow at [.github/workflows/build-release-package.yml](.github/workflows/build-release-package.yml).

On every push to `main`, GitHub will:
- install dependencies
- build the site
- zip the contents of `dist`
- upload `site-dist.zip` as a workflow artifact

That gives you a clean packaged build in GitHub even if the live deploy still happens from Codex over FTP.

For the human-safe version of publishing, follow [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).

## Route Support

The build includes an Apache `.htaccess` file so direct links like `/inner-compass` can load the React app on standard Apache hosting. Keep `.htaccess` when uploading to FTP.
