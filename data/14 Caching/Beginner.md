1. What is a cache, and why can it reduce latency?

**Deep explanation:** A cache stores copies of frequently used data in faster storage than the source. For example, an in-memory read is usually much faster than a remote database query. The tradeoffs are memory use, invalidation complexity, and possible stale data.

**Interview answer:** A cache is a fast storage layer for copies of data. It reduces latency by avoiding repeated database, network, or computation work.

2. What are a cache hit and a cache miss?

**Deep explanation:** A hit occurs when a requested value is present and valid in the cache. A miss means it is absent, expired, or unusable, so the application must fetch or compute it from the source.

**Interview answer:** A hit serves the requested value from cache; a miss falls back to the underlying source.

3. How would you calculate a cache hit ratio?

**Deep explanation:** Use `hits / (hits + misses)`, usually as a percentage. For 900 hits and 100 misses, the ratio is 90%. Interpret it with latency and correctness because a high ratio alone does not prove value.

**Interview answer:** Cache hit ratio is `hits / (hits + misses)`, multiplied by 100 for a percentage.

4. How do browser, CDN, application, and database caches differ?

**Deep explanation:** Browser caches are near one user; CDNs cache responses at geographic edge locations; application caches store domain data or computed results; database caches keep pages or query data close to the database engine. Each has a different scope and invalidation mechanism.

**Interview answer:** Browsers cache per client, CDNs cache near users, application caches hold business data or results, and database caches accelerate database access.

5. What is a cache key?

**Deep explanation:** A cache key uniquely identifies a value, such as `product:123`. It should include every input that changes the output and use stable namespacing or versions to prevent collisions.

**Interview answer:** A cache key is the identifier used to store and retrieve a value, and it must uniquely represent all inputs affecting that value.

6. What makes a cache key incorrect or incomplete?

**Deep explanation:** A key is wrong if unrelated requests collide or equivalent requests produce different keys. It is incomplete if it omits an output-changing input such as user ID, locale, permissions, filters, or version, which can return incorrect or leaked data.

**Interview answer:** A key is incomplete when it omits an input that changes the response—for example, leaving the user ID out of a personalized-response key.

7. What is a time to live?

**Deep explanation:** Time to live, or TTL, is how long an entry remains valid before expiration. Short TTLs reduce staleness but cause more misses; long TTLs improve hit rates but may serve old data longer.

**Interview answer:** TTL is the duration a cached entry is valid. After it expires, the value normally must be reloaded.

8. How do expiration and eviction differ?

**Deep explanation:** Expiration invalidates an entry because its TTL ended. Eviction removes it early, usually under memory pressure according to a policy such as LRU or LFU.

**Interview answer:** Expiration is time-based invalidation; eviction is removal by the cache, typically to free space.

9. What is cache invalidation?

**Deep explanation:** Cache invalidation makes cached data unusable after its source changes. Approaches include deletion, replacement, versioned keys, and TTLs. It is difficult because every affected key must be found reliably across processes and services.

**Interview answer:** Cache invalidation removes or replaces data that is no longer valid so later reads do not return stale results.

10. How does cache-aside work?

**Deep explanation:** The application checks the cache first. On a miss, it reads the database, caches the result, and returns it; writes commonly update the database and delete the key. It is simple, but first reads are slower and failed invalidation can cause staleness.

**Interview answer:** With cache-aside, the application reads cache first, loads and caches data on a miss, and usually invalidates the cache after a database write.

11. How do read-through and cache-aside differ?

**Deep explanation:** In cache-aside, application code loads missing data and populates the cache. In read-through, the cache or caching library loads the backing store automatically on a miss, hiding that logic from the application.

**Interview answer:** Cache-aside makes the application handle misses; read-through delegates miss loading to the cache layer.

12. How does write-through caching work?

**Deep explanation:** A write is synchronously applied to both cache and backing store before success is returned. This keeps cached reads fresh, but increases write latency and may cache values that are never read.

**Interview answer:** Write-through updates the cache and durable store synchronously, improving consistency at the cost of slower writes.

13. How does write-back caching work?

**Deep explanation:** Write-back updates the cache first and persists to the source asynchronously. It enables fast, batched writes, but failures can lose unpersisted changes, so durability, ordering, and retries matter.

**Interview answer:** Write-back acknowledges after updating cache and persists later. It is fast but risks loss or inconsistency unless pending writes are durable and safely retried.

14. What is refresh-ahead caching?

**Deep explanation:** Refresh-ahead reloads popular entries shortly before expiration, usually in the background. It avoids miss latency but can waste work refreshing entries that no one uses.

**Interview answer:** Refresh-ahead proactively refreshes an entry before its TTL ends so users avoid an expiration-induced miss.

15. How do local and distributed caches differ?

**Deep explanation:** A local cache is inside one process, making it fastest but isolated and limited per instance. A distributed cache is shared across instances and offers a common view, but adds network latency and another failure-prone service.

**Interview answer:** Local caches are per-process and fastest but can diverge; distributed caches are shared but add network and operational overhead.

16. What are common uses of Redis?

**Deep explanation:** Redis is used for caching, sessions, rate limits, counters, leaderboards, queues, pub/sub, and coordination. Its in-memory structures and atomic commands make these efficient, while persistence and consistency require deliberate configuration.

**Interview answer:** Common Redis uses include caching, sessions, rate limiting, counters, leaderboards, queues, pub/sub, and lightweight coordination.

17. How would you compare Redis and Memcached for a simple cache?

**Deep explanation:** Memcached is a focused, volatile key-value cache with a simple operational model. Redis adds rich data structures, atomic operations, replication, and optional persistence. Either can store opaque cached values; choose based on needed features and operational fit.

**Interview answer:** Memcached is a simple volatile cache; Redis is more feature-rich. For a basic cache, I would choose based on performance needs, existing expertise, and whether Redis features are useful.

18. How do strings, hashes, lists, sets, and sorted sets differ in Redis?

**Deep explanation:** Strings hold one value; hashes hold field-value pairs; lists are ordered sequences; sets contain unique unordered members; sorted sets contain unique members ordered by numeric scores. Match the type to the access pattern, such as sorted sets for rankings.

**Interview answer:** Strings store values, hashes store object-like fields, lists store ordered sequences, sets store unique members, and sorted sets rank unique members by score.

19. What is an eviction policy?

**Deep explanation:** An eviction policy decides which entries to discard when memory is full. Policies may remove least-recently-used, least-frequently-used, soonest-expiring, or random keys, either across all keys or only expiring ones.

**Interview answer:** An eviction policy is the rule a cache uses to choose entries to remove under memory pressure, such as LRU or LFU.

20. How do LRU and LFU eviction differ?

**Deep explanation:** Least Recently Used removes items not accessed for the longest time, favoring recency. Least Frequently Used removes items with the fewest accesses, favoring sustained popularity. LRU adapts quickly; LFU often needs aging so old popularity does not dominate forever.

**Interview answer:** LRU evicts the least recently accessed item; LFU evicts the least frequently accessed item.

21. What is a hot key?

**Deep explanation:** A hot key receives far more traffic than others and can overload one node, lock, or network path even when total capacity is sufficient. Mitigations include local caching, replication, request coalescing, or redesigning/sharding the data.

**Interview answer:** A hot key receives disproportionate traffic and becomes a bottleneck. I would mitigate it with local caching, replication, coalescing, or key redesign.

22. What is a cache stampede?

**Deep explanation:** A stampede happens when many requests miss the same popular key simultaneously, often after expiration, and all hit the source. Defenses include per-key locking, request coalescing, TTL jitter, refresh-ahead, and stale-while-revalidate.

**Interview answer:** A cache stampede is a burst of concurrent misses that overloads the source. I would use coalescing, jittered TTLs, or stale-while-revalidate.

23. What is negative caching?

**Deep explanation:** Negative caching temporarily stores a “not found” or other safe negative result, preventing repeated expensive failed lookups. Use a short TTL so newly created data or recovered dependencies become visible quickly; transient failures may be unsafe to cache.

**Interview answer:** Negative caching stores a safe failed result, such as “not found,” for a short time to avoid repeated source lookups.

24. Why can cached data become stale?

**Deep explanation:** The source may change before the cached copy expires or is invalidated. Long TTLs, lost update events, replication delays, races, and disconnected local caches can all extend staleness.

**Interview answer:** Cached data becomes stale when the source changes before the copy is refreshed or invalidated, or when an update signal is delayed or lost.

25. When should data not be cached?

**Deep explanation:** Avoid caching data with little reuse, cheap retrieval, strict freshness requirements, excessive size, or rapidly changing values. Do not cache sensitive data unless isolation and protection are correct, and avoid caching when invalidation costs exceed the saved work.

**Interview answer:** I would not cache when reuse is low, retrieval is cheap, strict freshness is required, invalidation is unsafe, or sensitive data cannot be isolated securely.

26. Why is a cache not automatically a durable source of truth?

**Deep explanation:** Cache entries may expire, be evicted, disappear on restart, or be lost through asynchronous replication. Caches usually optimize speed rather than authoritative durability; a database or durable log should remain the source of truth unless the system is explicitly engineered otherwise.

**Interview answer:** Cache data can expire, be evicted, or disappear during failure, so a cache is normally an optimization rather than the durable authoritative store.

27. How would you cache a product lookup?

**Deep explanation:** Use cache-aside with a namespaced key such as `product:v1:{id}`. On a miss, load from the database and cache with an appropriate TTL. Briefly negative-cache missing IDs and coalesce concurrent misses if they are common.

**Interview answer:** I would read `product:{id}` from cache, load and cache it on a database miss, use a suitable TTL, and optionally negative-cache missing products briefly.

28. How would you invalidate a cached product after an update?

**Deep explanation:** Commit the database update first, then delete the product key so the next read repopulates it. Also invalidate affected lists or aggregates. Distributed services may publish an invalidation event; deletion is often safer than reconstructing cached output in the write path.

**Interview answer:** After the database update succeeds, I would delete `product:{id}` and related aggregate keys, optionally broadcasting an invalidation event.

29. How would you keep one user's cached response from reaching another user?

**Deep explanation:** Include trusted user or tenant identity and every permission-sensitive input in the key, or avoid shared caching for private responses. Use appropriate HTTP directives such as `private` or `no-store`, and test authorization boundaries.

**Interview answer:** I would avoid shared caching or key by trusted user or tenant ID plus authorization context, and use private or no-store HTTP caching when appropriate.

30. What should an application do when its cache is unavailable?

**Deep explanation:** When possible, treat cache as optional: time out quickly and fall back to the source, protected by circuit breakers, bounded retries, concurrency limits, and load shedding. Cache-dependent security or session features should use a deliberate safe failure policy.

**Interview answer:** Degrade gracefully by bypassing the cache and protecting the source with timeouts, circuit breakers, and load limits. If correctness or security depends on cache, fail safely instead.
