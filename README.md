# Om Singh Jadon — The Developer's Cut

**[Explore the portfolio →](https://om2412.github.io/)** · [GitHub profile](https://github.com/OM2412) · [LinkedIn](https://www.linkedin.com/in/om-singh-jadon-b92679314/)

A personal portfolio with an original cinematic direction: crimson light, layered portrait art, an interactive WebGL wire sculpture and film-poster project case studies.

The portrait is in the first screen on desktop and mobile. Work, source links and contact options remain directly accessible; there is no intro gate or autoplay soundtrack.

## Work on the reel

| Project | Contribution | Deployment presentation |
| --- | --- | --- |
| ReturnTrail | Full-stack with Ajeet Gadekar | Public demo and walkthrough |
| OnceTold | Solo build | **Hosting paused**; code/local setup available; old Railway link omitted |
| Legal Contract Analyzer | Academic project | **Deployment planned**; no invented live URL |
| SpiderSense | Shared frontend/backend with Yogesh Sanodiya | Project website and original repository |

Project descriptions and engineering notes are curated. No clients, revenue, awards or impact metrics are fabricated.

## Automatic updates

A connected ChatGPT background task checks public GitHub metadata daily. Read the complete, constrained writer contract in **[AUTOMATION.md](AUTOMATION.md)**.

- New eligible public repositories appear in **From GitHub** without hand-editing a project card.
- Existing repository descriptions, primary language, push dates and published releases can refresh.
- Only public, non-fork, non-archived, non-empty repositories are eligible. Explicit exclusions live in `data/profile.json`.
- The four featured posters, collaborator credits, detailed claims, certificates and achievements stay curated.
- For a deployed project, put its HTTPS URL in the GitHub repository's **About → Website** field. The next changed snapshot can add it to a featured project when `allowHomepageSync` is true. A listed website is not a claim of verified uptime.
- OnceTold has `allowHomepageSync: false`; stale metadata cannot silently restore its old live link.
- The scheduled writer updates only `data/github.json` and commits only when metadata changes. It does not manufacture daily commits merely to refresh a timestamp.
- No GitHub token is embedded in the site; visitors request only the saved JSON files from this site. Browser/laptop uptime is not required for the cloud task.

The date on the website is the **saved snapshot date**. Daily checks without source changes do not change that date. Automatic updates depend on the task remaining enabled and the GitHub connection remaining available; GitHub Pages can take several minutes to publish changes.

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

## Local preview and checks

```sh
python3 -m http.server 8090
# Open http://localhost:8090
node --test scripts/catalog.test.mjs
node --check script.js
node --check lib/scene.mjs
```

On Windows, `py -m http.server 8090` can be used with Python installed. Node 18+ is sufficient for the tests; Node is not needed to serve the portfolio.

GitHub Pages publishes `main` from `/ (root)` using `.nojekyll`. No purchased domain is required.

## Attribution

The portrait and actual ReturnTrail capture originate from the ReturnTrail repository; portrait preparation is recorded in its `docs/PHOTO-EDIT.md`. Other poster graphics are explicitly labelled illustrations. The film identity and WebGL scene are original code-based graphics, not Netflix/Stranger Things assets or an affiliation claim.

AI assisted with portfolio implementation and writing. Project claims are grounded in the linked repositories and owner-supplied contributions.
