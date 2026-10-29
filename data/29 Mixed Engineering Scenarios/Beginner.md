1. A login works in an API client but fails in the browser; how would you investigate?

**Deep explanation:** Compare the browser request with the working client request: URL, method, headers, cookies, body, redirects, and response. Browser-only causes commonly include CORS, cookie `SameSite`/`Secure` settings, CSRF protection, mixed content, and credentials not being included. Use the Network and Console panels, then inspect server logs with a request ID.

**Interview answer:** I would diff the browser request against the successful API-client request, inspect the browser console and network trace, and correlate it with server logs. I would pay special attention to CORS, cookies, CSRF, redirects, and whether credentials are sent, then fix the actual configuration rather than weakening security controls.

2. A button submits a form twice; how would you identify and prevent the duplicate action?

**Deep explanation:** Check whether both `click` and `submit` handlers run, whether listeners were registered twice, or whether rapid clicks send two requests. Log a unique action ID at the UI and server. Prevent duplicates by using one form submission path, disabling the control while pending, and enforcing server-side idempotency or a uniqueness constraint for important operations.

**Interview answer:** I would trace event handlers and network requests to find whether the duplication is in the UI, retry layer, or backend. I would keep one submit handler, block repeat clicks while pending, and make the server operation idempotent so duplicate requests cannot create duplicate results.

3. A page looks correct on desktop but overflows on mobile; how would you debug it?

**Deep explanation:** Use responsive device tools and inspect which element extends beyond the viewport. Typical causes are fixed widths, `min-width`, unbreakable text, wide media, excessive margins, or flex/grid children that cannot shrink. Temporarily outline elements, check computed dimensions, and test several narrow widths rather than one device preset.

**Interview answer:** I would reproduce at narrow widths, identify the element wider than the viewport, and inspect its computed size and parent layout. I would replace unnecessary fixed sizing with responsive constraints, allow text and flex items to wrap or shrink, constrain media, and retest across breakpoints.

4. A React input loses focus after every keystroke; what would you investigate?

**Deep explanation:** Focus usually disappears because React unmounts and recreates the input. Investigate changing `key` values, components declared inside a render function, conditional branches, or parent state changes that replace the subtree. React DevTools and mount/unmount logging can confirm whether the DOM node identity changes.

**Interview answer:** I would check whether the input is being remounted on every state update, especially because of an unstable key or component definition. I would preserve stable component and DOM identity, keep the input controlled correctly, and verify with React DevTools that it rerenders without unmounting.

5. A list displays the wrong item after deletion; how would you inspect identity and state?

**Deep explanation:** The common cause is using an array index as a React key or storing selection by position. After deletion, positions shift and UI state attaches to another item. Inspect stable database IDs, reducer updates, mutation versus immutable updates, and whether cached or selected state references the same identity.

**Interview answer:** I would inspect the list keys and any selected-item state. I would key rows and store selection by a stable item ID, update the array immutably, and confirm the backend and cache remove the same ID rather than relying on an index.

6. A fetch request returns 404 without throwing; how would you handle the response?

**Deep explanation:** `fetch` rejects on network failures, not ordinary HTTP error statuses. Code must check `response.ok` or the status before parsing successful data. Error bodies may use a different format, so parsing should be defensive and the application should translate expected statuses such as 404 into useful domain behavior.

**Interview answer:** I would check `response.ok` immediately and handle non-2xx statuses explicitly. For a 404 I would parse any safe error payload, show or return a meaningful not-found result, and throw a typed error when the caller needs failure control flow.

7. A form accepts invalid data when JavaScript is disabled; how would you fix the full flow?

**Deep explanation:** Client validation improves feedback but is not a security boundary because it can be disabled or bypassed. Validate and normalize all inputs on the server using the same business rules, return field-level errors, and render them in the non-JavaScript response. Database constraints should protect critical invariants such as uniqueness and required relations.

**Interview answer:** I would add authoritative server-side validation and return accessible field errors while keeping client validation for convenience. I would also enforce critical invariants in the database, so every submission path is safe even without JavaScript.

8. A user can open another user's order by changing its ID; how would you investigate and repair it?

**Deep explanation:** This is an insecure direct object reference and an authorization failure. Reproduce with controlled accounts, inspect access logs, and determine exposure without accessing unnecessary user data. Repair the query or policy so it checks both order identity and the authenticated user's permission; unpredictable IDs alone do not provide authorization.

**Interview answer:** I would treat it as a security incident, verify scope, preserve evidence, and review logs for exploitation. I would enforce object-level authorization on every read and write—such as querying by both order ID and owner or tenant ID—add tests across users, and follow the incident-response process.

9. A password appears in application logs; what immediate and follow-up steps would you take?

**Deep explanation:** Stop further logging first, restrict access to affected logs, and follow incident procedures. Determine which users and systems were exposed, securely purge or expire logs according to policy, and require password resets where warranted. Then redact sensitive fields centrally, review similar logging paths, add tests and detection, and never log plaintext credentials.

**Interview answer:** I would stop the leak, secure the logs, notify the security or incident team, assess scope, and rotate affected credentials as appropriate. Then I would remove or redact secrets at the logging boundary, clean up retained copies through the approved process, and add tests and monitoring to prevent recurrence.

10. An API returns an empty list when a database query fails; how would you improve its behavior?

**Deep explanation:** An empty result means the query succeeded and found nothing; using it for failure hides outages and misleads clients. Preserve the distinction by logging the underlying error with context, returning an appropriate 5xx response and stable error shape, and attaching a correlation ID. Avoid exposing database internals.

**Interview answer:** I would stop converting exceptions into empty success responses. I would return a suitable 5xx error with a safe, consistent payload and correlation ID, log the real cause, and add tests distinguishing “no records” from “query failed.”

11. A query returns duplicate orders after a join; how would you find the cause?

**Deep explanation:** A join returns one row per matching combination, so a one-to-many relationship—such as an order with several items—naturally repeats order columns. Inspect the join keys and relationship cardinality with counts for one affected order. Then choose the intended result: aggregate children, fetch them separately, use `EXISTS`, or deliberately deduplicate; `DISTINCT` can mask an incorrect join.

**Interview answer:** I would isolate one duplicated order and inspect how many rows each joined table contributes and whether the join condition is complete. I would then model the desired shape explicitly with aggregation, `EXISTS`, or separate child loading instead of blindly adding `DISTINCT`.

12. A money total differs by a few cents between frontend and backend; how would you investigate?

**Deep explanation:** Compare line-item inputs, rounding points, tax and discount order, and currency rules on both sides. Binary floating-point cannot exactly represent many decimal fractions, and rounding each line differs from rounding the final total. Define one authoritative calculation using integer minor units or a decimal library and explicit rounding rules.

**Interview answer:** I would compare the exact inputs and each intermediate calculation to find where rounding diverges. I would make the backend authoritative, calculate with integer cents or decimal arithmetic, document when and how rounding occurs, and share test vectors with the frontend.

13. A scheduled task runs at the wrong local time; how would you inspect time-zone handling?

**Deep explanation:** Identify the scheduler's configured zone, host zone, stored timestamp format, and daylight-saving behavior. Log both UTC and the intended IANA time zone, such as `Asia/Kolkata`, rather than relying on abbreviations or fixed offsets. Decide whether the requirement is a fixed instant or a recurring local wall-clock time.

**Interview answer:** I would verify the scheduler, host, and application time zones and inspect the next computed run in UTC and local time. I would use an explicit IANA zone, test daylight-saving transitions where applicable, and clarify whether the schedule should follow local clock time or a fixed UTC instant.

14. A file upload works for text files but fails for images; how would you narrow the issue?

**Deep explanation:** Compare request size, MIME type, extension, multipart boundaries, and binary handling. Check limits and validation at every layer: browser, proxy, application, storage, antivirus or image processing. Server and proxy logs plus a small known-good image help locate whether rejection occurs during transport, parsing, validation, or post-processing.

**Interview answer:** I would reproduce with a tiny known-good image and trace it through the browser, proxy, application, and storage logs. I would check size limits, `multipart/form-data`, MIME validation, binary-safe handling, permissions, and image-processing errors, then fix the rejecting layer while retaining safe upload validation.

15. A Node.js server becomes unresponsive during a calculation; how would you diagnose it?

**Deep explanation:** CPU-heavy synchronous JavaScript blocks Node's event loop, preventing it from handling other requests. Measure event-loop lag and capture a CPU profile or flame graph to locate the hot function. Improve the algorithm, break work into bounded chunks, or move CPU work to worker threads or a job service; adding promises alone does not make computation non-blocking.

**Interview answer:** I would confirm event-loop blocking with latency metrics and a CPU profile, then identify the expensive synchronous calculation. I would optimize it or move it to a worker thread or background service, add limits and timeouts, and load-test responsiveness afterward.

16. A timer fires much later than expected; how would you investigate event-loop work?

**Deep explanation:** A timer's delay is a minimum, not an exact execution time; its callback waits until the event loop can run it. Look for long synchronous functions, excessive microtasks, garbage collection, blocking native calls, or system load. Measure event-loop delay and profile the interval before the late callback.

**Interview answer:** I would measure event-loop lag and profile what ran before the timer. I would look for CPU-heavy synchronous work, large microtask chains, blocking I/O, or GC pressure, then reduce or offload that work and avoid relying on timers for precise real-time guarantees.

17. A test passes alone but fails with the full suite; what shared state would you inspect?

**Deep explanation:** Suite-only failures usually indicate leaked global state, reused database rows, unreset mocks or timers, environment changes, shared files or ports, cached modules, or order-dependent asynchronous work. Reproduce with the smallest pair of tests and randomize order. Each test should create and clean up its own state without depending on another test.

**Interview answer:** I would identify the preceding test that triggers the failure, then inspect globals, mocks, timers, database data, environment variables, files, ports, and unfinished async work. I would isolate fixtures and cleanup, make tests order-independent, and add the combined case to prevent regression.

18. A Git merge removes a teammate's behavior while tests pass; how would you recover and prevent recurrence?

**Deep explanation:** Compare the merge commit with both parents to find the lost change, consult the teammate, and restore it in a new commit or revert the faulty merge through the team's workflow. Tests passing means coverage missed the behavior. Add a regression test, improve conflict review, and manually verify high-risk merged behavior.

**Interview answer:** I would inspect the merge diff against both parents, recover the intended code with the teammate's confirmation, and ship it through a reviewed corrective commit. Then I would add a regression test for the lost behavior and tighten merge-conflict review so passing tests are not the only signal.

19. A container exits immediately after startup; what would you inspect first?

**Deep explanation:** Containers live while their main process, PID 1, is running. Inspect exit code, stdout/stderr, container events, the configured entrypoint and command, and whether the process incorrectly daemonizes. Then check required environment variables, mounted files, permissions, architecture, and health or dependency failures.

**Interview answer:** I would start with the container logs, exit code, and effective entrypoint and command. I would verify the main process stays in the foreground and then check configuration, mounts, permissions, and dependencies, reproducing interactively only if the normal logs are insufficient.

20. A service works locally but cannot connect to the database in staging; how would you investigate?

**Deep explanation:** Test from inside the staging runtime because its DNS, routes, firewall, and credentials differ from the laptop. Verify host and port, secret injection, TLS settings, database allowlists, service identity, and connection limits. A TCP or database-native probe can distinguish network reachability from authentication or schema problems without printing secrets.

**Interview answer:** I would test DNS and database connectivity from the staging service itself, then verify endpoint, port, credentials, TLS, firewall or security-group rules, and database logs. I would compare configuration with local while redacting secrets and use the exact error to separate timeout, refusal, and authentication failures.

21. A build succeeds on one laptop but fails in CI; how would you compare environments?

**Deep explanation:** Compare source commit, runtime and package-manager versions, lockfile use, operating system, architecture, environment variables, filesystem case sensitivity, locale, and generated or untracked files. Reproduce with the same clean build command and container image when possible. Pin toolchains and make dependencies explicit.

**Interview answer:** I would compare the exact commit, tool versions, lockfile installation, OS, environment, and build command, then reproduce in a clean CI-like environment. I would fix undeclared dependencies or portability issues and pin versions so developer and CI builds are deterministic.

22. A user reports a blank screen with no reproduction steps; what evidence would you collect?

**Deep explanation:** Gather URL, time, user or tenant ID, browser and device, recent actions, screenshot, console errors, and network failures while respecting privacy. Correlate these with frontend error monitoring, release version, feature flags, API logs, and request IDs. A global error boundary and source maps make otherwise blank failures diagnosable.

**Interview answer:** I would ask for the time, URL, device and browser, actions before failure, and a screenshot or console trace if feasible. I would correlate that with client error monitoring, release and feature-flag data, network requests, and backend logs, then create a reproducible case before fixing it.

23. A dashboard shows outdated data after a successful save; how would you trace the update path?

**Deep explanation:** Follow data from the save response through local state, cache invalidation or mutation, refetching, backend reads, replicas, and browser or CDN caches. Confirm whether the write response contains updated data and whether the dashboard query key matches the invalidated key. Eventual consistency may require an explicit user experience rather than pretending updates are immediate.

**Interview answer:** I would trace the saved value from the write response to the dashboard query and compare network responses with rendered state. I would check cache keys, invalidation, optimistic updates, stale-time settings, and replica lag, then update or refetch the authoritative record with clear handling for eventual consistency.

24. A notification email is sent twice; how would you identify the duplicate trigger?

**Deep explanation:** Add or follow a correlation ID from business event to queued job and provider request. Determine whether the event was published twice, multiple consumers processed it, a retry followed a timeout, or two code paths send the same message. Delivery systems are commonly at-least-once, so persist an idempotency key or unique send record.

**Interview answer:** I would trace one notification using event, job, and provider IDs to locate where it duplicated. I would remove overlapping triggers and enforce idempotency with a unique business-event key, while keeping retries safe and recording send status transactionally.

25. A background job fails silently; how would you make failures visible?

**Deep explanation:** A worker should record structured logs with job and correlation IDs, metrics for successes, retries and failures, and the final exception. Configure bounded retries with backoff, a dead-letter queue or failed-job store, and alerts based on failure rate, age, or queue depth. Never mark a job successful after swallowing an exception.

**Interview answer:** I would ensure exceptions fail the job and emit structured logs and metrics tied to its ID. I would add bounded retries, a failed-job or dead-letter path, dashboards and actionable alerts, plus a safe replay process after the root cause is fixed.

26. A URL parameter breaks a page when it contains spaces or Unicode; how would you fix it?

**Deep explanation:** URL components require percent-encoding, and encoding rules differ between path segments and query parameters. Build URLs with the platform `URL` and `URLSearchParams` APIs or apply `encodeURIComponent` to individual values—not an entire assembled URL. Decode once at the boundary and test spaces, emoji, non-Latin scripts, `%`, `&`, `/`, and `+`.

**Interview answer:** I would stop concatenating raw values into the URL and use `URL`/`URLSearchParams`, or encode each path segment correctly. I would decode exactly once on the server and add round-trip tests for spaces, Unicode, and reserved characters.

27. A page cannot be used with a keyboard; how would you identify the first barriers?

**Deep explanation:** Navigate from the address bar using only Tab, Shift+Tab, Enter, Space, arrow keys, and Escape. Check that interactive elements are native controls, focus order is logical, focus is visible, dialogs manage and restore focus, and no keyboard traps exist. Automated accessibility checks help, but manual keyboard testing is essential.

**Interview answer:** I would perform a keyboard-only walkthrough and identify unreachable controls, invisible or illogical focus, keyboard traps, and custom widgets without expected keys. I would prefer semantic HTML, add correct focus behavior, test dialogs and menus, and verify with accessibility tools and manual retesting.

28. A database table grows much faster than expected; how would you find the source?

**Deep explanation:** Measure row and storage growth over time, then group new records by timestamp, type, tenant, source, or job identifier. Inspect write paths, retries, missing uniqueness constraints, audit or event retention, and large indexes or binary columns. Fix the producer before applying a retention, archival, partitioning, or cleanup policy.

**Interview answer:** I would quantify when growth began and sample recent rows to identify the dominant source and pattern. I would trace those rows to the writing service or job, check retries and constraints, fix unintended writes, and then implement an approved retention or archival plan with monitoring.

29. A developer commits an API key to a public repository; how would you respond?

**Deep explanation:** Assume the key is compromised even if the commit is quickly removed. Revoke or rotate it immediately, review provider audit logs and usage, notify security, and contain any abuse. Removing Git history is secondary because clones and caches may persist; afterward use secret management, least-privilege keys, scanning, and prevention hooks.

**Interview answer:** I would revoke or rotate the key immediately, assess usage and logs with the security team, and contain any impact. I would remove the secret from current code and history as appropriate, but never treat deletion as revocation, then move it to a secret manager and add scanning and least-privilege controls.

30. An AI-generated answer contains a confident but unsupported claim; how would you evaluate the feature?

**Deep explanation:** Create a representative evaluation set with known answers and evidence, then measure factual accuracy, citation support, abstention behavior, and severity of errors—not just fluency. Include adversarial and high-risk cases, have qualified humans review samples, and instrument production feedback. Mitigations can include retrieval, source display, confidence-independent verification, and refusing when evidence is insufficient.

**Interview answer:** I would evaluate grounded correctness rather than how convincing the answer sounds. I would use a representative test set, require claims to be supported by reliable sources, measure hallucination and appropriate abstention rates, review high-risk cases with experts, and gate release on explicit quality and safety thresholds.
