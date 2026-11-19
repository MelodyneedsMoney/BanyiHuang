# Banyi photo wall

A scattered, interactive photo wall for Banyi Huang. Click the entrance to reveal the photos and start looping background music. Hover over a photo to enlarge it and play a random sound. A birthday message follows an animated curved path above the photos.

## Preview locally

Open `dist/index.html` in a browser, or serve the website:

```sh
python3 -m http.server 8000 --directory dist
```

Visit http://localhost:8000. Audio starts after clicking the entrance.

## Files

- `dist/index.html`: page and entrance
- `dist/style.css`: layout, photo styling, and typography
- `dist/app.js`: audio, photo interactions, and animated text
- `dist/assets.js`: image and audio paths
- `dist/img`, `dist/sound`, `dist/music`: supplied media

This repository does not enable website publishing or GitHub Pages.
