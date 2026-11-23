# Portfolio public GitHub snapshot sync

## How refresh works

The portfolio's `From GitHub` feed is generated from `data/github.json`. As of 23 November 2026 the old ChatGPT scheduled refresh was not active; an unattended GitHub Actions workflow now owns this refresh:

- Workflow: [`.github/workflows/github-snapshot.yml`](.github/workflows/github-snapshot.yml)
- Script: [`scripts/sync-github.mjs`](scripts/sync-github.mjs)
- Schedule: daily 03:17 UTC (08:47 Asia/Kolkata), plus manual `workflow_dispatch`
- Destination: **only `data/github.json`**, committed by `github-actions[bot]` only on changes
- Secret handling: ephemeral built-in GitHub Actions `GITHUB_TOKEN` used in the runner; the token never appears in output JSON, frontend JS, Pages files or site visitors' browsers

This configuration requires GitHub Actions to be enabled for the repository, scheduled workflows to remain active, `GITHUB_TOKEN` to have repository contents write permission, and branch protection to permit the bot's commit. A committed workflow file is not evidence that the schedule ran successfully; inspect its Actions run and logs.

## Data boundaries

1. Fetch only public, non-fork, non-archived, non-empty repositories of `OM2412` through GitHub's public REST API. Paginate until all pages are consumed; reject incomplete snapshots.
2. Exclude names in `data/profile.json.excludedRepositories`, case-insensitively.
3. Also fetch the curated featured repositories named in `profile.projects`, including the collaborator-owned SpiderSense project. Abort on failure rather than accidentally removing featured data.
4. Save canonical GitHub metadata only: `id, fullName, name, description, source, homepage, language, pushedAt, createdAt, stars, fork, archived, visibility, size`. Only accept safe HTTPS homepages. Never infer uptime from a homepage field.
5. Save up to three newest published, non-draft, non-prerelease releases per included repo, when available.
6. Sort and deduplicate records. Compare the meaningful repository and release arrays against the current snapshot. **If nothing changed, do not rewrite the timestamp or make a commit.**
7. Keep `data/profile.json` untouched: contributor credit, project cards, architecture/captures, feature claims, achievements and demo URL overrides stay owner-curated.
8. Do not publish any private repositories, contact lists, secrets, customer information or source files.

## Manual refresh / troubleshooting

Use **GitHub → OM2412/om2412.github.io → Actions → Refresh public GitHub snapshot → Run workflow**. Review the outcome and `data/github.json` diff. If metadata fetching fails, the workflow should fail without overwriting the previous file.

If Actions shows no runs, check that Actions is enabled and the workflow exists on `main`. Schedules can be delayed and, on inactive public repositories, GitHub may disable scheduled workflows. Manual dispatch provides an explicit recovery path.

The website shows the snapshot's **last saved data change time**, not a last-successful-check time. An unchanged date does not necessarily mean the scheduled workflow has stopped, though a stale `pushedAt` is a useful reason to inspect it.
