1. Why does `useLayoutEffect` trigger a warning in Server-Side Rendering (SSR), and how should developers resolve or mitigate it?

**Deep explanation:** When using `useLayoutEffect` in an SSR environment (such as Next.js or Remix), React emits a console warning: *"Warning: useLayoutEffect does nothing on the server..."*.
- **Root Cause:** Neither `useEffect` nor `useLayoutEffect` runs on the server because Node.js lacks a DOM environment. However, React specifically warns about `useLayoutEffect` because components using it rely on DOM measurements to render correctly before paint. In SSR, the server generates raw HTML, which the browser downloads and paints immediately *before* client-side JavaScript downloads, executes, and hydrates the DOM. Consequently, the user sees the unadjusted server HTML first anyway, making it impossible to prevent the initial layout flicker, and potentially causing hydration mismatches if server and client HTML diverge.
- **Resolution Patterns:**
  1. **Isomorphic Layout Effect Hook:** Create a utility hook that falls back to `useEffect` during SSR and uses `useLayoutEffect` in the browser:
     ```javascript
     import { useEffect, useLayoutEffect } from 'react';
     export const useIsomorphicLayoutEffect =
       typeof window !== 'undefined' ? useLayoutEffect : useEffect;
     ```
     This silences the SSR warning while maintaining pre-paint execution in client environments.
  2. **Two-Pass Client-Only Rendering:** If a component requires DOM measurements that do not make sense on the server (such as dynamic floating popovers), defer rendering the component until after client mount using a `hasMounted` boolean flag set in `useEffect`.
  3. **CSS-First Alternatives:** Where possible, replace JavaScript measurements with modern CSS capabilities such as CSS Grid, Flexbox, `position: sticky`, or CSS anchor positioning to handle layout natively without lifecycle effects.

**Interview answer:** "React warns against `useLayoutEffect` in SSR because effects do not run on the server, meaning the browser paints the server-rendered HTML before hydration occurs anyway, nullifying flicker prevention. To address this, developers use an isomorphic layout effect hook that falls back to `useEffect` on the server, defer rendering until after client mount, or leverage modern CSS."