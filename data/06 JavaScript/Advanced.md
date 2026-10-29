1. How would you implement Promise.all while preserving order and rejection behavior?

**Deep explanation:** Convert the iterable to an array, allocate a results array of the same length, and wrap each item with `Promise.resolve`. Store each fulfillment at its original index and resolve only after every item succeeds; reject immediately on the first rejection. An empty input must resolve to `[]`. Already-running promises cannot be stopped by rejecting the aggregate.

**Interview answer:** I would normalize every value with `Promise.resolve`, write results by input index rather than completion order, count fulfillments, and resolve when the count reaches the input length. Any rejection immediately rejects the returned promise, and an empty iterable resolves to an empty array.

2. How would you implement a Promise-based concurrency limiter with cancellation?

**Deep explanation:** Maintain a FIFO queue and an `active` count. Start work while `active < limit`; in `finally`, decrement the count and drain again. Accept an `AbortSignal`, reject queued tasks when it aborts, and pass the signal into running tasks so cooperative operations can stop. Cancellation cannot forcibly terminate arbitrary JavaScript already executing.

**Interview answer:** I would queue task factories, run at most N, and start the next task from each task's `finally`. An `AbortSignal` would reject pending tasks and be forwarded to active tasks, with the caveat that running work must cooperate with cancellation.

3. How would you design an asynchronous queue with backpressure?

**Deep explanation:** Separate waiting producers and consumers. `enqueue` either satisfies a waiting consumer or buffers an item; `dequeue` either consumes buffered data or waits. Set a capacity and make producers await available space once it is reached. Define close and error semantics so all waiters settle, and consider fairness and cancellation.

**Interview answer:** I would use a bounded FIFO where consumers await data and producers await capacity. Direct handoff avoids unnecessary buffering, and close, failure, cancellation, and fairness rules ensure no waiter is left unresolved.

4. How would you implement a Promise timeout that also cancels underlying work?

**Deep explanation:** Create an `AbortController`, pass its signal to the operation, and race the operation against a timer that aborts and rejects with a timeout error. Clear the timer in `finally` and handle the losing promise to avoid unhandled rejections. A timeout only truly stops work if the underlying API observes the signal.

**Interview answer:** I would combine a timer with an `AbortController`: on timeout, abort and reject; on completion, clear the timer. I would also ensure the losing branch is handled and state that cancellation is cooperative.

5. How would you prevent starvation in a recursively scheduled microtask chain?

**Deep explanation:** Microtasks drain before the event loop advances, so endlessly scheduling more can block rendering, timers, and I/O. Process work in bounded batches, then yield through a task source such as `setTimeout`, `MessageChannel`, or a scheduler API. Choose the batch size by measuring latency versus throughput.

**Interview answer:** I would cap the amount of work per microtask and periodically yield to the task queue. That lets rendering and I/O proceed while preserving good throughput.

6. How would you model cooperative cancellation across generators and async functions?

**Deep explanation:** Use one cancellation context, commonly an `AbortSignal`, and propagate it through every layer. Async functions check it at awaits and pass it to cancellable APIs; generators check between yields and use `return()`/`finally` for cleanup. Translate cancellation into a consistent error type while keeping cleanup idempotent.

**Interview answer:** I would thread an `AbortSignal` through generators and async functions, check it at suspension boundaries, and put cleanup in `finally`. Cancellation remains cooperative and should use one consistent error contract.

7. How would you implement deep cloning with cycles and shared references?

**Deep explanation:** Keep a `WeakMap` from source objects to clones. Register a clone before recursively copying children, so cycles terminate and repeated references point to the same clone. Handle supported built-ins explicitly, preserve descriptors/prototypes only if required, and reject unsupported resources such as functions or DOM handles. `structuredClone` is preferable when its semantics fit.

**Interview answer:** I would memoize each source object in a `WeakMap` before descending. That preserves both cycles and aliasing, while type-specific handlers define behavior for Maps, Sets, typed arrays, dates, and other supported objects.

8. How would you design equality semantics for Maps, Sets, Dates, and cyclic objects?

**Deep explanation:** Equality needs an explicit contract: identity or structural equality, ordered or unordered collections, key comparison rules, prototype handling, and treatment of `NaN`/`-0`. Dates can compare timestamps; Maps and Sets usually require order-independent matching, which may be expensive. Track compared object pairs to terminate cycles without incorrectly equating different graph structures.

**Interview answer:** I would define the semantics first, then implement per type: timestamps for Dates, chosen key/value semantics for Maps, unordered membership for Sets, and a memo of object pairs for cycles. Complexity and ambiguous object-key matching must be documented.

9. How do Proxy traps interact with language invariants?

**Deep explanation:** A Proxy may customize operations but cannot contradict non-configurable properties or a non-extensible target. For example, `getOwnPropertyDescriptor`, `ownKeys`, `defineProperty`, and `set` must report results compatible with the target's real state. Engines validate these invariants after traps and throw `TypeError` on violations.

**Interview answer:** Proxy traps are not unrestricted virtualization. Their results must remain consistent with non-configurable properties and target extensibility, or the runtime throws a `TypeError`.

10. How would you use Reflect to preserve default object behavior inside a Proxy?

**Deep explanation:** Delegate with the matching `Reflect` method, such as `Reflect.get(target, key, receiver)`. Passing `receiver` matters because getters and setters use it as `this`; direct `target[key]` can change inherited accessor behavior. Reflect also returns operation-appropriate booleans instead of requiring manual emulation.

**Interview answer:** Each trap should normally delegate to its corresponding `Reflect` method after applying custom logic. I would preserve all arguments—especially the receiver—so accessors, prototypes, and failure semantics remain correct.

11. How would you build a reactive dependency tracker without leaking subscriptions?

**Deep explanation:** While an effect runs, record each accessed signal in a dependency set and subscribe the effect. Before rerunning, remove its old subscriptions so conditional dependencies do not accumulate. Provide explicit disposal, store reverse edges for efficient cleanup, avoid strong global registries where possible, and guard against re-entrancy or infinite update loops.

**Interview answer:** I would track dependencies during effect execution, clean previous subscriptions before every rerun, and expose disposal. Bidirectional bookkeeping makes cleanup deterministic; weak references alone are not a substitute for lifecycle management.

12. How would you prevent prototype pollution while merging untrusted objects?

**Deep explanation:** Reject dangerous keys such as `__proto__`, `prototype`, and `constructor` at every depth, operate only on own properties, and avoid invoking accessors. Build dictionary data with `Object.create(null)` or Map, validate against a schema, and prefer allowlists. Freezing prototypes is only defense in depth, not input validation.

**Interview answer:** I would schema-validate and allowlist keys, recursively block prototype-related keys, inspect only own data properties, and merge into null-prototype dictionaries or Maps. I would never blindly deep-merge untrusted input.

13. How can accessors make apparently simple property reads execute arbitrary code?

**Deep explanation:** A property lookup can invoke an own or inherited getter, and a Proxy `get` trap can run too. That code may mutate state, throw, perform I/O, or re-enter the caller. When inspecting untrusted objects, use property descriptors and prototype checks rather than reading values, and copy only validated data properties.

**Interview answer:** `obj.x` is not necessarily passive: it may call a getter or Proxy trap with arbitrary side effects. For untrusted objects, I inspect descriptors and accept only expected own data properties before reading values.

14. How would you safely process untrusted regular expressions or patterns?

**Deep explanation:** Backtracking regex engines can exhibit catastrophic runtime on crafted input. Prefer a non-backtracking engine or a restricted pattern language, limit pattern and input sizes, reject risky constructs with a proven parser, and execute with a hard time budget in an isolatable worker or process. A Promise timeout cannot interrupt synchronous regex execution on the same thread.

**Interview answer:** I would avoid running arbitrary patterns in the main backtracking engine. I would use a safe engine or restricted grammar, enforce size limits, and isolate evaluation so a real timeout can terminate it.

15. How would you avoid relying on FinalizationRegistry for essential resource cleanup?

**Deep explanation:** Finalizers are nondeterministic and may never run before process exit. Use explicit `close`/`dispose`, `try/finally`, scoped ownership, or explicit resource-management syntax where supported. A finalizer may serve only as a diagnostic or best-effort fallback and must not depend on the target through the held value.

**Interview answer:** Essential cleanup must be deterministic, so I use explicit disposal in `finally` or scoped resource management. `FinalizationRegistry` is only a best-effort safety net, never the primary release mechanism.

16. What limits make WeakRef unsuitable for predictable cache expiration?

**Deep explanation:** Garbage collection timing is unspecified, and an object may remain reachable or uncollected for an arbitrary duration. Dereferencing is race-like across jobs, memory pressure varies, and finalization is not prompt. Therefore WeakRef can reduce retention opportunistically but cannot implement TTLs, size limits, or correctness-critical eviction.

**Interview answer:** WeakRef eviction follows nondeterministic GC, not time or cache policy. I would use explicit TTL/LRU bookkeeping for predictable expiration and only use weak references as an optional memory-pressure optimization.

17. How do V8 hidden classes and inline caches affect hot code?

**Deep explanation:** V8 records object shapes internally and caches property-access behavior at call sites. Objects created with consistent property order and stable types tend to keep sites monomorphic and cheap; shape churn, deletes, or many unrelated shapes can make caches polymorphic or megamorphic. This is an engine optimization, so optimize only after profiling and preserve readable semantics.

**Interview answer:** Stable object shapes let V8 reuse optimized property-access paths. In hot code I avoid unnecessary shape changes and inconsistent construction, but I treat this as profile-guided V8-specific tuning rather than a language rule.

18. How would you investigate deoptimization caused by changing object shapes?

**Deep explanation:** Reproduce the hot path, collect a CPU profile and optimization/deoptimization traces, and identify the function and reason. Compare object construction paths, property order, deletes, optional fields, and value-type changes. Confirm the hypothesis with a minimal benchmark and production-representative workload before restructuring objects.

**Interview answer:** I would start with profiles and V8 deoptimization diagnostics, find the exact hot call site, then inspect shape and type consistency of its inputs. I would change construction only after a focused benchmark confirms the cause.

19. How would you compare allocation-heavy immutable updates with structural sharing?

**Deep explanation:** Full copying costs time and memory proportional to the copied structure and increases garbage-collection pressure. Persistent structures copy only the path to a change and share unchanged branches, typically reducing update cost to the structure's depth but adding indirection and metadata. Measure update/read throughput, peak memory, GC pauses, equality checks, and workload shape.

**Interview answer:** I would benchmark realistic reads and updates, including allocation rate and GC. Structural sharing usually makes deep updates cheaper and reference comparisons useful, but it trades that for indirection, implementation complexity, and sometimes slower reads.

20. How would you identify detached DOM nodes retained by closures?

**Deep explanation:** Take heap snapshots before and after repeatedly mounting and removing the UI, force GC where tooling permits, and compare retained objects. Locate detached nodes and follow retaining paths to listeners, timers, observers, caches, or closure environments. Fix lifecycle cleanup, repeat the scenario, and verify that retained counts stabilize.

**Interview answer:** I would reproduce the lifecycle repeatedly, compare heap snapshots, and inspect retaining paths from detached nodes. Closures usually lead back to an uncleared listener, timer, observer, or cache, which I would dispose and then verify with another snapshot.

21. How do SharedArrayBuffer and Atomics change JavaScript's concurrency model?

**Deep explanation:** Workers can share the same bytes rather than communicate only by copied messages. Ordinary concurrent reads and writes can race, while `Atomics` provides indivisible operations, ordering, and wait/notify coordination on supported integer typed arrays. Correctness now requires synchronization design; browsers also require cross-origin isolation for security.

**Interview answer:** SharedArrayBuffer introduces genuine shared-memory concurrency between workers. I use Atomics to establish synchronization and visibility, design against races and deadlocks, and account for browser cross-origin-isolation requirements.

22. How would you coordinate two workers without data races?

**Deep explanation:** Prefer message passing when throughput permits because ownership is clearer. With shared memory, define ownership of each region or a small protocol using atomic state transitions; publish data before an atomic ready flag and consume it after observing that flag. Avoid unsynchronized mixed access, document states, and test liveness as well as safety.

**Interview answer:** I would first choose message passing. If shared memory is necessary, I would define explicit ownership and an Atomics-based state machine or lock-free queue so every handoff has a clear happens-before relationship.

23. How would you evaluate transfer costs when moving data to a Web Worker?

**Deep explanation:** Compare structured cloning, transferable ownership, and shared memory using realistic payload sizes. Measure serialization time, main-thread blocking, latency, memory peaks, and the fact that transferred buffers become detached. Small messages may not justify worker overhead; chunking or double buffering can improve pipelines.

**Interview answer:** I would benchmark end-to-end latency and memory for cloning versus transferring representative payloads. Transferables are usually best for large buffers, but they give up sender ownership, while small tasks may cost more to dispatch than to execute locally.

24. How would you build a binary-protocol parser using TypedArrays and DataView?

**Deep explanation:** Keep an `ArrayBuffer` plus a cursor, bounds-check before every read, and use `DataView` for mixed-width integers, floats, and explicit endianness. Use typed-array views for homogeneous aligned regions and decode text with `TextDecoder`. Validate lengths before allocating or slicing, return structured parse errors, and support incomplete frames if streaming.

**Interview answer:** I would implement a cursor-based reader over DataView with explicit endian flags and strict bounds checks. Length fields are validated before use, typed arrays handle bulk homogeneous data, and streaming input distinguishes incomplete data from malformed frames.

25. How would you avoid endianness and byte-offset bugs in binary parsing?

**Deep explanation:** Specify endianness per field and always pass the flag explicitly to DataView methods. Remember that a view may start at a nonzero `byteOffset`; calculate offsets relative to the view and validate against `byteLength`. Centralize reads in tested helpers and use golden byte fixtures covering boundaries, misalignment, and truncated input.

**Interview answer:** I would never rely on implicit byte order or raw buffer offsets. A small reader abstraction uses view-relative offsets, explicit endianness, bounds checks, and fixture tests for boundary and truncated cases.

26. How would you design a library that works in browsers, Node.js, and workers?

**Deep explanation:** Keep the core free of platform globals and inject capabilities such as storage, timers, or networking. Publish standards-based ESM with carefully tested conditional exports only where implementations differ. Avoid top-level DOM/Node access and side effects, declare supported runtimes, and test each target with its native tooling.

**Interview answer:** I would build a platform-neutral core around web-standard APIs, isolate environment adapters, and avoid touching `window` or Node globals at module load. Conditional exports and a target-specific test matrix cover genuine runtime differences.

27. How would you make a package tree-shakeable without breaking side effects?

**Deep explanation:** Ship static ESM exports, avoid CommonJS indirection and namespace mutation, and keep modules small. Move registration or global mutation into explicit entry points. Set `sideEffects` accurately—`false` only when dropping any module is safe, otherwise list side-effectful files—and test production bundles to ensure CSS, polyfills, and initialization remain.

**Interview answer:** I would expose static ESM, isolate side effects behind explicit imports, and provide accurate package side-effect metadata. Then I would test real bundlers to verify unused code disappears without losing required initialization or assets.

28. How would you assess the correctness of a polyfill against language semantics?

**Deep explanation:** Read the relevant ECMAScript algorithms, including coercion order, property descriptors, species, iterators, realms, and abrupt completion. Run conformance tests such as relevant Test262 cases across edge inputs and compare native behavior where trustworthy. Some features cannot be faithfully polyfilled because they require syntax, internal slots, or engine integration; document those limits.

**Interview answer:** I would implement from the specification algorithm, not common examples, and validate with conformance tests covering coercion and observable ordering. I would explicitly state when a feature is only a shim because internal engine behavior cannot be reproduced.

29. How would you migrate from legacy decorators to a different decorator proposal safely?

**Deep explanation:** Inventory decorator usage and identify semantic differences in evaluation order, signatures, metadata, field initialization, and class replacement. Pin compiler settings, create adapter decorators where feasible, migrate one category at a time, and add behavior tests rather than snapshotting emitted code. Coordinate metadata-dependent frameworks and avoid mixing modes silently.

**Interview answer:** I would first map every decorator to the new proposal's lifecycle and signature, especially metadata and field initialization. With compiler settings pinned, adapters and behavior tests let me migrate incrementally and catch framework incompatibilities.

30. How would you evaluate explicit resource-management support across target runtimes?

**Deep explanation:** Check syntax parsing, `Symbol.dispose`/`Symbol.asyncDispose`, library support, and transpiler output for every supported runtime. Verify disposal order, suppressed-error behavior, and async cleanup with tests. If syntax cannot be shipped safely, expose explicit `dispose` APIs and `try/finally`; avoid assuming a polyfill can add unsupported syntax.

**Interview answer:** I would build a runtime and toolchain compatibility matrix, then test disposal order and error semantics. Where syntax support is incomplete, I keep an explicit disposal API and `try/finally` fallback rather than relying on a symbol polyfill alone.

31. How would you make event listeners, timers, and observers release resources predictably?

**Deep explanation:** Give each component an explicit lifecycle owner and make setup return an idempotent cleanup function. Cleanup removes listeners with matching options, clears timer handles, disconnects observers, and aborts outstanding work. An `AbortController` can group compatible listeners and operations; `try/finally` or framework unmount hooks must invoke disposal.

**Interview answer:** I would centralize every acquired handle in an idempotent disposer called at unmount or in `finally`. Abort signals can group listeners and async work, while timers and observers are explicitly cleared or disconnected.

32. How would you build a deterministic test harness for asynchronous scheduling?

**Deep explanation:** Inject clocks, schedulers, randomness, and I/O rather than using globals. Represent queued tasks and timers explicitly, provide operations to advance virtual time and drain selected queues, and flush microtasks at defined checkpoints. Avoid depending on production event-loop internals the harness cannot model, and add integration tests for real-runtime behavior.

**Interview answer:** I would dependency-inject a virtual clock and scheduler, then let tests advance time and drain queues deliberately. That makes ordering reproducible, while a smaller integration suite validates assumptions against the real event loop.

33. How would you avoid precision loss when exchanging large identifiers through JSON?

**Deep explanation:** JSON numbers parsed by JavaScript lose integer precision beyond `Number.MAX_SAFE_INTEGER`, and `JSON.stringify` cannot serialize BigInt directly. Encode identifiers as decimal strings, validate their format, and convert to BigInt only where arithmetic is needed. Ensure every producer and consumer treats the field as a string in its schema.

**Interview answer:** I would serialize large identifiers as strings, never JSON numbers. The schema enforces that representation end to end, and consumers may convert to BigInt only for computation.

34. How would you defend a JavaScript sandbox against host-object escape paths?

**Deep explanation:** Same-realm object-capability sandboxes are extremely hard because constructors, prototypes, accessors, dynamic code, and exposed host objects can reveal ambient authority. Use a separate process or hardened realm, expose a tiny capability-based API through serialized messages, validate inputs, freeze or remove dangerous intrinsics, enforce resource limits, and keep the isolation boundary patched. `eval` plus a Proxy is not a security boundary.

**Interview answer:** I would not claim an `eval`/Proxy sandbox is secure. I would isolate untrusted code in a separate process or hardened realm, expose only narrow message-based capabilities, remove ambient authority, and enforce time, memory, and I/O limits.

35. How would you distinguish language behavior from engine-specific implementation details?

**Deep explanation:** Language behavior is defined by ECMAScript and relevant host specifications; hidden classes, JIT tiers, GC heuristics, and many scheduling optimizations are implementation choices. Confirm semantics with specs and cross-engine tests, then use engine diagnostics only for performance analysis. Never make correctness depend on optimization, collection timing, or undocumented internals.

**Interview answer:** I use specifications and cross-engine tests for correctness, and treat JIT, GC, and object-layout details as profile-guided optimizations. Code must remain correct if an engine changes or omits those optimizations.
