1. Why does using `useSearchParams()` in a Client Component cause static generation de-optimization (bailing out to CSR), and how does `<Suspense>` solve this issue?

**Deep explanation:** During build-time static generation (SSG) or static prerendering, Next.js generates static HTML for pages. However, query parameters (`?search=term`) cannot be known at build time because they are dynamic and unique to incoming HTTP client requests.

When a Client Component invokes `useSearchParams()` without an enclosing `<Suspense>` boundary:
- Next.js cannot determine what query parameters will be present at runtime during build generation.
- Consequently, Next.js bails out of static generation for the entire page up to the nearest parent boundary, falling back to full Client-Side Rendering (CSR).
- This forfeits server-rendered HTML benefits: initial page load contains empty shells or spinners, Time to First Contentful Paint (FCP) degrades, and SEO indexing suffers.

To prevent bailing out the entire page, Next.js requires wrapping any Client Component that invokes `useSearchParams()` inside a React `<Suspense>` boundary:
```tsx
import { Suspense } from "react";
import SearchBar from "./SearchBar"; // Client component using useSearchParams()

export default function Page() {
  return (
    <main>
      <h1>Product Catalog</h1> {/* Prerendered statically at build time */}
      <Suspense fallback={<div>Loading search...</div>}>
        <SearchBar /> {/* Hydrated / rendered dynamically on the client */}
      </Suspense>
    </main>
  );
}
```
With `<Suspense>`, Next.js prerenders the static layout and fallback UI into static HTML at build time, and defers rendering the wrapped dynamic client component until hydration in the browser.

**Interview answer:** "Calling `useSearchParams()` without a `<Suspense>` boundary forces Next.js to bail out of static HTML prerendering and de-optimize the entire page to client-side rendering because query parameters are request-specific; wrapping the component in `<Suspense>` isolates the dynamic bailout and preserves the static page shell."

2. How do `useParams()`, `usePathname()`, and `useSearchParams()` handle reactivity during client-side navigation compared to native `window.location`?

**Deep explanation:** In Next.js, navigation hooks subscribe directly to Next.js's internal router context:
- **Reactive Updates on Soft Navigation:** When client-side transitions occur (e.g., clicking a `<Link>`, using `router.push()`, or handling browser back/forward buttons via `popstate`), Next.js updates its internal routing state. This causes `useParams()`, `usePathname()`, and `useSearchParams()` to return new values, prompting React to re-render only the subscribed components without triggering a full page reload or discarding existing client-side state.
- **Server-Client Hydration Consistency:** During initial SSR/hydration, Next.js navigation hooks guarantee consistent output between server and client. In contrast, referencing `window.location` inside component render bodies causes hydration mismatch errors (`Text content does not match server-rendered HTML`) because `window` does not exist during server execution.
- **Encapsulated History Management:** Imperatively mutating `window.location.search` or `window.location.pathname` forces a hard browser refresh, destroying React memory state and caches. Even using `window.history.pushState()` directly changes the browser address bar without notifying React or Next.js router listeners, resulting in a desynchronized UI.

Using Next.js navigation hooks ensures URL reads and updates remain fully integrated with React's concurrent rendering cycle and Next.js's client-side cache.

**Interview answer:** "Next.js navigation hooks subscribe directly to the framework's internal router state to trigger reactive re-renders on soft navigation and prevent hydration mismatches, whereas accessing or modifying native `window.location` causes hydration errors, triggers hard reloads, or fails to notify React of state changes."
