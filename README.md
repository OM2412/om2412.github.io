# Om Singh Jadon — The Developer's Cut

> **Current project URLs (2026-11-23 repository documentation):** [Portfolio](https://om2412.github.io/) · [Folio](https://folio-c4no.onrender.com/) · [ReturnTrail](https://returntrail.onrender.com/) · [OnceTold Render](https://oncetold-y69f.onrender.com/) · [OnceTold Cloudflare](https://oncetold.pages.dev/) · [OnceTold synthetic tour](https://oncetold.pages.dev/demo.html).  
> These are published targets; this README update does not certify uptime at every third-party host. **Note:** `data/profile.json` contains curated status/preview overrides; updating README links alone does not change the live portfolio cards.


**[Explore the portfolio →](https://om2412.github.io/)** · [GitHub profile](https://github.com/OM2412) · [LinkedIn](https://www.linkedin.com/in/om-singh-jadon-b92679314/)

A personal portfolio with an original cinematic direction: crimson light, layered portrait art, an interactive WebGL wire sculpture and film-poster project case studies.

The portrait is in the first screen on desktop and mobile. Work, source links and contact options remain directly accessible; there is no intro gate or autoplay soundtrack.

## Work on the reel

| Project | Contribution | Deployment presentation |
| --- | --- | --- |
| ReturnTrail | Full-stack with Ajeet Gadekar | [Render demo](https://returntrail.onrender.com/) · [Cloudflare D1 preview](https://returntrail-preview-api.omjadon242-67c.workers.dev/) · [Walkthrough](https://youtu.be/5lfysyQZOO0); original hosted FalkorDB instance expired |
| OnceTold | Solo build | [Render app](https://oncetold-y69f.onrender.com/) · [Cloudflare frontend](https://oncetold.pages.dev/) · [Synthetic tour](https://oncetold.pages.dev/demo.html); Render + Neon, fictional data only, free hosting may sleep |
| Legal Contract Analyzer | Academic project | [Live Folio](https://folio-c4no.onrender.com/); not legal advice, verify extracted text |
| SpiderSense | Shared frontend/backend with Yogesh Sanodiya | Project website and original repository |

Featured project dialogs now include structured engineering case studies: problem, system architecture, engineering decisions, verification boundaries and next steps. The extra content lives in `data/profile.json`, not in hard-coded HTML. Project descriptions and engineering notes are curated. No clients, revenue, awards or impact metrics are fabricated.

## Automatic updates

A connected ChatGPT background task checks public GitHub metadata daily. Read the complete, constrained writer contract in **[AUTOMATION.md](AUTOMATION.md)**.

- New eligible public repositories appear in **From GitHub** without hand-editing a project card.
- Existing repository descriptions, primary language, push dates and published releases can refresh.
- Only public, non-fork, non-archived, non-empty repositories are eligible. Explicit exclusions live in `data/profile.json`.
- The four featured posters, collaborator credits, detailed claims, certificates and achievements stay curated.
- For a deployed project, put its HTTPS URL in the GitHub repository's **About → Website** field. The next changed snapshot can add it to a featured project when `allowHomepageSync` is true. A listed website is not a claim of verified uptime.
- Featured projects have `allowHomepageSync: false` when their deployment URLs are owner-curated; OnceTold and SpiderSense also use curated links; their verified demo URLs are curated, so stale repository metadata cannot restore retired deployment URLs. ReturnTrail and Folio keep their curated deployment URLs in `data/profile.json`; the analyzer preview is not legal advice.
- The scheduled writer updates only `data/github.json` and commits only when metadata changes. It does not manufacture daily commits merely to refresh a timestamp.
- No GitHub token is embedded in the site; visitors request only the saved JSON files from this site. Browser/laptop uptime is not required for the cloud task.

The date on the website is the **saved snapshot date**. Daily checks without source changes do not change that date. Automatic updates depend on the task remaining enabled and the GitHub connection remaining available; GitHub Pages can take several minutes to publish changes.

## Visual project case studies

The selected-work dialogs now include **responsive architecture flow panels** for each featured project. ReturnTrail has distinct original FalkorDB and Cloudflare D1 preview diagrams; other projects show evidence-based application flows. These are explanatory architecture diagrams, **not screenshots or proof of live feature availability**.

Where an actual capture is available, the portfolio uses sourced images with explicit attribution and alt text: the original ReturnTrail workspace and Context Lab capture, and the OnceTold support portal. Folio and SpiderSense explicitly disclose that no verified product screenshot is included yet. Capture URLs are restricted to local `assets/*.webp` files or approved ReturnTrail GitHub-hosted documentation images.

Case-study flow and image metadata live in `data/profile.json`. Tests check diagram completeness, screenshot attribution and local file presence. Live status still requires independent end-to-end testing.

## Project-backed technical skills

The homepage now includes a dedicated **Tools with proof** section between the selected project reel and services. It groups hands-on technologies into backend/API, frontend/UX, data/persistence, AI/integrations and testing/deployment. Each group links to the specific repositories showing its use.

The source of truth is `data/profile.json → skills`; `script.js` creates text-only cards with validated GitHub repository links, while `styles.css` handles responsive layouts. This section intentionally avoids invented expertise ratings, percentage proficiency bars and unverifiable performance claims.

## Content editing

- `data/profile.json`: curated projects, case studies, collaborator attribution, deployment overrides and milestones.
- `data/github.json`: generated public metadata snapshot; the scheduled task's only write destination.
- `index.html`: introduction, service descriptions, contact layout and metadata.
- `styles.css`: responsive cinematic/studio themes and depth composition.
- `script.js`: project dialogs, filters, snapshot rendering, settings and email-draft helper.
- `lib/scene.mjs`: original WebGL geometry and rendering; no external 3D library or model download.
- `lib/catalog.mjs`: public-project selection, URL checks, stable links and deployment-status rules.

To add a milestone, include its label, title, accurate description and supporting URL in `milestones`. Employment, awards and certificates need owner-provided facts; commit activity must not be relabelled as an achievement.

The email-draft helper opens the visitor's email app. It does not send or store messages. If changing the contact address, change both `index.html` and `script.js`.

## Motion and access

- Real WebGL geometry with perspective, layered CSS 3D portrait and bounded pointer parallax.
- Motion control, reduced-motion defaults, capped device-pixel ratio and approximately 30 fps.
- Rendering pauses when the scene is offscreen or the document is hidden.
- A static portrait composition remains when WebGL is unavailable.
- Native accessible dialogs, keyboard focus/close behavior, semantic labels and ordinary source/contact links.
- No framework runtime, paid API, analytics or backend.

## Accessibility and QA

The portfolio includes semantic section headings, a keyboard skip link, reduced-motion support, native project dialogs, vetted HTTPS links and responsive card layouts. The November 2026 accessibility pass corrected five missing section-heading IDs and improved narrow-screen poster layout, navigation sizing and link targets.

[Portfolio quality GitHub Actions](.github/workflows/portfolio-quality.yml) runs on pushes to `main` and pull requests. It checks JavaScript syntax, project/data correctness, source-image metadata and structural accessibility with `scripts/catalog.test.mjs` and `scripts/portfolio-a11y.test.mjs`.

These are **static checks**, not a WCAG compliance certificate, Lighthouse performance report or cross-device browser test. A final browser-based audit should include keyboard/tab navigation, screen reader labels, desktop + 320/375/390px mobile screenshots, dialog focus handling, WebGL fallback, requests/console errors and a measured Lighthouse run.

## Local preview and checks

```sh
python3 -m http.server 8090
# Open http://localhost:8090
node --test scripts/*.test.mjs
node --check script.js
node --check lib/scene.mjs
```

On Windows, `py -m http.server 8090` can be used with Python installed. Node 18+ is sufficient for the tests; Node is not needed to serve the portfolio.

GitHub Pages publishes `main` from `/ (root)` using `.nojekyll`. No purchased domain is required.

## Attribution

The portrait and actual ReturnTrail capture originate from the ReturnTrail repository; portrait preparation is recorded in its `docs/PHOTO-EDIT.md`. OnceTold's case study includes an actual owner-supplied portal screenshot. Other poster graphics are explicitly labelled illustrations. The film identity and WebGL scene are original code-based graphics, not Netflix/Stranger Things assets or an affiliation claim.

AI assisted with portfolio implementation and writing. Project claims are grounded in the linked repositories and owner-supplied contributions.

## Resume and profile evidence

The first-screen resume link downloads the owner-supplied `Om_Singh_Jadon_Backend_Resume_Final.docx` from OneDrive. The link uses OneDrive's download parameter so visitors receive the updated backend resume.

`data/profile-sources.md` records the evidence checked on 19 October 2026 and unresolved date/wording differences. Credentials and historical ranks remain curated. The CCE IIT Mandi program is continuing education alongside the MITS degree; the weekly branch result is historical. LeetCode counts are a dated check, not a live counter.

To rebuild the PDF, install ReportLab and DejaVu Sans TTF fonts, then run `python3 scripts/build-resume.py`. Set `RESUME_FONT_DIR` when the fonts are stored elsewhere. Review the single-page rendering before replacing the published PDF.
