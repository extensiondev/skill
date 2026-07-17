# Building and Publishing

## Production builds

```bash
# Per-browser production build
npm run build -- --browser=chrome,firefox

# Store-ready zip (and source zip where stores require it)
npm run build -- --browser=chrome --zip
npm run build -- --browser=firefox --zip --zip-source
```

Verify the production build behaves before shipping: `npm run start` builds
and launches without HMR, which catches dev-only assumptions (HMR globals,
unhashed asset paths, dev CSP relaxations).

MCP: `extension_build`, `extension_start`, `extension_preview`.

## Zip hygiene

The zip must contain only the built extension. Exclude source control and
project metadata: `.git`, `node_modules`, `.env*`, design docs, store-listing
working files. The `--zip` flag packages `dist/<browser>/` correctly; avoid
hand-zipping the project root.

## Store readiness checklist

Run through this before any submission; each item is a common rejection:

1. Manifest version, name, description, and `version` are final and match the
   listing.
2. Icons exist as real files at 16, 32, 48, and 128 with correct dimensions
   (the store listing keys on 128).
3. Every permission in the manifest has a specific, plain-English
   justification. "Needed for the extension to work" fails review. Good shape:
   "`tabs`: reads the current tab's URL to show per-site settings."
4. No remote code, no `eval()` in extension pages, CSP intact (MV3
   requirement; also checked by Firefox AMO).
5. Listing copy describes user benefits, not implementation. "Highlights
   matching results on the page" rather than "Uses MutationObserver".
6. Screenshots at the Chrome Web Store's accepted sizes: 1280x800 or 640x400.
7. Privacy policy linked if any user data is touched, with disclosures
   matching what the code actually does.
8. Version notes written; version number bumped from the last submission.

Keep listing metadata, permission justifications, privacy disclosures, and
release notes in one tracked document in the repo, so resubmissions do not
reinvent them. Exclude that document from the zip.

## Firefox specifics

- AMO accepts unlisted submissions for self-distribution; useful for testing
  signed builds without a public listing.
- If the build targets MV2 on Firefox (`firefox:manifest_version: 2`), the
  AMO listing and the Chrome listing will differ in manifest claims; that is
  expected and fine.
- Source zip (`--zip-source`) is required by AMO when the build output is
  minified or bundled, which it is here.

## Publishing to extension.dev

The platform has its own publish flow for hosting and distribution:

```bash
# One-time device-code login (GitHub)
extension login        # MCP: extension_login
extension whoami       # MCP: extension_whoami

# Publish the built extension (shareable preview URL)
extension publish      # MCP: extension_publish
```

`extension_logout` signs the session out again. Publishing requires a prior
successful build for the target browser.

## Promoting releases headlessly

Projects released through extension.dev promote tested builds to channels
(stable, preview, beta) without a browser, from CI or an agent session, via
the MCP tool `extension_release_promote` (no `extension` CLI equivalent;
outside an MCP session use the package's own bin,
`extension-mcp release promote --build <sha> --channel <channel>`). Authorization
comes from the `EXTENSION_DEV_TOKEN` environment variable: the project owner
creates a release token in the dashboard (project settings, Access tokens)
and injects it as a CI secret or shell export, and the tool reads it from the
environment only. Never print it, log it, write it to a file, or pass it
inline in a command. The project is identified by the token's claims, so the
caller passes only the build sha and target channel.

Cutting a release (the version-bump PR) stays interactive by design: it
writes to the source repo.
