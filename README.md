# NCERT Lab

NCERT Lab is a static, privacy-first NCERT learning desk. It runs in the browser, stores books and progress locally, and has no application server.

## Run locally

From this directory:

```bash
python3 -m http.server 3000
```

Open `http://localhost:3000`. A web server is needed because ES modules and PDF.js are loaded by the browser.

## Use the app

The demo desk works immediately with a sample Lines and Angles lesson. Choose a class and subject, then optionally add one or more official NCERT PDFs. PDFs are saved in IndexedDB on the current browser/device. The parser samples the opening pages for chapter metadata and the lesson adapter can use the extracted preview as Gemini context.

For AI-generated lessons and twisted tests, open Settings & data and save your own Google Gemini API key. The key is stored in `localStorage`; it is not sent to NCERT Lab infrastructure. Gemini calls are made directly from the browser. If no key is saved, the deterministic sample lesson and test remain available.

## GitHub Pages

Upload the project files to a repository and enable GitHub Pages from the repository's main branch and root folder. The app uses relative paths, so it works from a project subpath. Keep `index.html`, `styles.css`, the JavaScript modules, `manus-routes.json`, `public/manus-routes.json`, and `app.config.ts` together; the two route files are identical so both Preview and the static publication output expose `/manus-routes.json`.

## Privacy model

Books, generated lessons, XP, streak, hint state, weak topics, settings, and data exports are local to the browser. The app has no accounts, analytics, backend, or telemetry. When a user chooses Gemini generation, selected textbook text is sent directly to Google using the user's own key, subject to Google's policies.

## Modules

- `db.js` — IndexedDB and portability helpers.
- `pdf-parser.js` — PDF.js loading, sample extraction, and TOC heuristics.
- `gemini-engine.js` — BYO Gemini adapter, JSON normalization, and demo fallbacks.
- `three-visuals.js` — Three.js geometry lab and live formula readouts.
- `scratchpad.js` — touch-friendly canvas tools.
- `app.js` — UI state and learning flows.
