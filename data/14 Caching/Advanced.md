1. How would you guarantee read-your-writes when several cache layers are involved?

**Deep explanation:** Return a monotonic commit version with each write and carry it in the user's session. A later read accepts an L1, distributed-cache, or CDN entry only if its version meets that minimum; otherwise it bypasses the stale layers and reads the authority. Invalidation improves the common path, while the version check provides the guarantee.

**Interview answer:** I would return a commit version with the write and require later reads to accept only cache entries at or above it. Otherwise they bypass or refresh from the source of truth, so delayed invalidation cannot violate read-your-writes.

2. How would you prevent stale data from being reinserted after invalidation?

**Deep explanation:** A slow fill can read old data, lose a race with an update and invalidation, then repopulate the old value. Store a version or generation and publish fills with an atomic compare-and-set only if their source version is still current. Versioned tombstones or leases can serve the same purpose; a plain delete cannot.

**Interview answer:** I would advance a per-record version during invalidation and conditionally publish fills only when their version is still current. That prevents an older in-flight fill from resurrecting stale data.

3. How would you use versioned values to resolve concurrent cache fills?

**Deep explanation:** Store `{version, value}` and atomically replace it only when the candidate version is newer. Multiple workers may compute simultaneously, but completion order no longer determines the winner. Versions should come from an authoritative sequence or log position, not local clocks that can skew.

**Interview answer:** Each fill carries the source record's monotonic version. A transaction or script stores it only if that version exceeds the cached one, so a late older fill cannot overwrite newer data.

4. How would you design cache invalidation driven by change-data-capture events?

**Deep explanation:** Send committed database changes to a durable stream partitioned by entity ID to preserve per-record order. Consumers perform idempotent, version-aware invalidation and checkpoint only after success. Include operation, key, schema, and record version; monitor lag, retain events for replay, and support rebuilding after gaps. TTLs remain a useful safety net.

**Interview answer:** I would consume a durable CDC stream partitioned by entity, apply idempotent version-aware invalidations, and checkpoint after success. I would monitor lag, support replay and rebuilds, and keep bounded TTLs for defense in depth.

5. How would you recover when invalidation messages are delayed or lost?

**Deep explanation:** Use durable delivery, retry, replay, sequence-gap detection, finite TTLs, and versioned values. On a gap, bypass or flush the affected namespace and reconcile it from the database. Periodic anti-entropy checks can compare source and cache versions, making the message bus helpful but not the sole correctness mechanism.

**Interview answer:** I would detect lag and sequence gaps in a replayable stream, bound staleness with TTLs and versions, and bypass affected entries during recovery. Then I would replay or reconcile from the source of truth.

6. How would you assess whether a Redis lock provides the guarantees your workflow needs?

**Deep explanation:** First identify whether the workflow needs duplicate suppression, mutual exclusion, or protection from stale owners. `SET key token NX PX` plus token-checked release is useful, but pauses, lease expiry, asynchronous replication, and failover can create overlapping owners. Irreversible work needs idempotency, an authoritative constraint, or fencing tokens, verified with fault tests.

**Interview answer:** I would compare the required safety property with Redis's failure model. A lease may be enough for duplicate work, but if a stale owner could corrupt data, I require fencing tokens or enforcement in the authoritative store.

7. How would fencing tokens change the safety of a cache-backed lock?

**Deep explanation:** Each acquisition gets a strictly increasing token. The protected resource remembers the largest accepted token and atomically rejects smaller ones, so an expired holder that resumes cannot mutate state after a newer owner. Generating tokens alone is insufficient; the downstream resource must enforce their ordering.

**Interview answer:** Fencing gives every owner a higher sequence number, and the resource rejects stale numbers. That blocks a paused old owner even if the cache lock temporarily allows overlapping holders.

8. How would you handle Redis failover during an atomic rate-limit update?

**Deep explanation:** A script is atomic on one primary, but asynchronous replication means an acknowledged counter update may disappear during promotion. Decide how much over-admission is tolerable, make retries idempotent, and use conservative limits; `WAIT` reduces but does not eliminate risk. Strict quotas require a consensus-backed authority or failing closed during uncertainty.

**Interview answer:** I would budget explicitly for update loss during failover, use an atomic script and idempotent request IDs, and optionally use `WAIT`. If exceeding the quota is unacceptable, I would use a strongly consistent authority or fail closed.

9. How would you distribute a global quota across regions with bounded error?

**Deep explanation:** A strongly consistent global allocator can lease token batches to regional counters. Regions admit locally only from their lease, so error is bounded by outstanding leases. Smaller batches improve precision but increase global coordination; expiration, returns, and demand-based rebalancing prevent stranded quota.

**Interview answer:** I would lease bounded quota chunks from a global authority to each region. Regions spend locally, and maximum error equals the outstanding leases; batch size trades precision for coordination cost.

10. How would you choose hash tags for Redis Cluster without creating hot slots?

**Deep explanation:** Colocate only keys that require multi-key atomicity, using the narrowest transaction scope, such as `{accountId}` rather than a huge `{tenant}`. Model traffic and bytes per tag because one popular tag maps to one slot. Shard hot logical groups when atomicity is unnecessary and monitor per-slot load.

**Interview answer:** I would tag by the smallest transactional unit and estimate both request rate and memory per tag. Broad or celebrity tags create hot slots, so I shard them unless their keys truly need atomic colocation.

11. How would you redesign an operation that requires multiple keys across cluster slots?

**Deep explanation:** If the keys form one bounded aggregate, give them a shared hash tag or store them as one value. Otherwise replace cross-slot atomicity with an idempotent saga and compensating actions, or move critical invariants to a transactional database. The tradeoff is contention and aggregate size versus workflow complexity.

**Interview answer:** I would colocate a small true aggregate, but redesign unrelated cross-slot work as an idempotent saga. Business-critical invariants belong in an authoritative transactional system.

12. How would you reshard a busy cache cluster without overwhelming clients?

**Deep explanation:** Add headroom and move slots in throttled batches while watching latency, CPU, network, replication lag, redirects, and connections. Clients must handle `MOVED` and `ASK`, refresh topology, and retry with jitter. Run off-peak and automatically pause when health thresholds are crossed.

**Interview answer:** I would migrate small slot batches with extra capacity and health-based throttling. I would verify redirect handling and topology refresh, use jittered retries, and pause automatically if latency or resource use degrades.

13. How would you diagnose latency from huge keys, blocking commands, or persistence activity?

**Deep explanation:** Correlate slow log and latency-monitor events with command statistics, sampled key sizes, CPU, fork duration, disk I/O, and replication. Use `SCAN`, `MEMORY USAGE`, or `--bigkeys`, not production-wide `KEYS`. Large values increase serialization and deletion time; blocking commands occupy the event loop; RDB/AOF work adds fork, copy-on-write, or fsync stalls.

**Interview answer:** I would correlate latency events with slow commands, key sizes, CPU, fork time, and disk I/O. Then I would determine whether spikes align with large-value operations, blocking commands, AOF fsync, or RDB activity.

14. How would you reclaim millions of expired keys without a latency spike?

**Deep explanation:** Prevent synchronized expiry with TTL jitter. For an existing backlog, let active expiry work gradually, tune its effort cautiously, and use throttled `SCAN` plus `UNLINK` where needed. Never issue a massive synchronous delete; monitor CPU, memory, and tail latency throughout.

**Interview answer:** I would jitter TTLs to prevent recurrence, then reclaim incrementally with active expiry and throttled `SCAN`/`UNLINK`. I would tune against latency and CPU rather than deleting everything at once.

15. How would you protect critical cache entries from noisy tenants?

**Deep explanation:** Put truly critical data in a separate memory and eviction domain. Shared tiers need per-tenant request, key, byte, and TTL limits, hot-key detection, and rate limiting. Admission policies can keep one-off scans from evicting frequently reused entries.

**Interview answer:** I would isolate critical entries where possible. In shared caches I would enforce per-tenant memory and request quotas, cap TTLs, detect hot keys, and use admission control to protect the working set.

16. How would you compare TTL caching with dependency-aware invalidation?

**Deep explanation:** TTLs are simple and resilient but trade freshness against hit rate and can cause stampedes. Dependency-aware invalidation is faster and permits longer lifetimes, but depends on a complete graph, reliable ordered events, and replay. A common design combines event invalidation with jittered TTLs and version checks.

**Interview answer:** TTL gives simple bounded staleness; dependency invalidation gives better freshness but more failure modes. I normally use events for speed, jittered TTLs as a backstop, and versions when correctness matters.

17. How would you estimate whether a cache saves more resources than it consumes?

**Deep explanation:** Measure hit ratio by workload and compare avoided origin CPU, I/O, queries, bandwidth, and latency with cache lookup, fill, memory, replication, network, and operational costs. Include miss amplification and tail latency. The break-even principle is that hits times avoided cost must exceed lookup, fill, and infrastructure cost.

**Interview answer:** I would calculate avoided origin cost per hit and subtract lookup, fill, memory, replication, network, and operational costs using measured workload-specific hit rates. I would validate the model with load tests and tail-latency data.

18. How would you model hit ratio under a skewed popularity distribution?

**Deep explanation:** A Zipf-like rank distribution provides a first approximation: capacity hits roughly the popularity mass of objects it holds. Real object sizes, TTLs, churn, bursts, and eviction policy change that result, so replay time-sliced production traces across candidate cache sizes for a reliable curve.

**Interview answer:** I would estimate coverage from the ranked popularity distribution, often Zipf-like, then replay real traces using actual sizes, TTLs, and eviction policy. Trace replay captures temporal locality and churn that a static formula misses.

19. How would you test cache correctness under concurrent writes and process crashes?

**Deep explanation:** Define invariants, then build deterministic races around source read, commit, invalidation, fill, and cache publication. Inject pauses, crashes, partitions, failovers, and duplicate, lost, or reordered events. Record histories and check them against the consistency model with property-based or linearizability tests where appropriate.

**Interview answer:** I would specify invariants, generate concurrent histories, and crash processes at every boundary between commit, invalidation, fill, and publication. I would also inject event faults and failovers, then verify the history against the intended consistency model.

20. How would you design a cache that can be bypassed safely during incidents?

**Deep explanation:** Keep an explicit source-of-truth path that does not depend on cache-only state. Provide scoped bypass switches by operation, tenant, or percentage, plus concurrency limits, circuit breakers, and origin load shedding. Exercise the path regularly and warm the cache gradually after recovery.

**Interview answer:** I would make the authoritative path cache-independent and add a scoped kill switch. Since bypass increases origin load, I would combine it with rate limits and load shedding, test it routinely, and restore caching gradually.

21. How would you avoid cache poisoning through untrusted headers or query parameters?

**Deep explanation:** Build keys only from allowlisted, canonicalized inputs that truly vary the response. Reject ambiguous encodings, duplicate parameters, and conflicting routing headers; sanitize host and forwarding headers at a trusted proxy. Separate authenticated variants and align CDN and origin normalization.

**Interview answer:** I would use an allowlisted canonical key, sanitize routing headers at the edge, reject ambiguous requests, and isolate personalized responses. The CDN and origin must interpret every key-varying input identically.

22. How would you investigate discrepancies between CDN cache keys and origin interpretation?

**Deep explanation:** Capture the raw request, the CDN's effective key and cache status, and the forwarded origin request. Compare host, path normalization, percent encoding, slash handling, query ordering and duplicates, headers, cookies, and negotiation. Reproduce two requests that collide at one layer but differ at the other, then unify canonicalization.

**Interview answer:** I would trace a request end to end and compare the CDN's effective key with what the origin sees and varies on. I would reproduce a collision pair, fix normalization, and add edge-to-origin regression tests.

23. How would you invalidate content globally while preserving availability?

**Deep explanation:** Publish idempotent versioned purges through a durable global control plane. Switching a namespace or manifest makes new traffic stop referencing old objects immediately while physical purging proceeds asynchronously. Urgent removals also need a globally distributed deny marker, plus acknowledgment tracking and retry for lagging regions.

**Interview answer:** I would switch to a new content namespace or manifest immediately and purge old objects asynchronously through a retryable global channel. For urgent takedowns, a distributed deny marker prevents serving during propagation.

24. How would you choose cache placement for users in several regions?

**Deep explanation:** Edge placement reduces user latency; placement near the authority reduces consistency and refill costs. Choose using traffic locality, reuse, object size, write rate, residency rules, and acceptable staleness. Read-mostly data suits regional caches, while frequently written strong-consistency data often stays near its home region.

**Interview answer:** I would segment by read locality, write frequency, freshness, object size, and residency. Read-mostly global data goes near users; strongly consistent, write-heavy data is cached near its authoritative region, possibly behind a two-tier cache.

25. How would you preserve privacy when cached records must be deleted quickly?

**Deep explanation:** Minimize sensitive caching, use short TTLs and encryption, and maintain deterministic key indexes or versioned subject namespaces. Revoke access immediately with a tombstone, namespace change, or encryption-key destruction, then purge all cache tiers with acknowledgments and audit evidence. Include replicas and derived data in the policy.

**Interview answer:** I would minimize and short-TTL sensitive entries, inventory every derived key, and revoke access immediately with a tombstone, version change, or key destruction. Then I would purge all tiers and retain verified audit evidence.

26. How would you migrate serialization formats while old and new cache clients coexist?

**Deep explanation:** Wrap each value in an explicit format version. Deploy readers that understand old and new before switching writers; use separate versioned keys, dual writes, or lazy conversion if needed. Monitor old-format reads and remove compatibility only after old clients and entries have expired, retaining rollback capability.

**Interview answer:** I would deploy versioned, backward-compatible readers first, then switch writers and optionally dual-write or lazily migrate. I remove old support only after metrics show old clients and cached values are gone.

27. How would you design probabilistic early expiration for expensive values?

**Deep explanation:** During a window before hard expiry, make refresh probability increase as expiry approaches and with recomputation cost. A randomized threshold spreads work instead of synchronizing it. Combine it with per-key single-flight, stale-while-revalidate, and a hard maximum age.

**Interview answer:** I would probabilistically refresh before hard expiry, with higher probability near expiry and for expensive values. Single-flight prevents duplicate work, stale-while-revalidate protects latency, and a hard max age preserves freshness.

28. How would you prevent single-flight request coalescing from becoming a bottleneck?

**Deep explanation:** Coordinate per exact key in a sharded structure, never under one global lock. Bound waiters and deadlines; if the leader stalls, serve stale data, allow controlled origin access, or launch a hedge. Shared work should survive one caller's cancellation, and entries must be cleaned reliably.

**Interview answer:** I would use sharded per-key coordination with bounded waiters and timeouts. Slow leaders trigger stale fallback or a controlled hedge, caller cancellation does not cancel shared work, and no global coordinator handles every key.

29. How would you compare materialized views, application caches, and read replicas?

**Deep explanation:** Materialized views durably precompute joins or aggregates but add refresh lag and write amplification. Application caches are flexible and fast but disposable and hard to invalidate. Read replicas retain general query capability but have replication lag and still pay query computation. They can be layered rather than treated as exclusive choices.

**Interview answer:** I use materialized views for durable precomputation, application caches for reusable low-latency values, and replicas for scaling general reads. I compare freshness, flexibility, failure behavior, write amplification, and cost.

30. How would you prove that losing the entire cache does not violate business correctness?

**Deep explanation:** Map every business invariant to enforcement in an authoritative system through transactions, constraints, idempotency records, or durable state. Then kill or bypass the cache under realistic concurrency and validate outcomes against that model. Origin load protection is separate: loss may hurt latency or availability but must not corrupt state.

**Interview answer:** I would prove every invariant is enforced outside the cache, then run cache-loss fault tests under concurrent workflows and verify source-of-truth outcomes. Load shedding ensures the origin survives, but correctness never relies on cached state.

31. How would you limit the runtime of Redis scripts that block other commands?

**Deep explanation:** Keep scripts bounded by a small known number of keys and reject user-controlled collection sizes. Never scan or loop without a strict bound; split large jobs into resumable client-driven batches. Measure worst-case runtime and alert before the configured time limit, since interrupting a write script safely is constrained.

**Interview answer:** I would enforce small bounded inputs and constant or known-small work per script. Large operations become resumable batches, and I would load-test and monitor worst-case execution time.

32. How would you handle a script or function that is unavailable after failover or deployment?

**Deep explanation:** `EVALSHA` can return `NOSCRIPT` on a new primary, so clients should load or evaluate the known source and retry safely. For Functions, verify the versioned library exists on all relevant nodes before shifting traffic. Make operations idempotent because a timeout may leave execution outcome uncertain.

**Interview answer:** On `NOSCRIPT`, I load or evaluate the trusted script and retry idempotently. For functions, deployment verifies the correct library across nodes, and request IDs handle ambiguous timeouts without duplicate effects.

33. How would you account for replication and persistence buffers in Redis memory planning?

**Deep explanation:** Budget beyond the dataset for allocator fragmentation, replication backlog, replica and client output buffers, AOF rewrite buffers, temporary command memory, and copy-on-write pages during forks. Measure peak RSS under realistic write rates and keep `maxmemory` sufficiently below host memory to prevent swapping or OOM.

**Interview answer:** I would size for dataset plus fragmentation, client and replica buffers, backlog, AOF buffers, and copy-on-write peaks. Production-like fork tests determine the headroom needed to avoid swap and OOM.

34. How would you prevent cache-key collisions when serializing composite user inputs?

**Deep explanation:** Canonicalize typed components and encode them unambiguously with length prefixes or a structured format, not delimiter concatenation. Define normalization for Unicode, case, URLs, nulls, and optional fields, and include namespace and schema version. If hashing, use a strong digest.

**Interview answer:** I would canonicalize each typed field, encode the tuple with an unambiguous length-prefixed or structured format, and add namespace and schema version. If shortened, it uses a cryptographic digest rather than a weak hash.

35. How would you evaluate client-side caching with invalidation tracking under reconnects?

**Deep explanation:** A disconnect can lose invalidations, so a reconnect must clear local entries or validate a server epoch before trusting them, then re-register tracking. Test failover, pooling, replica reads, redirections, prefix broadcasts, and tracking limits. Compare latency and server savings with per-client memory, invalidation fan-out, and stale-read risk.

**Interview answer:** I would treat reconnect as an invalidation gap and clear the local cache or change epochs before re-enabling tracking. I would fault-test failover and pooling, then compare the savings with fan-out, memory cost, and stale-read risk.
