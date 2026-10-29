1. How would you design a backend that enforces a tenant's resource budget across many services?

**Deep explanation:** Keep policy centrally but enforce it with locally leased, cost-weighted tokens. Short leases bound overspend during partitions; workload partitions reserve capacity for critical work, while usage events reconcile drift.

**Interview answer:** I would centrally configure cost-weighted budgets and distribute short-lived token leases to services. That gives fast local enforcement, bounded overspend, workload isolation, and auditable reconciliation.

2. How would you prevent authorization decisions from using stale cached permissions?

**Deep explanation:** Version permission state and include that version in tokens and cache keys. Push invalidations for speed, use short TTLs as backup, and require an authoritative version check for high-risk actions; fail closed when freshness is unknown.

**Interview answer:** I would version authorization state, invalidate caches on changes, and recheck the current version for sensitive operations. A missed invalidation can then cause delay, but never stale access.

3. How would you migrate a public API while multiple client versions remain active?

**Deep explanation:** Expand before contracting: add compatible fields and adapt supported versions to one domain model. Contract-test each version, measure client usage, publish deprecation milestones, and remove the old version only after migration criteria are met.

**Interview answer:** I would make additive changes first, version true breaking changes, and support old and new contracts through adapters. Usage telemetry and contract tests determine when retirement is safe.

4. How would you handle partial success in a bulk-write API?

**Deep explanation:** State whether the batch is atomic or best-effort. For best-effort processing, give items stable client IDs and return per-item status, error, and resource version. Idempotency keys let clients retry only failed or unknown items.

**Interview answer:** I would make atomicity explicit and return structured per-item results correlated by client ID. Each item is idempotent, so successful writes are not duplicated during retries.

5. How would you design an asynchronous API with polling, callbacks, and cancellation?

**Deep explanation:** Return `202` with a durable operation resource containing state, progress, result, and errors. Polling uses `Retry-After`; signed webhooks are retryable and replayable. Cancellation is idempotent and follows a documented state machine.

**Interview answer:** I would model work as a durable operation resource. Clients can poll it, receive signed callbacks, or request cancellation, with explicit states defining races and terminal outcomes.

6. How would you make cancellation semantics clear after irreversible work has started?

**Deep explanation:** Distinguish “requested” from “cancelled” and define a point of no return. Before it, stop and compensate; afterward return `too_late` or start a separate reversal workflow. Never imply that accepting a cancel request guarantees rollback.

**Interview answer:** I would document the commit point and return `cancelled`, `cancelling`, or `too_late`. After irreversible work, reversal is a separate operation rather than fictional cancellation.

7. How would you coordinate a database write and event publication without losing events?

**Deep explanation:** Persist the business change and an outbox row in one database transaction. A relay publishes committed rows. Because it may crash after publishing but before marking completion, delivery is at least once and consumers deduplicate by event ID.

**Interview answer:** I would use a transactional outbox, then relay events asynchronously. Stable event IDs and idempotent consumers safely handle inevitable duplicate publication.

8. How would you implement an outbox relay that can safely publish duplicates?

**Deep explanation:** Claim rows with leases or `SKIP LOCKED`, publish immutable events with unique IDs, then record completion. Consumers atomically store those IDs with their side effects. Backoff and quarantine prevent poison events from blocking progress.

**Interview answer:** I would assume duplicates are inevitable: safely claim and retry outbox rows, assign stable event IDs, and require transactional deduplication or naturally idempotent consumers.

9. How would you define an inbox deduplication window and cleanup policy?

**Deep explanation:** Retain IDs longer than the maximum producer retry, broker retention, replay horizon, and clock-skew margin. Time-partition records for cleanup. If valid replays are unbounded, use permanent business-level idempotency rather than a finite inbox window.

**Interview answer:** The dedupe window must exceed every valid redelivery horizon plus margin. I would atomically store IDs with effects and use durable business idempotency when replays can occur indefinitely.

10. How would you design compensating actions for a failed order workflow?

**Deep explanation:** Model a durable saga: reserve/release inventory, authorize/void payment, and create/cancel shipment. Persist each transition and make compensations idempotent. Irreversible reality needs remedies such as refunds or returns, not database rollback.

**Interview answer:** I would use a persisted saga with an idempotent compensation for each reversible step. Irreversible steps trigger explicit business remedies, and failed compensations retry safely.

11. How would you prevent a retry storm from amplifying a dependency outage?

**Deep explanation:** Retry only transient failures with deadlines, capped attempts, exponential backoff, and full jitter. Retry budgets, circuit breakers, adaptive concurrency, and load shedding prevent retries from consuming recovery capacity.

**Interview answer:** I would combine deadline-aware jittered retries with retry budgets, circuit breakers, and concurrency limits. During an outage, we shed or queue work instead of multiplying traffic.

12. How would you apply admission control before expensive work begins?

**Deep explanation:** Estimate cost from request shape, tenant, and current saturation before allocating scarce resources. Enforce bounded queues and class-specific concurrency, rejecting early with `Retry-After`; calibrate estimates against measured resource use.

**Interview answer:** I would estimate cost at ingress, reserve capacity by traffic class, and reject overload before expensive allocation. Bounded queues and adaptive concurrency keep latency predictable.

13. How would you protect critical endpoints from noisy background workloads?

**Deep explanation:** Separate queues, workers, connection pools, and limits for interactive and background classes. Reserve capacity for critical endpoints, throttle background work under saturation, and enforce per-tenant fairness.

**Interview answer:** I would isolate workload classes, reserve critical capacity, and make background concurrency yield under pressure. Per-tenant limits prevent noisy neighbors within each class.

14. How would you design a backend for both interactive and batch clients?

**Deep explanation:** Share domain rules but offer synchronous APIs for small requests and asynchronous, checkpointed bulk jobs for batches. Separate scheduling and quotas protect latency, while common validation and idempotency keep semantics consistent.

**Interview answer:** I would use one domain model with synchronous interactive endpoints and asynchronous resumable batch jobs. Separate resource pools protect users without producing different business results.

15. How would you keep long-running exports consistent while source data changes?

**Deep explanation:** Pin the export to a snapshot or high-water mark and paginate by immutable keys. Because long snapshots retain database versions, very large exports may stage data or read from a point-in-time replica or CDC snapshot.

**Interview answer:** I would bind the export to a clear snapshot and use keyset pagination. For very long jobs, I would stage the data or export from a point-in-time replica.

16. How would you handle GDPR-style deletion across caches, queues, logs, and backups?

**Deep explanation:** Drive deletion from a data inventory: erase primary and derived records, invalidate caches, tombstone queued data, and prevent recreation. Minimize logs; expire backups and reapply tombstones after restore. Keep non-personal audit evidence and honor legal holds.

**Interview answer:** I would orchestrate deletion across every mapped store and derivative. Backups age out and reapply deletions on restore, while the workflow records completion without retaining the erased personal data.

17. How would you perform zero-downtime schema and API changes together?

**Deep explanation:** Use expand-migrate-contract: add compatible schema, deploy dual-reading/writing code, backfill, verify, switch reads, retire old clients, then remove old fields. Flags and metrics make each stage observable and reversible.

**Interview answer:** I would expand first, run mixed versions safely, backfill and verify, then contract only after old code and clients are gone. No deployment requires an atomic fleet-wide switch.

18. How would you recover from a deployment that writes a new incompatible data format?

**Deep explanation:** Stop writes, identify affected records, and avoid rolling back to code that cannot read them. Deploy a compatible reader or idempotent repair, validate invariants, and retain evidence. Versioned envelopes and mixed-version tests prevent recurrence.

**Interview answer:** I would halt further writes, scope damage, and use forward-compatible code or an idempotent repair instead of a blind rollback. Then I would reconcile invariants and introduce explicit format versioning.

19. How would you detect and prevent mass-assignment vulnerabilities?

**Deep explanation:** Never bind request bodies directly to persistence models. Use operation-specific DTOs with allowlisted fields, validate ownership, and set privileged properties from trusted server context. Tests should probe fields such as `role`, `tenantId`, and `price`.

**Interview answer:** I would explicitly map allowlisted request fields into domain commands. Server-controlled properties are never client-settable, and security tests verify privileged fields are rejected.

20. How would you enforce policy across REST, GraphQL, and internal RPC paths?

**Deep explanation:** Put authorization at a transport-independent use-case boundary. Each transport authenticates callers and passes the same verified principal and resource context to one policy layer. Cross-transport integration tests catch bypasses.

**Interview answer:** I would centralize policy in the application/domain layer, not controllers or resolvers. Every transport invokes the same checks, with parity tests proving none can bypass them.

21. How would you prevent server-side request forgery in URL-import features?

**Deep explanation:** Use a restricted egress proxy, strict scheme/port allowlists, and block private, loopback, link-local, metadata, and reserved IPv4/IPv6 ranges. Revalidate DNS and every redirect to resist rebinding; cap time and bytes and send no ambient credentials.

**Interview answer:** I would strictly validate URLs and route imports through restricted egress. Every resolved destination and redirect is checked, internal ranges are blocked, and response size, time, protocols, and credentials are constrained.

22. How would you implement a trustworthy audit trail for privileged actions?

**Deep explanation:** Record actor, effective identity, action, target, reason, request ID, timestamp, and outcome in append-only restricted storage. Integrity protection, independent retention, clock monitoring, and gap alerts prevent silent tampering; secrets never enter the trail.

**Interview answer:** I would emit structured audit events for every privileged attempt into immutable, separately controlled storage. Integrity checks and gap monitoring make omissions and tampering detectable.

23. How would you design reconciliation for external financial operations?

**Deep explanation:** Persist an immutable internal intent before calling the provider. Combine webhooks with periodic settlement reports and match references, amount, currency, and state. Differences become explicit retry or review cases; corrections are ledger entries, never overwrites.

**Interview answer:** I would reconcile our immutable payment intents independently against provider settlement data. Missing, duplicate, and mismatched operations enter a state machine, and adjustments remain auditable.

24. How would you prevent duplicate side effects after a worker lease expires?

**Deep explanation:** Leases cannot stop a stale worker that resumes later. Give each lease a monotonically increasing fencing token and make downstream storage reject older tokens. External calls also need idempotency keys; without downstream support, exactly-once effects are impossible.

**Interview answer:** I would pair leases with fencing tokens and downstream idempotency keys. A stale holder's token is rejected, which closes the race that leases alone cannot solve.

25. How would you measure and improve p99 latency under mixed workloads?

**Deep explanation:** Record end-to-end histograms by endpoint, workload, tenant, payload, and region, with traces linking queue time, dependencies, retries, GC, and database waits. Reproduce the real mix, then isolate classes, bound concurrency, and fix the measured bottleneck.

**Interview answer:** I would segment true latency histograms and trace p99 requests to queueing and dependency spans. Improvements must be validated under the production workload mix, not an average synthetic request.

26. How would you separate connection saturation from CPU and database bottlenecks?

**Deep explanation:** Correlate pool utilization and acquisition time with app CPU/run queue and database query, lock, CPU, and I/O metrics. Controlled tests varying concurrency and pool size show whether connections are causal or only a symptom.

**Interview answer:** I would compare pool wait against application and database saturation signals, then vary concurrency under load. Increasing a pool helps only when the downstream database has spare capacity.

27. How would you design regional failover for stateful backend sessions?

**Deep explanation:** Prefer stateless signed sessions or replicate minimal state to a multi-region store. Define RPO/RTO and use ownership, quorum, or fencing to avoid split-brain mutation. Health-aware routing and regular drills must include dependencies, secrets, and capacity.

**Interview answer:** I would minimize session state, replicate the remainder, and pair failover routing with fencing or home-region ownership. Regular drills verify the secondary can actually carry production load.

28. How would you maintain compatibility between independently deployed producers and consumers?

**Deep explanation:** Enforce schema compatibility in CI and a registry. Make changes additive, supply defaults, and require consumers to tolerate unknown fields. Semantic breaks get a new event version with dual publishing/consumption during migration.

**Interview answer:** I would use compatible schema evolution and mixed-version contract tests. Breaking meaning changes create a new version that coexists until all producers and consumers migrate.

29. How would you build a safe feature rollout for a new billing calculation?

**Deep explanation:** Make calculations versioned and reproducible, shadow-run the new version, and compare results by cohort. Canary behind tenant flags with financial guardrails and instant rollback. Persist calculation version and inputs on every invoice.

**Interview answer:** I would shadow and diff the new calculation before charging, then canary by tenant with hard revenue guardrails. Every result records its version and inputs for explanation and rollback.

30. How would you decide when a backend module should become a separate service?

**Deep explanation:** Extract for a clear domain, ownership, scaling, release, fault, or compliance boundary—not size alone. First enforce an in-process module boundary; split only when benefits exceed network, consistency, deployment, observability, and on-call costs.

**Interview answer:** I would prefer a modular monolith until a measured independent domain or operational need justifies distribution. Service boundaries must repay their latency, failure, data, and ownership overhead.

31. How would you design a service contract that exposes business failure without leaking infrastructure details?

**Deep explanation:** Publish stable domain error codes, safe messages, retryability, and field details. Translate SQL, broker, and vendor failures internally to domain outcomes or generic unavailability. Correlation IDs connect clients to private diagnostics.

**Interview answer:** I would expose documented business errors and retry semantics, never stack traces or vendor details. A correlation ID preserves supportability without leaking infrastructure.

32. How would you prevent background jobs from running under expired user authorization?

**Deep explanation:** Persist initiating identity, intended action, resource, and authorization version, then reauthorize at execution. Work that must outlive user access needs an explicit least-privilege service capability, with the authority transition audited.

**Interview answer:** I would reauthorize user-delegated jobs when they run, not trust an old token. Durable system obligations use a narrow service identity rather than expired user authority.

33. How would you design a secure administrative impersonation feature?

**Deep explanation:** Require reauthentication, reason/ticket, narrow scope, and short expiry; sensitive cases may need dual approval. Carry real actor and effective user separately in every request and audit record, and never let impersonation exceed the admin's own rights.

**Interview answer:** I would make impersonation short-lived, reason-bound, strongly authenticated, and scope-limited. Both identities remain visible and immutably audited throughout the session.

34. How would you handle leap days, time zones, and daylight-saving transitions in scheduled operations?

**Deep explanation:** Store UTC instants plus the original IANA zone and local recurrence intent. Define behavior for nonexistent and repeated times, month ends, leap days, and timezone-rule changes. Unique occurrence IDs prevent duplicate execution.

**Interview answer:** I would preserve both UTC execution time and the user's IANA-zone schedule. The contract explicitly defines DST gaps/overlaps and calendar edge cases, with idempotent occurrence IDs.

35. How would you prove that a production remediation cannot double-charge or lose customer work?

**Deep explanation:** Operate from an immutable affected-item manifest with per-item idempotency keys and durable states. Dry-run counts, canary batches, invariants, and independent ledger reconciliation account for every input. Rate limits, kill switch, and compensation bound impact.

**Interview answer:** I would use an immutable manifest, idempotent effects, and restartable checkpoints. Canaries and reconciliation prove each item is logically handled once without relying on the script running once.

36. How would you enforce API query-cost budgets instead of counting every request equally?

**Deep explanation:** Estimate cost from depth, fields, joins, cardinality, time range, and fan-out, then reserve tenant tokens before execution. Compare estimates with actual use to calibrate. Hard depth, result-size, deadline, and concurrency limits backstop imperfect estimates.

**Interview answer:** I would charge estimated computational cost rather than requests, reject over-budget queries before execution, and calibrate from actual use. Structural and concurrency caps remain safety rails.

37. How would you design keyset pagination when ordering depends on a changing computed score?

**Deep explanation:** Freeze a score version or snapshot for the pagination session. Encode `(score, unique_tiebreaker, version)` in an opaque cursor and compare lexicographically. If ranking cannot be frozen, materialize it or explicitly accept duplicates and omissions.

**Interview answer:** I would pin the ranking version and cursor on score plus a unique tie-breaker. Without a stable snapshot, no pagination method can promise a stable traversal.

38. How would you prevent authorization leaks through API error differences and response timing?

**Deep explanation:** Make forbidden and nonexistent sensitive resources externally identical in status, body, headers, cache behavior, and approximately timing. Keep real reasons in protected logs and rate-limit enumeration attempts.

**Interview answer:** I would normalize unauthorized and not-found responses across content, caching, and timing. Internal logs preserve diagnostics while rate limits reduce statistical probing.

39. How would you build a bulk-import API that reports per-record results and resumes safely?

**Deep explanation:** Create an asynchronous job over immutable input, give rows stable IDs, and process checkpointed chunks with idempotent writes. Persist per-row results and errors. Resuming may replay the last chunk safely; duplicate and cross-row semantics must be explicit.

**Interview answer:** I would use immutable input, stable row IDs, durable checkpoints, idempotent writes, and downloadable per-row results. A restarted worker can replay work without duplicating effects.

40. How would you define contractual behavior for requests accepted just before a user's access is revoked?

**Deep explanation:** Define the authorization linearization point: request start, commit, or continuous boundaries. Sensitive work should recheck a policy version before commit and later irreversible steps. Revocation cancels uncommitted work; already committed effects remain valid and auditable.

**Interview answer:** I would explicitly define when authorization becomes binding. For sensitive operations, I would revalidate at commit and irreversible boundaries, canceling uncommitted work after revocation while auditing completed effects.
