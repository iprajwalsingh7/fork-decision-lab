# Fork

**A little clarity for your next big decision.**

Fork is an interactive decision lab: compare two to five options, weigh up to eight priorities, set must-have requirements, and explore the tipping points in a what-if sandbox. It is a complete static web app; there is no backend to sleep or database to expire.

## Features

- Responsive comparison board with live weighted scores and contribution bars
- Relative importance sliders; all-zero weights fall back to equal weighting
- Must-have requirements: an option must rate at least 5/10 on each enabled requirement
- What-if lab with proportional weight redistribution and nearest whole-percentage turning point
- Multiple decisions saved locally, with JSON backup/import and Markdown decision briefs
- Undo for deletions, keyboard shortcuts, native dialogs, reduced-motion support
- No API keys, accounts, application dependencies, analytics, or server-side decision storage

Scores reflect the user's own ratings and priorities. They are not objective recommendations. The demo opens with clearly editable example inputs. What-if turning points are evaluated at 1% intervals.

## Run locally

Requires Node.js 18 or newer. There are no packages to install.

```sh
npm start
```

Open http://127.0.0.1:4173. For checks:

```sh
npm test
npm run build
```

`dist/` is the complete deployable site. The build command checks syntax/assets; no compilation is needed. Deploy `dist/` to a static host such as Render Static Sites, GitHub Pages, or Cloudflare Pages. Static hosting avoids application cold starts.

## Privacy and storage

Decisions stay in localStorage in the current browser and origin. Export a backup before switching devices, clearing browser data, or changing hosts. Backup import adds decisions and does not replace the existing collection. Export/import supports up to 50 decisions per device. Fonts are loaded from Google Fonts; decision contents are never sent there. Font fallbacks work when the font service is unavailable.

## How the score works

Each rating is clamped to 0–10. Each criterion's weight is divided by the sum of all weights. Total score is the weighted average multiplied by ten. Eligible options sort ahead of options that fail a must-have. Equal scores retain input order and are presented as tied. What-if changes are temporary until Apply is selected.

Built with semantic HTML, CSS, vanilla JavaScript modules, inline SVG, and Node's built-in test runner.
