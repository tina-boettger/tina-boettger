# Release Checklist

Use this list each time you want to publish without surprises.

## Before Release

1. Run `npm run build`
2. Quickly open the local preview if you changed layout or content heavily
3. Confirm the FTP target folder is the live folder you actually want to replace
4. Keep your FTP client open in case you want to inspect `_archives` right after deploy

## Safe Test

Run a dry run first whenever the FTP settings changed:

`powershell -ExecutionPolicy Bypass -File .\scripts\deploy-ftp.ps1 -SkipBuild -WhatIf`

That shows what would be moved and uploaded without touching the server.

## Real Release

1. Set the FTP environment variables
2. Run `npm run deploy:ftp`
3. Wait until the script says the deploy completed
4. Open the live site and test the homepage and one or two important subpages

## Rollback

If the release looks wrong:

1. Connect with your FTP client
2. Open the remote `_archives` folder
3. Find the newest timestamped backup
4. Move the broken live files out of the way
5. Move the archived files back into the live folder

## GitHub Role

GitHub is the safe home for the code.

- Push code there first
- Let GitHub build `site-dist.zip`
- Use Codex to deploy the current code to FTP when you are ready

