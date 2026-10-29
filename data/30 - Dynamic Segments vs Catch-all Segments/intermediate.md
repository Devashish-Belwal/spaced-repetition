1. What is the route matching precedence in Next.js App Router when static, dynamic, catch-all, and optional catch-all segments overlap, and when should you choose each pattern?

**Deep explanation:** When multiple route definitions can match an incoming URL, Next.js App Router uses a deterministic specificity hierarchy to resolve collisions rather than route declaration order:
- **Specificity Precedence Order:**
  1. **Static Routes (Highest Specificity):** Exact, literal folder segments (e.g., `app/docs/overview/page.tsx`). A request to `/docs/overview` always matches this file first, bypassing any dynamic handlers.
  2. **Single Dynamic Segments (`[slug]`):** Explicit single-depth wildcards (e.g., `app/docs/[category]/page.tsx`). For a 1-depth URL like `/docs/getting-started`, this takes precedence over any catch-all segment.
  3. **Catch-All Segments (`[...slug]`):** Multi-depth greedy wildcards (e.g., `app/docs/[...slug]/page.tsx`). Evaluated for paths of depth $\ge 1$ when no matching static or single dynamic segment exists.
  4. **Optional Catch-All Segments (`[[...slug]]`) (Lowest Specificity):** Evaluated last. If a static `app/docs/page.tsx` exists alongside `app/docs/[[...slug]]/page.tsx`, navigating to `/docs` resolves to the static index page. If no static index page exists, the optional catch-all handles the request.
- **Collision Example:**
  Consider a request to `/docs/guides`:
  - If `app/docs/guides/page.tsx` exists $\rightarrow$ matches Static route.
  - Else if `app/docs/[section]/page.tsx` exists $\rightarrow$ matches Dynamic segment (`section = "guides"`).
  - Else if `app/docs/[...slug]/page.tsx` exists $\rightarrow$ matches Catch-all (`slug = ["guides"]`).
  - Else if `app/docs/[[...slug]]/page.tsx` exists $\rightarrow$ matches Optional catch-all (`slug = ["guides"]`).
- **Architectural Selection Guidelines:**
  - **Use Single Dynamic (`[slug]`):** When your entities represent discrete items of known depth, such as blog posts (`/blog/[slug]`), user profiles (`/users/[username]`), or order receipts (`/orders/[id]`).
  - **Use Catch-All (`[...slug]`):** When rendering arbitrary-depth tree structures with a dedicated, distinct landing page. For instance, documentation sites where `/docs` has a custom marketing layout, but nested paths (`/docs/api/v1/auth`) use a unified markdown documentation renderer.
  - **Use Optional Catch-All (`[[...slug]]`):** When the root index and all nested sub-paths share identical page layouts, data-fetching structures, and filtering logic—such as an e-commerce catalog matching `/shop`, `/shop/footwear`, and `/shop/footwear/sneakers/running`.

**Interview answer:** "Next.js resolves route collisions using strict specificity ranking: static routes match first, followed by single dynamic segments (`[slug]`), then catch-all segments (`[...slug]`), and finally optional catch-all segments (`[[...slug]]`). Use single dynamic segments for discrete 1-depth items, catch-all for nested trees with a separate landing page, and optional catch-all when the index and all nested sub-paths share identical rendering logic."