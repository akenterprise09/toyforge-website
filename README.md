# 🧸 ToyForge Website

Official website for **ToyForge** — premium educational wooden toys designed to spark curiosity and creativity in children.

🌐 **Live Site:** https://akenterprise09.github.io/toyforge-website/

## ✨ Features
- 3D Interactive Product Viewer (Three.js)
- Smooth Scroll Animations (GSAP + Lenis)
- Fully Responsive Design
- Product Showcase with Video Panels
- Animated Stats & Features Section

## 🛠 Tech Stack
- HTML5, CSS3, JavaScript
- Three.js (3D Models)
- GSAP + ScrollTrigger (Animations)
- Lenis (Smooth Scroll)

## 📁 Structure
```
index.html              — Main page markup (head, body, third-party script tags)
css/
  style.css              — All site styles
js/
  main.js                 — All site behavior (Lenis, GSAP, Three.js scenes, reveal animations)
assets/
  videos/
    shape-sorter-panel.mp4 / .webm   — Product panel 1 background video
    color-slide-panel.mp4 / .webm    — Product panel 2 background video
    showcase-loop.mp4 / .webm        — Dark "scroll showcase" section background video
```

## ⚡ Performance Notes

This site was refactored from a single 42MB `index.html` (which embedded all 3
videos as base64 text directly inside the page) into the structure above.

What changed and why it fixes scroll lag / heaviness:

1. **Videos extracted to real files** instead of being inlined as base64 text.
   Base64 inflates binary data by ~33%, and embedding video as text forces the
   browser to download and decode tens of megabytes of text before the page
   can even paint.
2. **Videos re-encoded** at web-appropriate settings (H.264 + WebM, downscaled,
   silent track removed, `faststart` enabled) since these are short, looping,
   heavily-overlaid background clips that don't need near-lossless bitrate.
   Combined original video size ~32.5MB → ~8.6MB for both formats together.
3. **CSS and JS split into external files** (`css/style.css`, `js/main.js`)
   so the browser can parse, cache, and reuse them separately from the HTML,
   instead of re-parsing a multi-megabyte inline `<style>`/`<script>` block
   embedded in the page on every load.
4. **`preload` hints** added per video — the first product panel video uses
   `preload="auto"` since it's near the top of the page, while the second
   panel and showcase videos use `preload="metadata"` so they don't compete
   for bandwidth before the user scrolls to them.
5. **Third-party scripts (Three.js, GSAP, Lenis) marked `defer`** and given
   `<link rel="preconnect">` hints so they load without blocking the initial
   render.

Net result: total site weight dropped from **42MB to ~8.6MB** (or ~2.7MB if
you choose to ship only the MP4 or only the WebM source instead of both),
with identical visual design and behavior.

### Optional further optimization
If you want an even smaller payload, you can drop one of the two video
formats per `<video>` tag:
- Keep only `.mp4` for maximum compatibility (works in literally every browser).
- Keep only `.webm` for the smallest possible file size (not supported in
  very old Safari versions).

---
© 2025 ToyForge. All rights reserved.
