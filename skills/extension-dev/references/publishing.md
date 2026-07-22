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
9. Firefox: `data_collection_permissions` declared in the manifest and
   matching the privacy disclosures (mandatory for new add-ons; AMO rejects
   without it).

Keep listing metadata, permission justifications, privacy disclosures, and
release notes in a tracked `STORE.md` at the project root, one section per
store, so resubmissions do not reinvent them. The full convention, template,
and maintenance rules live in [store-md.md](store-md.md). Exclude the file
from the zip.

`extension-deploy` reads `STORE.md` automatically and submits the fields the
store APIs accept: Firefox reviewer and release notes, and Edge certification
notes. Chrome listing fields are dashboard-only by store policy and stay
copy-paste.

## Store accounts and credentials

Full walkthroughs with portal paths live on the docs site under
"Publish to the stores" (extension.js.org/docs/publishing). The load-bearing
facts:

Account prerequisites (none of the store APIs can create the first listing
where noted; the first upload is manual):

- Chrome: register at the CWS Developer Dashboard (one-time $5 fee). The API
  cannot create a new item; upload the first zip by hand in the dashboard.
  The 32-character extension ID only exists after that upload.
- Firefox: AMO developer account plus acceptance of the Firefox Add-on
  Distribution Agreement; the API key page stays locked until accepted.
- Edge: Partner Center enrollment in the Microsoft Edge program (free).
  There is no create-product API and the Product ID is always required, so
  the product must be created with a first manual Partner Center submission.

Credential shapes and portals:

- Chrome: publisher UUID (from chrome.google.com/webstore/devconsole/<UUID>)
  plus either a GCP service account JSON (grant its email under dev console >
  Account; preferred, no expiry) or the OAuth trio: Desktop-app client ID
  (`123.apps.googleusercontent.com`), client secret (`GOCSPX-...`), refresh
  token (`1//...`). Mint the refresh token with `npx extension-deploy init`
  (local loopback consent flow). Never recommend the Google OAuth Playground
  for this: it needs a Web-application redirect URI and fails a Desktop-app
  client with redirect_uri_mismatch. If the OAuth consent screen is in
  Testing status, Google revokes the refresh token after 7 days.
- Firefox: JWT issuer (`user:12345678:987`) and JWT secret (64 hex, shown
  once) from addons.mozilla.org/developers/addon/api/key/. Listed channel
  requires an existing add-on GUID. Unlisted with an empty GUID creates a
  NEW add-on; copy the assigned GUID back into the store settings after the
  first submission, or every later empty-GUID submission creates another
  add-on. Set the channel explicitly; an unset channel defaults to listed at
  submit time.
- Edge: Client ID (GUID) and API key from the Partner Center Publish API
  page (partner.microsoft.com/dashboard/microsoftedge/publishapi, "Turn on
  API" / "+ New API key"). This is the current ApiKey model, not an Azure AD
  client secret. Keys expire about every 72 days; rotate before then. The
  Product ID is the lowercase GUID from the product's Extension Identity
  section, not the uppercase public Store ID.

Blast radius: all three stores' API credentials are account-wide, not
per-extension. For multi-client work, keep each client's listings under that
client's own store accounts.

Where they live on the platform track: per project, never per workspace.
Each project's credentials are written as write-only GitHub Actions secrets
on that project's managed mirror repo (STORE_CHROME_*, STORE_FIREFOX_API_KEY/
API_SECRET, STORE_EDGE_CLIENT_ID/CLIENT_SECRET; the Edge CLIENT_SECRET holds
the API key). Identifiers go to the mirror's _extension-dev/settings.json.
Rotation always means re-entering values. Direct mode keeps the same values
in a per-repo `.env.submit` (written by `npx extension-deploy init`, keep out
of git).

## Firefox specifics

- New add-ons (first submission, no existing GUID) must declare
  `browser_specific_settings.gecko.data_collection_permissions` in the
  manifest or AMO rejects the submission; `{"required": ["none"]}` when the
  extension transmits nothing. See the data collection section in
  [cross-browser.md](cross-browser.md).
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
