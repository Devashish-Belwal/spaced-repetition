1. How would you design a URL shortener with custom aliases and expiration?

**Deep explanation:** Store alias→URL records with conditional creation, expiry timestamps, and a cache for hot redirects; reject expired links on read and clean them asynchronously.

**Interview answer:** I’d use a consistent key-value mapping, atomically reserve custom aliases, cache redirects, and keep analytics and expiry cleanup off the request path.

2. How would you generate short IDs and handle collisions at high write volume?

**Deep explanation:** Base62-encode distributed unique integers for coordination-free sortable IDs. If IDs must be unpredictable, use high-entropy random values plus a unique constraint and retry.

**Interview answer:** I’d Base62-encode Snowflake-style IDs, or use random IDs with a unique insert and retry when unpredictability matters.

3. How would you design a public API rate limiter with per-user and per-tenant limits?

**Deep explanation:** At the gateway, atomically evaluate hierarchical token buckets in a partitioned store; a request passes only if both user and tenant budgets allow it.

**Interview answer:** I’d enforce user and tenant buckets together, return quota metadata, and define fail-open or fail-closed behavior per endpoint risk.

4. How would you compare token bucket, leaky bucket, fixed window, and sliding window limits?

**Deep explanation:** Fixed windows are cheap but burst at boundaries; sliding windows are fairer but costlier. Token buckets allow bounded bursts, while leaky buckets smooth output.

**Interview answer:** I’d usually choose token bucket for APIs, sliding counters for strict quotas, leaky bucket for smoothing, and fixed windows only when simplicity dominates.

5. How would you design a web crawler that respects domain-specific crawl policies?

**Deep explanation:** Partition the frontier by host, cache robots.txt, and schedule through per-host crawl-delay and concurrency controls. Separate fetching, parsing, dedupe, and discovery.

**Interview answer:** I’d use polite per-host queues governed by robots rules, delays, and concurrency caps, with distributed fetchers returning links through deduplication.

6. How would you prevent duplicate URLs and crawler traps from consuming the crawl budget?

**Deep explanation:** Canonicalize URLs, combine a Bloom filter with durable hashes, and fingerprint duplicate content. Cap depth, parameter combinations, calendar ranges, and per-domain spend.

**Interview answer:** I’d canonicalize and hash URLs, fingerprint content, and enforce trap heuristics plus strict domain crawl budgets.

7. How would you design a full-text search engine over hundreds of millions of documents?

**Deep explanation:** Build a compressed inverted index, shard by document, and replicate shards. Coordinators query shards in parallel, score with BM25, merge top-k, and fetch stored fields.

**Interview answer:** I’d use a sharded replicated inverted index, parallel BM25 search, coordinator top-k merging, and caches for hot queries and postings.

8. How would you update a search index while keeping search available?

**Deep explanation:** Stream changes into immutable segments, merge them in the background, and atomically switch readers after replicas load and warm a new version.

**Interview answer:** I’d build versioned immutable segments, warm them before an atomic swap, and retain the previous index for rollback.

9. How would you design search autocomplete with low latency and frequent updates?

**Deep explanation:** Keep top suggestions per prefix in an in-memory trie or FST. Merge a compact periodic base with a streaming delta for fresh popularity and catalog changes.

**Interview answer:** I’d serve prefix top-k from memory, combine a rebuilt base with realtime deltas, and cache hot prefixes near users.

10. How would you handle typos, prefixes, popularity, and personalization in autocomplete?

**Deep explanation:** Retrieve prefix and bounded edit-distance candidates, then rank by match quality, popularity, recency, and user context. Limit fuzzy expansion to protect latency.

**Interview answer:** I’d merge prefix and tightly bounded fuzzy candidates, rank with popularity and personalization, and keep a safe non-personalized fallback.

11. How would you design a news feed with low latency and high freshness?

**Deep explanation:** Maintain per-user candidate IDs, hydrate posts at read time, and use push fanout for normal publishers but pull for very large ones. Rank and cache the merged result.

**Interview answer:** I’d use hybrid fanout, event-driven updates, cached candidate lists, and read-time ranking and hydration.

12. How would you design a Twitter-style timeline with celebrity accounts?

**Deep explanation:** Celebrity fanout causes huge write amplification, so keep their posts in author outboxes and merge them into follower timelines on read.

**Interview answer:** I’d fan out normal users on write and merge celebrity outboxes on read, caching timelines for active users.

13. How would you choose feed fanout behavior for users with very different follower counts?

**Deep explanation:** Estimate push-versus-pull cost from follower count, posting rate, follower activity, and current load. A dynamic hybrid minimizes total work.

**Interview answer:** I’d dynamically push ordinary publishers and pull high-fanout or high-frequency publishers based on measured cost.

14. How would you design Instagram-style image uploads, feeds, and comments?

**Deep explanation:** Upload directly to object storage with signed URLs, persist metadata, and emit events for moderation, variants, and fanout. Serve media by CDN and partition comments by post.

**Interview answer:** I’d separate media from metadata, process images asynchronously, use hybrid feeds, and cursor-paginate comments.

15. How would you generate and deliver image variants efficiently?

**Deep explanation:** Decode once in an asynchronous pipeline, generate common sizes and formats, and store them under immutable versioned keys. CDN-cache them and lazily create rare bounded variants.

**Interview answer:** I’d precompute common responsive variants, use immutable CDN keys, and lazily generate uncommon transformations with request coalescing.

16. How would you design a YouTube-style video upload and streaming platform?

**Deep explanation:** Use resumable chunk uploads to object storage, then an idempotent workflow for scanning, transcoding, packaging, thumbnails, and publication. Deliver through CDNs.

**Interview answer:** I’d combine resumable direct uploads, asynchronous transcoding, separate metadata services, and adaptive CDN delivery.

17. How would you organize transcoding, adaptive bitrate delivery, and playback metadata?

**Deep explanation:** Create a codec-resolution bitrate ladder, segment renditions, and atomically publish HLS or DASH manifests. Track processing versions, captions, DRM, and availability in metadata.

**Interview answer:** I’d produce an adaptive bitrate ladder, package short segments and manifests, then let players switch using bandwidth and buffer health.

18. How would you design a Netflix-style video-on-demand service with regional content rights?

**Deep explanation:** A rights service evaluates region, time window, tier, and device before issuing short-lived DRM playback tokens. Build regional catalogs and place approved media in regional CDNs.

**Interview answer:** I’d enforce regional entitlement at token issuance, use DRM and geo controls, and distribute only licensed titles through regional CDNs.

19. How would you design a WhatsApp-style chat system with offline delivery?

**Deep explanation:** Route persistent connections through conversation-partitioned servers into a durable log and per-device inboxes. Offline devices resume from acknowledged cursors.

**Interview answer:** I’d durably append messages, enqueue them per device, deliver immediately when online, and resume from cursors after reconnect.

20. How would you model message IDs, ordering, delivery receipts, and read receipts?

**Deep explanation:** Use client-generated IDs for idempotency and server sequence numbers per conversation. Represent delivery and read progress as monotonic per-device or per-user cursors.

**Interview answer:** I’d deduplicate by client message ID, order within each conversation, and model receipts as compact monotonic cursors.

21. How would you design online presence and typing indicators?

**Deep explanation:** Treat them as ephemeral best-effort data: gateways renew presence leases with TTLs, while throttled typing events expire quickly over pub/sub.

**Interview answer:** I’d use TTL presence leases and short-lived throttled typing signals, keeping both off the durable message path.

22. How would you design notifications for 100 million users across email, SMS, and push?

**Deep explanation:** Ingest intents into a durable log, resolve templates and preferences, then dispatch through channel-specific queues and quota-aware provider adapters. Track every attempt.

**Interview answer:** I’d separate orchestration from channel delivery, partition queues, enforce provider quotas, and use idempotent delivery IDs with full observability.

23. How would you handle preferences, scheduling, provider quotas, and retries?

**Deep explanation:** Check current preferences before send, use durable time buckets for schedules, token buckets for providers, and exponential backoff with jitter only for transient errors.

**Interview answer:** I’d enforce preferences at send time, dispatch due work durably, rate-limit providers, and dead-letter exhausted idempotent retries.

24. How would you design Dropbox-style file storage and synchronization?

**Deep explanation:** Store immutable content chunks in object storage and versioned manifests in a transactional database. Clients consume a change log and create explicit conflicts on concurrent edits.

**Interview answer:** I’d separate chunk data from metadata, sync through ordered cursors, deduplicate by hash, and detect conflicts using base versions.

25. How would you detect changed file chunks and resume interrupted transfers?

**Deep explanation:** Hash fixed-size or content-defined chunks and compare them with the server manifest; content-defined boundaries reduce re-upload after insertions. Persist verified upload progress.

**Interview answer:** I’d upload only missing hashed chunks and persist session state so retries resume without resending verified data.

26. How would you design ride matching for an Uber-style service?

**Deep explanation:** Retrieve nearby eligible drivers, score by ETA and policy, and make offers through atomic short leases. Widen the search as offers expire or are rejected.

**Interview answer:** I’d rank nearby drivers, reserve one with a short lease, and expand the search through an explicit matching state machine.

27. How would you update driver locations and search nearby drivers efficiently?

**Deep explanation:** Stream rate-limited updates into an in-memory H3 or S2 cell index. Search neighboring cells, discard stale entries, then compute road ETA for a shortlist.

**Interview answer:** I’d index latest positions by spatial cell and reserve expensive routing calculations for nearby fresh candidates.

28. How would you design a food-delivery workflow across customer, restaurant, courier, and payment systems?

**Deep explanation:** Use a durable order saga across payment authorization, restaurant acceptance, preparation, courier assignment, pickup, and delivery. Every transition is idempotent with timeouts and compensation.

**Interview answer:** I’d coordinate the parties through an event-driven order state machine with deadlines, idempotency, and compensating actions.

29. How would you design ticket booking for a popular concert?

**Deep explanation:** Absorb spikes with an admission queue, cache seat maps, but serialize authoritative seat changes by event or section. Use atomic expiring holds and idempotent payment.

**Interview answer:** I’d combine a waiting room with strongly consistent seat holds and an idempotent payment-backed booking state machine.

30. How would you hold seats temporarily while a customer pays?

**Deep explanation:** Conditionally change an available seat to an owner-bound hold with expiry. Only that owner can confirm it; reads ignore expired holds and asynchronous cleanup releases them.

**Interview answer:** I’d create atomic expiring holds, verify ownership and validity at confirmation, and clean up expired holds asynchronously.

31. How would you design a payment service with idempotency and reconciliation?

**Deep explanation:** Persist idempotency keys with request fingerprints and results, maintain an append-only ledger, deduplicate webhooks, and compare records with processor settlement reports.

**Interview answer:** I’d make commands and webhooks idempotent, model explicit states and ledger entries, and regularly reconcile against provider settlements.

32. How would you separate authorization, capture, refund, and settlement states?

**Deep explanation:** Model each as a separate linked financial operation with its own ID, amount, lifecycle, and provider reference. Validate transitions and record money movement in a double-entry ledger.

**Interview answer:** I’d avoid one overloaded status and represent authorization, capture, refund, and settlement as distinct operations and ledger entries.

33. How would you design an e-commerce marketplace with catalog, inventory, orders, and payments?

**Deep explanation:** Separate domain services and connect them with durable events. Checkout snapshots offer data, reserves stock, authorizes payment, and uses a saga to compensate failures.

**Interview answer:** I’d build purpose-specific services and read models, then coordinate checkout through idempotent inventory, payment, and order transitions.

34. How would you reserve inventory without overselling during concurrent checkouts?

**Deep explanation:** Atomically decrement available quantity only when sufficient stock exists, creating an expiring reservation. Confirmation consumes it; cancellation or expiry releases it.

**Interview answer:** I’d use a conditional atomic stock update and an idempotent reservation with explicit confirm, release, and expiry transitions.

35. How would you design a distributed cache with partitioning and eviction?

**Deep explanation:** Use consistent hashing with virtual nodes and replication. Each node applies TTL plus approximate LFU or LRU, while clients protect hot misses with coalescing and jitter.

**Interview answer:** I’d shard by consistent hashing, replicate keys, use TTL plus approximate LFU, and handle stampedes and hot keys explicitly.

36. How would you design a distributed queue with acknowledgments and redelivery?

**Deep explanation:** Persist messages in replicated partitions and lease deliveries using visibility timeouts. A missing acknowledgment makes the item eligible for redelivery, so consumers must be idempotent.

**Interview answer:** I’d use durable partitioned logs, visibility leases, acknowledgments, and at-least-once delivery with idempotent consumers.

37. How would you design centralized logging for thousands of services?

**Deep explanation:** Agents batch structured logs into a durable bus; processors validate, redact, enrich, and route to hot indexed search plus cheap object archives. Quotas and retention control cost.

**Interview answer:** I’d decouple apps with asynchronous shipping, index recent structured logs, archive raw data, and enforce schemas, redaction, quotas, and retention.

38. How would you design a metrics platform with ingestion, aggregation, storage, and alerting?

**Deep explanation:** Ingest timestamped samples into a partitioned compressed time-series store. Pre-aggregate and downsample old data; stateful alert evaluators handle duration, deduplication, and routing.

**Interview answer:** I’d partition by metric and labels, compress and downsample, precompute common rollups, and run stateful deduplicated alert rules.

39. How would you design an analytics platform supporting realtime dashboards and historical queries?

**Deep explanation:** One durable event log feeds streaming materialized views for dashboards and partitioned columnar files for history. A query layer merges both using schemas, watermarks, and dedupe.

**Interview answer:** I’d combine streaming aggregates for freshness with columnar storage for history behind one query layer.

40. How would you handle late events and replay in an analytics pipeline?

**Deep explanation:** Aggregate by event time with watermarks and an allowed-lateness window, emitting corrections when needed. Retain raw immutable events so versioned deterministic jobs can rebuild outputs.

**Interview answer:** I’d use event-time watermarks, support corrections for late data, and replay raw events idempotently into versioned tables.

41. How would you design collaborative documents like Google Docs?

**Deep explanation:** Document-scoped realtime sessions order edits and use OT or CRDTs for convergence. Persist an operation log plus snapshots and resync disconnected clients by version.

**Interview answer:** I’d use persistent sessions, OT or CRDT convergence, a durable operation log, periodic snapshots, and version-based reconnect.

42. How would you model edits, document versions, cursors, and offline changes?

**Deep explanation:** Each edit has an ID, author, base version, and operation; the server merges it and advances the version. Cursors map through edits, while offline queues deduplicate and reconcile on reconnect.

**Interview answer:** I’d version and deduplicate edits, transform concurrent operations, remap ephemeral cursors, and merge offline changes against intervening revisions.

43. How would you design video conferencing with variable network conditions?

**Deep explanation:** Use WebRTC with ICE, STUN, and TURN, plus simulcast or scalable video. Receiver feedback drives bitrate, resolution, and frame-rate adaptation while prioritizing audio.

**Interview answer:** I’d use WebRTC, TURN fallback, layered video, congestion control, and adaptive subscriptions that protect audio first.

44. How would you choose a media-routing topology and recording pipeline?

**Deep explanation:** P2P suits tiny calls; SFUs scale most groups by forwarding selected layers; MCUs save client work at high server cost. Record server-side tracks and compose asynchronously.

**Interview answer:** I’d use P2P only for tiny calls, an SFU for groups, and record via server participants into durable tracks for later composition.

45. How would you design a leaderboard with global and friend-specific ranks?

**Deep explanation:** Maintain scores in partitioned sorted structures with atomic updates. Cache global top-k, compute exact rank from partitions, and rank friends from their much smaller score set.

**Interview answer:** I’d use sorted score indexes, cache global leaders, and calculate friend rank by fetching and sorting the user’s friend scores.

46. How would you handle ties, seasons, and frequent score updates?

**Deep explanation:** Define competition or dense-rank semantics with deterministic tie breakers, namespace every key by season, and batch high-frequency deltas. Freeze completed seasons as snapshots.

**Interview answer:** I’d make tie rules explicit, isolate seasons, aggregate rapid updates, and snapshot immutable final standings.

47. How would you design a recommendation service with candidate retrieval and ranking?

**Deep explanation:** Retrieve candidates from collaborative, content, popularity, and rule-based sources, then rank with fresh features under a latency budget. Filter, diversify, and log exposures.

**Interview answer:** I’d retrieve a few hundred candidates from multiple fast sources, rank them online, apply eligibility and diversity, and log outcomes for learning.

48. How would you address new-user and new-item cold starts?

**Deep explanation:** Bootstrap users with context, onboarding, and regional popularity; bootstrap items from metadata and content embeddings. Controlled exploration gathers feedback without harming quality.

**Interview answer:** I’d use contextual popularity for new users, content features for new items, and bounded exploration to learn quickly.

49. How would you design a distributed job scheduler with delayed and recurring tasks?

**Deep explanation:** Persist definitions and next-run times, shard scheduler ownership with leases, and move due jobs from time buckets into durable queues. Workers heartbeat idempotent attempts.

**Interview answer:** I’d durably store schedules, lease partitions to schedulers, enqueue due occurrences, and run recoverable idempotent worker attempts.

50. How would you prevent duplicate execution when a scheduler or worker crashes?

**Deep explanation:** Exactly-once side effects are generally unavailable. Give each occurrence a deterministic run ID, create its attempt conditionally, recover expired leases, and make effects idempotent or transactional.

**Interview answer:** I’d assume at-least-once delivery, deduplicate by run ID, use leases for recovery, and guard side effects with idempotency or an outbox.

51. How would you design an API gateway with routing, authentication, quotas, and observability?

**Deep explanation:** Stateless gateways terminate TLS, validate credentials, choose versioned routes, enforce hierarchical quotas, and propagate traces. Cache policy locally and bound retries and timeouts.

**Interview answer:** I’d run stateless gateways with cached routing and auth policy, quotas, bounded resilience controls, and consistent logs, metrics, and traces.

52. How would you design a feature-flag service with low-latency evaluation?

**Deep explanation:** An audited control plane streams versioned rules to SDKs that evaluate locally. Deterministic hashing gives stable percentage rollouts, and cached defaults survive outages.

**Interview answer:** I’d keep evaluation in local SDKs, stream versioned targeting rules, use stable hashing for rollout, and define safe defaults.

53. How would you design a distributed configuration service with versioned rollouts?

**Deep explanation:** Store immutable validated versions and stream them to caching clients. Roll out through canary cohorts with acknowledgments and health gates, then pause or repoint to roll back.

**Interview answer:** I’d publish immutable schema-validated versions, stage them through canaries, monitor health, and roll back by selecting the prior version.

54. How would you design a geospatial search service for nearby businesses?

**Deep explanation:** Index businesses in hierarchical cells, query intersecting cells, filter candidates, then calculate exact distance and rank by relevance, quality, and context.

**Interview answer:** I’d use H3, S2, or a geo index for coarse retrieval, exact-distance filtering, multi-signal ranking, and regional replicas.

55. How would you design a social graph supporting follows, blocks, and mutual connections?

**Deep explanation:** Store directed follow edges with forward and reverse indexes, paging high-degree users. Blocks override follows; mutuals come from intersecting smaller adjacency sets or precomputed views.

**Interview answer:** I’d maintain forward and reverse edges, enforce blocks as higher priority, and compute mutuals by bounded intersection or offline materialization.

56. How would you design a live sports-score service with bursty fan traffic?

**Deep explanation:** Ingest authoritative updates into an ordered per-game log, materialize snapshots, and push sequenced deltas through regional WebSocket gateways. Clients recover gaps from cached state.

**Interview answer:** I’d use one ordered stream per game, cached snapshots, regional push fanout, and sequence-based reconnect recovery.

57. How would you design a large-scale webhook delivery platform?

**Deep explanation:** Expand durable events into endpoint-aware queues, sign payloads, and send with strict timeouts. Apply quotas, circuit breakers, jittered retries, idempotent attempt IDs, and replay.

**Interview answer:** I’d durably queue signed deliveries, isolate endpoints, retry transient failures safely, and expose attempt history and replay.

58. How would you design an audit-log service with reliable event capture?

**Deep explanation:** Capture business changes and audit records atomically through an outbox into append-only tamper-evident storage. Encrypt, authorize, retain, and expose a redacted search projection.

**Interview answer:** I’d use a transactional outbox, immutable integrity-checked storage, strict access controls, and a separately indexed redacted query view.

59. How would you design a reservation system for hotel rooms across dates?

**Deep explanation:** Inventory is per property, room type, and night, so reserve every requested date consistently. Use expiring holds and idempotent confirmation, cancellation, and reconciliation.

**Interview answer:** I’d atomically reserve room-type inventory across all nights, then convert a valid expiring hold into a confirmed booking.

60. How would you design a subscription billing system with recurring charges and plan changes?

**Deep explanation:** Model subscriptions, versions, invoices, line items, attempts, credits, and entitlements separately. Generate invoices idempotently, calculate proration, apply dunning, and reconcile processors.

**Interview answer:** I’d use versioned subscription state, idempotent invoicing, explicit proration and ledger entries, plus retry and reconciliation workflows.

61. How would you design a MapReduce pipeline and explain map, shuffle, and reduce responsibilities?

**Deep explanation:** Map transforms independent input splits into key-value pairs; shuffle partitions, transfers, sorts, and groups equal keys; reduce aggregates each group into final output.

**Interview answer:** Map produces intermediate pairs, shuffle colocates equal keys, and reduce combines each grouped key into the result.

62. How would you choose a partition function and combiner for a large aggregation job?

**Deep explanation:** The partitioner must colocate equal keys while balancing load; hash is general, ranges preserve order, and hot keys may need salting. Combiners must be associative and commutative.

**Interview answer:** I’d choose a deterministic balanced partitioner, mitigate skew explicitly, and combine locally only when repeated application preserves semantics.

63. How would you separate command and query models without automatically adopting event sourcing?

**Deep explanation:** Use a transactional normalized write model and asynchronously maintained denormalized read projections. An outbox publishes changes reliably; events need not be the source of truth.

**Interview answer:** I’d keep a conventional write database, publish changes through an outbox, and build query-specific projections—CQRS does not require event sourcing.

64. How would you design a backend-for-frontend for web and mobile clients with different data needs?

**Deep explanation:** Give each client family a thin BFF for aggregation, payload shaping, caching, and compatibility, while shared domain decisions remain in core services.

**Interview answer:** I’d use separate thin web and mobile BFFs for client-specific composition without duplicating business rules.

65. How would you design an API gateway without concentrating every business rule in it?

**Deep explanation:** Limit the gateway to routing, edge authentication, quotas, protocol translation, and telemetry. Keep domain authorization and workflows in services, using declarative policy and narrow extensions.

**Interview answer:** I’d keep the gateway policy-driven and restricted to cross-cutting edge concerns, with business rules owned by backend services.
