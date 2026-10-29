1. What are the core differences between single dynamic segments (`[slug]`), catch-all segments (`[...slug]`), and optional catch-all segments (`[[...slug]]`) in Next.js App Router, and how do their URL matching behaviors differ?

**Deep explanation:** Next.js App Router relies on folder naming conventions inside the `app` directory to capture dynamic URL paths. The syntax determines segment depth, URL pattern resolution, and the shape of the extracted parameter object:
- **Single Dynamic Segment (`[slug]`):**
  - **Syntax & Path:** `app/blog/[slug]/page.tsx`
  - **Matching Behavior:** Matches exactly one path segment at that hierarchy level. For example, `/blog/hello` matches successfully (`slug = "hello"`). It does **not** match the parent root `/blog` (which requires an `app/blog/page.tsx` file) nor deeper nested paths like `/blog/hello/world` (which yields a 404 unless nested routes exist).
  - **Extracted Type:** `params.slug` resolves to a single `string`.
- **Catch-All Segment (`[...slug]`):**
  - **Syntax & Path:** `app/docs/[...slug]/page.tsx`
  - **Matching Behavior:** Uses JavaScript rest syntax (`...`) to match one or more subsequent path segments greedily. It matches `/docs/a`, `/docs/a/b`, and `/docs/a/b/c`.
  - **Root Matching Restriction:** It requires at least one segment after the base segment. Navigating to `/docs` returns a 404 (Not Found) unless a standalone root index page (`app/docs/page.tsx`) is explicitly created.
  - **Extracted Type:** `params.slug` resolves to an array of strings: `string[]` (e.g., `['a', 'b', 'c']`).
- **Optional Catch-All Segment (`[[...slug]]`):**
  - **Syntax & Path:** `app/docs/[[...slug]]/page.tsx`
  - **Matching Behavior:** Enclosing the rest segment in double square brackets makes the catch-all parameter completely optional. It matches zero, one, or multiple segments. It successfully matches the root base path `/docs`, as well as `/docs/a` and `/docs/a/b/c`.
  - **Index Unification:** A separate `app/docs/page.tsx` is unnecessary; the single `[[...slug]]/page.tsx` handles both the index/landing page and all nested sub-paths.
  - **Extracted Type:** `params.slug` resolves to `string[] | undefined`. When the root path `/docs` is visited with zero parameters, `slug` is `undefined`.

**Interview answer:** "`[slug]` matches exactly one segment returning a `string`, `[...slug]` matches one or more segments returning a `string[]` (returning 404 for the base path), and optional catch-all `[[...slug]]` matches zero or more segments returning `string[] | undefined`, allowing a single file to handle both the root index route and arbitrary nested sub-paths."