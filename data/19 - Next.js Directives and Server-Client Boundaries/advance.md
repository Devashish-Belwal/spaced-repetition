1. What is the `'use cache'` directive in React 19 / Next.js, and how do its modifiers and runtime APIs control caching?

**Deep explanation:** The `'use cache'` directive (introduced in Next.js 15 / React 19) represents a major paradigm shift, migrating caching semantics from low-level network wrappers (`fetch` options) to native function-level and component-level memoization.
- **Core Semantics:** Placing `'use cache'` at the top of a file, component, or async function marks its return value (whether raw data, complex computation, or rendered JSX trees) as cacheable. Next.js serializes the output and stores it in the server cache layer. Subsequent executions with identical arguments skip execution and immediately return the cached payload.
- **Modifiers:**
  1. `'use cache: remote'`: Specifies that the cache entry should reside in an external, shared distributed cache store (such as Redis, Memcached, or an edge key-value store). This ensures cache hits across multi-region serverless lambdas or distributed container instances.
  2. `'use cache: private'`: Scopes the cached computation or JSX fragment to an individual user's session or cookie context, allowing personalization caching without risking cross-user data leakage.
- **Runtime Fine-Grained Controls:**
  - `cacheLife()`: Configures time-to-live (TTL), stale-while-revalidate intervals, and expiry thresholds for the cache block (e.g., `cacheLife('hours')` or custom profile definitions).
  - `cacheTag()`: Associates custom semantic tags (e.g., `cacheTag('product-101')`) with the cached output, enabling precise on-demand cache invalidation via `revalidateTag('product-101')` inside Server Actions.

**Interview answer:** "`'use cache'` is a directive that marks an async function, component, or file as cacheable, memoizing its serializable data or rendered JSX at the server execution layer. It supports modifiers like `'use cache: remote'` for distributed stores and `'use cache: private'` for user-session caching, paired with `cacheLife()` and `cacheTag()` for granular invalidation."

2. How do `'use client'`, `'use server'`, and `'use cache'` cooperate in an end-to-end data lifecycle within an enterprise Next.js application?

**Deep explanation:** In modern Next.js architecture, the three directives establish a clear separation of concerns across three critical architectural boundaries:
- **The Triad of Boundaries:**
  1. `'use cache'`: Governs the **Server Execution -> Cache Store** boundary (data & UI memoization).
  2. `'use client'`: Governs the **Server Environment -> Browser Runtime** boundary (code delivery, DOM hydration, and client interactivity).
  3. `'use server'`: Governs the **Browser Runtime -> Server Execution** boundary (secure mutations via RPC endpoints).
- **End-to-End Architectural Flow:**
  1. **Server Fetch & Cache:** A Server Component queries a database inside a function decorated with `'use cache'` and tagged via `cacheTag('user-feed')`. Next.js checks the cache layer; on a hit, it serves the memoized RSC payload without hitting the database.
  2. **Passing Across the Client Boundary:** The Server Component passes this data as serializable props across the `'use client'` boundary into an interactive component (e.g., `<FeedInteractiveList initialPosts={posts} />`). Any non-interactive child elements remain Server Components passed via the `children` slot to minimize client bundle weight.
  3. **Hydration & User Interaction:** The browser downloads the HTML, streams the RSC payload, hydrates the interactive client island, and binds event listeners.
  4. **RPC Mutation Dispatch:** The user likes or comments on a post. The client invokes a Server Action marked with `'use server'`. The browser issues an HTTP POST RPC call with validated payload arguments.
  5. **Validation, Mutation & Invalidation:** The Server Action verifies user authentication, parses inputs with Zod, writes to the database, and calls `revalidateTag('user-feed')`.
  6. **Revalidation Stream:** Next.js invalidates the `'use cache'` entry and returns updated RSC payload deltas, allowing the client UI to re-render fresh server-backed state smoothly without a full page refresh.

**Interview answer:** "`'use cache'` memoizes server computations and UI into the cache layer, `'use client'` defines the bundle boundary for interactive browser code, and `'use server'` provides secure RPC endpoints for client-to-server mutations. Together, they create a full cycle where server data is cached, streamed across the client boundary for interaction, and mutated via Server Actions that trigger targeted cache revalidation."
