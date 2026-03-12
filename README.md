# vibe quizzes

Small standalone HTML geography quizzes on the map.


> **Note:** This project was created with the help of AI. It was loosely inspired by map quizzes on [Sporcle](https://www.sporcle.com/), but the game modes are different. Borders in the world are sometimes disputed and can change over time; these maps use a snapshot of the [Natural Earth](https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/) dataset.


## What this is

This repository is a set of minimal browser quizzes: you get a map and name countries by typing their names in the input.

- **No build step is required to use the quizzes.** Open `index.html` in a browser and follow the links.
- Each quiz is a self-contained `.html` file with inline CSS and JavaScript.
- **This repo commits only** the quiz pages, the main index, and this README. Build scripts and source data (GeoJSON, path JSON) are not in the repo; the quizzes are ready to use as-is.

## Quizzes

### Geography

- **africa.html** — Countries of Africa. Type a country name to find and highlight it on the map.
- **asia.html** — Countries of Asia.
- **south-america.html** — Countries of South America.

Enter a country name to find and highlight it on the map. Modes: **Default** (borders visible), **Darkness** (borders hidden until named), **Neighbor chain** (name a country that borders the previous one).


## About

Small standalone HTML tools · [vibetools](https://github.com/expectfun/vibetools)
