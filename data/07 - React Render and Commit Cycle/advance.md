1. In what exact order do `useInsertionEffect`, `useLayoutEffect`, and `useEffect` execute relative to DOM mutations and the browser paint, and what are their respective use cases?

**Deep explanation:** React provides three effect hooks that execute at distinct checkpoints surrounding DOM mutation and the browser paint:
- **1. `useInsertionEffect` (Pre-Layout Hook):**
  - **Execution Timing:** Runs synchronously *before* any DOM layout reading and before `useLayoutEffect` fires.
  - **Primary Use Case:** Designed specifically for CSS-in-JS libraries (such as Emotion or styled-components) to dynamically inject `<style>` tags into the document head before layout is calculated. Injecting styles here prevents browsers from repeatedly invalidating and recalculating styles during layout reads in `useLayoutEffect`, preventing layout thrashing. It has no access to DOM refs.
- **2. `useLayoutEffect` (Post-Mutation, Pre-Paint Hook):**
  - **Execution Timing:** Runs synchronously *after* React has updated the real DOM, but *before* the browser paints the screen.
  - **Primary Use Case:** Reading layout metrics from the DOM (e.g., `element.getBoundingClientRect()`, `scrollHeight`, scroll offsets) and performing synchronous DOM updates or positioning adjustments (e.g., tooltips, popovers, custom dropdown menus). Because it executes before paint, DOM adjustments happen invisibly to the user, completely eliminating visual flickering.
  - **Trade-off:** Because it runs synchronously on the main thread, expensive logic in `useLayoutEffect` blocks the browser paint and degrades perceived frame rate.
- **3. `useEffect` (Post-Paint Passive Hook):**
  - **Execution Timing:** Runs asynchronously *after* the browser has recalculated layout, painted pixels, and presented the updated frame to the user. React schedules passive effects using the browser's macro-task queue (via `MessageChannel` / `postMessage`).
  - **Primary Use Case:** The default choice for all standard side effects that do not require immediate DOM measurements, such as data fetching, setting up event listeners, timers, subscriptions, and logging. Because it runs after paint, it keeps the interface responsive.

**Interview answer:** "`useInsertionEffect` runs first to inject CSS-in-JS styles before layout calculation, `useLayoutEffect` runs synchronously after DOM mutations but before the browser paints to allow flicker-free layout measurements, and `useEffect` runs asynchronously after paint to avoid blocking screen updates."
