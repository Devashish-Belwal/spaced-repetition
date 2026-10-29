1. What are the major event-loop phases, and what work runs in each?

**Deep explanation:** Node cycles through timers, pending callbacks, idle/prepare (internal), poll, check, and close-callback phases. Timers run expired timer callbacks; poll handles most I/O; check runs `setImmediate`; close callbacks handle events such as socket closure, while microtasks are drained between callbacks/turns.

**Interview answer:** The main observable phases are timers, pending callbacks, poll, check, and close callbacks. `setTimeout` runs in timers, most I/O in poll, and `setImmediate` in check; Node also drains next-tick and Promise microtasks around callback execution.

2. How do the next-tick queue and Promise microtask queue interact?

**Deep explanation:** After current JavaScript finishes, Node drains the `process.nextTick` queue before the V8 Promise microtask queue. Work queued while draining can extend either queue, so excessive next-tick work can postpone Promises and I/O.

**Interview answer:** Node gives `process.nextTick` priority over Promise microtasks. It drains next ticks first, then Promise callbacks, before continuing the event loop.

3. Why can recursive process.nextTick calls starve I/O?

**Deep explanation:** Every next-tick callback may enqueue another callback, and Node drains that queue before returning to event-loop phases. An unbounded chain therefore prevents the poll phase from servicing sockets or files.

**Interview answer:** Recursive `process.nextTick` keeps replenishing a high-priority queue that must empty before I/O resumes, so it can starve the event loop.

4. How can a chain of resolved Promises delay timers?

**Deep explanation:** Promise reactions run as microtasks, and the microtask queue is drained before Node advances to another phase. A long or self-replenishing chain keeps JavaScript busy even when a timer is already due.

**Interview answer:** Resolved Promise handlers run before the event loop advances. A large microtask chain can therefore postpone an already-expired timer.

5. When can the order of setImmediate and setTimeout depend on context?

**Deep explanation:** From top-level code, a zero-delay timer and `setImmediate` race based on timing and event-loop state. Inside an I/O callback, the check phase normally follows poll, so `setImmediate` generally runs before a newly scheduled timer.

**Interview answer:** At top level their order is not guaranteed. Inside an I/O callback, `setImmediate` usually wins because check follows the poll phase.

6. How can CommonJS and ESM execution contexts affect scheduling examples?

**Deep explanation:** CommonJS loading is synchronous, while ESM evaluation is integrated with the asynchronous module job machinery and Promise microtasks. The same scheduling snippet can therefore show a different initial ordering depending on module type and Node version.

**Interview answer:** ESM startup participates in asynchronous module evaluation, while CommonJS executes synchronously. That can change the ordering of next ticks, Promise callbacks, timers, and immediates in small examples.

7. How would you verify scheduling behavior for a specific Node.js and libuv version?

**Deep explanation:** Record `process.version` and `process.versions.uv`, create a minimal trace with monotonic timestamps, and run it repeatedly in the real execution context. Check that version's Node/libuv documentation or source because event-loop behavior has changed across releases.

**Interview answer:** I would pin and print the Node and libuv versions, run a minimal reproducible script several times, and confirm the result against documentation or source for exactly those versions.

8. Which common operations use libuv's worker pool?

**Deep explanation:** Most asynchronous filesystem calls, many DNS `lookup` operations, selected crypto functions such as PBKDF2/scrypt, and zlib work use the pool. Network socket I/O normally relies on OS readiness APIs instead.

**Interview answer:** The pool commonly serves filesystem, `dns.lookup`, CPU-heavy crypto, and zlib operations. Ordinary network sockets generally do not use it.

9. How do network sockets differ from filesystem operations in their use of libuv?

**Deep explanation:** Sockets are usually nonblocking OS handles watched by epoll, kqueue, or IOCP, so readiness drives callbacks. Regular file APIs often cannot be polled portably and are delegated to libuv worker threads.

**Interview answer:** Socket I/O normally uses the operating system's async readiness mechanism; filesystem calls are commonly executed in libuv's worker pool.

10. How can expensive password hashing delay unrelated filesystem requests?

**Deep explanation:** Async password hashing and filesystem calls may share the same small libuv pool. If all workers are occupied by hashes, file requests queue behind them even though the operations are logically unrelated.

**Interview answer:** They compete for the shared libuv thread pool. Saturating it with hashes increases filesystem latency through queueing.

11. When would changing UV_THREADPOOL_SIZE help or hurt?

**Deep explanation:** Increasing it can improve throughput when many pool-backed operations wait concurrently and the machine has spare CPU/I/O capacity. Too many threads add memory, context switching, CPU contention, and storage pressure; it must also be set before Node initializes the pool.

**Interview answer:** It helps when the default pool is the bottleneck and hardware has headroom. It hurts when extra threads merely increase contention, memory use, or downstream I/O saturation.

12. How would you yield during a long computation without creating excessive overhead?

**Deep explanation:** Process a measured chunk, then schedule the next chunk with `setImmediate` so I/O gets a turn. Choose chunk size using latency measurements; yielding every iteration adds scheduling overhead, while very large chunks still block.

**Interview answer:** I would batch the computation and yield with `setImmediate` between batches, tuning batch size to balance responsiveness and scheduling cost.

13. How would you implement bounded concurrency for thousands of asynchronous jobs?

**Deep explanation:** Maintain a fixed number of workers consuming a shared iterator or queue, starting a new job only when one finishes. Collect results by index, define failure/cancellation semantics, and avoid materializing unnecessary work.

**Interview answer:** I would use a semaphore or worker loop with a concurrency limit, replenish one task on each completion, and propagate errors and cancellation explicitly.

14. Why can Promise.all over a huge collection exhaust resources?

**Deep explanation:** `Promise.all(items.map(start))` eagerly starts every operation and retains promises/results until completion. That can consume memory, file descriptors, sockets, database connections, or API quota far beyond system capacity.

**Interview answer:** `Promise.all` does not limit concurrency; it starts everything eagerly. For a huge input I would use bounded concurrency or batches.

15. How would you cancel sibling operations when one operation fails?

**Deep explanation:** Give all siblings a shared `AbortSignal`, abort its controller on the first failure, and await settlement so cleanup completes. Each operation must actually honor the signal and release resources.

**Interview answer:** I would share an `AbortController`, call `abort` on the first failure, and use `allSettled` or equivalent cleanup to observe every sibling's termination.

16. Why does Promise.race with a timeout not necessarily stop underlying work?

**Deep explanation:** `Promise.race` settles the wrapper when one promise wins but has no cancellation semantics. The losing I/O or computation continues unless its API receives an abort signal or explicit cleanup action.

**Interview answer:** Racing changes which result I observe, not the lifecycle of the losers. I must explicitly abort or dispose the underlying operation.

17. How would you propagate an AbortSignal through several layers?

**Deep explanation:** Accept `signal` in each layer's options and pass the same signal to repositories, fetches, streams, and waits. Check `throwIfAborted` before expensive work and unregister custom listeners during cleanup.

**Interview answer:** Cancellation should be part of every layer's API: accept the signal, fail fast if aborted, forward it to all cancellable dependencies, and clean up listeners.

18. How would you distinguish cancellation, timeout, and application failure?

**Deep explanation:** Use typed errors or stable error codes and preserve the original cause. Cancellation reflects caller intent, timeout is a deadline policy—often implemented by abort—and application failure is a domain or dependency error; map and log them differently.

**Interview answer:** I classify them with explicit error types/codes: caller cancellation, deadline exceeded, and real operation failure. I preserve causes and give each distinct retry, logging, and HTTP behavior.

19. How would you promisify an error-first API safely?

**Deep explanation:** Wrap it in `new Promise`, reject when the first callback argument is non-null, and resolve with the documented success value(s). Preserve receiver binding, guard synchronous throws, and check whether `util.promisify` or a custom promisify implementation already exists.

**Interview answer:** I prefer `util.promisify`; otherwise I wrap the callback, preserve `this`, reject on `err`, resolve on success, and let synchronous throws reject the Promise.

20. What problems arise when a callback API sometimes calls back synchronously?

**Deep explanation:** This releases "Zalgo": caller state and error handling depend on whether the callback ran before the function returned. It can cause reentrancy bugs, inconsistent stack behavior, and missed setup; APIs should consistently complete asynchronously.

**Interview answer:** Mixed sync/async completion creates unpredictable reentrancy and ordering. I would normalize the API so callbacks always occur asynchronously.

21. How would you prevent a callback from completing an operation twice?

**Deep explanation:** Use a once guard or an idempotent state transition before resolving, rejecting, or cleaning up. Remove listeners after completion and ensure every branch returns after invoking the final callback.

**Interview answer:** I wrap completion in `once`, mark the operation settled atomically, remove listeners, and make later completion attempts no-ops or diagnostics.

22. How would you avoid losing errors inside asynchronous event listeners?

**Deep explanation:** Event emitters do not await async listeners, so a rejected listener Promise may become unhandled. Catch inside the listener and route failure to a supervised error path, or adapt events into an awaited Promise/async iterator with cleanup.

**Interview answer:** I never rely on an emitter to await an async listener. I catch rejected work explicitly and forward it to centralized error handling or use an awaitable abstraction.

23. How do top-level await and dynamic import affect module startup?

**Deep explanation:** Top-level await pauses evaluation of that module and dependent modules until its Promise settles, potentially delaying a whole dependency graph. `import()` loads and evaluates on demand and returns a Promise, enabling lazy startup but moving failures to runtime.

**Interview answer:** Top-level await can block evaluation of importers; dynamic import defers module loading and is asynchronous. Both make startup ordering and failure handling Promise-based.

24. How does CommonJS module caching work?

**Deep explanation:** After resolution, `require` caches a module by its resolved filename and returns the same `exports` object on later calls. Different resolved paths or cache deletion can create new instances, and partially initialized exports appear during cycles.

**Interview answer:** CommonJS caches by resolved module filename, so repeated `require` calls normally share one module instance and its state.

25. What can go wrong with circular module dependencies?

**Deep explanation:** A module may observe another module before initialization is complete, producing missing or undefined exports and order-sensitive behavior. ESM can also expose temporal-dead-zone errors; cycles should be broken by extracting shared contracts or injecting dependencies.

**Interview answer:** Cycles expose partially initialized modules and create fragile initialization order. I usually extract shared code or invert the dependency.

26. How do ESM live bindings differ from copied values?

**Deep explanation:** An ESM import is a read-only view of the exporter's current binding, so later reassignment by the exporter is visible. Copying that imported value into a local variable or destructuring a CommonJS object captures a snapshot/reference at that moment.

**Interview answer:** ESM imports are live bindings: importers observe exporter updates, but cannot reassign the import. An ordinary copied value does not track later reassignment.

27. What are package exports and imports maps used for?

**Deep explanation:** The `exports` field defines a package's public entry points and conditional targets while hiding undeclared internals. `imports` defines private `#` aliases inside the package, supporting environment-specific resolution without publishing those paths.

**Interview answer:** `exports` controls the package's public API and conditional entry points; `imports` provides private internal aliases beginning with `#`.

28. How would you publish a package consumed by both ESM and CommonJS applications?

**Deep explanation:** Build distinct ESM and CommonJS entry points and map `import` and `require` conditions through `exports`, with matching types. Test both consumers and ensure both formats do not accidentally create incompatible duplicate state.

**Interview answer:** I publish separate ESM and CJS builds behind conditional exports, provide correct type declarations, and integration-test both `import` and `require` consumers.

29. What is the dual-package hazard?

**Deep explanation:** If the same package is loaded once as ESM and once as CommonJS, Node may create two module instances. Singleton state, class identity, and `instanceof` checks can then diverge, so packages should share implementation/state or avoid mixed loading.

**Interview answer:** Dual entry points can load two copies of one logical package, splitting singleton state and class identity. Conditional exports must be designed to avoid that.

30. How do npm workspaces affect dependency organization?

**Deep explanation:** Workspaces manage multiple packages from one root, link local packages, and commonly hoist compatible dependencies. Each package should still declare what it uses because hoisting layout is not a reliable API and version conflicts may remain nested.

**Interview answer:** Workspaces centralize installs and scripts and link local packages, but every workspace must declare its own dependencies; hoisting is an implementation detail.

31. How would you diagnose two incompatible versions of a shared dependency?

**Deep explanation:** Use `npm ls <package>` and `npm explain <package>` to find dependency paths and constraints, then inspect lockfile resolution. Upgrade dependents, use a safe override only after compatibility testing, or isolate versions when they truly cannot converge.

**Interview answer:** I trace both versions with `npm ls`/`npm explain`, identify which constraints force them, then align upstream packages or apply a tested override rather than blindly deduping.

32. How would you distinguish transpilation from type checking when running TypeScript?

**Deep explanation:** Transpilation erases TypeScript syntax and emits runnable JavaScript; type checking analyzes correctness and may emit nothing. Fast runners and Node's type stripping may execute code without proving it type-safe, so CI should run `tsc --noEmit` separately.

**Interview answer:** Transpilation converts syntax; type checking validates types. I treat them as separate steps and run an explicit no-emit type check even if execution transpiles successfully.

33. What limitations of built-in TypeScript support must you check for your Node.js version?

**Deep explanation:** Check whether that Node release supports type stripping or transformation, which syntax needs flags, module-resolution rules, `tsconfig` handling, source maps, and unsupported constructs requiring code generation. Built-in execution is version-specific and is not a substitute for type checking.

**Interview answer:** I verify the exact release docs for supported syntax, flags, modules, and `tsconfig` behavior. Node's built-in support may only strip types and does not type-check.

34. How would you stream a large file to an HTTP response?

**Deep explanation:** Create an `fs.createReadStream`, set appropriate response headers, and connect it with `stream.pipeline` so backpressure and errors are handled. Abort or destroy the file stream when the client disconnects.

**Interview answer:** I use `pipeline(createReadStream(path), res)`, set headers first, handle pipeline errors, and stop reading if the request closes.

35. What should happen after writable.write returns false?

**Deep explanation:** `false` means buffered data reached the writable high-water mark. The producer must pause and wait for the `drain` event before writing more, or use `pipeline`, which does this automatically.

**Interview answer:** Stop writing until `drain` fires. Ignoring `false` defeats backpressure and can grow memory without bound.

36. What do highWaterMark and objectMode change?

**Deep explanation:** `highWaterMark` is the buffering threshold that triggers backpressure, not a hard memory cap. In byte mode it is measured in bytes; in object mode chunks are arbitrary values and the threshold counts objects.

**Interview answer:** The high-water mark controls when a stream asks producers to slow down. It counts bytes normally and item count in object mode.

37. How do pipe and pipeline differ in error handling and cleanup?

**Deep explanation:** `pipe` connects streams and handles flow control but does not comprehensively propagate every error or destroy the entire chain. `pipeline` coordinates errors, closes all components, and offers callback/Promise completion.

**Interview answer:** I prefer `pipeline` for production chains because it propagates errors and cleans up all streams; `pipe` mainly wires data flow.

38. How would you consume a readable stream using async iteration?

**Deep explanation:** Use `for await (const chunk of readable)` inside `try/finally`; awaiting loop work naturally applies backpressure. Break or abort deliberately and destroy/cancel the stream if remaining data is not needed.

**Interview answer:** I use `for await...of`, process each chunk with awaited work, catch errors, and clean up the stream on early exit.

39. How would you implement a Transform stream?

**Deep explanation:** Extend `Transform` and implement `_transform(chunk, encoding, callback)`, emitting output with `push` or the callback's second argument. Use `_flush` for final buffered state and respect object/byte modes.

**Interview answer:** I subclass `Transform`, implement `_transform`, push transformed data, and call the callback exactly once; `_flush` handles trailing buffered data.

40. How would you ensure a transform callback is called exactly once?

**Deep explanation:** Structure `_transform` with one guarded completion function and return immediately from every success/error branch. For Promise-based work, end with one `.then`/`.catch` path or wrap completion with `once`.

**Interview answer:** I centralize completion behind a once guard and `return` after each callback path, so success, validation failure, and exceptions cannot fall through into another call.

41. How would you stop upstream work after a client disconnects?

**Deep explanation:** Observe the request/response close or abort signal, abort an operation controller, and pass its signal upstream to database calls, fetches, and stream pipelines. Destroy non-signal-aware resources and make cleanup idempotent.

**Interview answer:** I convert disconnect into an abort signal, propagate it through the whole operation, and destroy any resources that do not support signals.

42. How do Node.js streams and Web Streams interoperate?

**Deep explanation:** Node exposes adapters such as `Readable.fromWeb`, `Readable.toWeb`, and corresponding writable/duplex conversions. Verify chunk types, object mode, backpressure, error/cancel propagation, and version support at the boundary.

**Interview answer:** I use Node's `fromWeb`/`toWeb` adapters and test cancellation, errors, chunk types, and backpressure because the APIs have different conventions.

43. How would you handle a UTF-8 character split across Buffer chunks?

**Deep explanation:** Do not decode each chunk independently because a multibyte sequence may span chunks. Use `StringDecoder`, `readable.setEncoding('utf8')`, or a streaming `TextDecoder`, which retains incomplete trailing bytes.

**Interview answer:** I use a streaming decoder such as `StringDecoder`; it buffers incomplete UTF-8 bytes until the next chunk.

44. How do Buffer.slice, Buffer.subarray, and copying differ in memory ownership?

**Deep explanation:** For `Buffer`, both `slice` and `subarray` create views sharing the original memory, so mutations are visible across them. `Buffer.from(view)` or `Buffer.copy` creates independent storage.

**Interview answer:** `slice` and `subarray` share Buffer memory; copying creates independent ownership. I copy when isolation or long retention matters.

45. Why can retaining a small Buffer view retain a much larger allocation?

**Deep explanation:** A view references the original backing `ArrayBuffer`, so garbage collection cannot release that allocation while any view remains reachable. Copying the small needed range allows the large backing store to be reclaimed.

**Interview answer:** The tiny view still owns a reference to the full backing allocation. Copying the needed bytes breaks that retention.

46. How would you implement an atomic file replacement?

**Deep explanation:** Write the complete content to a temporary file in the same directory, flush it if durability matters, then rename it over the target. Same-filesystem rename is atomic, but Windows semantics, permissions, directory syncing, and crash durability need platform-aware handling.

**Interview answer:** I write and optionally fsync a same-directory temp file, then atomically rename it into place, with platform-specific error handling and cleanup.

47. What is the risk of checking file existence before opening it?

**Deep explanation:** It creates a time-of-check/time-of-use race: another process can create, delete, or replace the path between calls. Open directly with the desired exclusive or create flags and handle the result.

**Interview answer:** The check becomes stale immediately. I perform the open as the atomic operation and handle `ENOENT` or `EEXIST`.

48. How do append operations behave when several processes write concurrently?

**Deep explanation:** Opening with append requests that each individual write go to the end, but multiple writes that form one logical record can interleave and filesystem guarantees vary. Keep records in one bounded write or serialize through one writer when integrity matters.

**Interview answer:** Append protects the file position per write, not an arbitrary multi-write transaction. I use one write per record or explicit serialization.

49. What limitations should you consider when using fs.watch?

**Deep explanation:** Events may be coalesced, duplicated, omit filenames, or differ by OS; recursive watching and network filesystems also vary. Treat notifications as hints, debounce them, rescan state, and provide polling where correctness requires it.

**Interview answer:** `fs.watch` is platform-dependent and events are not a perfect change log. I debounce and reconcile actual filesystem state instead of trusting each event literally.

50. How would you limit memory use while processing a large CSV upload?

**Deep explanation:** Stream multipart/body data into an incremental CSV parser, process rows with bounded concurrency, and pause through backpressure when downstream is full. Enforce byte/row limits and avoid retaining the full upload or all results.

**Interview answer:** I stream-parse the upload, bound row-processing concurrency, respect backpressure, and enforce size limits without buffering the entire CSV.

51. How would you configure HTTP keep-alive and connection reuse?

**Deep explanation:** Use a keep-alive-capable agent/dispatcher, size connection pools per origin, and align idle/lifetime settings with servers and load balancers. Monitor reuse, queueing, resets, and stale connections rather than maximizing socket counts blindly.

**Interview answer:** I enable keep-alive through the supported agent or dispatcher, cap per-origin connections, tune idle timeouts to infrastructure, and monitor reuse and resets.

52. What is the role of an HTTP Agent?

**Deep explanation:** An agent manages client sockets for an origin: connection creation, pooling, reuse, concurrency limits, and TLS options. It prevents every request from paying a new TCP/TLS handshake when reuse is appropriate.

**Interview answer:** The Agent is the client connection manager. It pools and reuses sockets and controls connection limits and transport settings.

53. How do connection, headers, body, and overall request timeouts differ?

**Deep explanation:** Connection timeout bounds establishing TCP/TLS; headers timeout bounds waiting for response headers; body timeout bounds inactivity or completion while reading content; overall timeout caps the full operation. Each protects a different stall and should produce a distinguishable failure.

**Interview answer:** They cover different phases—connect, first headers, body transfer, and total deadline. I configure and classify them separately.

54. How would you enforce request-body size limits before memory is exhausted?

**Deep explanation:** Reject an oversized valid `Content-Length` early, but also count streamed bytes because the header can be absent or false. Stop reading, abort parsing/uploads, return an appropriate status, and configure proxy/framework limits too.

**Interview answer:** I enforce a streaming byte counter, use `Content-Length` only as an early check, and abort as soon as the hard limit is exceeded.

55. How would you handle malformed JSON without exposing internal errors?

**Deep explanation:** Catch the parser's syntax/size failure at the request boundary and return a stable 400 response with a correlation ID, not stack traces or parser internals. Log sanitized diagnostic details privately.

**Interview answer:** I map malformed JSON to a generic 400 error, avoid reflecting input or stack details, and log sanitized context with a request ID.

56. How would you validate multipart uploads and clean up temporary files?

**Deep explanation:** Stream with limits on total bytes, parts, filenames, and field sizes; verify content by signature when necessary rather than trusting MIME metadata. Track every temp path and remove it in `finally`, cancellation, parse-error, and disconnect paths.

**Interview answer:** I stream with strict limits, validate actual content and metadata, generate safe server filenames, and guarantee temp cleanup on success, failure, or disconnect.

57. How would you avoid trusting spoofed forwarding headers behind a proxy?

**Deep explanation:** Accept forwarded headers only when the direct peer belongs to a configured trusted proxy chain, and configure the exact hop/subnet policy. Otherwise use the socket peer address and ignore client-supplied forwarding values.

**Interview answer:** I configure an explicit trusted-proxy policy and only interpret forwarding headers from those peers; direct client headers are untrusted.

58. How would you structure routes, services, repositories, and validation in Express?

**Deep explanation:** Routes/controllers translate HTTP input/output, validation establishes trusted DTOs, services implement use cases, and repositories isolate persistence. Pass dependencies explicitly and keep framework objects out of core logic for easier testing.

**Interview answer:** I keep HTTP concerns in routes, validate at the boundary, put business rules in services, and isolate storage behind repositories with injected dependencies.

59. How does asynchronous error propagation depend on the Express version?

**Deep explanation:** Express 5 forwards rejected Promises from async handlers to error middleware. Express 4 generally requires `next(err)` or a wrapper; in either version, errors after headers are sent need careful delegation/connection cleanup.

**Interview answer:** Express 5 automatically forwards rejected async handlers; Express 4 needs an async wrapper or explicit `next`. I verify the deployed major version.

60. How do NestJS providers, modules, controllers, guards, pipes, and interceptors differ?

**Deep explanation:** Modules organize dependency scope; providers contain injectable logic; controllers map transports/routes. Guards authorize execution, pipes transform/validate arguments, and interceptors wrap execution for cross-cutting behavior such as timing, mapping, or caching.

**Interview answer:** Modules compose features, providers supply injectable logic, controllers handle endpoints, guards decide access, pipes validate/transform inputs, and interceptors wrap the request lifecycle.

61. How would you compare Fastify schema validation with middleware-based validation?

**Deep explanation:** Fastify attaches schemas to routes and can compile validation/serialization for speed and consistent contracts. Generic middleware is flexible but may duplicate schemas, validate later, and add per-request overhead; either approach needs normalized error responses.

**Interview answer:** Fastify's route schemas integrate compiled validation and serialization close to routing. Middleware validation is portable but easier to apply inconsistently and may be slower.

62. How would you implement request-scoped correlation IDs?

**Deep explanation:** Validate an inbound ID only from a trusted format/source or generate one, store it in `AsyncLocalStorage`, return it in the response, and include it in logs and outbound calls. Avoid global mutable variables.

**Interview answer:** I establish one ID at request entry, place it in async-local context, echo it in the response, and propagate it to logs and downstream requests.

63. What is AsyncLocalStorage useful for?

**Deep explanation:** It associates context with an asynchronous execution chain without passing it through every function. Typical uses are request IDs, trace context, tenant identity, and transaction context, but it should not become hidden general-purpose mutable state.

**Interview answer:** It carries request-scoped metadata across callbacks and Promises, especially correlation and tracing context.

64. How do AsyncLocalStorage.run and enterWith differ?

**Deep explanation:** `run(store, fn)` scopes the store to `fn` and async work created within it, restoring the prior context afterward. `enterWith(store)` changes context for the rest of the current synchronous execution and descendants, so it can unintentionally affect other listeners.

**Interview answer:** I prefer `run` because it creates a bounded scope and restores context. `enterWith` mutates the current context and is easier to leak across nearby work.

65. How would you prevent request context from leaking between users?

**Deep explanation:** Create a fresh immutable-ish store with `run` at each request boundary; never reuse store objects or keep user data in module globals. Test concurrent requests and clean up long-lived timers/listeners that outlive the request.

**Interview answer:** I create a new async-local store per request, avoid globals and reused objects, and ensure detached background work gets an explicit context.

66. How would you build a structured logger with secret redaction?

**Deep explanation:** Emit stable JSON fields such as timestamp, level, event, and correlation ID; allowlist useful data and redact configured nested keys before serialization. Avoid logging raw headers/bodies, hash identifiers where suitable, and test redaction against error objects and child fields.

**Interview answer:** I log structured events with consistent fields, default to allowlisting, redact secrets before serialization, and test that tokens, passwords, cookies, and PII never escape.

67. How would you test code that depends on timers and the current time?

**Deep explanation:** Inject a clock where possible and use fake timers to advance deterministic time without sleeping. Separate wall-clock dates from monotonic duration measurements, flush relevant microtasks, and restore timer globals after each test.

**Interview answer:** I inject time or use fake timers, advance them deterministically, flush async work, and restore state so tests remain fast and isolated.

68. How would you avoid tests hanging because open handles remain?

**Deep explanation:** Ensure servers, database pools, workers, intervals, sockets, and streams are closed in teardown even on failure. Use runner diagnostics or `process._getActiveHandles` only as a debugging aid, not as production logic.

**Interview answer:** I track every acquired resource and close it in hooks/`finally`; if a test still hangs, I inspect active handles to locate the missing teardown.

69. How would you test streams, errors, and cancellation?

**Deep explanation:** Use small controlled streams that emit multiple chunks, backpressure, and injected errors; await `pipeline` completion rather than arbitrary delays. Abort at defined points and assert cleanup, destroyed state, listener removal, and the exact error class/cause.

**Interview answer:** I use deterministic fake streams, await pipeline settlement, inject failures and aborts, and assert both output and resource cleanup.

70. How would you isolate integration tests that share a database?

**Deep explanation:** Give tests separate schemas/databases or wrap each in a rollback transaction when the application model allows it. Generate unique data, reset deterministically, limit parallelism for shared infrastructure, and never depend on test order.

**Interview answer:** I isolate with per-test transactions or unique schemas, create unique fixtures, and clean up deterministically so parallel tests cannot observe one another.

71. How do worker threads differ from child processes?

**Deep explanation:** Workers run JavaScript isolates in one process and can share/transfer memory, with lower overhead but a shared process failure boundary. Child processes have separate memory and stronger isolation, communicate via IPC/stdio, and can run other executables.

**Interview answer:** Workers suit CPU-bound JavaScript with efficient data transfer; child processes cost more but provide process isolation and can execute arbitrary programs.

72. How do spawn, exec, execFile, and fork differ?

**Deep explanation:** `spawn` streams an executable's stdio; `exec` runs a shell command and buffers output; `execFile` runs a file directly and buffers output; `fork` starts another Node process with an IPC channel. Shell use increases quoting and injection risk.

**Interview answer:** I use `spawn` for streaming, `execFile` for direct buffered execution, `exec` only when shell syntax is required, and `fork` for Node child IPC.

73. Why can executing shell strings introduce command injection?

**Deep explanation:** A shell parses metacharacters, substitutions, redirections, and quoting, so concatenated untrusted input can become new commands rather than data. Execute a fixed binary with an argument array and validation instead.

**Interview answer:** Shell strings are code, so user data can alter command structure. I avoid the shell and pass validated arguments to `spawn` or `execFile`.

74. How would you stream a child process's output instead of buffering it all?

**Deep explanation:** Use `spawn` and consume `child.stdout`/`stderr` as streams, piping them through backpressure-aware destinations. Handle `error`, exit/close status, output limits, cancellation, and stderr separately.

**Interview answer:** I use `spawn`, pipe or asynchronously iterate stdout/stderr, and handle backpressure, exit codes, aborts, and output limits.

75. How do workerData and postMessage transfer data to a worker?

**Deep explanation:** `workerData` supplies startup data when constructing a worker; `postMessage` exchanges messages throughout its lifetime. Values are structured-cloned unless transferable objects are provided, so large repeated copies can be expensive.

**Interview answer:** `workerData` is initial configuration, while `postMessage` is ongoing communication. Both clone by default, with transfer lists available for transferable buffers.

76. What can the structured-clone algorithm copy, and what cannot it preserve?

**Deep explanation:** It supports many built-ins including objects, arrays, maps, sets, dates, errors, typed arrays, and cyclic graphs. Functions, closures, symbols, weak collections, and host resources are not cloneable, and custom prototypes/accessors/property descriptors are generally not preserved as behavior.

**Interview answer:** Structured clone handles data graphs and many built-ins, including cycles, but not executable behavior such as functions or closures, and it does not preserve arbitrary class semantics.

77. How do transferred ArrayBuffers differ from copied buffers?

**Deep explanation:** Transferring moves ownership of an `ArrayBuffer` without copying and detaches it in the sender, which is efficient for large payloads. Copying keeps independent usable data on both sides but costs time and memory.

**Interview answer:** Transfer is near zero-copy but detaches the sender's buffer; cloning copies bytes and leaves both sides independent.

78. How would you build a reusable worker-thread pool?

**Deep explanation:** Start a bounded set of long-lived workers, queue jobs, correlate request IDs to Promise resolvers, and assign work to idle workers. Add queue limits, timeouts/cancellation, worker crash replacement, graceful shutdown, observability, and transferable payloads where helpful.

**Interview answer:** I keep a fixed worker set and bounded queue, dispatch to idle workers with correlated responses, replace failed workers, and support cancellation and graceful shutdown.

79. What does the cluster module do?

**Deep explanation:** Cluster starts multiple Node processes that can share a listening server, allowing one application to use multiple CPU cores. Workers still have separate heaps/state, and modern designs may instead use an external process manager or load balancer.

**Interview answer:** Cluster runs multiple Node worker processes behind a shared server port. It scales across cores but does not share application memory.

80. Why should application sessions not depend on one worker's memory?

**Deep explanation:** Load balancing may route later requests to another worker, and workers can restart or scale independently. Store sessions in a shared durable service or use verifiable stateless tokens, rather than relying on sticky routing alone.

**Interview answer:** In-memory sessions disappear on restart and are invisible to other workers. I use shared storage or properly designed stateless tokens.

81. How would you drain connections before terminating a Node.js server?

**Deep explanation:** On a termination signal, stop accepting new connections, mark readiness false, call server close, and let in-flight requests finish within a deadline. Close idle keep-alive sockets and dependencies, then force-destroy remaining connections after the grace period.

**Interview answer:** I fail readiness, stop new accepts, wait for in-flight work, close dependencies and idle sockets, and enforce a final shutdown deadline.

82. What do timer ref and unref change about process lifetime?

**Deep explanation:** A referenced timer keeps the event loop alive; `unref` allows the process to exit if it is the only remaining active handle. `ref` restores that behavior, but neither cancels the timer nor guarantees it will run.

**Interview answer:** `unref` means the timer alone should not keep Node alive; `ref` means it should. It changes liveness, not scheduling or cancellation.

83. How would you detect and remove leaked EventEmitter listeners?

**Deep explanation:** Treat max-listener warnings as diagnostics, inspect listener counts/names and creation stacks, then find missing lifecycle cleanup. Prefer `once`, remove listeners in `finally`/abort handlers, and do not merely raise the limit unless the fan-out is intentional.

**Interview answer:** I trace the warning to listener registration, compare add/remove lifecycles, and clean up with `once`, explicit removal, or abort-driven disposal.

84. How would you use CPU profiles to investigate a slow endpoint?

**Deep explanation:** Reproduce representative load, record a CPU profile for the slow window, and inspect bottom-up/heavy functions and flame graphs for hot stacks. Compare before/after profiles and correlate them with latency and event-loop delay; profiling adds overhead, so scope production captures carefully.

**Interview answer:** I profile under representative load, find hot stacks by self/total CPU, correlate them with the endpoint trace, optimize the dominant path, and verify with another profile.

85. How would you compare heapUsed, heapTotal, external memory, and RSS?

**Deep explanation:** `heapUsed` is live/allocated V8 heap usage; `heapTotal` is heap capacity reserved by V8. `external` covers native memory associated with JavaScript objects such as Buffers, while RSS is total resident process memory including heap, native allocations, code, and stacks.

**Interview answer:** Heap used/total describe V8's heap, external captures native-backed data such as Buffers, and RSS is the process's total resident footprint.

86. How would you distinguish a memory leak from normal garbage-collection behavior?

**Deep explanation:** Memory normally rises between GCs and may retain reserved capacity afterward. A leak shows a growing post-major-GC baseline and increasing retained objects across comparable heap snapshots under steady workload; also inspect external/RSS because not all leaks are in the V8 heap.

**Interview answer:** I compare memory after full GC over time and diff heap snapshots under stable load. A continually rising retained baseline suggests a leak, unlike normal sawtooth behavior.

87. How would you monitor event-loop delay and utilization?

**Deep explanation:** Use `perf_hooks.monitorEventLoopDelay` for latency distribution and `eventLoopUtilization` for active-versus-idle time, reporting percentiles rather than only averages. Correlate with CPU, GC, worker-pool saturation, traffic, and endpoint traces.

**Interview answer:** I track event-loop delay percentiles and utilization from `perf_hooks`, then correlate spikes with CPU, GC, traffic, and pool metrics.

88. How would you implement retries without duplicating non-idempotent operations?

**Deep explanation:** Retry only failures classified as transient, with bounded attempts, exponential backoff, jitter, and deadlines. For non-idempotent writes, use an idempotency key or transaction/outbox protocol so the server can return the original result instead of performing the action twice.

**Interview answer:** I retry only transient failures and require an idempotency mechanism for writes, plus bounded exponential backoff with jitter and a total deadline.

89. How would you prevent database connection-pool exhaustion?

**Deep explanation:** Size the pool against database limits across all application instances, bound request/job concurrency, and always release clients in `finally`. Set acquisition/query timeouts, monitor wait queues and long transactions, and apply backpressure before saturation.

**Interview answer:** I cap concurrency, right-size the pool globally, release every lease in `finally`, and monitor acquisition waits and long-running transactions.

90. How would you handle a background job that outlives its originating HTTP request?

**Deep explanation:** Persist a job record/message to a durable queue—ideally atomically with related state—then return a job identifier. A separate worker owns retries, idempotency, status, and dead-letter handling; it should not depend on request context or an in-memory Promise.

**Interview answer:** I enqueue durable work and return `202` with a job ID. A worker processes it idempotently with retries and persisted status independent of the HTTP process.

91. How would you configure TLS certificate validation for an outbound Node.js client?

**Deep explanation:** Keep peer verification enabled, use the correct hostname/SNI, and supply trusted CA certificates when using a private PKI. Never solve certificate errors with `rejectUnauthorized: false`; diagnose chain, hostname, and clock issues, and use pinning only with a rotation plan.

**Interview answer:** I leave verification on, configure the right CA bundle and hostname, and fix chain or SNI problems rather than disabling TLS checks.

92. How would you use SNI when one HTTPS server hosts several domains?

**Deep explanation:** The client sends the intended hostname in the TLS `servername`; the server's `SNICallback` or secure-context mapping selects the matching certificate. Each certificate must validate for that host, with a sensible default and secure unknown-host behavior.

**Interview answer:** I map SNI hostnames to TLS secure contexts/certificates and ensure clients send the actual DNS hostname during the handshake.

93. How would you diagnose a fetch connection that remains occupied after the response headers arrive?

**Deep explanation:** Fetch resolves when headers arrive, but the pooled connection is not reusable until the body is fully consumed or canceled. Inspect body-reading code, streaming stalls, abort paths, dispatcher statistics, and server framing to find the held resource.

**Interview answer:** I check whether the response body is being consumed or canceled. Headers alone do not release the pooled connection.

94. How would you consume or cancel an unused response body to release resources?

**Deep explanation:** If data is needed, fully read or stream `response.body`; if not, explicitly cancel it and handle cancellation failure. Put cleanup in `finally` and use an abort signal for the request deadline so connection resources are deterministically released.

**Interview answer:** I always either drain the body or call `response.body.cancel()`, with cleanup in `finally`; leaving it unread can occupy a connection.

95. How would you configure connection reuse for fetch through the supported dispatcher interface?

**Deep explanation:** Configure an Undici `Agent` or `Pool` with desired connection, pipelining, and keep-alive settings, then pass it as the request's `dispatcher` or install an intentional global dispatcher. Close custom dispatchers during shutdown and verify support for the deployed Node version.

**Interview answer:** I use the supported Undici dispatcher—usually an Agent or Pool—configure per-origin limits/keep-alive, pass it to fetch, and close it cleanly.

96. How would you design streaming compression without buffering the entire response?

**Deep explanation:** Negotiate an accepted encoding, set `Content-Encoding` and `Vary`, then pipeline the source through a zlib transform into the response. Remove `Content-Length`, preserve backpressure, handle disconnects, and skip already-compressed or tiny content.

**Interview answer:** I pipeline the source through a compression transform to the response, preserve backpressure, set negotiation headers, and avoid buffering or compressing unsuitable payloads.

97. How would you prevent compression from consuming all worker-pool capacity?

**Deep explanation:** Bound concurrent compression jobs, skip low-value payloads, choose moderate compression levels, and cache/precompress static assets. Monitor worker-pool queueing and isolate heavy compression in workers or another service when necessary.

**Interview answer:** I limit compression concurrency, use sensible levels and thresholds, precompress/cache where possible, and monitor shared pool saturation.

98. How would you use timingSafeEqual correctly when input lengths can differ?

**Deep explanation:** `timingSafeEqual` requires equal-length buffers, so decode into a fixed expected format and compare fixed-length values. If lengths differ, still perform a comparison against a fixed dummy value before returning false when the surrounding protocol requires minimizing timing leakage.

**Interview answer:** I normalize to fixed-length buffers, compare with `timingSafeEqual`, and handle length mismatch without an obviously data-dependent shortcut where that threat matters.

99. How would you derive encryption keys rather than using a password directly as a key?

**Deep explanation:** Use a password KDF such as scrypt, Argon2, or PBKDF2 with a unique random salt, suitable cost parameters, and the exact key length required. Store salt and parameters with ciphertext, protect derived keys, and support future parameter upgrades.

**Interview answer:** I run the password through a salted, costed KDF such as scrypt or Argon2 and derive a fixed-length key; I never use password bytes directly.

100. How would you manage authenticated-encryption nonces safely?

**Deep explanation:** A nonce must be unique for every encryption under the same key; reuse can catastrophically break modes such as GCM. Generate sufficiently large random nonces or use a persisted counter scheme, store the nonce with ciphertext, authenticate metadata as AAD, and rotate keys before uniqueness risk grows.

**Interview answer:** I guarantee nonce uniqueness per key, store the nonce beside ciphertext, and rotate keys safely. For GCM, nonce reuse is unacceptable.

101. How would you write a custom assertion for asynchronous rejection behavior?

**Deep explanation:** Accept a function returning a Promise, await `assert.rejects`, and validate error type/code/message with a predicate rather than swallowing arbitrary failures. Make the helper fail clearly if the function throws synchronously when only rejection is expected.

**Interview answer:** I await `assert.rejects` with a predicate that checks the meaningful error contract, and I distinguish synchronous throws from Promise rejections.

102. How would you organize subtests, hooks, mocks, and test isolation in the built-in test runner?

**Deep explanation:** Group behavior with named `t.test` subtests, use scoped hooks for setup/teardown, and register cleanup immediately after acquiring resources. Use the runner's mock/timer facilities, restore them per test, and control concurrency whenever state is shared.

**Interview answer:** I organize related cases as subtests, keep hooks local, restore mocks automatically, clean resources in teardown, and disable parallelism for shared mutable fixtures.

103. How would you measure code coverage without treating it as proof of correctness?

**Deep explanation:** Collect line, branch, and function coverage on realistic tests and use uncovered branches to guide review. Thresholds prevent regression, but high coverage can still assert nothing useful or miss requirements, races, and integration behavior.

**Interview answer:** Coverage tells me what executed, not whether behavior is correct. I use it to find gaps alongside strong assertions, boundary tests, and integration tests.

104. How would you distinguish a Node.js warning caused by application code from one caused by a dependency?

**Deep explanation:** Run with warning tracing enabled or attach a `process.on('warning')` diagnostic handler and inspect the warning's stack, code, and creation path. Reproduce on supported versions, map stack paths to first- or third-party modules, then fix code or upgrade/report the dependency.

**Interview answer:** I capture the warning code and full trace, find the first responsible application or dependency frame, and reproduce before deciding whether to patch our code or upgrade upstream.

105. How would you use source maps to debug transpiled TypeScript in production?

**Deep explanation:** Generate maps that exactly match deployed JavaScript and enable source-map stack translation in the runtime/observability pipeline. Secure map distribution because sources may be sensitive, retain artifacts by release ID, and verify line mapping in a production-like build.

**Interview answer:** I deploy matching source maps keyed to the release, enable stack translation, protect map access, and test that production errors resolve to correct TypeScript lines.

106. How would you configure trust proxy safely in an Express deployment?

**Deep explanation:** Configure trusted proxy IP ranges or an exact hop rule matching the real topology, not unconditional trust unless every direct peer is controlled. Then test `req.ip`, protocol, and hostname with spoofed forwarding headers from trusted and untrusted paths.

**Interview answer:** I trust only known proxy hops/subnets and test spoofing scenarios; Express should ignore forwarded values from untrusted direct clients.

107. How would you avoid sending a second response after headers have already been written?

**Deep explanation:** Make each handler's response a terminal `return`, centralize ownership of success/error responses, and avoid continuing after `next` or `send`. Error middleware should check `res.headersSent` and delegate appropriately rather than attempting a second body.

**Interview answer:** I return immediately after sending, keep one response owner, and have error middleware delegate when `headersSent` is already true.

108. How would you test Express middleware ordering and error propagation?

**Deep explanation:** Build a minimal app with instrumented middleware, make requests through an HTTP test client, and assert call order, mutations, status, and body. Include synchronous throws, rejected Promises according to the Express version, `next(err)`, short-circuit responses, and post-header errors.

**Interview answer:** I integration-test a real middleware stack and assert its trace for normal, short-circuit, and error paths, including async behavior for the deployed Express version.

109. How do singleton, transient, and request-scoped dependencies affect a NestJS application?

**Deep explanation:** Singletons are shared and efficient but must not hold request-specific mutable state; transient providers create a new instance per consumer; request scope creates instances per request and propagates scope up dependency chains. Request/transient scopes increase allocation and can complicate lifecycle/performance.

**Interview answer:** Singleton is the default shared instance, transient is per injection consumer, and request scope is per request. I use narrower scopes only when isolation justifies their overhead.

110. How would you use validation schemas without validating the same payload inconsistently in several layers?

**Deep explanation:** Define one authoritative boundary schema, validate once, and pass the resulting typed/normalized DTO inward. Reuse generated types or schema fragments deliberately; deeper layers enforce domain invariants, not duplicate transport parsing with different rules.

**Interview answer:** I validate and normalize once at the boundary into a trusted DTO. Services then enforce business invariants rather than revalidating the same transport payload differently.
