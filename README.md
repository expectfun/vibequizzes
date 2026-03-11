# vibe quizzes

> **Note:** This project was created with the help of AI.

Small standalone HTML geography quizzes on the map.

## What this is

This repository is a set of minimal browser quizzes: you get a map and name the countries by clicking on them.

- **No build step is required to use the quizzes.** Open `index.html` in a browser and follow the links.
- Each quiz is a self-contained `.html` file with inline CSS and JavaScript.
- To regenerate quiz pages from GeoJSON (e.g. after changing data or styling), run the Node scripts in this repo; the built HTML is committed.

## Quizzes

### Geography

- **africa.html** — Countries of Africa. Click the country on the map to type its name.
- **south-america.html** — Countries of South America.
- **europe.html** — Countries of Europe.
- **asia.html** — Countries of Asia.

Each quiz supports “name → find on map” and “click on map → type name” modes.

## Build (optional)

To rebuild the quiz HTML from GeoJSON and path data:

```bash
node build-html.js           # Africa
node build-south-america-html.js
node build-europe-html.js
node build-asia-html.js      # Asia
```

Source geometry: `ne_110m_admin_0_countries.geojson`. Paths are precomputed in `*-paths.json`; use the `geojson-to-svg*.js` scripts if you need to regenerate them.

## About

Small standalone HTML tools · [vibetools](https://github.com/expectfun/vibetools)
