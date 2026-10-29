1. What are the primary hooks provided by Next.js (`next/navigation`) to read the current URL in Client Components, and how do their roles differ from the Pages Router?

**Deep explanation:** In Next.js App Router, URL parsing is strictly decoupled into dedicated hooks imported from `next/navigation` rather than combining dynamic and query parameters into a single `router.query` object as in the legacy Pages Router (`next/router`):
- **`useParams()`**: Reads dynamic route segments resolved from the current URL based on folder naming conventions (such as `app/posts/[id]/page.tsx` or `app/shop/[...slug]/page.tsx`). It returns an object containing key-value pairs of dynamic parameters (where catch-all routes yield string arrays). In TypeScript, it accepts a type parameter (e.g., `useParams<{ id: string }>()`) for compile-time safety.
- **`usePathname()`**: Returns the current URL's pathname string (e.g., `/dashboard/analytics`), stripped of query strings (`?query=value`) and hash fragments (`#section`). It updates reactively whenever client-side navigation changes routes.
- **`useSearchParams()`**: Returns a `ReadonlyURLSearchParams` instance containing the query string parameters of the current URL (e.g., `?sort=desc&page=2`). It provides standard read utility methods such as `.get()`, `.getAll()`, `.has()`, and `.entries()`.

This separation ensures clear architectural boundaries: dynamic path parameters define resource identity and routing hierarchy, while search parameters represent transient UI or query state.

**Interview answer:** "In Next.js App Router, `useParams` retrieves dynamic route segments, `usePathname` returns the URL path excluding queries and hashes, and `useSearchParams` provides a read-only interface to query parameters, cleanly separating path-based routing from transient query state."
