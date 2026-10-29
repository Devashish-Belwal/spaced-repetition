1. How would you design frontend architecture for several teams sharing one product?

**Deep explanation:** Organize around stable product domains, with explicit ownership, public interfaces, and dependency rules. Keep cross-cutting capabilities—design system, authentication, telemetry, build standards—on versioned platforms, while domain teams deploy independently where that autonomy pays for its operational cost. Use architecture decision records, contract tests, and a lightweight review process to prevent accidental coupling without centralizing every decision.

**Interview answer:** I would split the product by business domains, assign clear ownership, and require teams to interact through documented, versioned contracts. I would centralize only true platform concerns, automate boundary checks, and choose independent deployment only where it provides enough value to justify the extra complexity.

2. How would you compare microfrontends, a modular monolith, and a shared component library?

**Deep explanation:** A modular monolith gives the simplest runtime and atomic releases but needs strong internal boundaries. Microfrontends enable independent ownership and deployment, at the cost of duplicated dependencies, integration complexity, inconsistent UX, and harder observability. A shared component library standardizes presentation but does not define domain boundaries; it can complement either architecture.

**Interview answer:** I default to a modular monolith with enforced modules. I choose microfrontends only when independent release cadence and organizational autonomy outweigh runtime and governance costs, and I use a shared component library for visual consistency rather than treating it as the architecture.

3. How would you enforce dependency boundaries in a frontend monorepo?

**Deep explanation:** Give packages domain and layer tags, then encode allowed dependency directions in lint rules, build tooling, and import maps. Expose narrow public entry points, forbid deep imports and cycles, and make CI fail on violations. Ownership files and dependency graphs help reviewers spot architectural drift.

**Interview answer:** I would encode the architecture as machine-checkable rules: tagged packages, allowed dependency directions, public APIs, cycle detection, and no deep imports. CI should reject violations, while ownership and graph reports make exceptions visible and deliberate.

4. How would you prevent a service-worker update from trapping users on stale code?

**Deep explanation:** Version caches and assets immutably, avoid caching HTML indefinitely, and make activation an explicit lifecycle rather than blindly calling `skipWaiting`. Notify open clients that an update is ready, activate at a safe point, claim clients, and reload once so HTML and chunks belong to the same release. Keep a rollback path and delete old caches only after successful activation.

**Interview answer:** I would use hashed assets, short-lived or network-first HTML, versioned caches, and a controlled update prompt. After activation I would reload clients exactly once to align the document and chunks, while retaining rollback and telemetry for failed updates.

5. How would you reconcile offline edits from several devices?

**Deep explanation:** Model edits as operations with stable IDs, device identity, logical time, and idempotency keys rather than overwriting whole records. On reconnect, sync from a server cursor, deduplicate operations, and merge with domain-appropriate rules such as CRDTs, field-level last-writer-wins, or explicit user resolution. Tombstones and retained history are necessary to reconcile deletes safely.

**Interview answer:** I would sync idempotent operations plus version metadata, not entire snapshots. The merge policy would be chosen per domain—CRDT for collaborative structures, deterministic field merges where safe, and user-visible conflicts when intent cannot be inferred.

6. How would you handle conflict resolution for locally cached records?

**Deep explanation:** Store the server version or ETag alongside the local base and pending changes. On conflict, perform a three-way merge between base, local, and current server data; merge independent fields automatically and surface competing edits with meaningful context. Never silently resolve high-value destructive changes merely by timestamp.

**Interview answer:** I would retain the base version and submit conditional writes. If the server rejects one, I would three-way merge non-overlapping fields and ask the user to resolve semantically important collisions, then retry with the new version.

7. How would you build an accessible spreadsheet-like interface with millions of cells?

**Deep explanation:** Virtualize rows and columns so only a small window is rendered, but maintain a logical grid model independent of DOM nodes. Implement roving focus or `aria-activedescendant`, correct grid coordinates, keyboard navigation, selection announcements, and an offscreen accessible representation when needed. Batch measurement and painting, and test with multiple screen readers because virtualization can disrupt their navigation model.

**Interview answer:** I would separate the million-cell data model from a virtualized viewport. The viewport would expose proper grid semantics, predictable keyboard navigation, and announced selection/edit state, with overscan and focused-cell retention so recycling never loses accessibility context.

8. How would you render a high-frequency financial chart without blocking input?

**Deep explanation:** Ingest and aggregate data off the main thread, ideally in a worker, and transfer compact typed arrays. Render with Canvas or WebGL, cap updates to the display refresh rate, downsample to pixel resolution, and prioritize input over repainting. Separate a low-frequency accessible summary from the visual stream.

**Interview answer:** I would move parsing and aggregation to a worker, downsample to what the screen can show, and draw through Canvas or WebGL at most once per animation frame. Input and accessibility updates would remain lightweight and higher priority than rendering every tick.

9. How would you choose between DOM, Canvas, WebGL, and server-rendered images?

**Deep explanation:** DOM is best for semantic, interactive content of moderate size; Canvas handles many frequently changing 2D primitives but requires custom hit testing and accessibility. WebGL fits very large or GPU-heavy scenes but has the highest implementation cost. Server-rendered images suit static, shareable, low-interactivity output and weak clients, but cannot provide rich client interactions alone.

**Interview answer:** I choose based on semantics, element count, update rate, and interaction. DOM first for accessibility, Canvas for dense 2D drawing, WebGL for GPU-scale scenes, and server images for static output; hybrids often give the best accessible and visual result.

10. How would you manage coordinate transformations for a collaborative whiteboard?

**Deep explanation:** Store objects in a canonical world coordinate system and represent viewport pan, zoom, rotation, and device-pixel scaling as composed matrices. Convert pointer coordinates through the inverse view matrix before hit testing or emitting operations. Keep transforms numerically stable, define object-local coordinates, and synchronize model operations rather than screen pixels.

**Interview answer:** I would keep shared objects in world coordinates and treat each client's viewport as a matrix. Pointer events are transformed back with the inverse matrix, while collaboration messages carry world-space operations so different zoom levels and displays produce the same document.

11. How would you design browser storage eviction and quota recovery?

**Deep explanation:** Treat browser storage as evictable unless durable storage has been granted. Classify data by value, monitor estimates where supported, use bounded LRU cleanup, and preserve server-sync cursors and unsent operations ahead of reproducible caches. Catch quota failures, compact transactionally, retry once, and provide export or recovery for irreplaceable local-only data.

**Interview answer:** I assume caches can disappear. I would enforce per-category budgets, evict reproducible data first, protect unsynced work, handle quota errors transactionally, and expose a recovery path instead of letting storage failure corrupt application state.

12. How would you protect a web app against XSS while supporting rich user content?

**Deep explanation:** Parse rich content through a proven allowlist sanitizer and store a canonical safe format, while sanitizing again at the rendering boundary when formats can evolve. Avoid raw HTML sinks, use contextual escaping, Trusted Types, and a strict CSP as defense in depth. Isolate especially risky content in a sandboxed origin and validate URLs and CSS independently.

**Interview answer:** I would sanitize rich content with an allowlist, escape by context, avoid unsafe DOM APIs, and enforce Trusted Types plus CSP. For content that needs risky features, I would render it in a sandboxed, separate origin rather than weakening the main app.

13. How would you roll out a strict Content Security Policy without breaking the app?

**Deep explanation:** Start with `Content-Security-Policy-Report-Only`, collect and group violations, then remove inline code and unknown origins using nonces or hashes. Roll out directives incrementally, monitor browser support and false positives, and keep report samples free of sensitive data. Once stable, enforce while retaining reporting and regression tests.

**Interview answer:** I would inventory resource origins, deploy report-only CSP, fix violations, replace inline code with nonce- or hash-authorized code, and tighten directives in stages. After monitoring shows clean traffic, I would enforce it and keep CSP checks in CI and production telemetry.

14. How would you reduce supply-chain risk from browser dependencies and analytics scripts?

**Deep explanation:** Minimize dependencies, pin lockfiles, verify provenance and integrity, scan continuously, and review install scripts and maintainer changes. Self-host critical assets where practical, constrain third-party scripts with CSP, consent gates, sandboxed frames, and Subresource Integrity for immutable CDN files. Maintain an inventory, owners, and a rapid disable path.

**Interview answer:** I would reduce and pin dependencies, automate vulnerability and provenance checks, and review high-risk updates. Third-party browser code gets least privilege, explicit ownership, integrity controls where possible, and a kill switch because it executes with user-facing trust.

15. How would you isolate embedded customer code or third-party widgets?

**Deep explanation:** Run untrusted code in a sandboxed iframe on a separate origin with the fewest sandbox capabilities possible. Communicate through a small, schema-validated `postMessage` protocol and enforce quotas, timeouts, and feature permissions. A worker isolates computation but is not a complete security boundary for hostile code by itself.

**Interview answer:** I would place the widget in a sandboxed cross-origin iframe, grant only required capabilities, and expose a narrow validated message API. I would also constrain network, storage, CPU, and UI permissions and make the integration revocable.

16. How would you defend cross-window messaging against origin confusion?

**Deep explanation:** Send messages to an exact `targetOrigin`, never `*` for sensitive data, and verify both `event.origin` and the expected `event.source`. Validate message schemas, bind each session with a nonce or handshake, and keep privileged commands separate from untrusted data. Remember that an allowed window can later navigate, so revalidate throughout the channel lifetime.

**Interview answer:** I would pin the target origin, validate origin, source, schema, and a session nonce on every message, and expose only an allowlisted command set. I would close or re-handshake the channel after navigation or lifecycle changes.

17. How would you maintain authentication across embedded contexts with restricted third-party cookies?

**Deep explanation:** Avoid depending on third-party cookies. Use a top-level authorization flow with short-lived, single-use codes passed through a validated messaging handshake, then establish first-party state inside the embedded application's own origin where browser policy permits. Consider the Storage Access API or CHIPS only as capability-dependent enhancements, with a redirect or new-tab fallback.

**Interview answer:** I would use a top-level OAuth-style flow and exchange a one-time code rather than passing tokens or relying on third-party cookies. The embed gets short-lived scoped credentials, with Storage Access or partitioned cookies as optional enhancements and a clear fallback.

18. How would you assess cross-origin isolation requirements for shared memory?

**Deep explanation:** `SharedArrayBuffer` generally requires a secure, cross-origin-isolated page using COOP and COEP. Audit every subresource, iframe, popup, and authentication flow because COEP requires compatible CORS or CORP headers and COOP changes opener relationships. Enable the headers in report-only modes where available, verify `crossOriginIsolated`, and keep a non-shared-memory fallback.

**Interview answer:** I would first prove shared memory is worth the deployment constraints. Then I would audit dependencies, deploy compatible COOP and COEP headers, test popup and embed flows, check `crossOriginIsolated` at runtime, and retain a fallback for unsupported contexts.

19. How would you attribute an INP regression to application code or third-party code?

**Deep explanation:** Capture field INP attribution: interaction type, target, event timing, long animation frames or tasks, script URLs, and release metadata, while respecting privacy. Reproduce representative slow interactions with performance traces, then compare first-party and third-party task contribution through controlled blocking or feature flags. Segment by device, route, and percentile because aggregate averages hide regressions.

**Interview answer:** I would start with field attribution tied to releases, routes, devices, targets, and responsible long tasks. Then I would validate causality in traces and controlled experiments that disable suspected third-party or application features, rather than blaming whichever script appears nearby.

20. How would you design a performance budget enforced in CI and production?

**Deep explanation:** Set user-centered budgets for Core Web Vitals and interaction flows, plus proxy budgets for JavaScript, images, requests, and main-thread work. CI should catch deterministic regressions with repeatable tests and bundle diffs; production RUM should enforce percentile SLOs across real device and network segments. Define ownership, alert thresholds, and an explicit exception process with expiry dates.

**Interview answer:** I would combine CI guardrails for bundle and lab metrics with production percentile SLOs for real user outcomes. Budgets are route- and device-aware, owned by teams, and failures block or alert with a time-bounded exception process.

21. How would you avoid misleading frontend benchmarks caused by synthetic devices?

**Deep explanation:** Calibrate lab profiles against field distributions rather than naming an arbitrary device preset. Run multiple CPU, network, thermal, and cache states; control variance and report distributions instead of one score. Use lab tests for diagnosis and regression detection, then confirm product impact with RUM or controlled experiments.

**Interview answer:** I would never treat one emulated device score as reality. I would benchmark representative profiles repeatedly, report distributions, and use field data to choose profiles and validate whether a lab regression affects actual users.

22. How would you recover when an API schema changes before cached clients update?

**Deep explanation:** Servers should tolerate older clients through additive changes, versioned representations, and a compatibility window. Validate responses at client boundaries, supply defaults or adapters for known variants, and fail safely with a refresh or upgrade path when required fields are incompatible. Telemetry should identify client build and schema version so deprecation follows observed usage.

**Interview answer:** I would keep server changes backward compatible for the supported client window and adapt version differences at one client boundary. If compatibility is impossible, the client should detect it, preserve user work, and prompt a controlled refresh rather than crash unpredictably.

23. How would you design backward-compatible contracts for independently deployed frontend and backend teams?

**Deep explanation:** Prefer additive evolution: optional new fields, stable semantics, tolerant readers, and explicit deprecation periods. Publish machine-readable schemas, generate or validate types, and run consumer-driven or compatibility tests against supported versions. Breaking changes require a parallel version, migration telemetry, and coordinated retirement rather than synchronized deployment assumptions.

**Interview answer:** I would make contracts additive and versioned, validate them automatically, and test each producer against active consumer expectations. Breaking changes ship in parallel, with usage telemetry and a documented deprecation window, so frontend and backend releases remain independent.

24. How would you preserve accessibility when introducing custom gestures and animation?

**Deep explanation:** Every gesture needs an equivalent keyboard and pointer control with visible instructions and sufficient target size. Respect `prefers-reduced-motion`, avoid motion that triggers vestibular issues, preserve focus, and announce meaningful state changes without noise. Test zoom, switch control, screen readers, and touch exploration rather than assuming ARIA alone is sufficient.

**Interview answer:** I would treat gestures as enhancements, always providing keyboard and visible control alternatives. Animation respects reduced-motion preferences, never hides focus or state, and is tested with assistive technologies and high zoom.

25. How would you test reconnect behavior under intermittent mobile networks?

**Deep explanation:** Use deterministic network fault injection for latency, loss, offline transitions, reordered responses, captive behavior, and reconnect flapping. Test requests at every lifecycle point, verify retry backoff and idempotency, and assert that queued mutations neither disappear nor duplicate. Combine automated state-machine tests with real-device runs and server-side correlation.

**Interview answer:** I would script repeatable disconnect and reconnect scenarios around every request state, including flapping and reordered responses. Success means no lost or duplicate mutations, bounded retries with jitter, accurate UI state, and eventual convergence verified on real mobile devices.

26. How would you implement privacy-aware session replay or choose not to capture sensitive screens?

**Deep explanation:** Begin with data minimization and a documented threat model, not blanket capture. Default-deny text, inputs, media, canvas, and sensitive routes; allowlist only necessary elements, sample narrowly, encrypt data, restrict retention and access, and honor consent and regional rules. If useful debugging cannot be achieved without unacceptable re-identification or secret leakage risk, use structured events instead.

**Interview answer:** I would make replay opt-in by surface, mask by default, exclude sensitive routes, and tightly control sampling, access, and retention. If we cannot demonstrate that secrets and personal data stay out, I would not deploy replay and would use privacy-preserving telemetry instead.

27. How would you compare edge rendering, streaming rendering, and static delivery for a global product?

**Deep explanation:** Static delivery gives the lowest cost and highest cacheability for content that changes infrequently. Streaming improves perceived latency for dynamic pages by sending useful HTML as data resolves, while edge rendering reduces geographic compute latency but adds distributed runtime, data-access, consistency, and observability constraints. Architectures can combine static shells, streamed personalization, and edge routing per route.

**Interview answer:** I choose per route: static for cacheable content, streaming when dynamic dependencies resolve at different speeds, and edge compute when geographic latency justifies its operational constraints. I measure total user latency, cache hit rate, data locality, and failure behavior rather than assuming edge is always faster.

28. How would you migrate a large application between build tools with minimal disruption?

**Deep explanation:** Inventory implicit behavior—module resolution, transforms, environment variables, assets, tests, dev proxy, and chunking—before changing tools. Create a compatibility layer and migrate vertical slices behind identical commands, comparing output, runtime behavior, and performance in CI. Run both paths temporarily, canary the new build, and keep rollback until production parity is proven.

**Interview answer:** I would first capture the old tool's behavioral contract, then migrate incrementally behind stable developer commands. Dual builds, parity tests, bundle comparisons, canaries, and rollback let teams continue shipping while risks are isolated.

29. How would you design frontend observability that connects a user action to backend traces?

**Deep explanation:** Create a trace or interaction context at the user action and propagate W3C trace headers through frontend requests, respecting cross-origin allowlists. Attach route, release, session-safe correlation IDs, Web Vitals, and errors to spans without collecting sensitive content. Sampling must be coordinated so important failures retain both client and server traces.

**Interview answer:** I would represent a user action as a client span and propagate trace context to every related backend request. Release, route, errors, and performance signals share privacy-safe correlation metadata, with coordinated sampling so engineers can follow one action end to end.

30. How would you investigate a browser-specific production failure you cannot reproduce locally?

**Deep explanation:** Segment telemetry by exact browser, OS, hardware, feature support, release, route, and experiment, then improve diagnostics around the failing boundary. Acquire a matching real device or cloud browser, replay minimal inputs, and use remote debugging or a guarded diagnostic build. Bisect with feature flags and capability detection while preserving a safe fallback for affected users.

**Interview answer:** I would narrow the affected environment from production evidence, add privacy-safe diagnostics, and reproduce on matching real or hosted hardware. In parallel I would mitigate with a feature flag or fallback, then bisect features and verify the fix against the affected segment.

31. How would you prevent personalized Next.js responses from entering a shared route or data cache?

**Deep explanation:** Make personalization explicit by reading request-specific inputs such as cookies or headers and ensure the route is dynamically rendered where required. Mark personalized fetches as uncached with `cache: 'no-store'` or an appropriate revalidation policy, and never use a shared cache key that omits identity or authorization scope. Test for cross-user leakage at both framework and CDN layers.

**Interview answer:** I would separate public cacheable data from personalized data, force dynamic rendering for request-bound output, and disable shared caching for identity-scoped fetches. I would also configure CDN headers deliberately and run two-user leakage tests before release.

32. How would you coordinate revalidation after mutations across server data and client navigation state?

**Deep explanation:** Give cached server data stable tags or paths and make the mutation return canonical updated state plus a version. After authorization and commit, invalidate the precise server tags, then update or invalidate the client cache and refresh navigation state only where needed. Use optimistic updates with rollback and deduplicate concurrent refreshes to avoid flicker and races.

**Interview answer:** The mutation should commit first, return canonical data, and invalidate narrowly tagged server entries. I would reconcile the client optimistically or from that response, refresh affected route state, and guard against races with versions and request deduplication.

33. How would you authorize server actions independently of page-level route protection?

**Deep explanation:** Treat every server action as a public mutation endpoint because clients can invoke it without following the intended UI. Re-authenticate inside the action, authorize the specific resource and operation, validate input, protect against request forgery as applicable, and enforce tenancy and rate limits. Route guards improve UX but are not an authorization boundary.

**Interview answer:** I would put authentication, resource-level authorization, validation, and tenancy checks inside every server action. Page middleware can redirect users, but it never substitutes for mutation-level authorization on the server.

34. How would you deploy a server-rendered application across several instances with consistent cache invalidation?

**Deep explanation:** Do not rely on process-local invalidation when requests can reach different instances. Use a shared cache or publish versioned invalidation events through durable infrastructure, with idempotent consumers and a recovery mechanism for missed events. Prefer immutable keys or generational namespaces where possible, and monitor propagation delay and stale-hit rates.

**Interview answer:** I would use shared cache state or durable invalidation events, not per-instance memory. Versioned keys, idempotent invalidation, replay for missed events, and propagation metrics keep instances consistent while allowing safe rolling deployments.

35. How would you migrate between framework versions when routing, rendering, or caching defaults change?

**Deep explanation:** Inventory every behavior that depends on defaults and turn it into explicit configuration or characterization tests. Read migration notes and codemods critically, upgrade in supported increments, and canary routes while comparing HTML, cache headers, data freshness, errors, and performance. Use compatibility adapters and feature flags so rollback does not require undoing unrelated work.

**Interview answer:** I would freeze current behavior in tests, make implicit routing and caching assumptions explicit, and upgrade incrementally. Automated migration helps with syntax, but canary comparisons, observability, feature flags, and rollback prove semantic compatibility.
