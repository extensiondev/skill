# STORE.md: One Store Metadata File for Every Store

`STORE.md` is a single tracked file at the project root that holds everything
the stores will ask for at submission time: listing copy, permission
justifications, privacy disclosures, version history, and per-store notes.
Cross-browser extensions submit to several stores; this file is the one place
where that paperwork lives, so resubmissions never reinvent it.

It has a second job: a store submission through extension.dev reads it
automatically and attaches the fields the store APIs accept. Everything else
stays a copy-paste reference for the dashboard forms.

## When to create it

The starter already exists at project creation: every template ships a
`STORE.md` with each store's rows as unfilled lines, and a project made with
`extension_project_create` carries one. Fill it from the first commit on,
and create it the moment publishing intent appears when a project has none:

- The user says they want to publish or "get ready for the store".
- A new extension is clearly headed for a store.
- The user asks about listing requirements or review.

Do not wait for the submission itself. The file earns its keep by being
maintained while the code changes, not written in a scramble at the end.
Two values are decided once and never change on the store, so write them at
creation: `browser_specific_settings.gecko.id` in the manifest (Firefox
assigns one on the first upload when absent, and the next build without it
reads as a new add-on) and the Safari bundle id in `extension.config.js`
(`browser.safari.bundleId`, permanent once an app record uses it).

## Structure

One `##` section per store, shared material above them. Store sections are
matched by heading text, so `## Firefox Add-ons`, `## firefox-amo`, and
`## AMO` all work; the same goes for Chrome and Edge.

```markdown
# Store metadata

Last updated: 2026-07-20

## Listing

Name, one-line summary, long description, category, screenshot list.
Write user benefits, not implementation. "Highlights matching results
on the page", never "Uses MutationObserver".

## Privacy and data use

What is collected, stored, or transmitted, and the privacy policy URL.
Must match what the code actually does AND the manifest's Firefox
data_collection_permissions declaration (see cross-browser.md).

## Chrome Web Store

- Visibility: unlisted

### Permissions justification

- tabs: reads the current tab URL to show per-site settings.
- storage: persists user preferences locally.
- Host access to example.com (a content script on that site only): reads
  the page title to show it in the popup.

### Single purpose

One sentence stating the extension's single purpose.

## Firefox Add-ons

### Reviewer notes

Test credentials and the steps a reviewer needs to exercise the
extension. Include build-from-source instructions when the zip is
minified (it is; AMO requires the sources zip).

### Release notes

User-facing notes for this version.

## Edge Add-ons

### Certification notes

Anything the certification team needs to test the extension.

## Version history

- 1.2.0 (2026-07-20): added per-site settings. Submitted to all three.
- 1.1.0 (2026-07-01): rejected on AMO for a vague tabs justification;
  fixed by naming the exact data read.
```

## What the listing reader takes

`extension_submit` `sync-listing` and the preflight advisory read the
`## Listing` section as `- Key: value` bullets (keys are case-insensitive;
aliases in parentheses). A trailing parenthetical note is kept out of the
value, so `- Category: Privacy & Security (Chrome Web Store)` reads as
`Privacy & Security`. A value that starts with `TODO` counts as absent.
Screenshots and the icon are never read from this file: the icon comes from
the build the store receives, and screenshots reach the per-store listing
record only through the Screenshots door below. A `- Screenshots:` line is
reported as skipped and read for no file.

| Line | Stores | Limit and shape |
| --- | --- | --- |
| `- Name:` (`Title`) | all | 100 characters |
| `- Summary:` (`Short description`) | all | 250 characters |
| `- Description:` (`Long description`, `Full description`) | all | indented paragraphs below the bullet; 16,000 characters |
| `- Category:` (`Categories`) | all | one name for every store, or `<name> (Chrome), <name> (Firefox)` per store; up to 5 |
| `- License:` | Firefox | 100 characters |
| `- Support email:` | all | an email address |
| `- Homepage:` (`Website`, `Homepage URL`) | all | an http or https URL |
| `- Search terms:` (`Keywords`, `Tags`) | Edge | comma list, up to 16 |
| `- Visibility:` (under `## Chrome Web Store`) | Chrome | public, unlisted or private (trusted testers); unlisted when absent |

Under `## Privacy and data use`: `- Privacy policy URL:` (every store). A
line that is present but unreadable (a category naming only two stores, a
support email that is not an address, a value over its limit) makes the
preflight name the exact shape it takes instead of saying "not in STORE.md".

## The bring list

Every store demands the inputs below before a review goes through. The
platform derives what the extension already contains (icon sizes, emulator
captures, the source archive, the package scan) and authors nothing;
everything else the owner brings. `extension_submit` `preflight` answers the
list per store, free and without writing anything:

- `value.stores.<store>.requirements`: the store's own rows, each with
  `status` have, missing or unknown, the store's size, count or character
  limit in `format`, its documentation link in `docs`, and the STORE.md
  line, file, store setting or dashboard tab that satisfies it.
- `value.stores.<store>.bringList`: the same rows with `supply` "from your
  build" or "you supply", `clearedBy` naming the exact door that clears the
  row, `decideOnce` on the rows a store never lets you change, and
  `neverPrefilled` on every privacy or data answer; `say` is the paragraph
  to read to the person.
- `value.stores.<store>.readyForReview`: true only when no required row is
  missing.

Read the bring list to the person at project creation and before the first
review send, in the store's own numbers. The draft upload never waits on
it: Chrome and Edge drafts do not enter review, a Firefox unlisted upload
is signed without a listing, and a Safari upload stops at App Store Connect
before App Review. Only Send to review is refused on a missing required row.

**Privacy answers are never prefilled.** Chrome's data use certification and
remote code answer, Firefox's `data_collection_permissions`, Edge's personal
information and mature content answers, Apple's App Privacy labels: the
preflight says the row is empty and where it is answered, and never proposes
a value. A derived "none" pasted into a store is a policy strike against the
owner's account. Owner-written or absent.

**Decide-once rows.** `firefox.add_on_id` (`browser_specific_settings.gecko.id`),
`safari.bundle_identifiers`, the App Store name, the Chrome item, the Edge
product and the app record are created once by hand where the store demands
it and recorded once in store settings; the bring list marks them
`decideOnce`.

### The Screenshots door

Images are not text, so they never live in `STORE.md`. One 1280x800 24-bit
PNG satisfies every store's screenshot row at once:

1. `extension_screenshot` with `forStore: "chrome"` (or firefox, edge,
   safari) on an open surface or page in a live session captures at that
   store's accepted size (1280x800 unless `width` and `height` name another
   the store takes) at a 1x pixel ratio, flattens the alpha channel on this
   machine, and answers `value.forStore.clears` with the reason when the
   file does not clear the row. Pass `path: "store/screenshots/popup.png"`
   to keep the file tracked.
2. `extension_submit` `sync-listing` with `screenshots: [<paths>]` writes
   the files to the store's listing record on extension.dev beside the
   STORE.md text, behind the same owner approval as the text; the answer's
   `value.stores.<store>.images` names the rows the images clear and the
   image rows that remain, read back from the platform.

The Safari push uploads the record's screenshots to App Store Connect;
Chrome's go into `pasteInDashboard` (Google's API takes no listing); AMO and
Partner Center take them on their own sites. The console's "Add screenshots"
verb writes the same record.

### Send to review refused

When the platform refuses a review send with `409 LISTING_INCOMPLETE`, before
any approval is minted or spent, `extension_submit` answers
`listing-incomplete` with `value.missing` (the rows in the store's words),
`value.bringList`, the store's console page in `value.trackUrl` and
`nextStep` `screenshot` or `sync-listing`. Say exactly that: nothing was
sent to review, no approval was spent and no submission was recorded. Never
tell the person the submission is on its way.

## What each store asks for

The console's submission page and store card render the same rows as "What
<store> asks for". Required inputs first; the console, the store's dashboard
or a store setting take the ones no STORE.md line can; screenshots go
through the Screenshots door.

| Store | Required | Optional |
| --- | --- | --- |
| Chrome Web Store | Connected developer account and the item created once on the dashboard (console); `- Name:` (up to 75 characters); `- Summary:` (up to 132); `- Description:` (up to 16,000); `- Category:`; store icon (128x128 px PNG, 96x96 artwork inside a 16 px transparent margin, from the manifest icons); screenshots (1 to 5, 1280x800 or 640x400 px, JPEG or 24-bit PNG, no alpha; the Screenshots door); `### Single purpose`; `### Permissions justification` (one reason per permission and per host, content script matches included); data usage disclosures and the remote code answer (dashboard Privacy tab); language (dashboard Store listing tab); `- Visibility:` (dashboard Distribution tab; a new item starts Public) | `- Privacy policy URL:` (required when the extension handles user data); `- Homepage:`; small promo tile 440x280 px, marquee promo tile 1400x560 px and a YouTube URL (dashboard); test instructions (dashboard Test instructions tab) |
| Firefox Add-ons | AMO JWT issuer and secret (console); `browser_specific_settings.gecko.id` in the manifest (decide once); distribution channel (store setting; unset reads as unlisted); `data_collection_permissions` in the manifest (never prefilled); source code archive for a bundled build (store setting) with the build steps in `### Reviewer notes`; `### Reviewer notes`; `- Name:` (up to 50); `- Summary:` (up to 250); `- Description:`; `- Category:` (1 to 2); `- License:`; `- Support email:`; add-on icon (128x128 px or larger, from the manifest icons) | screenshots (1280x800 px reads best; the Screenshots door); `- Homepage:`; `- Privacy policy URL:` (required when the add-on collects or transmits user data); `### Release notes` |
| Edge Add-ons | Publish API client id and key and the product created once by hand (console); `- Name:` (up to 45, from the manifest); `- Summary:` (up to 250); `- Description:` (up to 10,000); `- Category:`; store logo 300x300 px PNG (Partner Center, resized on this machine from the largest manifest icon); screenshots (up to 10, 640x480 or 1280x800 px; at least 1 here; the Screenshots door); `- Support email:`; privacy policy requirements and mature content (Partner Center) | `- Privacy policy URL:` (mandatory when the extension handles personal information); `- Homepage:`; `- Search terms:` (up to 7); `### Certification notes`; small 440x280 px and large 1400x560 px promotional tiles and a YouTube URL (Partner Center) |
| App Store (Safari) | App Store Connect API key with the App Manager role (console); two bundle identifiers, `<bundle id>` and `<bundle id>.extension` (store setting; decide once); two distribution certificates and two provisioning profiles (console: Mint signing assets); the app record created once on the App Store Connect website (name, primary language, bundle ID, SKU); `- Name:` (up to 30); `- Description:` (up to 4,000); `- Category:` (error 90242 without it); support URL (the project's feedback URL); `- Privacy policy URL:` (every app); screenshots (1 to 10 macOS screenshots at exactly 1280x800, 1440x900, 2560x1600 or 2880x1800 px, RGB with no alpha channel, showing the extension running in Safari; the Screenshots door); app icon (1024x1024 px, stamped from the largest manifest icon); age rating (none by default, `### Age rating` bullets override); content rights (listing push); `- Review contact name|email|phone:` and `### Reviewer notes` under `## Safari`; App Privacy answers (App Store Connect only); price and availability (listing push) | `- Summary:` as the subtitle (up to 30); `- Search terms:` as keywords (up to 100 characters); `- Homepage:` as the marketing URL; `### Release notes` as What's New |

## What gets submitted automatically

At submission time these fields are read from the file and sent with the
submission; explicit flags or config values win over the file:

| Store section | `###` field | Sent as |
| --- | --- | --- |
| Firefox | Reviewer notes | AMO `approval_notes` |
| Firefox | Release notes | AMO `release_notes` |
| Edge | Certification notes | Edge submission `notes` |

The Chrome Web Store accepts no listing metadata over its API, so the whole
Chrome section is dashboard-only. Its shape mirrors the `CHROMEWEBSTORE.md`
convention other agent tooling expects, so an agent looking for that file's
sections finds them here.

What that means in practice:

- `sync-listing` for Chrome records the listing on extension.dev and sends
  nothing to Google. It answers `listing-recorded` with
  `value.stores.chrome.pasteInDashboard`: each field with its dashboard tab
  (Store listing, Privacy, Distribution, Test instructions) and the
  `STORE.md` line to paste from, or the listing record for the screenshots.
  The owner pastes them in the item's dashboard.
- The preflight reads every dashboard-only Chrome field as `unknown`, with
  its tab and the item's dashboard address, never as `have`. Google's API
  answers the item's review state, nothing on the listing.
- `- Visibility:` is the audience the project intends: `public`,
  `unlisted` or `private` (trusted testers). Without the line the intent
  is `unlisted`, the least public option. A new item starts **Public** on
  the Distribution tab, so the preflight warns until Chrome itself confirms
  the intent. Set Visibility there before the first review.
- Every host the production Chrome package reaches, content script
  `matches` included, needs a bullet under `### Permissions justification`
  that names the host. The preflight names each uncovered pattern from the
  built package, and flags a `localhost` or `127.0.0.1` match in a
  production build as a review risk: keep development-only matches out of
  the production manifest.

Two facts about where the file is read from, both of which have bitten people:

- **The submission reads `STORE.md` from the project's source repository at
  the built commit**, not from the working directory. An uncommitted or
  unpushed edit does not travel with the submission. Commit and push the
  file, then rebuild, then submit.
- **`extension_submit` checks the local copy and warns**, and the warning is
  worth acting on. Its parser is a pinned port of the one the real submission
  runs, held to the original by a test that replays both implementations over
  the same corpus, so "no Firefox reviewer notes" here means no Firefox
  reviewer notes there. Section headings are matched the same way in both:
  `## Firefox Add-ons`, `## firefox-amo` and `## AMO` all resolve to Firefox,
  and the `###` field heading is matched by prefix.

## Maintenance rules

Update `STORE.md` in the same change that makes it stale:

- **Manifest changed** (`permissions`, `host_permissions`,
  `content_scripts`): revisit every justification. Each permission and
  each host gets a specific, plain-English reason; "needed for the
  extension to work" fails review on every store.
- **User-facing behavior changed**: refresh the listing copy and bump the
  last-updated date.
- **New release**: add a version history entry and rewrite the release
  notes section for the new version.
- **Data handling changed**: update the privacy section, the policy it
  links to, and the manifest's Firefox `data_collection_permissions`
  declaration together before submitting; the three must agree.
- **Store rejection**: record the reason and the fix in version history, so
  the next submission does not repeat it.

## Hygiene

- Track the file in git; it is part of the project, not a scratch note.
- Exclude it from the extension zip (the `--zip` flag already packages only
  `dist/<browser>/`, so the default build is safe).
- Never put real user credentials in it; reviewer test accounts are
  throwaway by construction.
