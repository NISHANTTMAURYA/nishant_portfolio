# Nishant Maurya | Backend Developer Portfolio

A premium, interactive developer portfolio built with Vanilla HTML, CSS, and JS, featuring a custom 3D technology cubes grid, real-time image masonry gallery, high-DPI canvas particles, and project iframe previews.

---

## 🛠️ Tech Stack
* **Frontend:** Vanilla HTML5, CSS3, ES6+ Javascript
* **Animations:** GSAP (GreenSock Animation Platform)
* **Hosting Configuration:** Netlify Headers & Redirects configuration

---

## 🤖 AI Agent Guardrails (Critical Constraints)

If you are an AI assistant editing this project, you **must** read and follow these rules to avoid breaking layouts:

### 1. Name Centering & Preloader Space
* The vertical coordinates of `#hero-name` must match exactly before, during, and after loading.
* `.loader-bar-wrapper` must be `height: 0`, `margin: 0`, and `overflow: visible`. Visual distance is handled strictly via `transform: translateY(1.25rem)`.

### 2. Scroll Locking on Mobile Viewports
* **Never** lock scrolling on mobile by setting `height: 100dvh` or `overflow: hidden` on the `html` tag. This freezes scrolling permanently on iOS WebKit.
* **Always** lock scrolls by setting `position: fixed; width: 100%; height: 100%; overflow: hidden !important;` on `body.intro-loading` only.

### 3. Masonry Gallery Redraw
* Since elements are hidden during preloading, container widths measure as `0px`.
* **Always** dispatch a window `resize` event upon hiding the loader screen to trigger masonry recalculation:
  ```javascript
  window.dispatchEvent(new Event('resize'));
  ```
* Maintain at least `2` columns fallback in the masonry grid on mobile viewport sizes to preserve the Pinterest grid look.

### 4. 3D Cubes Grid Loop
* Do **not** disable the `requestAnimationFrame(loop)` on mobile screen sizes. If optimization is needed, bypass the idle `!userActive` auto-rotate block, but keep the loop running so touch tilts and ripples remain active.

### 5. High-DPI Canvas Scaling
* Scale canvases by `devicePixelRatio` and draw grid lines using CSS logical units (`canvas.width / dpr`) to prevent grid blur or double-scaling on Retina screens.

---

## 📊 Analytics (Microsoft Clarity) & UTM Sharing Links

Microsoft Clarity (free) is installed: the tracking snippet is in the `<head>` of `index.html`, and `initClarityTracking()` in `script.js` fires anonymous section-view events for all 10 sections plus resume-download, email-click and subscribe-submit events. No visitor is identified by name/email, and the footer email input is masked (`data-clarity-mask`). View sessions, recordings and heatmaps in the Clarity dashboard for the `portfolio` project.

UTM tags are **not** automatic — add them to the link when sharing, so Clarity can filter sessions by where a visitor came from. Keep everything lowercase, no spaces, and keep `campaign=portfolio` the same everywhere. Format:

```
https://nishantmaurya.me/?utm_source=SOURCE&utm_medium=MEDIUM&utm_campaign=portfolio
```

Ready-to-share links:

* LinkedIn post: `https://nishantmaurya.me/?utm_source=linkedin&utm_medium=social&utm_campaign=portfolio&utm_content=post`
* LinkedIn bio: `https://nishantmaurya.me/?utm_source=linkedin&utm_medium=social&utm_campaign=portfolio&utm_content=bio`
* Instagram bio: `https://nishantmaurya.me/?utm_source=instagram&utm_medium=social&utm_campaign=portfolio&utm_content=bio`
* GitHub profile: `https://nishantmaurya.me/?utm_source=github&utm_medium=profile&utm_campaign=portfolio`
* Resume: `https://nishantmaurya.me/?utm_source=resume&utm_medium=pdf&utm_campaign=portfolio`
* WhatsApp: `https://nishantmaurya.me/?utm_source=whatsapp&utm_medium=social&utm_campaign=portfolio`
* Email signature: `https://nishantmaurya.me/?utm_source=email&utm_medium=email&utm_campaign=portfolio`
