1. How should authentication and authorization be structured across Middleware and Server Components in Next.js to prevent unauthorized data streaming and optimize performance?

**Deep explanation:** A comprehensive authentication and authorization strategy in Next.js leverages a layered, defense-in-depth approach dividing responsibilities between **Middleware** and **Server Components (Layouts/Pages)**:

1. **Edge Middleware (Coarse-Grained Authentication & Route Protection):**
   - **Role:** Middleware runs at the Edge before a request hits the Next.js cache or Server Component rendering pipeline.
   - **Mechanism:** It inspects the incoming request for session tokens (e.g., verifying a signed JWT or checking cookie presence). If the token is missing or invalid, Middleware can issue an immediate HTTP `307 Temporary Redirect` to the login page without executing Server Component logic or initiating database queries.
   - **Best Practice:** Keep Middleware lightweight. Avoid heavy ORM calls or complex database operations inside Middleware because it runs on every matched route and often runs in an Edge runtime where persistent DB connection pools are unavailable.

2. **Server Components (Fine-Grained Authorization & Data Access):**
   - **Role:** Deep session verification, role-based access control (RBAC), and entity-level authorization (e.g., "Does user A own document 123?").
   - **Mechanism:** Server Components decrypt session data and run direct database/ORM queries. If a user is authenticated but unauthorized for a specific resource, the component calls `redirect('/unauthorized')` or `notFound()`.
   - **Halting HTML Streaming:** React Server Components stream UI to the client as chunks become ready. When `redirect()` or `notFound()` is invoked inside a Server Component, Next.js throws an internal error (`NEXT_REDIRECT`) that immediately cancels rendering and streaming for that branch. This ensures that partially rendered protected data is never flushed or leaked into the HTTP stream.

3. **Layouts vs. Pages Authorization Caveat:**
   - In Next.js, Layouts do not re-render on subsequent client-side navigations between sibling child pages (partial rendering). Therefore, critical resource-specific authorization checks must reside inside individual `page.tsx` components or a dedicated data access layer (DAL), rather than relying solely on `layout.tsx`, ensuring authorization executes on every page transition.

**Interview answer:** "Best practice implements defense-in-depth: Edge Middleware performs coarse-grained checks to redirect unauthenticated users before rendering begins, while Server Components handle fine-grained, database-driven authorization and role checks. If access is denied in a Server Component, invoking `redirect()` immediately terminates execution, ensuring unauthorized data is never streamed over the wire."
