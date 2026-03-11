# vibe quizzes

> **Note:** This project was created with the help of AI.

Small standalone HTML geography quizzes on the map.

## What this is

This repository is a set of minimal browser quizzes: you get a map and name countries by typing their names in the input.

- **No build step is required to use the quizzes.** Open `index.html` in a browser and follow the links.
- Each quiz is a self-contained `.html` file with inline CSS and JavaScript.
- **This repo commits only** the quiz pages, the main index, and this README. Build scripts and source data (GeoJSON, path JSON) are not in the repo; the quizzes are ready to use as-is.

## Quizzes

### Geography

- **africa.html** — Countries of Africa. Type a country name to find and highlight it on the map.
- **south-america.html** — Countries of South America.
- **europe.html** — Countries of Europe.
- **asia.html** — Countries of Asia.

Enter a country name to find and highlight it on the map. Modes: **By outline** (borders visible), **Blind** (borders hidden until named), **Neighbor chain** (name a country that borders the previous one).

## Build (optional, tooling not in repo)

If you have the full project (e.g. from a backup or another source), you can rebuild the quiz HTML from GeoJSON and path data. These files are **not** committed to this repo:

- **Scripts:** `build-html.js`, `build-south-america-html.js`, `build-europe-html.js`, `build-asia-html.js` — each produces one quiz `.html`.
- **Data:** `ne_110m_admin_0_countries.geojson` (source geometry). Paths are in `*-paths.json`; to regenerate them use the `geojson-to-svg*.js` scripts.

Then run:

```bash
node build-html.js           # Africa
node build-south-america-html.js
node build-europe-html.js
node build-asia-html.js      # Asia
```

## About

Small standalone HTML tools · [vibetools](https://github.com/expectfun/vibetools)
