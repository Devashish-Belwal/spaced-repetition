1. What storage strategies and architectural patterns should be used to persist state across browser reloads, and what are their trade-offs regarding security and performance?

**Deep explanation:** Because React state does not persist across reloads, developers must synchronize volatile memory with external storage layers based on data sensitivity, access frequency, and data size:

- **Web Storage API (`localStorage` & `sessionStorage`):**
  - `localStorage` provides persistent, synchronous key-value storage (~5MB limit) surviving reloads and browser restarts. Ideal for non-sensitive client preferences (UI theme, layout state, sidebar collapse status).
  - `sessionStorage` isolates data to the lifetime of the active tab. Useful for multi-step form wizards where data should discard once the tab closes.
  - *Trade-off / Risk:* Synchronous access can block the main thread if processing large payloads. Crucially, web storage is accessible to any script running on the origin, making it vulnerable to Cross-Site Scripting (XSS) attacks. Sensitive data such as session tokens, JWTs, or PII must never be stored here.
- **`HttpOnly`, `Secure`, `SameSite` Cookies:**
  - Standard for authentication sessions and refresh tokens. Setting the `HttpOnly` flag prevents client-side JavaScript (`document.cookie`) from reading the token, neutralizing token theft via XSS. The browser automatically includes cookies in subsequent HTTP requests.
  - *Trade-off / Risk:* Cookies are susceptible to Cross-Site Request Forgery (CSRF) unless configured with strict `SameSite` attributes (`SameSite=Lax` or `SameSite=Strict`) and CSRF tokens. Size is constrained to ~4KB per cookie.
- **IndexedDB:**
  - An asynchronous, transactional, NoSQL object database capable of storing hundreds of megabytes of structured data (files, blobs, complex nested objects).
  - Used for offline-first PWAs, local-first document editors, or heavy client-side caching. Libraries like `idb` or Dexie.js simplify its complex event-based API.
- **URL Parameters (`useSearchParams`):**
  - Essential for state that represents the current view configuration (filters, search queries, pagination, tab selection). Because the URL is preserved in the browser's address bar and history, reloads preserve state naturally while allowing users to bookmark and share specific application states.
- **Server-Side Rehydration (Cache-First / Stale-While-Revalidate):**
  - For server-authoritative entities (user profiles, shopping carts), React state initializes with an empty or skeleton state on reload, while data-fetching libraries (TanStack Query, SWR, RTK Query) query the backend API using credentials provided via cookies or storage. Once fetched, the server response rehydrates Context and updates the UI seamlessly.

**Interview answer:** "To persist state across reloads, non-sensitive UI settings can be mirrored to `localStorage`, while view-specific parameters like pagination and filters belong in the URL query string. Sensitive authentication tokens must be stored in `HttpOnly`, `Secure` cookies to prevent XSS exposure, and application data should be rehydrated from server APIs using tools like React Query upon page mount."
