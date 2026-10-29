1. A React page becomes slow after loading 10,000 rows; how would you locate and reduce the bottleneck?

**Deep explanation:** Use the React Profiler and browser Performance panel to separate expensive rendering, layout, data transformation, and network work. Check for unnecessary rerenders with stable keys and memoized props, then virtualize the table so only visible rows exist in the DOM; move costly sorting/filtering off the render path or to a worker if needed.

**Interview answer:** I would profile first, then eliminate avoidable rerenders and virtualize the rows. I would benchmark sorting, filtering, and layout separately so the fix targets the measured bottleneck.

2. Autocomplete shows results for an older query after the user types quickly; how would you fix the race?

**Deep explanation:** Responses can arrive out of order, so request order cannot define result order. Debounce input, cancel the previous request with `AbortController`, and associate each request with a sequence number or query value; update state only if the response still matches the latest request.

**Interview answer:** I would cancel superseded requests and guard state updates with a request ID. Only the response for the current query may update the suggestions.

3. A large file upload fails randomly on mobile networks; how would you make it resumable?

**Deep explanation:** Split the file into numbered chunks and create an upload session with a durable ID. The server records received chunks and verifies checksums; after interruption the client queries session state and retries only missing chunks, then the server atomically assembles and validates the complete file.

**Interview answer:** I would use chunked uploads with an upload ID, per-chunk checksums, idempotent retries, and a status endpoint. The client resumes from confirmed chunks instead of restarting the file.

4. A WebSocket chat misses messages after reconnecting; how would you design recovery?

**Deep explanation:** WebSockets provide a connection, not durable delivery. Give every conversation event a monotonic sequence or cursor, persist events, have the client send its last acknowledged cursor on reconnect, and replay the gap before resuming live delivery; deduplicate by message ID.

**Interview answer:** I would persist sequenced messages and reconnect with the last received cursor. The server replays missing events, and the client deduplicates IDs before switching back to live traffic.

5. A payment request times out after the provider charges the customer; how would you resolve the outcome safely?

**Deep explanation:** A timeout means the result is unknown, not failed. Persist a payment attempt with an idempotency key, query the provider or wait for a verified webhook, and reconcile states before retrying; never issue a new charge merely because the response was lost.

**Interview answer:** I would mark the attempt pending, reconcile it using the provider's idempotency key and status API or webhook, and charge again only after proving the original attempt did not succeed.

6. An API receives the same checkout request five times; how would you prevent duplicate orders and charges?

**Deep explanation:** Require an idempotency key scoped to the customer and operation, persist it with the request fingerprint and final response, and enforce a unique database constraint. Create the order and claim the key transactionally; reuse the same key with different input should be rejected.

**Interview answer:** I would make checkout idempotent with a persisted key and unique constraint, and pass a related idempotency key to the payment provider. Duplicate requests return the original result.

7. A database query is fast locally but times out in production; how would you compare plans and data distributions?

**Deep explanation:** Capture the exact SQL, parameters, schema, statistics, and `EXPLAIN (ANALYZE, BUFFERS)` safely in both environments. Compare estimated versus actual rows, index choices, joins, spills, locks, cache state, and parameter-sensitive plans; production-scale skew or stale statistics often changes the optimizer's decision.

**Interview answer:** I would compare actual execution plans using representative production parameters and inspect row-estimate errors, skew, stale stats, missing indexes, spills, and lock waits. I would test the fix against production-like data.

8. An endpoint's p99 latency rises while its average remains stable; how would you investigate?

**Deep explanation:** The average hides a slow minority. Slice traces by region, tenant, payload size, instance, dependency, and status; correlate slow spans with GC, queueing, cold starts, connection-pool waits, retries, and database locks, using exemplars from the p99 bucket.

**Interview answer:** I would inspect traces for the slowest requests and segment them until the affected cohort appears. Then I would attribute tail time to queueing, dependencies, resource pauses, or retries rather than optimizing the average path.

9. The database pool is exhausted even though database CPU is low; how would you locate the bottleneck?

**Deep explanation:** Pool exhaustion can mean connections are leaked, held during non-database work, blocked on locks, or limited by a downstream network problem. Measure acquisition wait and hold time, inspect active/idle transactions and lock waits, trace connection ownership, and verify timeout and pool sizing across all replicas.

**Interview answer:** I would trace pool acquisition and connection hold duration, then inspect leaks, long transactions, lock waits, and connections held across remote calls. Low CPU suggests waiting or poor lifecycle management, not necessarily too small a pool.

10. A Redis outage causes the database to fail minutes later; how would you prevent this cascade?

**Deep explanation:** When every cache miss falls through, the database receives a sudden synchronized load. Add circuit breakers, bounded concurrency, request shedding, stale-cache serving, local caches, and single-flight request coalescing; recover gradually with jittered warm-up rather than instantly restoring full traffic.

**Interview answer:** I would protect the database with concurrency limits and load shedding, serve stale data where safe, and coalesce identical misses. Redis recovery and cache refill should be gradual and jittered.

11. Cache entries are stale immediately after updates; how would you analyze concurrent reads and invalidation?

**Deep explanation:** Trace a timeline of database commit, cache invalidation/write, and concurrent cache fills. A reader may fetch old data before commit and write it after invalidation; prevent that with versioned values, delete-after-commit plus guarded fills, or a transactional outbox that drives ordered invalidations.

**Interview answer:** I would reconstruct the race around commit, invalidation, and cache fill. Then I would use version checks or ordered post-commit invalidation so an old read cannot repopulate the cache.

12. A queue's backlog grows while consumers report healthy status; how would you investigate throughput and skew?

**Deep explanation:** Health checks prove processes are alive, not that useful work keeps pace. Compare arrival and completion rates, processing-time distributions, retries, poison messages, partition lag, key skew, concurrency, downstream throttling, and acknowledgement behavior; inspect each partition rather than only aggregate depth.

**Interview answer:** I would compare ingress versus completed throughput and inspect lag per partition. I would look for hot keys, slow handlers, retries, poison messages, and downstream limits while verifying acknowledgements actually advance offsets.

13. A consumer crashes after committing a database update but before acknowledging; how would you make replay safe?

**Deep explanation:** At-least-once delivery makes this failure normal. Store the message ID in an inbox/deduplication table and apply the business update in the same transaction under a uniqueness constraint; on replay, detect the recorded ID and acknowledge without repeating effects.

**Interview answer:** I would make the handler idempotent by transactionally recording the event ID with the database change. A replay finds the ID and becomes a no-op before acknowledgement.

14. A webhook arrives before the related API response; how would you model the workflow?

**Deep explanation:** Model both inputs as independent observations of one durable operation rather than assuming temporal order. Correlate them by provider object or idempotency ID, upsert state through valid transitions, retain unmatched events, and reconcile asynchronously when either side arrives.

**Interview answer:** I would use a durable state machine keyed by the provider operation ID. API responses and webhooks are idempotent events that can arrive in either order and converge on the same state.

15. A deployment breaks clients with cached JavaScript bundles; how would you recover and improve compatibility?

**Deep explanation:** First restore compatible server behavior or roll forward with the missing assets; avoid deleting old hashed bundles. Use content-hashed immutable assets, deploy assets before HTML, keep older assets for a retention window, and make APIs backward compatible across active client versions.

**Interview answer:** I would restore compatibility immediately and retain the old hashed bundles. Future deploys would publish assets first, keep them immutable, and preserve API compatibility for cached clients.

16. A Kubernetes pod restarts repeatedly without application error logs; how would you investigate its termination reason?

**Deep explanation:** Inspect pod status, events, container `lastState`, exit code, reason, restart count, and previous-container logs. Distinguish OOM kills, failed liveness probes, node eviction, crashes before logging, and external signals; then compare resource limits and probe timing with metrics.

**Interview answer:** I would check `describe`, events, `lastState`, exit code, and `logs --previous`. That identifies whether Kubernetes, the kernel, a probe, or the process caused the restart even when current logs are empty.

17. A pod is healthy but receives no traffic; how would you inspect selectors, endpoints, and readiness?

**Deep explanation:** Compare Service selectors with pod labels, then inspect EndpointSlices to see whether the pod IP is published and ready. Verify readiness conditions, named ports and target ports, namespace, network policies, ingress routing, and whether the application listens on the pod interface.

**Interview answer:** I would follow the route from Service selector to EndpointSlice to pod IP and port. Then I would verify readiness, port mapping, policies, and ingress configuration at the first point where the route disappears.

18. A rolling deployment drops long-lived connections; how would you improve shutdown coordination?

**Deep explanation:** On termination, first fail readiness and stop accepting new connections, then drain existing sessions during a sufficient grace period. Handle `SIGTERM`, use a pre-stop/drain mechanism if necessary, coordinate load-balancer deregistration delay, and support client reconnect with resumable session state.

**Interview answer:** I would mark the pod unready, allow endpoint removal to propagate, stop new connections, and gracefully drain existing ones before exit. Clients should reconnect safely and resume from a cursor.

19. A new index improves reads but sharply slows writes; how would you evaluate the tradeoff?

**Deep explanation:** Indexes add maintenance, WAL, storage, cache pressure, and contention to every affected write. Measure read latency and frequency against write throughput and tail latency, inspect index usage and size, and consider a narrower, partial, covering, or differently ordered index; remove redundant indexes.

**Interview answer:** I would quantify total workload benefit, not just the target query. If write cost outweighs read gains, I would redesign the index, consolidate redundancy, or move the read pattern elsewhere.

20. A batch job locks a table needed by checkout; how would you redesign the job?

**Deep explanation:** Avoid one large transaction and lock-heavy full-table operations. Process stable primary-key ranges in small idempotent batches, commit frequently, use short lock timeouts and `SKIP LOCKED` where appropriate, schedule or throttle work, and consider shadow tables plus an atomic swap for transformations.

**Interview answer:** I would break the job into small resumable transactions ordered by primary key and throttle it against checkout latency. For bulk replacement, I would build a shadow table and swap it briefly.

21. A new feature exposes another tenant's data through a cache; how would you contain and repair the issue?

**Deep explanation:** Disable the feature or cache path, purge affected entries, preserve audit evidence, assess exposure, rotate secrets if implicated, and follow incident-notification obligations. Fix cache keys to include immutable tenant identity, enforce authorization after cache retrieval, and add cross-tenant isolation tests.

**Interview answer:** I would contain it immediately, purge the cache, investigate and notify through the incident process. The repair includes tenant-scoped keys, authorization on every response, and tests proving isolation.

22. Users stop receiving notifications while provider requests return success; how would you trace delivery end to end?

**Deep explanation:** A successful provider request usually means accepted, not delivered. Correlate an internal notification ID through enqueue, worker attempt, provider message ID, provider callbacks, carrier/device delivery, suppression lists, and user preferences; compare cohorts and monitor terminal outcomes.

**Interview answer:** I would trace one notification from creation through the provider's message ID to delivery receipts. I would check suppressions, callbacks, device tokens, and provider-specific failures rather than treating HTTP success as delivery.

23. An AI chatbot retrieves the correct document but still answers incorrectly; how would you isolate the failure?

**Deep explanation:** Freeze a failing example and inspect the exact retrieved chunks, ordering, prompt, model output, and post-processing. Test whether the necessary fact survives chunking and context limits, whether instructions conflict, and whether the model is grounded; evaluate retrieval and generation separately with cited-answer checks.

**Interview answer:** Since retrieval is correct, I would inspect context construction and generation: chunk content, truncation, prompt, model settings, and post-processing. I would require citations and score answer faithfulness independently of retrieval recall.

24. A RAG system returns confidential content to an unauthorized employee; how would you enforce retrieval permissions?

**Deep explanation:** Authorization must filter candidates before content reaches the model, because prompting cannot reliably hide exposed context. Propagate authenticated identity and groups to retrieval, apply document- or chunk-level ACL filters with deny-by-default semantics, isolate indexes where needed, and recheck authorization before returning citations.

**Interview answer:** I would enforce ACLs inside retrieval before any chunk enters the prompt, with tenant isolation and deny-by-default filters. I would also audit access and test permission changes and cache behavior.

25. A canary shows more errors only for one customer segment; how would you decide whether to continue?

**Deep explanation:** Aggregate health can hide severe cohort harm. Verify statistical and practical significance, identify what distinguishes the segment, compare canary and control within that cohort, and use predefined guardrails; pause or roll back if the segment is important or the failure is severe, even if global metrics pass.

**Interview answer:** I would treat segment-level error rate as a release guardrail, validate it against a matched control, and pause the rollout while investigating. Global averages do not justify harming a specific cohort.

26. A dependency upgrade breaks only production builds; how would you identify the compatibility issue?

**Deep explanation:** Reproduce the production build in the same container with the locked dependency graph, runtime, OS, architecture, environment flags, and minification/tree-shaking settings. Diff lockfiles and artifacts, inspect peer dependencies and conditional exports, then bisect the upgrade or build options to find the minimal incompatibility.

**Interview answer:** I would make the production build reproducible locally or in CI, compare its exact toolchain and lockfile, and bisect the dependency and build configuration. Production-only optimization and environment differences are prime suspects.

27. A report changes when rerun for the same historical period; how would you inspect late data and time semantics?

**Deep explanation:** Determine whether the report uses event time, ingestion time, or mutable current state, and verify timezone and interval boundaries. Quantify late-arriving records, corrections, deduplication, and dimension changes; reproducible reports need a data snapshot or an explicit as-of watermark and versioned logic.

**Interview answer:** I would compare the two input snapshots and audit event time, ingestion time, timezones, late arrivals, and corrected records. If reproducibility is required, I would run against versioned data and an explicit as-of time.

28. A search feature returns irrelevant results for common terms; how would you evaluate indexing and ranking?

**Deep explanation:** Build a labeled query set and measure metrics such as precision@k, recall, and NDCG by query class. Inspect analysis chains, stop words, stemming, synonyms, field boosts, term frequency, and popularity/freshness signals; compare lexical, semantic, and hybrid ranking with offline evaluation and controlled experiments.

**Interview answer:** I would start with judged queries and ranking metrics, then inspect tokenization and scoring explanations for common terms. I would tune analyzers and signals and validate the change offline and with an A/B test.

29. A service's memory rises after every request burst and never returns; how would you distinguish leaks from retained capacity?

**Deep explanation:** Resident memory may stay high because the allocator or runtime retains freed pages. Track heap live bytes after forced or full GC, object counts and dominator paths, off-heap/native allocations, RSS, and workload plateaus across repeated bursts; a leak shows growing reachable state, while retained capacity tends to stabilize and be reusable.

**Interview answer:** I would compare post-GC live heap with RSS across repeated identical bursts and inspect heap profiles. Growing reachable objects indicate a leak; stable live heap with high RSS suggests allocator or runtime retention.

30. A retry policy improves one endpoint but worsens overall availability; how would you measure amplification?

**Deep explanation:** Retries multiply offered load and can extend outages when dependencies are saturated. Measure attempts per original request, retry concurrency, downstream QPS, queue depth, timeout budget, and success gained by retry; distinguish client, service, proxy, and SDK retry layers, then use bounded exponential backoff, jitter, budgets, and circuit breaking.

**Interview answer:** I would measure retry amplification as total attempts per logical request and correlate it with downstream saturation. I would consolidate retry layers and enforce retry budgets, jittered backoff, and deadlines.

31. A database migration fails halfway through deployment; how would you recover without assuming rollback is harmless?

**Deep explanation:** First inspect the actual schema and data state and stop incompatible application rollout. Many DDL or data changes are irreversible or partially committed, so choose a tested roll-forward repair or a safe restore based on evidence; use expand-contract migrations, checkpoints, backups, and idempotent steps to reduce future risk.

**Interview answer:** I would freeze the rollout, determine exactly which migration steps committed, and verify application compatibility. I would prefer a tested roll-forward fix unless a validated restore plan proves rollback safe.

32. A user edits the same document on two offline devices; how would you reconcile changes?

**Deep explanation:** Preserve both operation histories and a common base or version vector. Merge independent edits automatically with an OT or CRDT model, but surface semantic conflicts—such as competing replacements of the same field—for user resolution; synchronization must be idempotent and deterministic.

**Interview answer:** I would sync versioned operations, merge non-overlapping changes deterministically with OT or a CRDT, and ask the user to resolve true semantic conflicts. I would never silently discard one device's edits.

33. A public API must support ten times tomorrow's traffic; how would you prioritize changes under time pressure?

**Deep explanation:** Load-test the critical path with a realistic traffic shape to identify the first saturation point. Apply low-risk capacity and protection measures first: scale known bottlenecks, cache hot reads, precompute, raise verified quotas, bound concurrency, shed optional work, and establish dashboards, rollback triggers, and provider coordination.

**Interview answer:** I would load-test immediately, scale the measured bottleneck, cache or disable expensive optional work, and protect dependencies with limits and shedding. I would define live guardrails and a rollback or traffic-control plan before the event.

34. A frontend token refresh causes dozens of simultaneous refresh requests; how would you coordinate them?

**Deep explanation:** Use a single-flight refresh promise: the first failing request starts refresh and others await the same promise, then retry once. Coordinate across tabs with a shared worker or `BroadcastChannel`, rotate tokens safely, prevent infinite retry loops, and log out cleanly if refresh fails.

**Interview answer:** I would ensure only one refresh is in flight and queue other requests behind it, including cross-tab coordination when needed. After success they retry once; after failure they all transition to logged out.

35. A metrics bill suddenly doubles without more users; how would you inspect cardinality and collection changes?

**Deep explanation:** Break cost down by metric name, label cardinality, sample volume, retention, and source version. Compare recent deployments and collector configuration, find unbounded labels such as user IDs or URLs, duplicate scraping, changed intervals, and new histograms; drop or aggregate high-cardinality dimensions and enforce budgets.

**Interview answer:** I would attribute the increase by metric and label, then compare deploys and collector settings for new series, duplicate collection, or shorter intervals. I would remove unbounded labels and add cardinality and cost alerts.
