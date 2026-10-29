1. How would you choose a TTL based on freshness requirements?

**Deep explanation:** Start with the maximum staleness the business permits, then factor in change frequency, miss cost, and whether reliable invalidation exists. Short TTLs improve freshness but increase backend load; long TTLs improve hit rate but risk stale reads.

**Interview answer:** I derive TTL from allowed staleness, update frequency, miss cost, and invalidation reliability, then tune it using stale-read, hit-rate, and backend-load metrics.

2. How would you prevent many keys from expiring simultaneously?

**Deep explanation:** Add random jitter to a base TTL so expirations spread over time. Proactive refresh and stale-while-revalidate further protect hot keys.

**Interview answer:** I randomize TTLs and proactively refresh hot keys, allowing bounded stale serving while one worker refreshes.

3. How would you coalesce concurrent requests for one missing key?

**Deep explanation:** Use single-flight: the first requester acquires a per-key lease or shared promise, loads the value, and wakes waiters. Bound waiting and lease duration so failures cannot block indefinitely.

**Interview answer:** I permit one in-flight fill per key; concurrent callers await it with a timeout, turning many misses into one backend query.

4. How would you prevent cache penetration from repeated nonexistent IDs?

**Deep explanation:** Validate IDs, briefly cache negative results, and optionally use a Bloom filter to reject definitely absent keys. Short negative TTLs preserve visibility of newly created records; rate limits deter abuse.

**Interview answer:** I combine validation, short-lived negative caching, optional Bloom filters, and rate limiting.

5. How would you warm a cache after deployment?

**Deep explanation:** Preload only a measured hot set at a controlled rate, or gradually ramp traffic while filling asynchronously. Warming everything wastes memory and can overload the source.

**Interview answer:** I throttle warming of recently hot keys, ramp traffic gradually, and monitor database load and hit ratio.

6. How would you avoid overwhelming a database during cache recovery?

**Deep explanation:** Coalesce identical misses, limit fill concurrency, use exponential backoff and TTL jitter, and serve bounded stale data where safe. Prioritize hot keys and shed noncritical load.

**Interview answer:** I use single-flight fills, concurrency limits, backoff, stale serving, and load shedding so recovery is gradual.

7. How would you cache expensive computations with variable inputs?

**Deep explanation:** Canonicalize every result-affecting input, hash it into a versioned key, and normalize ordering, defaults, units, and precision. Limit value size and key cardinality because arbitrary inputs may have little reuse.

**Interview answer:** I build a deterministic versioned key from canonical inputs and cache only computations likely to repeat, with size and cardinality limits.

8. How would you version cache keys during schema changes?

**Deep explanation:** Put a version in the namespace, such as `user:v3:123`. New code uses the new version while old entries expire; temporary dual-read or backfill can smooth migration.

**Interview answer:** I introduce a new key-version namespace and let old keys age out, using a temporary fallback only if rollout compatibility requires it.

9. How would you design cache keys for tenant, locale, authorization, and query parameters?

**Deep explanation:** Include every response-varying dimension: version, tenant, locale, permission fingerprint, and canonically sorted parameters. Never embed secrets; hash long components and use unambiguous delimiters.

**Interview answer:** My canonical key includes version, tenant, resource, locale, authorization scope, and sorted query parameters, without raw secrets.

10. How would you compare invalidating before and after a database update?

**Deep explanation:** Before-write invalidation can be repopulated with old data before commit. After-write invalidation can be skipped if the process crashes after commit. Durable outbox or CDC-driven post-commit invalidation closes the latter gap.

**Interview answer:** I prefer durable post-commit invalidation with retries: pre-invalidation risks stale refill, while ordinary post-invalidation risks a commit-to-delete crash window.

11. What races can occur between a cache miss and a concurrent database write?

**Deep explanation:** A miss may read the old row, then cache it after a writer commits and invalidates, resurrecting stale data. Versions, conditional cache writes, coordination, or durable later invalidation prevent this.

**Interview answer:** The classic race is an old miss filling after a new write. I prevent it with versioned or compare-and-set fills and reliable post-commit invalidation.

12. How would you implement stale-while-revalidate behavior?

**Deep explanation:** Store soft and hard expiries. Before soft expiry serve normally; between them serve stale while one lease holder refreshes; after hard expiry require fresh data or apply an explicit fallback.

**Interview answer:** I use soft and hard deadlines and a per-key refresh lease, serving stale only within the bounded interval.

13. How would you define a maximum acceptable staleness window?

**Deep explanation:** Base it on user and business harm, update rate, and promised consistency. Express it as an observable SLO, such as 99.9% of prices being under 60 seconds old.

**Interview answer:** I turn business tolerance into a measurable age SLO, shorten it for risky data, and monitor actual value age and violations.

14. How would you choose between caching complete objects and individual fields?

**Deep explanation:** Whole objects reduce calls and simplify atomic reads but transfer unused data and invalidate broadly. Fields support partial access and updates but add calls, reconstruction, and mixed-version risk.

**Interview answer:** I cache whole objects when fields are read together; I split independently accessed or large fields while accounting for consistency and round-trip costs.

15. How would you prevent large cached values from increasing latency?

**Deep explanation:** Enforce size limits, cache projections or chunks, and benchmark compression against CPU cost. Rarely reused large blobs belong in object storage with metadata cached.

**Interview answer:** I cap value size, cache compact projections, benchmark compression, and move large blobs to object storage.

16. How do pipelining and transactions differ in Redis?

**Deep explanation:** Pipelining reduces network round trips but is not atomic, so other commands may interleave. `MULTI`/`EXEC` executes queued commands without interleaving, but lacks SQL-style rollback.

**Interview answer:** Pipelines optimize transport; transactions provide atomic command grouping. Redis transactions do not provide relational rollback semantics.

17. When would a Lua script help make a Redis operation atomic?

**Deep explanation:** Lua suits multi-step read-check-write logic such as compare-and-delete lock release or token-bucket updates. Redis runs the script atomically; keep it short because it blocks other work.

**Interview answer:** I use Lua when several dependent Redis operations must be indivisible, and keep scripts deterministic, bounded, and fast.

18. How would you implement a rate limiter using Redis primitives?

**Deep explanation:** Fixed windows use `INCR` and expiry but burst at boundaries; sorted-set sliding logs are accurate but cost more memory. A Lua token bucket provides smooth limits and atomic refill/consume behavior.

**Interview answer:** I usually implement a token bucket in Lua, key it by subject and route, expire idle state, and explicitly choose fail-open or fail-closed.

19. How would you implement a leaderboard using sorted sets?

**Deep explanation:** Store players as members and points as scores. Use `ZINCRBY`, `ZREVRANGE ... WITHSCORES`, and `ZREVRANK`; define deterministic handling for equal scores.

**Interview answer:** I use one sorted set per board, update with `ZINCRBY`, query leaders with `ZREVRANGE`, and fetch rank with `ZREVRANK`.

20. How would you model session expiration and revocation in Redis?

**Deep explanation:** Map opaque session IDs to data with TTLs. Sliding sessions may extend idle TTL up to an absolute maximum; deletion revokes a session, while a user-to-session index enables global logout.

**Interview answer:** I store opaque IDs with idle and absolute expiry, rotate them at security boundaries, and delete indexed sessions for revocation or global logout.

21. How would you monitor cache latency, hit ratio, evictions, and memory use?

**Deep explanation:** Track client-observed latency percentiles, segmented hits/misses, evictions, expirations, memory and fragmentation, errors, and downstream load. Global averages can conceal one failing workload.

**Interview answer:** I dashboard p50/p95/p99 latency, hit ratio by key class, evictions, memory and fragmentation, errors, and correlated database load.

22. How do Redis persistence options affect recovery expectations?

**Deep explanation:** RDB is compact and fast to restore but loses changes since its last snapshot. AOF offers a smaller configured loss window at greater I/O and storage cost. Both require tested RPO/RTO; replicas are not backups.

**Interview answer:** RDB favors compact recovery with more potential loss; AOF favors durability at higher cost. I select against RPO/RTO and test restores.

23. How would you evaluate replica lag for cached or session data?

**Deep explanation:** Measure offset or time lag during normal load and failover, then map it to tolerated staleness and loss. Reconstructable cache data may tolerate lag; session revocation often requires primary reads or replication acknowledgement.

**Interview answer:** I measure lag distributions and failover behavior, using replicas for tolerant cache reads but stronger primary or acknowledged paths for session security changes.

24. How would you distribute keys across cache nodes?

**Deep explanation:** Hash stable keys into partitions and monitor both memory and request balance. Colocate related multi-key data only when required because hash tags can create hotspots; plan replication and rebalancing.

**Interview answer:** I hash keys across partitions, use colocation tags sparingly, and monitor traffic and memory per node rather than only key counts.

25. How does consistent hashing reduce movement during resizing?

**Deep explanation:** Nodes and keys occupy a logical ring, so adding or removing a node changes only neighboring ownership ranges rather than rehashing nearly everything. Virtual nodes improve balance and capacity weighting.

**Interview answer:** Consistent hashing remaps roughly only the affected node's share during membership changes; virtual nodes smooth distribution.

26. How would you mitigate one hot key that dominates requests?

**Deep explanation:** For reads, use local caches or replicated keys, coalesced refresh, and stale serving. For write-heavy counters, shard updates and aggregate. Diagnose CPU, bandwidth, and payload size first.

**Interview answer:** I identify whether reads, writes, or value size dominate, then replicate/local-cache reads or shard and aggregate writes.

27. How would you use Cache-Control, ETag, and Last-Modified?

**Deep explanation:** `Cache-Control` sets cacheability and freshness. `ETag` and `Last-Modified` validate stale responses; matching conditional requests receive `304 Not Modified`. ETags are generally more precise than timestamps.

**Interview answer:** I use Cache-Control for freshness and scope, then ETag or Last-Modified for cheap conditional revalidation after expiry.

28. How does Vary affect HTTP cache correctness?

**Deep explanation:** `Vary` adds selected request headers, such as encoding or language, to representation selection. Missing it can serve the wrong variant; high-cardinality headers destroy reuse.

**Interview answer:** Vary makes relevant request headers part of the cache key. I include only headers that truly change the response.

29. How would you prevent personalized responses from entering a shared CDN cache?

**Deep explanation:** Send `Cache-Control: private` or `no-store` and configure CDN bypass for authentication or session cookies. Test cache-key rules because a missing identity dimension can leak data across users.

**Interview answer:** I mark personalized responses private or no-store, bypass authenticated requests at the CDN, and test for cross-user cache leakage.

30. How would you invalidate static assets after a release?

**Deep explanation:** Use content-hashed filenames and long-lived immutable caching. New HTML references new URLs; keep old assets briefly so clients with older HTML still work.

**Interview answer:** I fingerprint asset URLs by content and cache them immutably; deployment changes HTML references instead of purging the CDN.

31. How do WATCH, MULTI, and EXEC support optimistic updates in Redis?

**Deep explanation:** `WATCH` observes keys, the client reads and computes, `MULTI` queues changes, and `EXEC` commits only if watched keys remained unchanged. Conflicts require a fresh bounded retry.

**Interview answer:** I watch, read, calculate, queue with MULTI, and EXEC; if concurrent modification aborts it, I reread and retry with backoff.

32. What happens when a Redis transaction's watched key changes before execution?

**Deep explanation:** `EXEC` returns null and none of the queued commands execute. The client must discard its stale calculation and optionally retry; contention requires a retry cap.

**Interview answer:** Redis aborts the transaction without applying queued commands, so the client rereads and retries within a bounded policy.

33. How would you use atomic SET options for conditional insertion with expiration?

**Deep explanation:** `SET key value NX EX 30` combines insert-if-absent and expiry atomically, avoiding the leak possible with separate `SETNX` and `EXPIRE`. Locks also need unique owner tokens and compare-and-delete release.

**Interview answer:** I use `SET key token NX EX seconds`; for locks, a Lua release deletes only when the owner token matches.

34. How do Redis Pub/Sub and Redis Streams differ in persistence and replay?

**Deep explanation:** Pub/Sub is transient fan-out to currently connected subscribers, without history or acknowledgement. Streams retain entries and support IDs, replay, consumer groups, pending tracking, and acknowledgements.

**Interview answer:** Pub/Sub is ephemeral; Streams are durable and replayable with consumer groups and acknowledgements.

35. How would you choose between SCAN and a blocking key-enumeration command?

**Deep explanation:** `KEYS` scans the entire keyspace in one blocking operation. `SCAN` returns incremental batches but can duplicate entries and is not a stable snapshot while data changes. Prefer explicit indexes when possible.

**Interview answer:** In production I use bounded cursor-based SCAN and handle duplicates; I avoid KEYS because it can stall a large Redis server.
