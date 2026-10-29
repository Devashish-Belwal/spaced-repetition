1. How would you build autocomplete with keyboard navigation, caching, and race protection?

**Deep explanation:** Use a controlled input with a short debounce, request cancellation via `AbortController`, and a monotonically increasing request ID so stale responses cannot replace newer results. Cache normalized queries with a bounded TTL/LRU policy. Model the popup as an accessible combobox: arrow keys change the active option, Enter selects it, Escape closes it, and ARIA attributes connect the input, listbox, and active option.

**Interview answer:** I would debounce input, cancel superseded requests, and ignore any stale response using a request sequence number. I would cache recent normalized queries with TTL and size limits, then implement keyboard behavior and ARIA combobox semantics so mouse, keyboard, and screen-reader users get the same state.

2. How would you implement infinite scroll while preserving navigation position?

**Deep explanation:** Trigger page loads with an `IntersectionObserver` sentinel and prevent duplicate requests with explicit loading/end states. Keep stable item IDs and persist the loaded pages plus scroll anchor—an item ID and offset—in router or session state. On return, restore data first, render, then scroll to the anchor; virtualization may require its own index/offset restoration API.

**Interview answer:** I would load from an observed sentinel, deduplicate requests, and stop at the end cursor. Before navigating away I would save the loaded data and a stable item anchor with its offset, then restore the list before restoring position, including the virtualizer's state if the list is virtualized.

3. How would you build a large-file uploader with progress and cancellation?

**Deep explanation:** Split the file into chunks and upload them with bounded concurrency, retrying transient failures with backoff. Track completed bytes for aggregate progress, use `AbortController` for cancellation, and let the server issue an upload ID so completed chunks can be resumed. Verify size/type early and integrity with per-chunk or final checksums; multipart or resumable protocols avoid restarting a multi-gigabyte upload.

**Interview answer:** I would use resumable chunked uploads with an upload ID, bounded parallelism, retry/backoff, byte-based progress, and `AbortController` cancellation. The server would record completed chunks and verify integrity so a failed or interrupted upload resumes instead of restarting.

4. How would you design a realtime chat UI with pending and failed messages?

**Deep explanation:** Insert an outgoing message immediately with a client-generated ID and `pending` status. Send that ID as an idempotency key; reconcile the acknowledgement to the canonical server ID and timestamp. Mark timeouts or rejections as `failed` with retry controls, deduplicate socket events, and order messages using server sequence/timestamps while showing connection and delivery states separately.

**Interview answer:** I would optimistically add messages with client IDs and pending status, then reconcile acknowledgements to server IDs. Idempotency keys and event deduplication prevent duplicates; failures remain visible with retry, while server ordering metadata handles out-of-order realtime events.

5. How would you build a dashboard whose widgets fail independently?

**Deep explanation:** Give each widget its own data request, loading state, timeout, and error boundary rather than one page-wide promise. A widget failure should render a local fallback and retry action while the rest remain interactive. Shared infrastructure can enforce request limits and logging, but widget contracts should prevent malformed data from cascading across the dashboard.

**Interview answer:** I would isolate every widget at both the rendering and data-fetching layers with local loading, error, empty, and retry states. An error boundary catches render failures, independent queries prevent one API failure from blocking all widgets, and telemetry identifies the failing widget.

6. How would you prevent repeated clicks from duplicating a purchase?

**Deep explanation:** Disable the action while submission is pending, but treat that only as UX protection. The client should create an idempotency key per purchase intent and reuse it for retries; the server must atomically store that key and return the original result for duplicates. Unique database constraints or transactional state transitions provide the final guarantee.

**Interview answer:** I would immediately lock the button, but rely on server-side idempotency for correctness. Each purchase intent gets one key reused across retries, and the backend atomically records it so double-clicks, refreshes, and network retries all produce one purchase.

7. How would you manage authentication expiry during an unsaved form edit?

**Deep explanation:** Preserve the draft locally or in application state before starting reauthentication. When an API reports expiry, pause submission, show a non-destructive re-login flow, then retry safely after refreshing credentials; use an idempotency key if submission could have reached the server. Warn before navigation and encrypt or avoid persisting sensitive draft fields.

**Interview answer:** I would never discard the form on expiry. I would snapshot the draft, pause the operation, reauthenticate in place, and retry with idempotency protection; if reauthentication fails, I would keep a recoverable draft while avoiding storage of sensitive fields.

8. How would you synchronize logout across browser tabs?

**Deep explanation:** Broadcast a logout event with `BroadcastChannel`, with a `storage` event fallback for older environments. Each tab clears in-memory credentials, cancels protected requests, invalidates sensitive caches, and redirects as appropriate. Server-side session or refresh-token revocation remains authoritative, because a tab event alone is not a security boundary.

**Interview answer:** On logout I would revoke the server session, clear local auth state, and publish a `BroadcastChannel` message. Other tabs would clear their caches and credentials and navigate away; I would use the `storage` event as a compatibility fallback.

9. How would you coordinate token refresh when many requests fail together?

**Deep explanation:** Use a single-flight refresh promise: the first eligible 401 starts refresh and subsequent requests await the same promise. After success, retry each request once with the new token; after failure, reject all waiters and log out. Exclude the refresh endpoint, prevent retry loops, and consider cross-tab coordination if tokens are shared.

**Interview answer:** I would gate refresh behind one shared promise so a burst of 401s creates one refresh call. Waiting requests retry once after success; if refresh fails, they all fail consistently and auth state is cleared, with guards against intercepting the refresh call itself or looping forever.

10. How would you design a reusable API client with cancellation and typed errors?

**Deep explanation:** Centralize base URL, headers, serialization, timeouts, and authentication while accepting an `AbortSignal` per call. Convert transport, timeout, HTTP, validation, and domain failures into discriminated typed errors that retain status, request ID, and safe details. Keep retry policy explicit and idempotency-aware, and parse responses through runtime schemas because TypeScript types do not validate network data.

**Interview answer:** I would expose typed request functions that accept an `AbortSignal`, validate responses at runtime, and normalize failures into discriminated errors such as network, HTTP, validation, and domain errors. Authentication and tracing are centralized, while retries remain opt-in and safe for the HTTP method.

11. How would you separate client validation from authoritative server validation?

**Deep explanation:** Client validation provides immediate feedback for format, required fields, and obvious constraints, but it can be bypassed and may be stale. The server repeats all security and business-rule validation against current authoritative data. Share schemas where practical, map field errors back into the form, and handle cross-field or concurrency conflicts as server responses.

**Interview answer:** Client validation is for usability; server validation is the source of truth. I would share rule definitions where possible, validate again on the server, and return structured field and form errors so the UI can explain authoritative failures such as uniqueness or changed inventory.

12. How would you preserve filter state in a shareable URL?

**Deep explanation:** Encode meaningful filter, sort, and page state in canonical query parameters with stable names and defaults omitted. Parse and validate parameters into typed state, update them through the router, and use replace versus push depending on whether each edit deserves browser history. Keep large or sensitive state outside the URL and ensure equivalent filters serialize identically.

**Interview answer:** I would make the URL the source of truth for shareable filters, parse it through a typed schema, and serialize a canonical minimal query string. I would use router replacement for noisy changes and pushes for meaningful navigation, while excluding sensitive or oversized state.

13. How would you handle search, filtering, sorting, and pagination consistently?

**Deep explanation:** Define one query model containing normalized search, filters, sort keys/direction, and pagination. Serialize it consistently to the URL and API cache key; changing search, filters, or sort resets pagination. The server applies a deterministic secondary sort, returns total or cursor metadata, and the UI distinguishes loading, empty, error, and stale-data states.

**Interview answer:** I would use one validated query-state object shared by the URL, data request, and cache key. Any search, filter, or sort change resets the page, and the backend uses deterministic ordering so pagination remains stable and reproducible.

14. How would you choose between offset and cursor pagination in a UI?

**Deep explanation:** Offset pagination supports arbitrary page jumps and simple totals, making it suitable for relatively stable datasets, but deep offsets can be slow and concurrent inserts cause skips or duplicates. Cursor pagination uses a stable ordered key, scales better, and behaves consistently on changing feeds, but usually supports next/previous navigation rather than random page jumps.

**Interview answer:** I would choose offset when users need numbered pages or direct jumps and the dataset is stable enough. I would choose cursor pagination for large or frequently changing feeds because it scales and avoids shifting offsets, accepting that random page access and exact totals are harder.

15. How would you implement optimistic UI when the server may reject an update?

**Deep explanation:** Snapshot the affected cache state, apply a temporary update immediately, and tag the mutation so concurrent operations can be reconciled safely. On success, replace optimistic data with the canonical response; on failure, roll back only that mutation and show an actionable error. Avoid optimism for high-risk or irreversible operations unless compensation is reliable.

**Interview answer:** I would snapshot the previous state, apply an identifiable optimistic patch, and reconcile it with the server response. If rejected, I would roll back that patch without overwriting newer changes and explain the failure; I would reserve optimistic behavior for operations with safe recovery.

16. How would you support offline drafts and later synchronization?

**Deep explanation:** Store versioned drafts in IndexedDB with local IDs, timestamps, sync status, and the base server version. Queue changes while offline and synchronize when connectivity returns, using retries and idempotency keys. Detect conflicts through versions/ETags and either merge field-level changes or ask the user; never treat the browser `online` event as proof that the server is reachable.

**Interview answer:** I would persist drafts and an outbox in IndexedDB, then sync idempotently when the server becomes reachable. Each draft carries a base version so conflicts are detected rather than overwritten, with automatic merges for safe fields and a user resolution UI for real conflicts.

17. How would you choose what belongs in IndexedDB instead of localStorage?

**Deep explanation:** `localStorage` is synchronous, string-only, small, and best for tiny infrequently accessed preferences. IndexedDB is asynchronous, transactional, indexed, and designed for larger structured or binary data such as offline records, drafts, and cached files. Neither should hold long-lived secrets vulnerable to XSS; storage quotas, eviction, and schema migration must be handled.

**Interview answer:** I use `localStorage` only for small simple preferences where synchronous access is acceptable. For sizable structured data, blobs, offline queues, or transactional updates I use IndexedDB, with migrations and quota handling, and I avoid storing sensitive credentials in either.

18. How would you use IntersectionObserver instead of continuous scroll polling?

**Deep explanation:** Observe a sentinel or target and react when it crosses a configured threshold or root margin. The browser batches intersection calculation more efficiently than running layout-dependent code on every scroll event. Disconnect observers during cleanup, guard repeated callbacks, and remember that intersection indicates visibility geometry, not guaranteed user attention.

**Interview answer:** I would observe a sentinel with an appropriate root and root margin, then load or lazy-render when it intersects. I would deduplicate callbacks and disconnect on cleanup; this avoids continuous scroll handlers and repeated layout reads.

19. How would you use ResizeObserver without creating a resize loop?

**Deep explanation:** A resize loop occurs when the observer callback changes dimensions that trigger itself again. Read observed sizes in the callback, compare them with the last value, and defer necessary writes to `requestAnimationFrame`; prefer CSS container queries when layout alone can solve the problem. Observe the narrowest target and disconnect on teardown.

**Interview answer:** I would keep the observer callback read-focused, ignore unchanged measurements, and schedule any dimension-changing writes for the next animation frame. I would prefer container queries for pure styling and always clean up the observer.

20. How would you move CPU-heavy work into a Web Worker?

**Deep explanation:** Put pure CPU work in a worker and exchange serializable messages through `postMessage`; use transferable objects for large `ArrayBuffer`s to avoid copying. Define request IDs, progress, cancellation, error, and termination protocols. Workers cannot directly access the DOM, and startup plus serialization overhead means small tasks may be faster on the main thread.

**Interview answer:** I would isolate the computation behind a typed message protocol with request IDs, progress, cancellation, and errors. Large buffers would be transferred rather than cloned, results would update the UI on the main thread, and I would measure whether worker overhead is justified.

21. How would you reduce bundle size using code splitting and tree shaking?

**Deep explanation:** Split code at routes and genuinely heavy feature boundaries with dynamic imports, while keeping critical paths small enough to avoid request waterfalls. Tree shaking requires ESM, production optimization, and packages that correctly declare side effects. Analyze the built bundle, import modules narrowly, remove or replace costly dependencies, and enforce budgets to catch regressions.

**Interview answer:** I would inspect the production bundle first, dynamically import route or feature code that is not needed initially, and ensure dependencies expose tree-shakeable ESM with correct side-effect metadata. Then I would remove duplicate or oversized packages and enforce bundle budgets in CI.

22. How would you prioritize loading above-the-fold content?

**Deep explanation:** Deliver critical HTML and CSS early, preload only truly critical fonts or hero assets, and give the LCP image an appropriate fetch priority without lazy-loading it. Defer below-the-fold media and nonessential JavaScript, reserve dimensions to avoid layout shift, and avoid excessive preloads that compete for bandwidth. Validate decisions with a network waterfall and LCP attribution.

**Interview answer:** I would prioritize the LCP resource, critical CSS, and essential fonts, while deferring below-the-fold images and noncritical scripts. I would reserve media dimensions and verify the actual critical chain in performance traces rather than marking everything high priority.

23. How would you compare prefetch, preload, and preconnect?

**Deep explanation:** `preload` fetches a known resource needed by the current page with high relevance and requires correct `as` and CORS settings. `prefetch` is a low-priority hint for likely future navigation and may be ignored. `preconnect` establishes DNS, TCP, and TLS early for a critical origin but should be limited because idle connections consume resources.

**Interview answer:** I use preload for a specific current-page critical resource, prefetch for likely next-page resources, and preconnect when I know a critical cross-origin request is coming. Each is a hint with a cost, so I apply only a few and confirm impact in the waterfall.

24. How would you avoid shipping duplicate dependencies?

**Deep explanation:** Inspect the bundle and lockfile for multiple versions, then align version ranges, deduplicate the lockfile, and use overrides/resolutions cautiously. Libraries should put shared frameworks in `peerDependencies` where appropriate, and monorepos should maintain consistent constraints. Aliasing incompatible versions can break runtime behavior, so test the production artifact after consolidation.

**Interview answer:** I would use bundle analysis and the package-manager dependency tree to find duplicate versions, align constraints, and dedupe or override where compatible. For libraries I would use peer dependencies for host-owned frameworks, then test the final production bundle because forced deduplication can be unsafe.

25. How would you diagnose a memory leak after repeated page navigation?

**Deep explanation:** Reproduce a fixed navigation loop, force garbage collection in a controlled DevTools session, and compare heap snapshots or allocation timelines. Inspect retained-object paths for detached DOM nodes, listeners, timers, subscriptions, caches, and closures. Fix missing cleanup or unbounded ownership, then repeat the loop and confirm the retained heap reaches a stable plateau.

**Interview answer:** I would create a repeatable navigation test, compare heap snapshots after forced GC, and follow retaining paths from growing objects. Common causes are unremoved listeners, timers, subscriptions, detached DOM, and unbounded caches; the fix is verified when repeated cycles stop increasing retained memory.

26. How would you measure frontend performance in the field and in a lab?

**Deep explanation:** Lab tools provide controlled traces, waterfalls, CPU throttling, and repeatable regression tests. Real-user monitoring captures actual Core Web Vitals, devices, networks, routes, and percentiles; attach release and diagnostic dimensions without collecting sensitive data. Use both: lab data explains causes, while field distributions reveal user impact and regressions.

**Interview answer:** I would combine repeatable lab testing for diagnosis with RUM for real-user outcomes. I would track Core Web Vitals and supporting timings by route, device, and release at percentiles such as p75, then use traces to investigate regressions seen in the field.

27. How would you prevent third-party scripts from dominating page performance?

**Deep explanation:** Inventory each script, assign an owner and measurable value, then remove or delay nonessential tags until consent or interaction. Load remaining scripts asynchronously, isolate them in workers or sandboxes where compatible, and enforce performance budgets through monitoring. Self-hosting can improve control but also transfers update and security responsibility.

**Interview answer:** I would treat every third-party script as a performance dependency with an owner and budget. Noncritical scripts load after consent or interaction, critical ones load asynchronously and are monitored for main-thread and network cost, and unnecessary vendors are removed.

28. How would you internationalize dates, plurals, numbers, and layouts?

**Deep explanation:** Store messages by stable keys and use ICU-style message formatting for plural/select rules rather than string concatenation. Format dates, times, currencies, and numbers with `Intl` using explicit locale and time-zone semantics. Allow text expansion, avoid fixed dimensions, use locale-aware sorting, and test representative scripts and pseudo-locales.

**Interview answer:** I would use message catalogs with ICU plural rules and the `Intl` APIs for dates, numbers, currencies, and collation. Layouts must tolerate expansion and different scripts, and tests should include pseudo-localization plus representative locales and time zones.

29. How would you support right-to-left content and mixed-language text?

**Deep explanation:** Set document or section `dir` correctly and use CSS logical properties such as `margin-inline-start` instead of left/right assumptions. For user-generated mixed text, use `dir="auto"` or Unicode isolation elements such as `bdi` so embedded runs do not reorder surrounding punctuation. Mirror directional icons but not inherently symmetric or semantic content, and test keyboard/focus order.

**Interview answer:** I would drive direction with `dir`, use logical CSS properties, and isolate mixed user content with `dir="auto"` or `bdi`. I would selectively mirror directional UI, preserve logical DOM and focus order, and test real RTL locales rather than relying on visual flipping.

30. How would you add secure clipboard and file-download functionality?

**Deep explanation:** Use the Clipboard API only in secure contexts and from a user gesture, request minimal permissions, and provide a selection-based fallback. For downloads, validate authorization server-side, sanitize filenames and content types, prevent formula or HTML injection where relevant, and revoke temporary object URLs. Large files should stream or use short-lived signed URLs rather than buffering entirely in memory.

**Interview answer:** Clipboard writes should be user-initiated over HTTPS with clear feedback and a fallback. Downloads must be authorized by the server, use safe filenames and content types, and for large files use streaming or short-lived signed URLs; any client object URL is revoked afterward.

31. How would you test a browser feature across different engines?

**Deep explanation:** Define a support matrix covering Chromium, Firefox, and WebKit plus relevant mobile versions. Use standards-based feature detection rather than user-agent sniffing, automate behavioral tests in each engine, and include a few real-device checks for platform-specific behavior. Provide a fallback or progressive enhancement and monitor failures in production.

**Interview answer:** I would define the supported browser matrix, use feature detection, and run the same behavioral suite in Chromium, Firefox, and WebKit, supplemented by real mobile devices. Unsupported capability gets a tested fallback or progressive enhancement rather than browser-name branching.

32. How would you manage feature flags in the frontend?

**Deep explanation:** Fetch typed flag definitions with safe defaults and evaluate them consistently for a stable user context. Flags control exposure, not authorization—the server still enforces access. Avoid layout flicker by resolving critical flags before render or bootstrapping them, log exposure for experiments, support emergency overrides, and remove stale flags after rollout.

**Interview answer:** I would use a typed flag service with deterministic targeting, safe defaults, exposure logging, and a kill switch. Critical flags are available before rendering to avoid flicker, server permissions remain authoritative, and every temporary flag has an owner and removal date.

33. How would you design reliable end-to-end selectors?

**Deep explanation:** Prefer accessible roles and names when they represent user-visible behavior; use stable `data-testid` attributes only where semantic selectors are ambiguous. Selectors should describe intent, not DOM structure, CSS classes, generated IDs, or translated text unless localization is under test. Keep test IDs documented and colocated with reusable components.

**Interview answer:** I would select by role, label, and accessible name first because that mirrors user interaction. When that is ambiguous, I would add a stable test ID tied to the component contract, avoiding brittle CSS paths, generated classes, and incidental structure.

34. How would you redact sensitive information in frontend telemetry?

**Deep explanation:** Start with an allowlist of fields rather than trying to blacklist every secret. Strip query values, form contents, tokens, headers, and user text before events leave the browser; sanitize URLs and errors, and avoid raw session replay in sensitive areas. Enforce equivalent server-side filtering, retention/access controls, sampling, and automated tests with synthetic secrets.

**Interview answer:** I would make telemetry schema-based and allowlisted, with redaction in the client before transmission and again at ingestion. Tokens, form values, user content, and sensitive URL parameters never ship; access, retention, and replay masking are controlled and tested.

35. How would you make a release recoverable when cached assets become incompatible?

**Deep explanation:** Use content-hashed immutable asset filenames and keep old assets available long enough for cached HTML and active sessions. Deploy assets before HTML, make service-worker activation/version migration deliberate, and avoid deleting chunks immediately after release. Add an error recovery path that detects chunk-load failures, refreshes once, and can roll back HTML/API compatibility safely.

**Interview answer:** I would content-hash assets, deploy them before HTML, and retain prior versions so cached pages can still load their chunks. Service-worker upgrades are versioned, APIs remain backward-compatible during rollout, and chunk-load failures trigger a guarded refresh with rollback available.

36. How would you compare Next.js routing conventions with a client-only router?

**Deep explanation:** Next.js routing is filesystem- and framework-driven, with nested layouts, server rendering, route-level loading/error UI, metadata, and server endpoints integrated into the build. A client-only router offers explicit runtime route configuration and hosting flexibility but requires separate solutions for SSR, data loading, SEO, and server boundaries. The choice depends on rendering and deployment needs, not only route syntax.

**Interview answer:** Next.js gives convention-based routes plus integrated server rendering, layouts, data boundaries, and deployment behavior. A client-only router gives more explicit control and works well for pure SPAs, but I must assemble SSR, data loading, and backend integration separately.

37. How would you choose static, dynamic, and incrementally regenerated pages in Next.js?

**Deep explanation:** Statically render content that is identical for users and changes only at deployment. Use incremental regeneration for cacheable public content that may tolerate bounded staleness, choosing revalidation by time or event. Dynamically render request-specific, personalized, authorization-sensitive, or truly fresh content; a route can combine cached and dynamic data, but caching behavior must be verified for the framework version.

**Interview answer:** I choose static generation for stable shared content, revalidation for shared content that can be briefly stale, and dynamic rendering for personalized or request-time data. I base the decision on freshness, cacheability, and access control, then verify the route's actual cache behavior.

38. How would you separate server-only code from client components in a full-stack React framework?

**Deep explanation:** Keep data access, secrets, privileged SDKs, and authorization in server modules or server components. Mark the smallest interactive leaf as a client component and pass only serializable, non-sensitive props across the boundary. Add server-only import guards or lint rules so database modules cannot enter browser bundles; server actions still validate authentication, authorization, and input.

**Interview answer:** I keep secrets, database access, and authorization in server-only modules and make client components only where browser state or events are needed. The boundary passes serializable safe data, tooling blocks server imports from client code, and every server action revalidates input and permissions.

39. How would you design loading and error boundaries around nested routes?

**Deep explanation:** Place boundaries at route segments that can load or fail independently, keeping persistent navigation and sibling content usable. Use local skeletons that match final geometry, distinguish expected not-found/domain errors from unexpected failures, and provide scoped retry/reset actions. Avoid a boundary for every tiny component because excessive fragmentation can cause visual churn and complicated recovery.

**Interview answer:** I would align loading and error boundaries with meaningful nested route ownership. A child failure gets a local fallback and retry while parent layout and siblings stay available; skeletons preserve layout, and a top-level boundary remains for unrecoverable failures.

40. How would you verify a framework's cache behavior instead of assuming all fetches behave alike?

**Deep explanation:** Build a small matrix of route mode, request options, authentication/cookies, revalidation settings, and navigation type. Instrument the origin with request IDs and timestamps, inspect response/cache headers and framework build output, then test first load, refresh, client navigation, expiry, mutation, and multiple deployment instances. Consult documentation for the exact version, because defaults and interactions change.

**Interview answer:** I would create a minimal reproducible route and instrument both server requests and response headers. Then I would test cold and warm requests, client navigation, revalidation, cookies, and deployments against a written matrix, using version-specific documentation and observed origin hits as evidence.
