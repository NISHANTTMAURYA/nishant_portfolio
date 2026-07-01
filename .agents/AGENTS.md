# AI Agent Guardrails & Design System Constraints

This document defines critical design, layout, and implementation rules for the **Nishant Maurya Portfolio** workspace. Future AI coding assistants MUST adhere to these rules to prevent layout breaks, scroll lock freezes, or rendering failures.

---

## 1. Loader & Name Centering Layout
* **Constraint:** The hero name (`#hero-name`) must occupy the exact same vertical center coordinates before, during, and after the loading sequence.
* **Implementation Rule:**
  * The `.loader-bar-wrapper` container must have `height: 0`, `margin: 0`, `padding: 0`, and `overflow: visible`.
  * Visual separation below the name is handled strictly using `transform: translateY(1.25rem)`.
  * Do NOT introduce margins, paddings, or height block elements between the name and the loader that alter the vertical layout flow during the transition.
  * Children inside the wrapper (e.g. `.loader-bar-container`, `.loader-percentage`) must use `flex-shrink: 0` to prevent them from squishing to `0px` height inside the 0-height parent flexbox.

---

## 2. Scroll Locking on Mobile Viewports
* **Constraint:** The page scroll must be frozen during the intro loading screen but must unlock cleanly on all mobile engines (especially iOS WebKit/Safari).
* **Implementation Rule:**
  * **Never** set `height: 100dvh !important` or `overflow: hidden !important` on the `html` tag to lock scrolls. WebKit does not recalculate the viewport scroll container properly when these styles are toggled dynamically.
  * **Always** use the fixed-body technique to freeze mobile scrolls:
    ```css
    body.intro-loading {
        overflow: hidden !important;
        position: fixed;
        width: 100%;
        height: 100%;
    }
    ```

---

## 3. Dynamic Layout Recalculation (Masonry Gallery)
* **Constraint:** Element sizes (like `containerRef.offsetWidth`) evaluate to `0` when sections are hidden during the loader screen, causing absolute layout elements to collapse.
* **Implementation Rule:**
  * Once the preloader finishes and `intro-loading` is removed from the body, **always** dispatch a window resize event to force absolute-positioned components to recalculate their offsets:
    ```javascript
    window.dispatchEvent(new Event('resize'));
    ```
  * Maintain at least `2` columns in the masonry gallery on mobile views to keep the Pinterest-style grid layout. Do NOT fall back to a single column vertical list.

---

## 4. 3D Cubes Grid Animation Loop
* **Constraint:** The 3D cubes rely on a `requestAnimationFrame(loop)` loop to update their 3D transforms (`rotateX` / `rotateY`) based on pointer coordinates.
* **Implementation Rule:**
  * **Never** stop or cancel the loop (`simRAF`) based on mobile viewport queries.
  * If mobile optimization is required, **only** bypass the background idle simulation calculations (`!userActive` auto-rotate block) on mobile screens. Keep the requestAnimationFrame loop running so touch drag, tilt animations, and ripples remain fully responsive.

---

## 5. Background Grid Canvas Scale
* **Constraint:** Background grid lines will look fuzzy or double-scaled on high-DPI (Retina/scaled) screens.
* **Implementation Rule:**
  * Compute rows and columns using CSS logical dimensions (`canvas.width / dpr`) rather than physical canvas boundaries:
    ```javascript
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = canvas.width / dpr;
    const logicalHeight = canvas.height / dpr;
    const cols = Math.ceil(logicalWidth / gridSpacing) + 1;
    const rows = Math.ceil(logicalHeight / gridSpacing) + 1;
    ```

---

## 6. Tech Stack Grid Height Collapse (Flexbox & aspect-ratio)
* **Constraint:** Placing a container that relies on `aspect-ratio` (e.g. `.default-animation` wrapper) inside a flexbox child (like `.skills-cubes-layout`) causes the vertical height to collapse to `0px` in many mobile browser layout engines. This causes subsequent elements (marquee, category legend) to slide up and overlap the grid.
* **Implementation Rule:**
  * **Never** use `display: flex` on container elements enclosing child elements with `aspect-ratio`. 
  * **Always** use block layout (`display: block`) for these containers so the browser calculates height correctly (`width * heightRatio / widthRatio`), maintaining grid spacing and layout flow.

---

## 7. Responsive Mockup Window Scaling
* **Constraint:** Hiding mockup browser header elements (like traffic lights or the domain address bar) on mobile screens ruins the desktop-mockup visual identity.
* **Implementation Rule:**
  * **Never** hide `.browser-dots` or `.browser-address` inside mobile responsive queries.
  * **Always** scale down mockup elements (e.g., using smaller fonts like `0.65rem`, smaller widths like `62%`, and dot dimensions like `7px`) inside media queries so the browser mockup is preserved without clipping.

---

## 8. GSAP Tween Compilation & Functional Values
* **Constraint:** Passing dynamic arrow-function values to properties inside GSAP timelines (e.g. `opacity: (i, el) => ...`) can cause compile-time or run-time exceptions if elements evaluate to null or undefined. A single crash stops the entire GSAP timeline execution, leaving element opacities in an intermediate "stuck" state.
* **Implementation Rule:**
  * **Never** use dynamic functions inside timeline tweens or `gsap.set` targets.
  * **Always** use a standard Javascript loop (like `.forEach`) to evaluate states at timeline compile-time and insert static, individual tweens into the timeline.

---

## 9. Interactive Auto-Moving Synchronization
* **Constraint:** Manual interactions (scrolling, clicking, swiping) must pause auto-scrolling cleanly and prevent simulation snapping when the idle timer expires.
* **Implementation Rule:**
  * **Always** invoke a unified `pauseAutoMoving()` helper to reset a 3-second idle timer on any pointer, touch, scroll, or click events on both the cubes grid and the marquee line.
  * **Always** sync the auto-moving simulation trackers (`simIndex`, `simTarget`, `simPos`) with the manually highlighted item in the marquee scroll listener while `userActive` is true. This ensures the loop resumes seamlessly from where the user manually scrolled.

