1. What impact does accessing `searchParams` have on static page generation, and why is `searchParams` excluded from `layout.tsx`?

**Deep explanation:** Accessing `searchParams` has major implications for how Next.js builds, caches, and renders routes:

**Dynamic Rendering Bailout:**
Query parameters represent arbitrary client input that cannot be predicted at build time (e.g., `?coupon=SUMMER26` or `?user=123`). As a result, reading `searchParams` in a page component acts as a dynamic server-side trigger:
- The route bails out of Static Site Generation (SSG) / static export.
- Next.js automatically switches the page to **dynamic rendering** at request time on the server, generating fresh HTML for each incoming request.
- If static generation is desired for the main page shell, developers use Partial Prerendering (PPR) or push query-dependent logic to the client using `useSearchParams()` wrapped inside a `<Suspense>` boundary.

**Why `searchParams` is NOT Available in `layout.tsx`:**
Next.js intentionally omits `searchParams` from layout props for architectural and performance reasons:
1. **Partial Rendering and Layout Preservation:** In Next.js, layouts persist across page navigations within the same segment tree. When a user updates a query parameter (e.g., changing from `/shop?sort=asc` to `/shop?sort=desc`), the layout does *not* re-render. Only the page inside the layout re-renders.
2. **Cache Invalidation Avoidance:** If `layout.tsx` had access to `searchParams`, changing any query string would force the entire layout hierarchy—including costly shared navigation bars, sidebar menus, and complex data fetches—to re-render from scratch on every parameter shift.

**Best Practice Solutions:**
- If server rendering depends on query parameters, inspect `searchParams` inside `page.tsx` and pass derived data down to children as explicit props.
- If a shared component or layout needs query values, use a Client Component with the `useSearchParams()` hook, ensuring it is wrapped in `<Suspense>` so the surrounding layout remains statically renderable.

**Interview answer:** "Reading `searchParams` forces a page into dynamic request-time rendering because query strings cannot be determined at build time. Furthermore, `searchParams` is not provided to `layout.tsx` because layouts preserve state and do not re-render during client-side query string changes; requiring query params at the layout level would break partial rendering and trigger unnecessary full-tree re-renders."
