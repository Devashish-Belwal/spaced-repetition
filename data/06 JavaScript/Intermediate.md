1. How would you explain closure behavior inside a loop using var and let?

**Deep explanation:** `var` is function-scoped, so all callbacks close over one binding and usually see its final value. `let` creates a fresh binding per iteration, so each closure retains that iteration's value. An IIFE can provide equivalent per-iteration scope for `var`.

**Interview answer:** With `var`, loop callbacks share one binding and usually see the final value. With `let`, each iteration gets a new binding, so every closure sees its expected value.

2. How does this behave when a method is passed as a callback?

**Deep explanation:** A normal function's `this` depends on its call site. Passing `obj.method` loses `obj` as the receiver, so use `bind(obj)` or a wrapper such as `() => obj.method()`. A wrapper may be preferable when arguments or dynamic lookup matter.

**Interview answer:** Passing a method alone loses its receiver. I preserve `this` with `bind` or a wrapper, while considering whether callback identity must remain stable.

3. How do arrow functions interact with bind and new?

**Deep explanation:** Arrows capture lexical `this` and have no own `this`, `arguments`, or `prototype`. `bind` can pre-fill arguments but cannot change their `this`; calling an arrow with `new` throws a `TypeError`.

**Interview answer:** Arrow functions capture surrounding `this`, so `bind` cannot rebind it. They are also not constructors and cannot be used with `new`.

4. What happens when a constructor explicitly returns an object?

**Deep explanation:** With `new`, an explicitly returned non-null object replaces the created instance. A returned primitive is ignored and the normal instance is used, which is why explicit object returns can unexpectedly change prototype and `instanceof` behavior.

**Interview answer:** An explicit object return becomes the result of `new`; a primitive return is ignored. Constructors therefore rarely return objects explicitly.

5. How do own, inherited, enumerable, and symbol properties differ?

**Deep explanation:** Own properties exist directly on an object; inherited ones come from its prototype chain. Enumerability controls participation in common enumeration. Symbols are a separate key type skipped by many string-key APIs, but they are discoverable and not private.

**Interview answer:** Ownership describes direct versus prototype properties, enumerability controls common iteration, and symbols are distinct keys that many string-key APIs omit but that remain reflectable.

6. How do Object.keys, Reflect.ownKeys, and for...in differ?

**Deep explanation:** `Object.keys` returns own enumerable string keys. `Reflect.ownKeys` returns every own key, including non-enumerable strings and symbols. `for...in` visits enumerable string keys across the prototype chain, so it often needs `Object.hasOwn`.

**Interview answer:** `Object.keys` gives own enumerable strings, `Reflect.ownKeys` gives all own string and symbol keys, and `for...in` also includes inherited enumerable strings.

7. How do Object.freeze, Object.seal, and preventExtensions differ?

**Deep explanation:** `preventExtensions` blocks additions. `seal` also makes existing properties non-configurable, preventing deletion or redefinition. `freeze` additionally makes data properties non-writable; all three operate only on the target object.

**Interview answer:** `preventExtensions` blocks additions, `seal` also blocks deletion and reconfiguration, and `freeze` also blocks writes to data properties. They are shallow.

8. Why does freezing an object not necessarily freeze nested objects?

**Deep explanation:** Freeze changes only the descriptors on the passed object; a nested object's reference is fixed, but its contents remain mutable. Deep freezing requires recursive traversal, cycle detection with a `WeakSet`, and rules for special built-ins.

**Interview answer:** `Object.freeze` is shallow: nested objects remain independently mutable. Deep immutability requires recursively freezing the graph and handling cycles.

9. How do getters, setters, and property descriptors work?

**Deep explanation:** A descriptor is either a data descriptor (`value`, `writable`) or accessor descriptor (`get`, `set`), plus `enumerable` and `configurable`. Accessors run on reads or writes with the receiver as `this`; omitted flags in `defineProperty` default to `false`.

**Interview answer:** Descriptors define value/accessor behavior and writability, enumerability, and configurability. Getters run on reads and setters on writes.

10. How do private class fields differ from naming a property with an underscore?

**Deep explanation:** A `#field` is language-enforced, accessible only inside its declaring class, and absent from normal reflection. `_field` is only a convention and remains publicly readable and writable.

**Interview answer:** An underscore only signals intent. A `#privateField` is actually enforced by JavaScript and cannot be accessed externally through normal property operations.

11. How do static fields and instance fields initialize in subclasses?

**Deep explanation:** Static fields initialize once on the class during class evaluation. Instance fields initialize per object: base fields during `super()`, then derived fields after `super()` returns and before the derived constructor body continues, in declaration order.

**Interview answer:** Static fields belong to and initialize on the class. Base instance fields initialize during `super()`, then derived instance fields initialize before the derived constructor body resumes.

12. How would you implement debounce and throttle with cancellation?

**Deep explanation:** Debounce resets a timer until calls stop; throttle permits at most one call per interval, optionally with a trailing call. Both should preserve `this` and arguments, define leading/trailing behavior, and expose `cancel()` to clear timers and references.

**Interview answer:** Debounce waits for quiet; throttle limits frequency. I track timer and call state, preserve the receiver and arguments, and expose cancellation for pending work.

13. How would you implement a memoized function with a sensible cache key?

**Deep explanation:** Keys must match the function's equality semantics. Nested `Map`/`WeakMap` nodes support primitives and object identity without JSON collisions; stringification is safe only for constrained canonical data. Also consider eviction, expiration, invalidation, and rejected promises.

**Interview answer:** I derive keys from the required equality rules, often using a `Map`/`WeakMap` trie for arguments. I avoid blind JSON stringification and bound or invalidate caches that can grow indefinitely.

14. How would you implement currying for a function of known arity?

**Deep explanation:** Accumulate arguments in closures across calls and invoke once their count reaches the chosen arity. Support grouped arguments such as `f(1)(2, 3)` and allow explicit arity because `fn.length` is misleading with defaults and rest parameters.

**Interview answer:** I return partial functions that collect arguments until the known arity is met, then call the original. I accept explicit arity instead of relying exclusively on `fn.length`.

15. How would you flatten a deeply nested array without overflowing the stack?

**Deep explanation:** Use an explicit stack: push elements in reverse, pop each value, and push nested contents or append scalars. This visits each item once and avoids call-stack limits; define how sparse holes and non-array iterables are treated.

**Interview answer:** I use iterative depth-first traversal with my own stack, pushing nested elements in reverse to preserve order. It is linear and avoids recursion-depth failures.

16. How would you compare two nested values for structural equality?

**Deep explanation:** Start with `Object.is`, then compare compatible types, prototypes, key sets, and corresponding values recursively. Track already-compared object pairs for cycles and explicitly define rules for dates, maps, sets, typed arrays, symbols, descriptors, and prototypes.

**Interview answer:** I compare identity first, then types, keys, and nested values while tracking object pairs for cycles. Deep equality needs explicit semantics for special objects and prototypes.

17. How does structuredClone differ from JSON-based cloning?

**Deep explanation:** `structuredClone` supports cycles and many built-ins including `Date`, `Map`, `Set`, and typed arrays. JSON cloning handles only JSON-safe data, loses types and unsupported values, and fails on cycles and `BigInt`. Structured cloning still cannot clone functions or preserve every custom prototype/descriptor.

**Interview answer:** `structuredClone` handles cycles and many native types that JSON loses. JSON cloning is suitable only for known JSON-safe data; neither method reproduces functions or every custom-object detail.

18. How do WeakMap and WeakSet differ from Map and Set?

**Deep explanation:** Map and Set strongly retain, expose size, and are iterable. Weak collections weakly hold object-based entries and cannot be enumerated because garbage collection is nondeterministic, making them useful for metadata that should not extend object lifetime.

**Interview answer:** Map and Set retain and enumerate entries. Weak collections are non-enumerable and weakly hold object entries, which helps avoid memory leaks in per-object metadata.

19. What are iterables, iterators, and generators?

**Deep explanation:** An iterable implements `[Symbol.iterator]()` and produces an iterator. An iterator's `next()` returns `{value, done}`. A generator creates an object that is both, preserving execution state automatically across `yield` points.

**Interview answer:** An iterable produces an iterator, and an iterator produces `{value, done}` records. Generators are concise stateful iterators built with `yield`.

20. How does an async generator support streaming values?

**Deep explanation:** An async generator can `await` work and `yield` values over time; `next()` returns a promise. `for await...of` requests values sequentially, providing natural backpressure, while `finally` supports cleanup on early termination.

**Interview answer:** An async generator emits values incrementally while awaiting between them. `for await...of` consumes them with natural sequential backpressure and early-exit cleanup.

21. How would you implement a custom iterable range?

**Deep explanation:** Implement `[Symbol.iterator]` so each traversal gets independent state and a `next()` returning `{value, done}`, or use a generator. Validate a nonzero step, account for its sign, and define whether the endpoint is inclusive.

**Interview answer:** I implement `[Symbol.iterator]`, usually as a generator, and yield values until the signed boundary is reached. I validate the step and document endpoint behavior.

22. How do microtasks differ from tasks in a browser event loop?

**Deep explanation:** A task such as a timer or event runs to completion, then the browser drains all microtasks before rendering or starting another task. Promise reactions and `queueMicrotask` use the microtask queue; endlessly adding microtasks can starve rendering.

**Interview answer:** After each task, the browser drains microtasks before rendering or taking another task. Promise callbacks are microtasks, while timers are tasks.

23. How would you predict the order of synchronous logs, Promise callbacks, and timers?

**Deep explanation:** Run synchronous code first while recording scheduled work. When the stack empties, drain microtasks FIFO—including ones they add—then execute the next task and repeat the microtask checkpoint. Ordering across different host task sources can be host-specific.

**Interview answer:** I list synchronous output first, then drain Promise microtasks, then process timer tasks one at a time with another microtask drain after each.

24. How does await affect execution even for an already-resolved Promise?

**Deep explanation:** `await` suspends the async function and schedules its continuation as a promise-reaction microtask. Thus code after it is asynchronous even for an already fulfilled promise or a plain value.

**Interview answer:** `await` always creates an asynchronous boundary. Even an already-resolved promise resumes the function later in a microtask.

25. Why does async forEach not wait for all callbacks?

**Deep explanation:** `forEach` is synchronous and discards callback return values, so returned promises are not awaited or collected. Use `for...of` plus `await` for sequential work or `Promise.all(items.map(...))` for concurrency.

**Interview answer:** `forEach` does not understand promises and ignores the async callback's return value. I use `for...of` sequentially or `Promise.all` with `map` concurrently.

26. How would you implement sequential and bounded-parallel asynchronous iteration?

**Deep explanation:** Sequential iteration is `for...of` with `await`. For bounded parallelism, run a fixed number of workers drawing the next index, store results by original index, and define whether first failure cancels work or errors are collected.

**Interview answer:** I use `for...of` plus `await` sequentially. For bounded concurrency, I create a fixed-size worker pool, preserve output order by index, and specify failure/cancellation semantics.

27. How does Promise resolution handle another Promise or thenable?

**Deep explanation:** Resolving with a promise adopts its eventual state. For a thenable, the resolution procedure reads and calls `then`, guarding against thrown errors, repeated callbacks, and self-resolution, enabling interoperability with foreign promise-like objects.

**Interview answer:** Promise resolution assimilates promises and thenables instead of fulfilling with them as plain values. It safely handles errors, repeated settlement attempts, and self-resolution.

28. How would you prevent an older search request from overwriting newer results?

**Deep explanation:** Give each request an increasing ID and commit results only when its ID is still latest. Also abort the previous fetch to save work, but retain the ID check because cancellation can race; debouncing reduces volume but does not guarantee freshness.

**Interview answer:** I combine `AbortController` with a latest-request token. A response updates state only if its token is current, so stale results cannot overwrite newer ones.

29. How would you cancel a fetch request and handle its error?

**Deep explanation:** Pass an `AbortController` signal to `fetch` and call `abort()` on replacement or cleanup. In `catch`, distinguish intentional aborts from real failures; separately check `response.ok`, because HTTP error statuses do not reject fetch.

**Interview answer:** I pass an abort signal to fetch, abort obsolete work, and handle abort errors separately from actual failures. I also check `response.ok` for HTTP errors.

30. How do ES module exports and live bindings work?

**Deep explanation:** Imports are live views of exporter-owned bindings, so importers observe later reassignment, but cannot assign to an imported binding. Modules are statically linked and evaluated once per module instance; default is simply a distinguished export name.

**Interview answer:** ES imports are live, read-only views rather than copied values. Modules are statically linked and evaluated once, with named and default exports using the same binding model.

31. How would you identify a circular module dependency?

**Deep explanation:** Inspect the import graph for strongly connected components using dependency tooling or Tarjan's algorithm. Runtime symptoms include access before initialization or partial CommonJS exports. Break cycles by extracting shared code, inverting dependencies, or injecting them.

**Interview answer:** I analyze the import graph for paths returning to their starting module. Then I break the architectural cycle by extracting a shared abstraction or inverting/injecting the dependency.

32. How would you use BigInt without silently mixing it with Number?

**Deep explanation:** Keep calculations in one numeric domain; most arithmetic mixing `bigint` and `number` throws. Convert explicitly only after range/integer validation, and define a string-based JSON representation because JSON cannot directly serialize BigInt.

**Interview answer:** I keep BigInt and Number separate and explicitly convert at validated boundaries. BigInt preserves large integers but requires deliberate JSON serialization.

33. How would you handle Unicode grapheme clusters in string operations?

**Deep explanation:** JavaScript indexes UTF-16 code units, which can split surrogate pairs; even code points can split combined user-perceived characters. Use `Intl.Segmenter` with grapheme granularity for counting or truncation, and normalization separately when canonical equivalence matters.

**Interview answer:** I do not treat string indices as visible characters. I use `Intl.Segmenter` for grapheme clusters and normalization separately when equivalent Unicode forms must compare consistently.

34. How would you format dates, numbers, and currencies for different locales?

**Deep explanation:** Use `Intl.DateTimeFormat` and `Intl.NumberFormat` with explicit locale and options rather than manual formatting. Specify currency and time zone where relevant, and reuse formatter instances in hot paths to avoid repeated construction cost.

**Interview answer:** I use `Intl` formatters with explicit locale, currency, options, and time zone. They correctly handle language-specific ordering, separators, digits, and symbols.

35. How would you avoid shared-state bugs when updating nested application data?

**Deep explanation:** Use immutable updates: create new objects along the changed path while retaining untouched references. This enables shallow comparisons and prevents cross-consumer mutation; for deep state, normalize it or use reducers or helpers such as Immer rather than shallow-copying only the root.

**Interview answer:** I use immutable updates with structural sharing: copy every changed path and keep untouched references. For complex nested state, I normalize it or use a reducer or immutable-update helper.
