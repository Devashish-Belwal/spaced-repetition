1. How do rendering and committing differ in React's execution model?

**Deep explanation:** Rendering calculates the next UI tree from props and state; it must be pure and may be paused, restarted, or discarded. Committing applies the chosen changes to the DOM, updates refs, and runs layout effects before later passive effects.

**Interview answer:** Render computes what the UI should be and may be repeated. Commit makes that result visible and runs commit-phase work such as refs and effects.

2. Why must rendering remain safe to repeat or abandon?

**Deep explanation:** Concurrent React can restart or discard render work. Side effects during render could therefore happen twice or survive an abandoned tree, so external work belongs in event handlers or effects.

**Interview answer:** Render must be pure because React may repeat or abandon it; otherwise we can duplicate writes, leak subscriptions, or corrupt shared state.

3. How would you diagnose an expensive commit versus expensive rendering?

**Deep explanation:** Use React DevTools Profiler for component render and commit timing, then correlate it with the browser Performance panel. Slow component calculations indicate render cost; DOM mutation, layout effects, style, layout, or paint after rendering indicate commit/browser cost.

**Interview answer:** I correlate React Profiler with browser traces: costly component work means rendering, while long DOM, layout-effect, layout, or paint work means commit-side cost.

4. How do transitions separate urgent and nonurgent updates?

**Deep explanation:** `startTransition` marks updates as interruptible background work, allowing urgent input updates to commit first. It changes scheduling priority, not network speed, and provides pending state for feedback.

**Interview answer:** I keep direct input urgent and wrap expensive follow-up updates in a transition so React can interrupt them and preserve responsiveness.

5. How would you use deferred values without confusing stale UI with stale server data?

**Deep explanation:** Defer only the value consumed by an expensive subtree while retaining the latest source value. Visually signal lagging results, and manage server freshness separately with keyed caching, cancellation, timestamps, and revalidation.

**Interview answer:** I make deferred UI staleness visible and keep it separate from server-data freshness, which is governed by request and cache policy.

6. How would you coordinate several Suspense boundaries to avoid poor loading experiences?

**Deep explanation:** Keep the stable shell visible, group content that must appear together, and nest boundaries for independently useful regions. During refreshes, transitions can retain existing content and avoid fallback flicker.

**Interview answer:** I align boundaries with UX regions: preserve the shell, reveal dependent content together, and progressively show independent sections.

7. How does streaming server rendering affect time to usable content?

**Deep explanation:** Streaming sends the shell and completed Suspense regions before all server work finishes, improving visual timing. Interaction still waits for JavaScript and hydration, so boundary placement and selective hydration determine actual usability.

**Interview answer:** Streaming can show HTML sooner, but usable content also requires its JavaScript and hydration, so I measure both visibility and interaction readiness.

8. How would you investigate a hydration failure that appears only in production?

**Deep explanation:** Reproduce with the production artifact, capture recoverable errors, server HTML, and initial client inputs. Compare dates, locale, timezone, random values, IDs, browser branches, invalid nesting, data versions, and CDN markup changes.

**Interview answer:** I compare server HTML with the client's first production render and look for nondeterminism, invalid markup, environment differences, and mismatched data.

9. How do Server Components differ from server-rendered Client Components?

**Deep explanation:** Server Components run only on the server and ship serialized output, not their code; they cannot use client state, effects, or browser APIs. Server-rendered Client Components still ship JavaScript and hydrate in the browser.

**Interview answer:** Server Components never run client-side. A server-rendered Client Component has initial server HTML but still ships and hydrates its code.

10. Where should the boundary between Server and Client Components sit?

**Deep explanation:** Keep data access, secrets, and noninteractive composition server-side, placing `'use client'` around the smallest cohesive interactive islands. Balance reduced JavaScript against excessive boundary fragmentation.

**Interview answer:** I default to server components and introduce client boundaries around cohesive features needing state, effects, or browser APIs.

11. What data can cross a Server Component boundary, and what needs special care?

**Deep explanation:** Pass only values supported by the framework's serialization transport. Arbitrary functions, clients, request objects, class instances, and secret-bearing objects should not cross; dates, collections, and server references require framework-specific verification.

**Interview answer:** I pass supported serializable data and explicit server references, never infrastructure objects, arbitrary functions, or secrets.

12. How would you prevent secrets from entering client bundles through shared modules?

**Deep explanation:** Isolate credentials in enforced server-only modules, use package boundaries and lint rules, and inspect bundles. Never rely on dead-code elimination; Client Component import reachability can expose shared-module contents.

**Interview answer:** I enforce server-only credential modules and expose narrow sanitized server APIs, then verify client bundles contain no secrets.

13. How would you secure a server-side action independently of its UI caller?

**Deep explanation:** Treat it as a public endpoint: authenticate, authorize the exact resource, validate input, enforce tenancy and origin/CSRF controls, and add idempotency, transactions, or rate limits where needed.

**Interview answer:** I authenticate, authorize per resource, validate all input, enforce tenant and CSRF boundaries, and never trust the UI as a security control.

14. How would you evaluate framework support and compatibility for Server Components?

**Deep explanation:** Assess supported React versions, router and bundler integration, caching, streaming, deployment targets, third-party libraries, testing, error handling, and upgrade policy. Validate critical flows in a production-like spike.

**Interview answer:** I evaluate the framework's complete RSC contract and prove critical behavior in a production-like prototype before adoption.

15. How would you assess whether React Compiler changes your memoization strategy?

**Deep explanation:** Inspect compiler coverage and measure the compiled application. Remove redundant memoization gradually, but retain stable identities required by external APIs, effects, or deliberate cache semantics.

**Interview answer:** I let profiling and compiler diagnostics guide removal of redundant memoization while preserving identities that are semantically required.

16. How would you identify code that violates assumptions required for compiler optimization?

**Deep explanation:** Use compiler diagnostics and React lint rules to find impure rendering, mutation, invalid Hook calls, ref access during render, and unsupported dynamic patterns. Refactor toward pure functions and immutable data, then retest coverage.

**Interview answer:** I inspect compiler bailouts and lint findings, fix impurity, mutation, and Hook violations, and verify both behavior and optimization coverage.

17. How would you integrate an external mutable store using a consistent subscription model?

**Deep explanation:** Use `useSyncExternalStore` with stable subscription logic and cached immutable snapshots. Provide a matching server snapshot for SSR and identity-stable selectors to limit rerenders.

**Interview answer:** I adapt the store through `useSyncExternalStore` using stable subscriptions, immutable snapshots, and an SSR snapshot.

18. How would you avoid tearing when a store changes during rendering?

**Deep explanation:** Publish atomic immutable snapshots through `useSyncExternalStore`; React can recheck before commit and retry if the version changed. Never read mutable store fields directly during render.

**Interview answer:** I use atomic versioned snapshots so React can detect mid-render changes and restart with one consistent store version.

19. How would you design a state model for collaborative editing and offline changes?

**Deep explanation:** Separate shared document state from ephemeral UI state. Persist uniquely identified operations with causal metadata and use CRDT, OT, or explicit domain merge rules; synchronization must tolerate replay, duplication, reordering, and reconnects.

**Interview answer:** I persist idempotent offline operations and merge them with a domain-appropriate CRDT or OT model while keeping local UI state separate.

20. How would you maintain correctness during overlapping optimistic mutations?

**Deep explanation:** Layer identified optimistic patches over confirmed state and rebase remaining patches as out-of-order responses arrive. Use idempotency keys, version checks, and serialization for operations that do not commute.

**Interview answer:** I track each optimistic patch, rebase on authoritative responses, and use idempotency and version checks to handle overlap safely.

21. How would you implement a complex form with thousands of fields?

**Deep explanation:** Use field-level subscriptions or uncontrolled inputs, partition sections, preserve normalized values outside mounted views, and validate incrementally. Virtualize carefully, retaining focus and accessibility, and profile keystroke latency and memory.

**Interview answer:** I avoid whole-form rerenders with field-level state, incremental validation, and careful virtualization while preserving unmounted values.

22. How would you balance virtualization with keyboard navigation and screen-reader access?

**Deep explanation:** Expose full collection semantics and indices, overscan around focus, and mount a destination before moving focus. Test real keyboard and assistive technology flows, offering pagination or nonvirtualized access when needed.

**Interview answer:** I preserve ARIA collection semantics, make focus targets mount before navigation, test with real assistive technology, and provide an accessible fallback.

23. How would you design a design-system component API that survives product evolution?

**Deep explanation:** Build semantic primitives with composition points instead of boolean-prop explosions. Keep state, refs, accessibility, and theming contracts consistent; evolve additively with deprecations, migration docs, and codemods.

**Interview answer:** I favor semantic, composable APIs with stable accessibility and state contracts, deliberate escape hatches, and managed deprecations.

24. How would you migrate a React monolith into independently deployed frontend modules?

**Deep explanation:** Define domain ownership and contracts, then extract vertical slices incrementally behind a stable shell. Govern shared React dependencies, isolate failures, instrument integration points, and require independent rollback.

**Interview answer:** I split by business capability, extract incrementally, govern shared dependencies, and prove failure isolation and rollback before independent deployment.

25. How would you prevent multiple React copies from breaking Hooks in a monorepo?

**Deep explanation:** Libraries should declare React as a peer dependency; central constraints should align versions. Externalize or alias React to the host copy, inspect the dependency graph, and fail CI on unintended duplicates.

**Interview answer:** I enforce React as a peer dependency and a single workspace version, configure bundling to use the host runtime, and audit duplicates in CI.

26. How would you profile memory retained after route transitions?

**Deep explanation:** Repeat navigation in a production build, compare heap snapshots after garbage collection, and inspect retaining paths for detached DOM, listeners, timers, caches, requests, and closures. Confirm the fix by showing memory stabilizes across cycles.

**Interview answer:** I take comparable heap snapshots across repeated transitions, trace dominator retaining paths, and verify retained memory stops growing after cleanup.

27. How would you handle realtime updates without rerendering an entire dashboard?

**Deep explanation:** Normalize events, update only affected entities, and give widgets narrow selector subscriptions with stable identities. Batch or coalesce bursts; move very high-frequency drawing to canvas, a worker, or a specialized engine.

**Interview answer:** I route normalized updates through narrow subscriptions, batch bursts, and keep high-frequency rendering outside React when appropriate.

28. How would you recover UI state after a chunk-loading failure during deployment?

**Deep explanation:** Detect chunk errors, retry briefly, then perform one guarded reload for the new manifest. Persist safe versioned draft state, retain old assets during rollout where possible, and prevent reload loops.

**Interview answer:** I use bounded retry followed by one controlled reload, preserve versioned recoverable state, and add loop protection and telemetry.

29. How would you test asynchronous rendering without relying on arbitrary delays?

**Deep explanation:** Control async dependencies with deferred promises, fake timers when time is the input, and `act`-aware utilities. Explicitly resolve work and assert observable UI states rather than internal render counts.

**Interview answer:** I make async inputs deterministic, resolve them explicitly inside React-aware test utilities, and assert user-visible states without sleeps.

30. How would you investigate Strict Mode revealing a subscription or cleanup bug?

**Deep explanation:** Strict Mode's extra development setup/cleanup cycle exposes nonreversible effects. Instrument every subscribe/unsubscribe pair, verify matching handler identity, and ensure cleanup releases timers, requests, observers, and listeners.

**Interview answer:** I treat Strict Mode as a lifecycle test, trace setup and cleanup symmetry, and fix the effect so remounting is safe.

31. How would you measure whether a React optimization improves actual user interaction latency?

**Deep explanation:** Measure the target interaction using field INP and custom input-to-paint marks, supported by browser and React profiles. Compare representative cohorts and tail latency while checking memory and loading regressions.

**Interview answer:** I measure real input-to-paint latency in production, especially INP and p75/tail behavior, rather than relying on render counts or microbenchmarks.

32. How would you define error boundaries for a page with several independently failing widgets?

**Deep explanation:** Place boundaries around independently useful failure domains, with contextual fallbacks, retry/reset, and metadata-rich reporting. Keep a page boundary as a final safety net without fragmenting into noisy micro-boundaries.

**Interview answer:** I align boundaries with independent widgets, provide useful retryable fallbacks, and retain a page-level boundary for unexpected shared failures.

33. How would you design authentication state across tabs, server rendering, and token refresh?

**Deep explanation:** Prefer server-validated sessions in secure HttpOnly SameSite cookies so SSR uses authoritative identity. Broadcast login/logout across tabs, deduplicate refresh, handle expiry races, rotate credentials, and clear user-scoped caches on identity changes.

**Interview answer:** I use a server-authoritative cookie session, coordinate auth events across tabs, make refresh single-flight, and invalidate user-scoped state when identity changes.

34. How would you migrate deprecated React APIs without changing user-visible behavior?

**Deep explanation:** Establish characterization, accessibility, and performance baselines first. Migrate incrementally, review codemod semantics, canary risky changes, compare telemetry, and retain rollback until confidence is high.

**Interview answer:** I lock down current behavior with tests and metrics, migrate in small reversible steps, and verify production telemetry before completing the rollout.

35. How would you decide whether a complex interaction belongs in React state or an external engine?

**Deep explanation:** React suits declarative UI-driven state at manageable update rates. High-frequency simulation, complex mutable graphs, collaboration, canvas/WebGL, or specialized undo may belong in an external engine exposed through narrow stable snapshots.

**Interview answer:** I decide by update frequency, data shape, and domain ownership: React owns declarative UI state, while specialized engines own hot or complex domain state.
