# Release Checklist

Use this checklist whenever the live site is updated.

## Before Release

1. Confirm the intended changes are committed or clearly identified on the current branch.
2. Run `npm run lint` and `npm run build`.
3. Preview changed routes locally, especially pages affected by content, links, downloads, or layout changes.
4. Confirm the deployment targets the configured `LiveDir` and excludes `OriginalMediaDir`.
5. Unlock SecretStore only for the publishing session.

## Dry Run

Run this after credential, folder, or deployment-script changes and before the first live release from a new computer:

```powershell
npm run deploy:ftp:dry-run
```

It builds and checks the FTP target while reporting planned moves/uploads without altering live files.

## Real Release

A direct request to publish authorizes a live deployment after validation.

```powershell
npm run deploy:ftp
```

Record the reported `_archives/<timestamp>` backup folder, then verify:

- `https://tina-boettger.com/`
- `/inner-compass`, `/for-agents`, `/blog`, and the changed page routes
- `/sitemap.xml` and `/robots.txt`
- any changed images or public downloads

## Rollback

If live verification fails, restore the archive reported by the release:

```powershell
npm run deploy:ftp:rollback -- -RollbackArchive <timestamp>
```

The rollback preserves the permanent original-media folder and creates its own safety backup of the replaced live files.

## Credential Safety

- Credentials belong only in the local password-protected SecretStore vault.
- Never paste FTP passwords into repository files, GitHub Actions, commit messages, or release logs.
- Delete legacy plaintext credential files once the vault-backed deploy has been validated.
- Request FTP password rotation from the hosting administrator when possible; deleting a saved password alone does not revoke access.
