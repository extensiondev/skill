# STORE.md: One Store Metadata File for Every Store

`STORE.md` is a single tracked file at the project root that holds everything
the stores will ask for at submission time: listing copy, permission
justifications, privacy disclosures, version history, and per-store notes.
Cross-browser extensions submit to several stores; this file is the one place
where that paperwork lives, so resubmissions never reinvent it.

It has a second job: `extension-deploy` (and platform releases through
extension.dev) read it automatically and attach the fields the store APIs
accept. Everything else stays a copy-paste reference for the dashboard forms.

## When to create it

Create `STORE.md` the moment publishing intent appears:

- The user says they want to publish or "get ready for the store".
- A new extension is clearly headed for a store.
- The user asks about listing requirements or review.

Do not wait for the submission itself. The file earns its keep by being
maintained while the code changes, not written in a scramble at the end.

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
Must match what the code actually does.

## Chrome Web Store

### Permissions justification

- tabs: reads the current tab URL to show per-site settings.
- storage: persists user preferences locally.

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

## What gets submitted automatically

At deploy time these fields are read from the file and sent with the
submission; explicit CLI flags or config values win over the file:

| Store section | `###` field | Sent as |
| --- | --- | --- |
| Firefox | Reviewer notes | AMO `approval_notes` |
| Firefox | Release notes | AMO `release_notes` |
| Edge | Certification notes | Edge submission `notes` |

The Chrome Web Store accepts no listing metadata over its API, so the whole
Chrome section is dashboard-only. Its shape mirrors the `CHROMEWEBSTORE.md`
convention other agent tooling expects, so an agent looking for that file's
sections finds them here.

## Maintenance rules

Update `STORE.md` in the same change that makes it stale:

- **Manifest changed** (`permissions`, `host_permissions`,
  `content_scripts`): revisit every justification. Each permission gets a
  specific, plain-English reason; "needed for the extension to work" fails
  review on every store.
- **User-facing behavior changed**: refresh the listing copy and bump the
  last-updated date.
- **New release**: add a version history entry and rewrite the release
  notes section for the new version.
- **Data handling changed**: update the privacy section and the policy it
  links to before submitting.
- **Store rejection**: record the reason and the fix in version history, so
  the next submission does not repeat it.

## Hygiene

- Track the file in git; it is part of the project, not a scratch note.
- Exclude it from the extension zip (the `--zip` flag already packages only
  `dist/<browser>/`, so the default build is safe).
- Never put real user credentials in it; reviewer test accounts are
  throwaway by construction.
