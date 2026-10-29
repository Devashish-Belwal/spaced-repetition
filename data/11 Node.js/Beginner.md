1. What is the Node.js event loop, and why does it matter?

**Deep explanation:** The event loop coordinates callbacks for completed asynchronous work while JavaScript runs on one main thread. It lets one process handle many concurrent I/O operations without dedicating a thread to each request.

**Interview answer:** The event loop runs ready callbacks and keeps Node responsive while I/O happens elsewhere, which is why Node handles high I/O concurrency efficiently.

2. What happens to an incoming request while Node.js waits for file or network I/O?

**Deep explanation:** Node starts the I/O through the operating system or libuv, then returns to other work. When the operation completes, its callback or Promise continuation is queued for the event loop.

**Interview answer:** Node does not normally block the JavaScript thread; it handles other requests and resumes this one when the I/O result is ready.

3. What does it mean to say that JavaScript execution in Node.js is single-threaded?

**Deep explanation:** One event-loop thread executes a given process's JavaScript instructions, so two JavaScript callbacks do not run simultaneously there. Asynchronous work and additional workers may still use other threads.

**Interview answer:** Application JavaScript runs one callback at a time on the main thread, though Node can perform supporting work on other threads.

4. Which parts of a Node.js application can still run on other threads?

**Deep explanation:** Libuv's worker pool handles some filesystem, DNS, crypto, and compression work; the OS handles much network I/O. Worker threads and child processes can explicitly run application work in parallel.

**Interview answer:** The OS, libuv thread pool, worker threads, and child processes can work outside the main JavaScript thread.

5. How do blocking and nonblocking operations differ?

**Deep explanation:** A blocking operation prevents the current thread from progressing until it finishes. A nonblocking operation starts work and returns control, delivering the result later through a callback, event, or Promise.

**Interview answer:** Blocking code waits and stalls the thread; nonblocking code lets it do other work until the result is ready.

6. What is the difference between synchronous and asynchronous execution?

**Deep explanation:** Synchronous code completes before the next statement proceeds. Asynchronous code may complete later, so its result is consumed via callbacks, Promises, or events; `await` makes that flow readable without making the underlying I/O synchronous.

**Interview answer:** Synchronous work returns its result immediately in sequence; asynchronous work reports its result later without necessarily blocking the thread.

7. What are V8 and libuv responsible for?

**Deep explanation:** V8 parses, compiles, and executes JavaScript and manages memory. Libuv supplies the event loop, cross-platform asynchronous I/O abstractions, and a worker pool.

**Interview answer:** V8 is the JavaScript engine; libuv provides Node's event loop and much of its asynchronous I/O infrastructure.

8. How does Node.js differ from JavaScript running in a browser?

**Deep explanation:** Node provides server and system APIs such as filesystem, processes, and sockets, but no browser DOM by default. Browsers provide DOM and Web APIs inside a security sandbox; globals and module conventions also differ.

**Interview answer:** It is the same language in a different runtime: Node exposes OS and server APIs, while browsers expose DOM and web-page APIs.

9. Which workloads are a good fit for Node.js?

**Deep explanation:** Node suits I/O-heavy, highly concurrent services such as APIs, real-time applications, proxies, streaming systems, and CLI tools. Its event-driven model keeps per-connection overhead low.

**Interview answer:** Node is strongest for concurrent I/O-heavy workloads, especially APIs, real-time services, and streaming applications.

10. Which workloads require extra care when implemented in Node.js?

**Deep explanation:** CPU-intensive calculations can block the event loop and delay every request. Large computations should be partitioned, delegated to worker threads or services, or implemented with suitable native tooling.

**Interview answer:** CPU-bound work needs extra care because it can block the event loop; I would offload or parallelize it.

11. What is a callback, and when is it executed?

**Deep explanation:** A callback is a function passed to other code to invoke later or under a condition. For asynchronous APIs it runs when the operation completes and the event loop reaches its queued callback.

**Interview answer:** A callback is a function another function invokes, often after asynchronous work finishes.

12. What is an error-first callback?

**Deep explanation:** It follows the convention `(error, result)`: failure supplies an Error as the first argument, while success supplies `null` there and the value afterward. Callers must check the error first.

**Interview answer:** It is a Node callback whose first argument is an error and whose later arguments contain successful results.

13. What causes callback hell?

**Deep explanation:** Deeply nesting dependent callbacks creates difficult control flow, error handling, and readability. Named functions, modularization, Promises, and `async`/`await` flatten the structure.

**Interview answer:** Callback hell comes from many nested asynchronous callbacks; Promises and async/await usually make the flow clearer.

14. How does a Promise represent an asynchronous result?

**Deep explanation:** A Promise is a placeholder for one eventual outcome: fulfillment with a value or rejection with a reason. Consumers attach handlers or await it without knowing exactly when it settles.

**Interview answer:** A Promise represents a future value or failure that I can await or handle with then and catch.

15. What states can a Promise have?

**Deep explanation:** A Promise begins pending, then permanently becomes fulfilled or rejected. Fulfilled and rejected are collectively called settled.

**Interview answer:** Pending, fulfilled, or rejected; once settled, its state cannot change.

16. How do then, catch, and finally differ?

**Deep explanation:** `then` handles fulfillment and transforms the chain, `catch` handles rejection, and `finally` runs cleanup regardless of outcome. `finally` normally preserves the prior value or error unless it throws or returns a rejected Promise.

**Interview answer:** Then handles success, catch handles failure, and finally runs cleanup in either case.

17. What does an async function return?

**Deep explanation:** It always returns a Promise. A returned value becomes fulfillment, while a thrown error becomes rejection; returning a Promise adopts that Promise's outcome.

**Interview answer:** An async function always returns a Promise, even when I return a plain value.

18. What happens when an awaited Promise rejects?

**Deep explanation:** `await` throws the rejection reason at that point in the async function. It can be handled with `try`/`catch`; otherwise the async function's returned Promise rejects.

**Interview answer:** Await turns the rejection into a thrown error, which I handle with try/catch or let propagate as a rejected Promise.

19. How do sequential awaits differ from starting operations together?

**Deep explanation:** Sequential awaits wait for each operation before starting the next, so durations add up. Independent operations can start first and be awaited together, commonly with `Promise.all`, reducing total latency.

**Interview answer:** Sequential awaits serialize work; starting independent Promises together allows concurrency and is usually faster.

20. What does Promise.all do when one input rejects?

**Deep explanation:** It returns a Promise that rejects as soon as any input rejects; otherwise it fulfills with results in input order. Other operations are not automatically cancelled and may keep running.

**Interview answer:** Promise.all fail-fast rejects on the first rejection, but it does not cancel the remaining operations.

21. How do Promise.allSettled, Promise.race, and Promise.any differ?

**Deep explanation:** `allSettled` waits for every outcome, `race` adopts the first settled outcome, and `any` fulfills with the first fulfillment or rejects with `AggregateError` if all reject.

**Interview answer:** AllSettled collects every result, race takes the first settlement, and any takes the first success.

22. Why does a timer not guarantee execution at an exact time?

**Deep explanation:** A delay is the minimum time before a callback becomes eligible. Busy JavaScript, other queued work, OS scheduling, and timer clamping can postpone actual execution.

**Interview answer:** A timer only makes its callback eligible after the delay; the event loop may run it later.

23. What is the difference between setTimeout and setInterval?

**Deep explanation:** `setTimeout` schedules once; `setInterval` schedules repeatedly until cleared. Slow callbacks can cause interval drift or bunching, so recursively scheduled timeouts offer better control for some jobs.

**Interview answer:** SetTimeout runs once after a delay; setInterval repeats until cleared.

24. What is setImmediate used for?

**Deep explanation:** It schedules a callback in the event loop's check phase, commonly to run after the current poll phase or yield between pieces of work. Its order relative to a zero-delay timer depends on context.

**Interview answer:** SetImmediate defers work to the event loop's check phase, often after I/O callbacks.

25. What does process.nextTick schedule?

**Deep explanation:** It queues a callback to run after the current operation and before the event loop continues to another phase. Excessive recursive use can starve I/O.

**Interview answer:** It schedules work immediately after the current call stack, ahead of normal event-loop phases.

26. What is a microtask?

**Deep explanation:** A microtask is high-priority deferred work, such as a Promise reaction, drained after current JavaScript before normal event-loop tasks continue. Too many microtasks can delay timers and I/O.

**Interview answer:** It is deferred work, including Promise handlers, that runs after the current stack before regular queued tasks.

27. How does queueMicrotask differ from scheduling a timer?

**Deep explanation:** `queueMicrotask` runs in the microtask checkpoint before the event loop advances. A timer runs in a later timers phase after its minimum delay, so it normally executes later.

**Interview answer:** QueueMicrotask runs before the next event-loop phase; a timer waits for a later timers phase.

28. What happens when a callback performs a long CPU calculation?

**Deep explanation:** It monopolizes the main thread, so no other JavaScript callbacks can run and request latency rises. Break up the work or move it to worker threads or another process.

**Interview answer:** It blocks the event loop and delays all other callbacks, so CPU-heavy work should be offloaded.

29. How would you write a minimal HTTP server using node:http?

**Deep explanation:** Import `node:http`, call `createServer((req, res) => { res.end('OK'); })`, and call `listen(port)`. Production code also handles errors, routing, validation, and shutdown.

**Interview answer:** I would create a server with `http.createServer`, write or end the response in its request handler, and call `listen` on a port.

30. How do request headers, request bodies, and URL parameters differ?

**Deep explanation:** Headers carry metadata, the body carries payload data, and URL path/query parameters identify resources or modify retrieval. Each has different parsing, size, validation, and security considerations.

**Interview answer:** Headers are metadata, the body is the payload, and URL parameters describe the requested resource or query.

31. What are IncomingMessage and ServerResponse used for?

**Deep explanation:** `IncomingMessage` is the readable request object containing method, URL, headers, and streamed body. `ServerResponse` is the writable response used to set status and headers and send the body.

**Interview answer:** IncomingMessage represents the request; ServerResponse lets me construct and send the response.

32. Why must an HTTP response eventually end?

**Deep explanation:** Ending signals that no more response bytes are coming, allowing the client and server to complete or reuse the connection. Forgetting it leaves requests hanging and consumes resources.

**Interview answer:** The client needs an end signal; otherwise the request hangs and resources remain occupied.

33. How would you return JSON with the correct status and content type?

**Deep explanation:** Set a status code and `Content-Type: application/json; charset=utf-8`, then end with `JSON.stringify(value)`. Headers must be set before body bytes are sent.

**Interview answer:** I set the status and JSON content type, then send `JSON.stringify` of the value and end the response.

34. How would you read an environment variable?

**Deep explanation:** Read `process.env.NAME`, check whether it is missing, then validate and convert it before use. Avoid logging secrets.

**Interview answer:** I read `process.env.NAME` and explicitly validate or parse it.

35. Why are environment-variable values usually handled as strings?

**Deep explanation:** The process environment is a string key-value interface, so values such as `"false"` and `"3000"` are not booleans or numbers automatically. Applications must parse and validate them.

**Interview answer:** Environment variables arrive as strings, so I must explicitly convert and validate typed configuration.

36. What is process.argv used for?

**Deep explanation:** It contains command-line arguments: the Node executable, script path, then user arguments. A parser helps handle flags, aliases, defaults, and validation.

**Interview answer:** Process.argv gives the command-line arguments passed to the Node process.

37. What is the difference between process.cwd() and a module's location?

**Deep explanation:** `process.cwd()` is the directory from which the process was launched and can change. A module location is where that source file resides, obtained with `__dirname` in CommonJS or `import.meta.url` in ESM.

**Interview answer:** Cwd is the launch directory; the module location is tied to the source file itself.

38. What are stdin, stdout, and stderr?

**Deep explanation:** They are standard streams for input, normal output, and diagnostic output, exposed as `process.stdin`, `stdout`, and `stderr`. Keeping errors separate enables piping normal output safely.

**Interview answer:** They are the process's standard input, normal output, and error-output streams.

39. What is a process exit code?

**Deep explanation:** It is the integer status returned to the parent process when the program terminates. Zero conventionally means success; nonzero values indicate failure classes useful to shells and automation.

**Interview answer:** It tells the caller whether the process succeeded—usually zero—or failed with a nonzero code.

40. How would you handle a graceful shutdown signal?

**Deep explanation:** Listen for signals such as `SIGTERM`, stop accepting work, finish or time out in-flight work, close servers and resources, then exit. Make cleanup idempotent and enforce a deadline.

**Interview answer:** On SIGTERM I stop new work, drain existing requests, close resources, and exit with a bounded timeout.

41. How do CommonJS modules and ECMAScript modules differ?

**Deep explanation:** CommonJS uses `require` and `module.exports`; ESM uses static `import` and `export`, supports top-level await, and follows standard URL-based resolution semantics. Interoperability exists but has edge cases.

**Interview answer:** CommonJS uses require and module.exports; ESM uses the standard import/export syntax and different loading rules.

42. How do require and import differ at a basic level?

**Deep explanation:** `require()` is the CommonJS loader and is normally callable dynamically. Static `import` belongs to ESM, is analyzed before execution, and creates live bindings; dynamic `import()` returns a Promise.

**Interview answer:** Require loads CommonJS modules at runtime, while import is the ESM mechanism with statically analyzable bindings.

43. What is the difference between module.exports and exports?

**Deep explanation:** `exports` initially references `module.exports`, so adding properties works. Reassigning `exports` only changes the local variable; exporting a replacement requires assigning `module.exports`.

**Interview answer:** Exports is only an alias; assigning a new exported value must be done through module.exports.

44. What do .js, .cjs, and .mjs extensions communicate?

**Deep explanation:** `.cjs` explicitly means CommonJS and `.mjs` explicitly means ESM. `.js` depends on the nearest package's `type` field, defaulting to CommonJS when no applicable `type: module` exists.

**Interview answer:** Cjs forces CommonJS, mjs forces ESM, and js follows the package type configuration.

45. How does package.json affect module interpretation?

**Deep explanation:** Its `type` field controls whether `.js` files are ESM or CommonJS; `main` and `exports` define package entry points and exposure. Package boundaries also affect resolution.

**Interview answer:** Package.json can set the module type and define which entry points consumers can import.

46. What belongs in package.json?

**Deep explanation:** It commonly contains identity, version, entry points, module type, scripts, dependency groups, engine requirements, and publishing metadata. Only settings relevant to the package should live there.

**Interview answer:** It holds package metadata, scripts, dependencies, entry points, module settings, and compatibility requirements.

47. How do dependencies and devDependencies differ?

**Deep explanation:** `dependencies` are needed when the application or library runs; `devDependencies` support development tasks such as testing and linting. Production installs may omit dev dependencies.

**Interview answer:** Runtime requirements go in dependencies; build, test, and development tools go in devDependencies.

48. What are peerDependencies used for?

**Deep explanation:** They declare a package that the consumer should provide in a compatible version, common for plugins sharing a host library. This avoids incompatible duplicate host instances.

**Interview answer:** Peer dependencies express compatibility with a host package that the consuming project supplies.

49. What is a package lockfile for?

**Deep explanation:** It records the resolved dependency graph, exact versions, sources, and integrity data. Committing it makes installs more reproducible and reviewable.

**Interview answer:** A lockfile pins the resolved dependency tree so installations are consistent and auditable.

50. How do npm install and npm ci differ?

**Deep explanation:** `npm install` can resolve and update the lockfile. `npm ci` requires the manifest and lockfile to agree, performs a clean deterministic install, and is designed for CI.

**Interview answer:** Install may update dependency resolution; npm ci strictly installs the committed lockfile from a clean state.

51. What do semantic-version ranges communicate?

**Deep explanation:** They describe acceptable releases using major, minor, and patch compatibility rules. For example, caret ranges usually allow compatible minor and patch updates while excluding the next major.

**Interview answer:** Semver ranges state which versions are acceptable and how much automatic upgrading is allowed.

52. What is an npm script?

**Deep explanation:** It is a named command in `package.json` run with `npm run name`; package binaries are added to its PATH. Scripts provide a shared interface for build, test, lint, and start tasks.

**Interview answer:** It is a package.json command that standardizes project tasks such as test, build, and start.

53. How would you choose a supported Node.js release for production?

**Deep explanation:** Choose an actively supported LTS release compatible with dependencies and deployment infrastructure. Pin it through tooling or images, test upgrades, and track the official support schedule.

**Interview answer:** I use an active LTS version, verify ecosystem compatibility, pin it, and plan upgrades before end of support.

54. How would you check whether an API exists in your deployed Node.js version?

**Deep explanation:** Check the official documentation's version history and the runtime's `process.versions.node`, then test in the same pinned environment. Feature detection can provide a fallback when supporting multiple versions.

**Interview answer:** I compare the deployed version with the official API documentation and verify it in the actual runtime.

55. How do core modules differ from third-party packages?

**Deep explanation:** Core modules ship with Node and need no package installation. Third-party packages come from registries or other sources and add supply-chain, versioning, licensing, and maintenance considerations.

**Interview answer:** Core modules are built into Node; third-party packages must be installed and independently evaluated and maintained.

56. What is the purpose of the node: module prefix?

**Deep explanation:** The `node:` prefix explicitly identifies a built-in module, as in `node:fs`, making intent clear and preventing confusion with similarly named packages.

**Interview answer:** It clearly says the import is a Node built-in module, not an installed package.

57. What is a Buffer?

**Deep explanation:** A Buffer is Node's byte-oriented data type, a subclass of `Uint8Array`, used for binary files, network packets, and encoded text. Its contents are raw bytes, not characters.

**Interview answer:** A Buffer stores raw bytes for binary data and I/O.

58. How do strings and Buffers represent data differently?

**Deep explanation:** A JavaScript string represents Unicode text, while a Buffer contains bytes. Converting between them requires an encoding such as UTF-8, and byte length can differ from character count.

**Interview answer:** Strings represent text characters; Buffers represent bytes, with an encoding needed to convert between them.

59. How would you convert between a Buffer and a UTF-8 string?

**Deep explanation:** Use `Buffer.from(text, 'utf8')` to encode and `buffer.toString('utf8')` to decode. Invalid or mismatched encodings can corrupt or replace data.

**Interview answer:** I encode with `Buffer.from(text, 'utf8')` and decode with `buffer.toString('utf8')`.

60. What is the difference between Buffer.alloc and Buffer.allocUnsafe?

**Deep explanation:** `Buffer.alloc(size)` zero-fills memory safely. `allocUnsafe(size)` is faster in some cases but contains old memory until completely overwritten, so reading it first can expose sensitive data.

**Interview answer:** Alloc returns zeroed memory; allocUnsafe may be uninitialized and must be fully overwritten before use.

61. How do synchronous, callback-based, and Promise-based file APIs differ?

**Deep explanation:** Synchronous APIs block until completion. Callback and Promise APIs are asynchronous; Promises compose naturally with `async`/`await`, while callbacks may have slightly different ergonomics or overhead.

**Interview answer:** Sync file APIs block; callback and Promise APIs do not, with Promises fitting async/await more cleanly.

62. How would you read, write, append, and delete a file?

**Deep explanation:** With `node:fs/promises`, use `readFile`, `writeFile`, `appendFile`, and `unlink`, and handle expected errors such as missing files and permissions. Streams are preferable for very large data.

**Interview answer:** I use the corresponding fs/promises methods—readFile, writeFile, appendFile, and unlink—with explicit error handling.

63. What is a file descriptor?

**Deep explanation:** It is a process-local integer handle the OS uses to identify an open file or I/O resource. Operations reference the descriptor until it is closed.

**Interview answer:** A file descriptor is the operating system handle for an open file or stream.

64. Why should file handles be closed?

**Deep explanation:** Open handles consume limited OS resources and may retain locks or unflushed state. Close them in `finally` blocks or use APIs with well-defined automatic cleanup.

**Interview answer:** Closing releases OS resources and prevents descriptor leaks, locks, and incomplete cleanup.

65. How do path.join and path.resolve differ?

**Deep explanation:** `path.join` combines and normalizes segments. `path.resolve` builds an absolute path, processing right-to-left and using the current directory if necessary.

**Interview answer:** Join combines path parts; resolve produces an absolute path.

66. Why can manually concatenating filesystem paths cause bugs?

**Deep explanation:** Separators and absolute-path rules vary by platform, and missing or duplicate separators are easy mistakes. `node:path` handles these rules consistently, though untrusted paths still require containment checks.

**Interview answer:** Manual concatenation mishandles platform separators and path rules, so I use the path utilities.

67. How would you read a directory and distinguish files from directories?

**Deep explanation:** Call `readdir(path, { withFileTypes: true })` and inspect each `Dirent` using `isFile()` or `isDirectory()`. Symlinks need an explicit policy because they may point elsewhere.

**Interview answer:** I use readdir with `withFileTypes` and inspect the returned Dirent objects.

68. What is a stream in Node.js?

**Deep explanation:** A stream is an interface for processing data incrementally instead of loading it all at once. It supports asynchronous flow, composition, and bounded memory usage.

**Interview answer:** A stream reads or writes data in chunks over time.

69. What are readable, writable, duplex, and transform streams?

**Deep explanation:** Readables produce data, writables consume it, duplex streams do both independently, and transforms are duplex streams whose output is derived from input, such as compression.

**Interview answer:** Readables produce, writables consume, duplex streams do both, and transforms convert input into output.

70. Why might a stream be preferable to reading an entire file?

**Deep explanation:** Streaming bounds memory and can begin processing or sending data before the full file arrives. It is especially valuable for large files and pipelines, at the cost of more lifecycle/error handling.

**Interview answer:** Streams use bounded memory and reduce time to first output for large files.

71. What are stream chunks?

**Deep explanation:** Chunks are individual pieces delivered through a stream, commonly Buffers, strings, or objects in object mode. Chunk boundaries are transport details and do not necessarily match logical records.

**Interview answer:** They are the pieces of data a stream processes; boundaries should not be assumed to equal complete messages.

72. What is backpressure in a stream?

**Deep explanation:** Backpressure prevents a fast producer from overwhelming a slower consumer. Writable signals and `pipe`/`pipeline` pause or regulate reads so buffering remains controlled.

**Interview answer:** It is flow control that slows the producer when the consumer cannot keep up.

73. What is an EventEmitter?

**Deep explanation:** It is Node's synchronous publish-subscribe abstraction: listeners subscribe to named events and `emit` invokes them in registration order. It is useful for in-process notifications but requires cleanup.

**Interview answer:** EventEmitter lets objects publish named events to registered listener functions.

74. How do on, once, and off differ?

**Deep explanation:** `on` adds a persistent listener, `once` removes itself after its first invocation, and `off` removes a previously registered listener reference.

**Interview answer:** On subscribes repeatedly, once subscribes for one event, and off unsubscribes.

75. What happens when an EventEmitter emits an unhandled error event?

**Deep explanation:** If no `error` listener exists, Node throws the error and the process normally terminates. Emitters that can fail should have deliberate error handling.

**Interview answer:** An unhandled error event is thrown and usually crashes the process.

76. How do thrown errors differ from emitted errors?

**Deep explanation:** A thrown error follows synchronous stack propagation and `try`/`catch`. An emitted error is an event delivered to listeners; it does not travel through the caller's stack in the same way.

**Interview answer:** Thrown errors propagate through the call stack; emitted errors go through an EventEmitter's listeners.

77. How would you attach useful context to an Error?

**Deep explanation:** Use a descriptive message plus stable fields such as `code`, safe metadata, and `cause` when wrapping another error. Preserve the stack and never attach secrets.

**Interview answer:** I add a clear message, machine-readable code, safe context, and a cause when wrapping an underlying error.

78. What does an unhandled Promise rejection indicate?

**Deep explanation:** It means a rejected Promise had no rejection handler at the time Node checked it, often revealing a missing `await`, `catch`, or returned Promise. Treat it as a programming defect, log context, and shut down safely if state may be unreliable.

**Interview answer:** It usually means asynchronous error handling is missing and should be fixed rather than ignored.

79. How would you debug Node.js using breakpoints?

**Deep explanation:** Start or attach a debugger using the inspector, place breakpoints in source, reproduce the behavior, then inspect stack frames, variables, scopes, and asynchronous call stacks.

**Interview answer:** I run Node with the inspector, attach my IDE or DevTools, set breakpoints, and inspect execution state.

80. What is the built-in Node.js test runner?

**Deep explanation:** `node:test` supplies tests, suites, hooks, mocking, and assertions integrate with `node:assert`. Tests can run with `node --test` without a third-party framework.

**Interview answer:** It is the `node:test` module, commonly run with `node --test`.

81. How would you test an asynchronous function?

**Deep explanation:** Make the test function async and await the result or rejection, then assert the outcome. Ensure failures propagate rather than mixing callbacks and Promises or leaving work unawaited.

**Interview answer:** I return or await the Promise in the test and assert both success and failure paths.

82. How would you make a basic fetch request in Node.js?

**Deep explanation:** Call `await fetch(url, options)`, check `response.ok` because HTTP errors do not reject automatically, then consume the body once with `json`, `text`, or a stream.

**Interview answer:** I await fetch, verify the status, then parse the response body and handle network or parsing errors.

83. What is an AbortController used for?

**Deep explanation:** It creates an `AbortSignal` that cooperative APIs use to cancel or time out work such as `fetch`. Cancellation rejects the operation, so that path must be handled.

**Interview answer:** It supplies a signal for cancelling asynchronous operations, commonly requests and timeouts.

84. How would you parse a URL safely?

**Deep explanation:** Use `new URL(input, optionalBase)` and access structured fields such as `pathname` and `searchParams`. Catch invalid input and validate scheme, host, and destination when security matters.

**Interview answer:** I use the WHATWG URL class, then validate the parsed components instead of manually splitting strings.

85. What is middleware in an Express application?

**Deep explanation:** Middleware is a function in the request-response chain that can inspect or modify state, end the response, or call `next`. It supports concerns such as logging, authentication, and parsing.

**Interview answer:** Middleware is a request-chain function that handles a concern, sends a response, or passes control onward.

86. How do route parameters and query parameters differ in Express?

**Deep explanation:** Route parameters are named path segments, such as `/users/:id`, available on `req.params`. Query parameters follow `?`, are available on `req.query`, and commonly express filtering or pagination.

**Interview answer:** Route params identify parts of the path; query params are optional key-value modifiers after the question mark.

87. Why does middleware order matter?

**Deep explanation:** Express processes matching middleware in registration order. Parsers, authentication, routes, 404 handlers, and error handlers must be placed so each sees the intended request state.

**Interview answer:** Express runs middleware in order, so earlier handlers determine what later ones can see and whether they run.

88. How would you handle an unknown route and an application error separately?

**Deep explanation:** Place a normal 404 middleware after all routes, then an error-handling middleware with four parameters after that. Return controlled responses and avoid leaking internal details.

**Interview answer:** I add a final normal middleware for 404s and a separate four-argument error middleware for failures.

89. Why should secrets stay out of source control and logs?

**Deep explanation:** Repositories and logs are widely copied and retained, making leaked credentials hard to erase and easy to exploit. Store secrets in an approved secret system, restrict access, redact output, and rotate exposures.

**Interview answer:** Repos and logs spread and retain data, so secrets belong in controlled secret storage and must be redacted.

90. How would you validate incoming JSON before using it?

**Deep explanation:** Enforce body size and content type, parse with error handling, then validate structure, types, ranges, formats, and allowed fields against a schema. Reject invalid input before business logic.

**Interview answer:** I parse under size limits, validate against a schema, and reject invalid or unexpected data before using it.

91. What information does the node:os module expose about the host?

**Deep explanation:** It exposes platform, architecture, CPU, memory, uptime, hostname, network interfaces, temporary directory, and related OS information. Container limits may differ from host-wide values.

**Interview answer:** It provides operating-system details such as platform, CPUs, memory, uptime, and network interfaces.

92. How would you build an interactive command-line prompt using readline?

**Deep explanation:** Create a readline interface from `process.stdin` and `process.stdout`, ask questions or iterate lines, handle cancellation, and close the interface. `node:readline/promises` works naturally with async/await.

**Interview answer:** I create a readline interface over stdin and stdout, await questions, and close it when finished.

93. How do assert.equal and assert.strictEqual differ?

**Deep explanation:** `assert.equal` uses coercive `==` comparison, while `assert.strictEqual` uses `===`. Strict equality avoids surprising conversions and is normally preferred.

**Interview answer:** Equal allows type coercion; strictEqual does not and is generally safer.

94. What does util.inspect help you see while debugging?

**Deep explanation:** It formats objects with configurable depth, colors, array limits, and visibility of non-enumerable or custom-inspected values. It is for diagnostics, not serialization.

**Interview answer:** It produces a readable diagnostic representation of complex JavaScript values.

95. What is a cryptographically secure random value, and how would you generate one in Node.js?

**Deep explanation:** It is generated by a CSPRNG and is unpredictable enough for tokens, keys, or nonces. Use `crypto.randomBytes`, `randomInt`, or `randomUUID`, not `Math.random` for security-sensitive values.

**Interview answer:** It is unpredictable random data from a CSPRNG; in Node I use node:crypto APIs such as randomBytes or randomUUID.

96. How would you calculate a hash or HMAC using node:crypto?

**Deep explanation:** For a hash, use `createHash(algorithm).update(data).digest(format)`. For an authenticated keyed digest, use `createHmac(algorithm, secret)`; protect the key and compare authentication values safely.

**Interview answer:** I use createHash for an unkeyed digest and createHmac with a secret key for message authentication.

97. How would you compress and decompress data with node:zlib?

**Deep explanation:** Use convenience functions for small buffers or create gzip, deflate, or Brotli transform streams and connect them with `pipeline` for large data. Both sides must agree on the format.

**Interview answer:** I use zlib's matching compression and decompression functions, or transform streams with pipeline for large data.

98. How do URL and URLSearchParams help avoid manual URL parsing?

**Deep explanation:** `URL` applies standard parsing and resolution rules; `URLSearchParams` safely reads and encodes repeated query keys and special characters. They avoid brittle splitting and concatenation.

**Interview answer:** They provide standards-based parsing and encoding for URL components and query parameters.

99. How would you start Node.js with the inspector enabled?

**Deep explanation:** Run `node --inspect app.js` to listen for a debugger, or `--inspect-brk` to pause before application code. Do not expose the inspector port to untrusted networks.

**Interview answer:** I use `node --inspect`, or `--inspect-brk` when I need to pause at startup.

100. What are process warnings, and how do they differ from thrown errors?

**Deep explanation:** Warnings report concerning conditions such as deprecations and emit a `warning` event, but normally allow execution to continue. Thrown errors interrupt the current control flow unless caught.

**Interview answer:** Warnings are diagnostic and usually nonfatal; thrown errors alter control flow and can terminate execution.

101. How would you read a binary integer from a Buffer?

**Deep explanation:** Choose the method matching width, signedness, and byte order, such as `readUInt32LE(offset)`, and ensure the buffer contains enough bytes. The data format determines the correct choice.

**Interview answer:** I use the Buffer read method matching the integer size, signedness, and endianness at a validated offset.

102. What do little-endian and big-endian Buffer methods mean?

**Deep explanation:** They specify byte order for multi-byte numbers: little-endian stores the least-significant byte first, big-endian the most-significant byte first. Decoding must match the producer's format.

**Interview answer:** They describe byte order; LE puts the least-significant byte first and BE the most-significant byte first.

103. How would you distinguish an Error's message, stack, code, and cause?

**Deep explanation:** `message` is human-readable context, `stack` records creation and call frames, `code` is a stable machine-readable category when provided, and `cause` links the underlying error being wrapped.

**Interview answer:** Message explains it, stack locates it, code classifies it programmatically, and cause preserves the underlying failure.

104. How would you write a small command-line application that accepts flags and input files?

**Deep explanation:** Parse `process.argv` with `util.parseArgs` or a maintained parser, validate flags and positional file paths, process files asynchronously, write results to stdout and diagnostics to stderr, and set meaningful exit codes.

**Interview answer:** I parse and validate arguments, process each input file, separate normal output from errors, and return a useful exit code.

105. How would you organize Express routers for several related resources?

**Deep explanation:** Give each resource or bounded feature its own `Router`, colocate handlers and validation, and mount it under a clear prefix. Shared middleware belongs at the narrowest common level.

**Interview answer:** I create feature-focused routers and mount them under resource prefixes, sharing middleware only where appropriate.

106. How do application-level and router-level middleware differ?

**Deep explanation:** Application middleware is attached to the Express app and can affect broad paths. Router middleware is attached to a modular `Router` and applies only when that router is mounted and matched.

**Interview answer:** App-level middleware is broad; router-level middleware is scoped to a mounted router.

107. How would you serve static files without exposing arbitrary directories?

**Deep explanation:** Mount `express.static` on a fixed, resolved public directory and optional URL prefix. Never derive the root from untrusted input; control dotfiles, indexes, caching, and sensitive files.

**Interview answer:** I mount express.static on an explicit public directory and never let user input select the filesystem root.

108. What does a package's engines field communicate?

**Deep explanation:** It declares intended compatible runtime or package-manager versions, such as a Node range. Enforcement depends on the package manager and configuration, so CI and deployment should check it too.

**Interview answer:** It documents the Node or package-manager versions the package supports, though enforcement is not always automatic.

109. How would you inspect an npm dependency tree?

**Deep explanation:** Use `npm ls` for the installed hierarchy, optionally naming a package, and `npm explain package` to see why it is installed. The lockfile provides the full resolved graph.

**Interview answer:** I use npm ls for the tree and npm explain to trace why a dependency is present.

110. Why should package-install scripts be reviewed before running untrusted packages?

**Deep explanation:** Install lifecycle scripts execute code with the installing user's permissions and can access files, credentials, and the network. Review provenance and scripts, use isolation, and disable scripts when appropriate.

**Interview answer:** Install scripts run arbitrary code during installation, so untrusted packages create a serious supply-chain risk.
