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

MCP: `extension_build`, `extension_start`.

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

A submission reads `STORE.md` automatically and sends the fields the store
APIs accept: Firefox reviewer and release notes, and Edge certification
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
  Account; preferred, no expiry, and nothing has to be minted) or the OAuth
  trio: Desktop-app client ID (`123.apps.googleusercontent.com`), client
  secret (`GOCSPX-...`), refresh token (`1//...`). The refresh token comes
  from a local loopback consent flow against that Desktop-app client. Never
  recommend the Google OAuth Playground for this: it needs a Web-application
  redirect URI and fails a Desktop-app client with redirect_uri_mismatch. If
  the OAuth consent screen is in Testing status, Google revokes the refresh
  token after 7 days. Prefer the service account and skip the trio.
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

Where they live: per project, never per workspace. Credentials are entered
once in the extension.dev console under the project's store settings, and the
platform writes them as write-only GitHub Actions secrets on that project's
managed mirror repo (STORE_CHROME_*, STORE_FIREFOX_API_KEY/API_SECRET,
STORE_EDGE_CLIENT_ID/CLIENT_SECRET; the Edge CLIENT_SECRET holds the API
key). Identifiers go to the mirror's _extension-dev/settings.json. Rotation
always means re-entering values. Credentials are never tool arguments and
never leave the console, so no submission command takes one.

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
# One-time device login: approve the printed code at extension.dev/device
npx @extension.dev/mcp login --project <workspace>/<project>   # MCP: extension_auth action:login
npx @extension.dev/mcp whoami                                  # MCP: extension_auth action:status

# Publish the built extension (shareable preview URL)
EXTENSION_DEV_TOKEN=<token> extension publish   # MCP: extension_publish
```

Login is a two-phase RFC 8628 device flow hosted by extension.dev itself: the
first call returns a user code plus `extension.dev/device`, the user approves
it there in a browser signed in to extension.dev, and the second call stores a
project-scoped token that lives at most 7 days. GitHub is federated
server-side, so no GitHub token ever lands on the developer's machine, and
there is no github.com step to send the user to. `extension_auth` with
`action: "logout"` signs the session out again. Publishing requires a prior
successful build for the target browser.

Token pickup differs by surface: the MCP tool `extension_publish` reads
`EXTENSION_DEV_TOKEN` first and falls back to the stored device login, so it
needs nothing after `extension_auth`. The `extension publish` CLI never reads
the stored login; give it `--token` or `EXTENSION_DEV_TOKEN`. There is no
`extension login`; device login lives in the MCP package only.

`extension_auth` can only sign in to a project that already exists. If the
extension has no extension.dev project yet, push the source to GitHub first,
then call `extension_project_create`, then `extension_auth`. In that order,
and never the reverse: logging in first just fails against a project that is
not there.

## Sharing a build before it ships

`extension_preview_web` with `share: true` uploads the build and returns a
link that opens the extension in a web emulator: no install, no sign-in, no
dev server on the other end. It is the way to show a build to a reviewer, a
client, or a teammate, and it is the only lane of that tool that works from
an npm install of the MCP server. Without `share: true` the tool returns a
`preview://build` deep link that resolves only against a local
preview.extension.dev dev server, which is for people developing
extension.dev itself.

Say what a share does before making one: it also serves the build as a zip,
so the recipient gets the built code, not just a rendering of it. Read the
`share` property of the response back to the user.

`extension_shares` is the other half, and the reason a share is not a
one-way door:

- `action: "list"` returns every share the token owns, live and dead, with
  its `artifactId`, `previewUrl`, `zipUrl`, `revokeUrl` and expiry, so a link
  whose response was lost is findable again.
- `action: "revoke"` kills one permanently, by `artifactId` or by any URL of
  the share. The link you sent someone is enough to pull it back.
- `attribution.ownership` says who may revoke: `project` means any workspace
  member can, `personal` means one person holds it alone, `unknown` means no
  owner was disclosed. Read `attribution.credit` as credit only, never as
  access.

Never share a build and leave the session without recording the link. If it
is already lost, `extension_shares` with `action: "list"` is the recovery
path, not a support ticket.

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

## Submitting to the stores through extension.dev

`extension_submit` is the tool for store review. It is the most consequential
call in this document and the least reversible, so read this section before
using it.

What it does: submits a built commit for review at the Chrome Web Store,
Firefox AMO, Edge Add-ons and the App Store (Safari). The platform holds the
store credentials and dispatches from the project's mirror CI, so no
credential is ever an argument and no local file is uploaded. There is no
`extension` CLI equivalent.

What it is not: it does not push a build to the extension.dev platform and it
does not make a shareable link. Those are `extension_publish` and
`extension_preview_web`. When a user says "deploy", "ship" or "release", they
almost always mean publish. Reach for `extension_submit` only when the ask is
explicitly a store submission.

```text
extension_submit
  browsers: ["chrome", "firefox"]   required
  buildSha: <built commit sha>      required; from extension_release_status
  channel:  stable                  default
  dryRun:   true                    DEFAULT. false dispatches, irreversibly.
```

How to use it safely:

1. **Dry run first, always.** `dryRun` defaults to `true` and dispatches
   nothing. The platform checks auth, project, build and store workflow, and
   the tool adds a per-store credential-health verdict on top. Trust the
   per-store rows over the platform's bare preflight line, which does not
   check store health.
2. **Read every row before passing `dryRun: false`.** A row reading NOT
   actionable means that store would fail. A row reading cannot be verified
   means the check could not read the project's store configuration, not that
   the store is fine.
3. **`dryRun: false` is a one-way door.** It enters store review. Confirm
   with the user in the same breath as calling it; never pass it because a
   dry run looked good.
4. **The build sha must already exist.** An unknown sha is rejected. Get one
   from `extension_release_status`, never from `git rev-parse` and hope.
5. **Store publish mode is invisible from here.** Whether a store is set to
   draft, skip-publish or live is not readable with a CLI token, so the tool
   says so instead of guessing. Check it in the console.
6. **Safari is a paid lane.** A free workspace is refused for the App Store;
   the other three stores are unaffected by that refusal.

The tool also reads the project's `STORE.md` and warns when Firefox reviewer
notes or Edge certification notes are missing. Trust that advisory: the
parser is a pinned port of the one the real submission uses, held to it by a
test that replays both over the same corpus, so a warning here means a
missing field there. One caveat it states itself: the submission reads
`STORE.md` from the project's source repository at the built commit, so an
uncommitted or unpushed edit does not travel with it.

## Reading where a project stands

`extension_release_status` reads the project's state from the public registry
and is read-only: it dispatches nothing and promotes nothing, so it is always
safe to call.

- `include: ["releases"]` returns the release channels (channel to promoted
  build sha), recent builds, and a public build-page URL for each. **This is
  where a valid sha for `extension_release_promote`, `extension_submit` or
  `extension_publish` comes from.**
- `include: ["stores"]` returns the per-store picture after a submission:
  configured or not, the last credential health check, the last recorded
  submission, and the latest review status. This is how "was it approved?"
  gets answered without opening the console.

Both are included by default. It reads the logged-in project unless you pass
`workspace` and `project`. Registry state can lag the store dashboards by up
to a polling interval, so a status that has not moved yet is not a failure.
