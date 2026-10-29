1. How does rehydrating persisted client-side state create SSR hydration mismatches in frameworks like Next.js, and what are the best patterns to resolve them?

**Deep explanation:** In Server-Side Rendering (SSR) and Static Site Generation (SSG), the server generates HTML markup before sending it to the client. The server runs in a Node.js or edge environment where browser-only storage APIs (`window`, `localStorage`, `sessionStorage`) do not exist. Consequently, the server renders components using default fallback values (e.g., rendering a light theme or `user = null`).

When the browser receives this HTML and downloads the JavaScript bundle, React executes the "hydration" phase—reconciling its in-memory virtual DOM against the pre-rendered HTML DOM. If a component synchronously accesses client storage during initial render:
```javascript
// Problematic pattern:
const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
```
If `localStorage` contains `'dark'`, the client's initial render creates markup with `theme="dark"`, whereas the server-rendered HTML had `theme="light"`. React detects this discrepancy and emits a hydration mismatch error (or hydration warning in React 18/19), discarding the server DOM or causing visible layout shifts (FOUC — Flash of Unstyled Content) and UI glitches.

**Proven Remediation Strategies:**
1. **Deferred Client-Side Effect (Two-Pass Rendering):**
   Render the fallback state initially on both server and client, then read storage inside `useEffect` (which only executes on the client after initial hydration completes):
   ```javascript
   const [theme, setTheme] = useState('light');
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
     setMounted(true);
     const saved = localStorage.getItem('theme');
     if (saved) setTheme(saved);
   }, []);

   if (!mounted) return <SkeletonLoader />;
   ```
2. **Cookie-Based Server Hydration:**
   Store preferences (such as theme or locale) in a cookie rather than `localStorage`. The incoming HTTP request includes the `Cookie` header, allowing the server to read the user's preference during SSR and render the exact matching HTML upfront, eliminating hydration mismatches entirely.
3. **Blocking Inline Head Script (For Instant UI Theming):**
   To prevent flashing between light and dark modes without delaying rendering, place an inline, synchronous `<script>` tag inside the document `<head>` (before any body HTML is parsed). The script evaluates `localStorage.getItem('theme')` and immediately sets a CSS class or data attribute on `document.documentElement`.
4. **`useSyncExternalStore` with Server Snapshots:**
   React 18's `useSyncExternalStore` hook accepts a `getServerSnapshot` argument specifically to return a safe SSR snapshot (e.g., `'light'`) while reading `localStorage` via `getClientSnapshot`, cleanly separating client and server expectations.

**Interview answer:** "Hydration mismatches occur when the initial client render synchronously reads browser-specific storage like `localStorage`, producing a DOM tree that differs from the server-rendered HTML. To resolve this, you can either defer the storage read until after mount using `useEffect`, pass preferences via cookies so the server can render the correct HTML upfront, or use an inline `<head>` script to apply themes before initial paint."
