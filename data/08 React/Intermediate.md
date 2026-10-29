1. How does React decide whether to preserve or reset component state?

**Deep explanation:** React associates state with a component's identity in the render tree, not with the JSX text itself. It preserves state when the same component type remains at the same position with the same key; changing its type or key tells React it is a different component and resets its state.

**Interview answer:** React preserves state when a component keeps the same type, position, and key. If that identity changes, React unmounts the old component and initializes new state.

2. How do element type, position, and key affect reconciliation?

**Deep explanation:** React compares children by type and location. A different element type usually replaces the old subtree, while matching types are updated. Keys give siblings stable identities across insertion, deletion, and reordering; unstable keys such as array indexes can attach state to the wrong item.

**Interview answer:** Type tells React whether a node can be reused, position is the default identity among siblings, and keys provide explicit stable identity. Good keys let React reconcile reordered lists correctly.

3. What problems arise from mutating an object stored in state?

**Deep explanation:** Mutation keeps the same object reference, so React or memoized children may not detect a change. It also modifies previous render snapshots, which can cause stale UI, broken undo/history, and hard-to-reproduce bugs. Create a new object for each changed level instead.

**Interview answer:** Mutating state breaks React's snapshot and reference-equality assumptions. I produce a new object or array so React can detect the change and previous state remains intact.

4. How would you update deeply nested state safely?

**Deep explanation:** Copy every object or array along the path to the changed value, commonly with spread syntax or a functional state update. For very deep structures, normalize the data, split the state, or use an immutable-update helper such as Immer to reduce error-prone copying.

**Interview answer:** I use a functional update and create new references at every changed nesting level. If updates are deeply nested or frequent, I normalize the state or use Immer.

5. When would you choose useReducer over several useState calls?

**Deep explanation:** `useReducer` fits state whose fields change together, has multiple transition types, or benefits from explicit, testable rules. Separate `useState` calls are simpler for independent values. A reducer adds ceremony, so it should clarify transitions rather than merely centralize setters.

**Interview answer:** I choose `useReducer` when state transitions are related or complex and I want one explicit transition function. For independent, simple values, several `useState` calls are clearer.

6. How would you separate server state from local UI state?

**Deep explanation:** Server state is remote, asynchronous, shared, and subject to caching or invalidation; local state represents ephemeral UI details such as an open panel or draft input. Keep server data in a query/cache layer and local interaction state in component state or a reducer, avoiding copied server data unless editing a deliberate draft.

**Interview answer:** I use a server-state library for fetching, caching, retries, and invalidation, and React state for local UI details. I avoid mirroring query data into local state unless I need an editable draft.

7. How would you avoid storing data that can be derived during rendering?

**Deep explanation:** Store the minimal source of truth and compute values such as filtered lists, totals, or full names during rendering. This prevents synchronization bugs and extra Effects. Memoize only when profiling shows the derivation is expensive or referential stability is required.

**Interview answer:** I keep only source data in state and derive the rest in render. That removes duplicate state and synchronization Effects; I use `useMemo` only for genuinely expensive calculations.

8. How would you debug an Effect that runs continuously?

**Deep explanation:** Inspect which dependency changes on every render, especially newly created objects, arrays, or functions. Check whether the Effect sets state that changes one of its dependencies, forming a loop. Log or compare dependencies, move non-reactive construction inside the Effect, stabilize only where appropriate, or remove the Effect if the value can be derived.

**Interview answer:** I identify the dependency whose identity changes, then check whether the Effect updates that dependency. I fix the data flow, move construction inside the Effect, or stabilize a value only when stable identity is semantically correct.

9. What causes stale closures in Hooks?

**Deep explanation:** A callback captures values from the render in which it was created. If a dependency is omitted or a long-lived timer/listener keeps an old callback, it continues reading that snapshot. Correct dependencies, functional state updates, or a ref for the latest non-rendering value solve different versions of the problem.

**Interview answer:** Stale closures occur when a callback keeps values from an older render, often because dependencies were omitted. I declare dependencies, use functional updates, or use a ref when I specifically need the latest mutable value.

10. How would you avoid suppressing legitimate Effect dependency warnings?

**Deep explanation:** Treat the dependency rule as a design signal. Include every reactive value, restructure the Effect, move constants outside the component, move temporary objects inside the Effect, or extract stable logic. Disabling the rule can hide stale reads; do it only for a narrowly documented invariant that the linter cannot express.

**Interview answer:** I include all reactive dependencies and restructure the code when that causes unwanted reruns. I do not silence the warning merely to control timing because that usually creates stale behavior.

11. How would you cancel or ignore an outdated data-fetching result?

**Deep explanation:** Create an `AbortController` for each request and abort it in Effect cleanup when supported. Also guard commits with a request ID or ignore flag because not every async operation is cancellable. Query libraries commonly provide cancellation and prevent stale results from overwriting newer cache data.

**Interview answer:** I abort the old request in cleanup and ensure only the latest request may update state, using a request ID or ignore flag. This prevents race conditions where an older response wins.

12. How would you prevent duplicate submissions in a form?

**Deep explanation:** Track a submission state synchronously in the handler or mutation layer, reject further attempts while pending, and disable the submit control for feedback. Because retries and double clicks can still reach a server, use an idempotency key or server-side uniqueness rule for operations that must occur exactly once.

**Interview answer:** I guard the handler and disable submission while the request is pending. For important writes, I also use server-side idempotency because UI prevention alone cannot guarantee one execution.

13. How do useEffect and useLayoutEffect differ?

**Deep explanation:** `useEffect` normally runs after the browser paints and is appropriate for most synchronization work. `useLayoutEffect` runs after DOM changes but before paint, so it can measure and synchronously adjust layout without visible flicker. Because it blocks painting and is problematic during server rendering, use it sparingly.

**Interview answer:** `useEffect` runs after paint; `useLayoutEffect` runs before paint after the DOM update. I reserve layout Effects for measurement or visual correction that must happen without flicker.

14. How would you measure layout without causing unnecessary repainting?

**Deep explanation:** Read layout in a layout Effect or `ResizeObserver`, then update state only when the measured value actually changes. Batch reads before writes and avoid alternating DOM reads and writes, which forces layout thrashing. Prefer CSS when the layout can be expressed declaratively.

**Interview answer:** I measure in `useLayoutEffect` or with `ResizeObserver`, avoid interleaving reads and writes, and skip redundant state updates. I prefer CSS over JavaScript measurement whenever possible.

15. How do useMemo, useCallback, and memo differ?

**Deep explanation:** `useMemo` caches a computed value, `useCallback` caches a function reference, and `memo` lets a component skip rendering when its props compare equal. They are performance tools, not correctness guarantees; one always-new prop can defeat component memoization.

**Interview answer:** `useMemo` memoizes a value, `useCallback` a function identity, and `memo` a component result based on props. I apply them after identifying avoidable render or calculation cost.

16. When can memoization increase complexity without improving performance?

**Deep explanation:** Memoization adds dependency tracking, comparisons, memory use, and cognitive overhead. It provides little value when calculations and renders are cheap, dependencies change almost every render, or downstream consumers are not memoized. Profiling should show that the saved work exceeds these costs.

**Interview answer:** Memoization can be a net loss for cheap work or frequently changing dependencies. I profile first and keep ordinary rendering unless there is a measurable bottleneck or identity requirement.

17. How would you prevent broad Context updates from rerendering unrelated components?

**Deep explanation:** Split one broad context into contexts by concern and place providers close to consumers. Stabilize provider values where useful, and separate state from actions so action-only consumers do not update with state. For highly selective subscriptions, use an external store or context-selector approach.

**Interview answer:** I split context by update frequency and concern, keep provider values stable, and separate state from actions. If consumers need fine-grained subscriptions, I use a selector-based store.

18. How would you design a reusable compound component?

**Deep explanation:** Expose related parts such as `Tabs`, `Tabs.List`, and `Tabs.Panel`, with shared state and actions supplied through an internal context. Provide accessible defaults, controlled and uncontrolled APIs where justified, validation for misuse, and composition points without exposing internal implementation details.

**Interview answer:** I create named child components that share scoped context, such as `Tabs.List` and `Tabs.Panel`. The root owns coordination while consumers control structure and styling through composition.

19. How would you choose between render props, custom Hooks, and composition?

**Deep explanation:** Use composition when reusable UI structure is the main need, a custom Hook when sharing stateful behavior independent of markup, and a render prop when a component must own behavior but delegate rendering dynamically. Hooks are usually the least visually nested, but cannot replace every component boundary or lifecycle owner.

**Interview answer:** I prefer composition for UI structure, custom Hooks for reusable behavior, and render props when a component owns behavior while the caller must render from its live state.

20. How would you forward access to a DOM node across a component boundary?

**Deep explanation:** Accept or forward a ref according to the React version and attach it to the intended DOM element. Use `useImperativeHandle` when the component should expose a small imperative API rather than the entire node. Document ownership and avoid refs when a declarative prop can express the interaction.

**Interview answer:** I pass the ref through the component to the DOM node, using the version-appropriate ref API. If exposing the raw node is too broad, I expose a focused handle with `useImperativeHandle`.

21. How would you verify ref-handling conventions for the React version in use?

**Deep explanation:** Check the installed React version and its matching official documentation and type definitions, rather than assuming an older convention. Confirm whether the project expects `forwardRef`, supports ref as a prop, and which migration or compiler constraints apply; then follow the repository's established pattern.

**Interview answer:** I verify the installed version, official docs, and project types. Ref conventions changed across React versions, so I confirm whether this codebase uses `forwardRef` or the newer ref-as-prop approach.

22. How would you build a modal using a portal?

**Deep explanation:** Render the dialog into a dedicated DOM node with a portal so it escapes clipping and stacking contexts while remaining in the React event and context tree. Add a backdrop, semantic dialog markup, a close mechanism, focus management, scroll locking, Escape handling, and cleanup.

**Interview answer:** I portal the modal to a top-level container, then implement dialog semantics, focus trapping, Escape and backdrop behavior, scroll locking, and cleanup. The portal changes DOM placement, not React ownership.

23. How would you preserve focus when opening and closing a modal?

**Deep explanation:** Save the previously focused element, move focus to the dialog or its first appropriate control, and trap Tab navigation within it. On close, restore focus to the trigger if it still exists. Use a well-tested accessible dialog primitive when possible because nested dialogs and dynamic content add edge cases.

**Interview answer:** I remember the trigger, focus the dialog on open, trap focus while it is active, and restore focus on close. I also use proper dialog semantics and handle Escape.

24. How would you implement debounced autocomplete with request cancellation?

**Deep explanation:** Keep the input responsive immediately, then debounce only the query side effect. After the delay, abort the prior request, issue the new one, and accept results only if they belong to the latest query. Handle empty input, loading, errors, caching, and accessible keyboard selection.

**Interview answer:** I update the input immediately, debounce the search term, abort the previous request, and ignore any stale response. I also cache repeated queries and handle keyboard and screen-reader interaction.

25. How would you implement infinite scrolling without duplicate requests?

**Deep explanation:** Observe a sentinel with `IntersectionObserver` and request the next cursor only when more data exists and that cursor is not already pending or loaded. Deduplicate items by stable ID, cancel on unmount, and preserve an explicit retry or load-more path for accessibility and failure recovery.

**Interview answer:** I observe a sentinel, guard on `hasNextPage` and `isFetching`, and track cursors so each page is requested once. I merge items by stable ID and provide error recovery.

26. How would you virtualize a list of 100,000 rows?

**Deep explanation:** Render only the visible window plus a small overscan region, while a spacer preserves total scroll height. Fixed heights are simplest; variable heights require measurement and cached offsets. Use a mature virtualization library and ensure stable keys, keyboard access, and scroll-position restoration.

**Interview answer:** I window the list so only visible rows and overscan are mounted. I use stable IDs and a virtualization library, with measured-size caching if row heights vary.

27. How would you handle optimistic updates and rollback?

**Deep explanation:** Before the request, snapshot affected cached data, apply the predicted result, and reconcile with the server response. On failure, restore the snapshot or apply an inverse update and show an actionable error. Concurrent mutations need ordered IDs or cache-library support so one rollback does not erase a newer success.

**Interview answer:** I snapshot the current cache, apply the optimistic change, then replace it with the server result. If the request fails, I roll back and notify the user, taking care not to overwrite newer concurrent updates.

28. How would you cache, deduplicate, and invalidate server queries?

**Deep explanation:** Give each query a stable key derived from its inputs and use a query cache that shares in-flight requests among consumers. Configure freshness and retention separately, then invalidate or update precise keys after mutations. Broad invalidation is simple but causes extra traffic; exact cache updates are efficient but easier to get wrong.

**Interview answer:** I use stable query keys and a server-state library to share in-flight requests and cached results. After mutations, I update or invalidate the affected keys based on the required consistency.

29. How would you lazy-load a route or component?

**Deep explanation:** Split the code at a meaningful boundary using dynamic import and render the lazy component inside a Suspense fallback. Route-level boundaries often provide good chunking with predictable loading UI. Preload likely next routes where useful, and pair lazy loading with an error boundary for failed chunks.

**Interview answer:** I use a dynamic import at a route or heavy-component boundary, wrap it in Suspense, and add an error boundary. I may preload likely navigation targets to reduce perceived delay.

30. What does Suspense coordinate, and what does it not automatically support?

**Deep explanation:** Suspense coordinates a fallback while compatible children signal that they are not ready, such as lazy code or framework-integrated data resources. It controls reveal timing and nested boundaries. An arbitrary fetch started in `useEffect` does not automatically suspend, and Suspense does not replace error handling.

**Interview answer:** Suspense coordinates loading boundaries for resources integrated with it, including lazy modules and framework-supported data. It does not automatically handle ordinary Effect-based fetching or errors.

31. How would you recover when a lazily loaded bundle fails?

**Deep explanation:** Place an error boundary around the lazy boundary and offer retry or reload UI. A retry should create a genuinely new import attempt, often by resetting the boundary or refreshing after a deployment mismatch. Log the failure and avoid infinite retry loops; service-worker and stale-HTML issues may require a full reload.

**Interview answer:** I catch chunk failures with an error boundary, log them, and offer a bounded retry or reload. Resetting the boundary must trigger a new import attempt rather than reuse the rejected promise.

32. How do client rendering, server rendering, and static generation differ?

**Deep explanation:** Client rendering builds the UI primarily in the browser after JavaScript loads. Server rendering generates HTML per request, improving initial content but adding server work and hydration complexity. Static generation produces HTML at build or revalidation time, giving fast delivery but potentially stale content; applications often mix these approaches per route.

**Interview answer:** CSR renders in the browser, SSR generates HTML per request, and static generation creates HTML ahead of requests. The choice trades off freshness, infrastructure cost, initial response, and caching.

33. What is hydration?

**Deep explanation:** Hydration is React attaching behavior, event handlers, and component state to server-rendered HTML while reconciling it with the first client render. The initial client output should match the server markup so React can reuse the DOM predictably instead of repairing mismatches.

**Interview answer:** Hydration makes server-rendered HTML interactive by connecting it to the client React tree. The first client render must match the server output.

34. What common mistakes cause hydration mismatches?

**Deep explanation:** Common causes include rendering current time or randomness, browser-only values, locale-dependent output, invalid HTML nesting, different data, and conditional markup based on `window`. Make the first render deterministic, pass the server snapshot to the client, and defer genuinely client-only differences until after hydration.

**Interview answer:** Mismatches come from nondeterministic or environment-specific first renders, such as dates, random IDs, browser APIs, or different data. I make server and initial client output deterministic and defer client-only UI.

35. How would you test routing, forms, and network failures together?

**Deep explanation:** Use an integration test that mounts the application with a realistic router and intercepts network calls at the request boundary. Drive the form through user-visible controls, assert navigation and accessible UI, then simulate validation, timeout, and server-error responses. Keep a smaller number of end-to-end tests for real browser and deployment integration.

**Interview answer:** I write an integration test with the real routing setup and mocked network boundary, submit through user interactions, and assert navigation, loading, success, and failure states. I cover the critical path again with a focused end-to-end test.
