1. How would you redesign a URL shortener after one link receives half of all traffic?

**Deep explanation:** Treat the mapping as an immutable hot key: replicate it at CDN and edge caches, coalesce misses, and keep redirect analytics off the request path through an event stream. Long TTLs reduce origin load; emergency invalidation preserves control.

**Interview answer:** I would serve the hot mapping from edge replicas, coalesce origin misses, and publish analytics asynchronously so counters cannot overload redirects.

2. How would you revoke malicious short links globally without making every redirect synchronous?

**Deep explanation:** Push a versioned denylist to edge nodes and check it locally before returning cached redirects. An emergency invalidation channel plus bounded TTLs limits the revocation window without requiring a central lookup.

**Interview answer:** I would use a locally checked edge denylist, urgent invalidations, and bounded TTLs rather than synchronously calling a global service.

3. How would you enforce a global rate limit across regions during a network partition?

**Deep explanation:** A strict global limit requires coordination and loses availability during a partition. Leasing bounded token budgets to regions permits fast local decisions while putting a hard ceiling on total overage.

**Interview answer:** I would lease quota to each region; during partition it can spend only its lease, making the consistency-versus-availability choice explicit.

4. How would you preserve fairness when thousands of clients share one NAT address?

**Deep explanation:** IP-only limits punish unrelated users behind NAT. Use hierarchical quotas keyed first by trusted account or API identity, then device/session and IP risk signals, with a conservative shared pool for anonymous traffic.

**Interview answer:** I would limit trusted identities individually and use the NAT IP only as a secondary aggregate guard, so one client cannot consume everyone’s quota.

5. How would you rebalance a crawler's frontier while preserving per-domain politeness?

**Deep explanation:** Partition frontier ownership by normalized host so one scheduler owns its politeness clock. Move checkpointed host queues through leases and fencing, ensuring the old owner stops before the new one fetches.

**Interview answer:** I would rebalance complete per-host queues with leases and fencing tokens, preserving next-fetch times and preventing concurrent owners.

6. How would you detect malicious URLs that resolve to internal network addresses after validation?

**Deep explanation:** This is DNS rebinding/SSRF. Resolve through a controlled resolver, reject private, loopback, link-local, metadata, and disallowed IPv6 ranges, pin the validated IP for the connection, and repeat checks after redirects.

**Interview answer:** I would validate every resolution and redirect, connect only to the pinned approved IP, and enforce network egress rules as a second boundary.

7. How would you rebuild a search engine's entire index while continuing writes and queries?

**Deep explanation:** Build a versioned index from a consistent snapshot while recording later mutations in a change log. Replay until caught up, shadow-query for correctness, atomically swap an alias, and retain the old index for rollback.

**Interview answer:** I would snapshot, build in parallel, replay writes, validate with shadow traffic, and atomically switch the read alias.

8. How would you enforce document permissions inside distributed search results?

**Deep explanation:** Attach stable principals or security labels to indexed documents and filter inside every shard query, before ranking and pagination. Recheck highly sensitive results authoritatively and propagate revocations urgently.

**Interview answer:** I would enforce tenant and ACL filters within shard queries, then reauthorize sensitive results so stale index data never leaks documents.

9. How would you remove abusive autocomplete suggestions quickly across caches and replicas?

**Deep explanation:** Keep a centrally authored, versioned suppression list that serving nodes check after candidate generation. Push emergency tombstones and invalidate caches immediately, then rebuild the underlying model asynchronously.

**Interview answer:** I would layer a rapidly propagated serving-time blocklist over autocomplete, purge affected caches, and rebuild the model later.

10. How would you maintain feed freshness when a celebrity posts during a traffic spike?

**Deep explanation:** Fanout-on-write is unsafe for huge audiences. Use hybrid fanout: precompute normal users, store celebrity posts for pull-on-read, and merge them into cached feeds with short freshness bounds.

**Interview answer:** I would switch celebrity posts to fanout-on-read and merge them at read time, avoiding billions of synchronous fanout tasks.

11. How would you remove a deleted or blocked post from precomputed feeds?

**Deep explanation:** Make the canonical post tombstone and authorization check authoritative at read time so stale feed references cannot render it. Publish invalidations, purge caches, and scrub materialized feeds asynchronously.

**Interview answer:** I would hide it immediately through read-time visibility checks, then invalidate caches and remove stale feed entries in the background.

12. How would you recover a feed fanout pipeline after several hours of backlog?

**Deep explanation:** Resume from durable offsets with idempotent consumers, prioritize fresh/high-value events, and scale only within downstream limits. Compact obsolete work rather than forcing new posts to wait behind stale fanout.

**Interview answer:** I would drain durable queues with idempotent workers, prioritize freshness, compact superseded tasks, and throttle recovery to protect dependencies.

13. How would you prevent media-processing retries from publishing incomplete image variants?

**Deep explanation:** Write variants to a job/version-specific staging namespace and track required outputs durably. Validate the complete set, then atomically publish one manifest; stable idempotency keys make retries harmless.

**Interview answer:** I would stage versioned variants and expose them only through an atomic manifest after every required output validates.

14. How would you reconcile upload metadata with objects left behind after partial failures?

**Deep explanation:** Represent uploads with explicit states and tag objects by upload ID. A periodic idempotent reconciler completes recoverable commits and deletes unreferenced objects only after a safety grace period.

**Interview answer:** I would use an upload state machine plus a sweeper that repairs valid objects and garbage-collects abandoned ones after a grace period.

15. How would you design multi-region video ingestion and transcoding failover?

**Deep explanation:** Upload to regional durable storage, replicate source assets, and dispatch leased jobs through a recoverable queue. Deterministic output keys, heartbeats, and fencing let another region safely resume expired jobs.

**Interview answer:** I would replicate source video and run leased, idempotent transcodes so a healthy region can resume without publishing duplicates.

16. How would you balance video startup time, rebuffering, quality, and CDN cost?

**Deep explanation:** Use adaptive bitrate ladders, short initial segments, throughput/buffer-aware selection, and demand-based CDN placement. Optimize startup delay, rebuffer ratio, delivered quality, and cost together because improving one can harm another.

**Interview answer:** I would tune ABR and caching against a multi-objective QoE metric, using fast low-bitrate startup and deeper caching for popular renditions.

17. How would you prevent unauthorized redistribution of paid video content while preserving usability?

**Deep explanation:** Signed short-lived manifests, encrypted segments, DRM licenses, device/concurrency controls, and forensic watermarking raise abuse cost. Screen capture cannot be eliminated, so controls must not unduly harm legitimate offline or multi-device use.

**Interview answer:** I would combine DRM, short-lived authorization, concurrency limits, and watermarking with risk-based enforcement that preserves legitimate usability.

18. How would you define chat ordering across devices, reconnects, and regional failover?

**Deep explanation:** Guarantee order per conversation, not globally: a conversation leader assigns monotonic sequence numbers while client IDs deduplicate retries. Offline messages remain provisional until the server confirms their position.

**Interview answer:** I would use server sequence numbers per conversation and client message IDs for deduplication, then reconcile provisional messages after reconnect or failover.

19. How would end-to-end encryption change search, moderation, backups, and multi-device chat?

**Deep explanation:** Servers cannot inspect plaintext, so search becomes a client-side encrypted index, backups require client-held encryption, and moderation relies on reports, metadata, or privacy-preserving signals. Multi-device use needs secure key sync, verification, rotation, and recovery.

**Interview answer:** E2EE moves plaintext features and key ownership to clients; I would redesign local search, encrypted backups, abuse workflows, and device key distribution around that constraint.

20. How would you prevent presence data from leaking a user's private activity?

**Deep explanation:** Treat presence as access-controlled, coarse, and ephemeral. Use opt-in audiences, quantized timestamps, subscription limits, no durable history, and block semantics that do not reveal relationships through probing.

**Interview answer:** I would expose coarse presence only to authorized audiences, retain it briefly, and rate-limit probing while enforcing privacy at read time.

21. How would you stop a notification retry storm from violating provider limits?

**Deep explanation:** Use durable partitioned queues, stable idempotency keys, leases, jittered backoff, and priority-aware admission control. Recovery must respect downstream capacity and discard expired or superseded work.

**Interview answer:** I would use durable queues and idempotent leased workers, then drain with priorities, jitter, and downstream-aware rate limits.

22. How would you implement notification deduplication when providers return ambiguous outcomes?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

23. How would you resolve conflicting offline file edits without silently losing work?

**Deep explanation:** Track causal versions and preserve every divergent branch. Merge nonoverlapping operations automatically using stable element identities, but surface semantic conflicts and retain history rather than silently choosing a winner.

**Interview answer:** I would detect concurrent versions, merge safe operations deterministically, and preserve conflicts plus history for explicit resolution.

24. How would you implement file sharing, revocation, and deletion across cached downloads?

**Deep explanation:** Separate authoritative state from cache state, use versioned keys, bounded TTLs, request coalescing, and gradual ownership changes. Replication absorbs hot reads while epochs prevent stale owners from publishing.

**Interview answer:** I would replicate hot data, coalesce misses, migrate gradually, and use versioning or fencing to prevent stale writes.

25. How would you prevent double assignment of a driver during rapid location changes?

**Deep explanation:** Keep immutable versioned events and deterministic transformation code. Rebuild beside the live path, replay from a checkpoint, validate invariants and parity, then switch through a versioned pointer with rollback.

**Interview answer:** I would replay versioned events into a parallel model, verify it, and cut over atomically while retaining rollback.

26. How would you degrade ride matching when location updates or map services become unavailable?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

27. How would you compensate a food order when payment succeeds but the restaurant rejects it?

**Deep explanation:** Model the workflow as durable idempotent state transitions backed by an immutable double-entry ledger. Ambiguous provider outcomes require reconciliation and compensating entries, never destructive edits.

**Interview answer:** I would use idempotency keys, durable saga state, immutable ledger entries, and reconciliation with compensation for ambiguous outcomes.

28. How would you prevent overselling tickets across regions during a major launch?

**Deep explanation:** Keep immutable versioned events and deterministic transformation code. Rebuild beside the live path, replay from a checkpoint, validate invariants and parity, then switch through a versioned pointer with rollback.

**Interview answer:** I would replay versioned events into a parallel model, verify it, and cut over atomically while retaining rollback.

29. How would you recover expired seat holds whose payments complete late?

**Deep explanation:** Model the workflow as durable idempotent state transitions backed by an immutable double-entry ledger. Ambiguous provider outcomes require reconciliation and compensating entries, never destructive edits.

**Interview answer:** I would use idempotency keys, durable saga state, immutable ledger entries, and reconciliation with compensation for ambiguous outcomes.

30. How would you design a multi-region payment ledger with strict financial invariants?

**Deep explanation:** Model the workflow as durable idempotent state transitions backed by an immutable double-entry ledger. Ambiguous provider outcomes require reconciliation and compensating entries, never destructive edits.

**Interview answer:** I would use idempotency keys, durable saga state, immutable ledger entries, and reconciliation with compensation for ambiguous outcomes.

31. How would you reconcile payment-provider records with internal orders after an outage?

**Deep explanation:** Model the workflow as durable idempotent state transitions backed by an immutable double-entry ledger. Ambiguous provider outcomes require reconciliation and compensating entries, never destructive edits.

**Interview answer:** I would use idempotency keys, durable saga state, immutable ledger entries, and reconciliation with compensation for ambiguous outcomes.

32. How would you correct a financial mistake while preserving an immutable audit history?

**Deep explanation:** Model the workflow as durable idempotent state transitions backed by an immutable double-entry ledger. Ambiguous provider outcomes require reconciliation and compensating entries, never destructive edits.

**Interview answer:** I would use idempotency keys, durable saga state, immutable ledger entries, and reconciliation with compensation for ambiguous outcomes.

33. How would you handle inventory shared by online orders and physical stores?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

34. How would you migrate a marketplace's seller data across shards without downtime?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

35. How would you reshard a distributed cache while handling hot keys and node failures?

**Deep explanation:** Define the invariant, RTO, RPO, and which operations may lose availability. Replicate durable state across failure domains, transfer ownership through leases and fencing, and validate recovery under representative load.

**Interview answer:** I would replicate across failure domains, fence ownership during failover, retry idempotently, and prove the recovery goals with failure tests.

36. How would you recover a distributed queue after acknowledged replicas are lost?

**Deep explanation:** Use durable partitioned queues, stable idempotency keys, leases, jittered backoff, and priority-aware admission control. Recovery must respect downstream capacity and discard expired or superseded work.

**Interview answer:** I would use durable queues and idempotent leased workers, then drain with priorities, jitter, and downstream-aware rate limits.

37. How would you bound logging costs when a faulty service emits millions of events?

**Deep explanation:** Keep immutable versioned events and deterministic transformation code. Rebuild beside the live path, replay from a checkpoint, validate invariants and parity, then switch through a versioned pointer with rollback.

**Interview answer:** I would replay versioned events into a parallel model, verify it, and cut over atomically while retaining rollback.

38. How would you prevent high-cardinality metrics from overwhelming storage and query systems?

**Deep explanation:** Keep immutable versioned events and deterministic transformation code. Rebuild beside the live path, replay from a checkpoint, validate invariants and parity, then switch through a versioned pointer with rollback.

**Interview answer:** I would replay versioned events into a parallel model, verify it, and cut over atomically while retaining rollback.

39. How would you provide tenant isolation in a shared analytics platform?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

40. How would you correct historical analytics after discovering a broken event schema?

**Deep explanation:** Keep immutable versioned events and deterministic transformation code. Rebuild beside the live path, replay from a checkpoint, validate invariants and parity, then switch through a versioned pointer with rollback.

**Interview answer:** I would replay versioned events into a parallel model, verify it, and cut over atomically while retaining rollback.

41. How would you resolve concurrent rich-text edits while preserving user intent?

**Deep explanation:** Track causal versions and preserve every divergent branch. Merge nonoverlapping operations automatically using stable element identities, but surface semantic conflicts and retain history rather than silently choosing a winner.

**Interview answer:** I would detect concurrent versions, merge safe operations deterministically, and preserve conflicts plus history for explicit resolution.

42. How would you compact document-edit history without breaking offline clients?

**Deep explanation:** Track causal versions and preserve every divergent branch. Merge nonoverlapping operations automatically using stable element identities, but surface semantic conflicts and retain history rather than silently choosing a winner.

**Interview answer:** I would detect concurrent versions, merge safe operations deterministically, and preserve conflicts plus history for explicit resolution.

43. How would you handle video-conference participants behind restrictive networks?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

44. How would you maintain a call when a media server or region fails?

**Deep explanation:** Define the invariant, RTO, RPO, and which operations may lose availability. Replicate durable state across failure domains, transfer ownership through leases and fencing, and validate recovery under representative load.

**Interview answer:** I would replicate across failure domains, fence ownership during failover, retry idempotently, and prove the recovery goals with failure tests.

45. How would you detect leaderboard cheating and correct previously published ranks?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

46. How would you update a recommendation model without disrupting online feature compatibility?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

47. How would you measure recommendation quality without reinforcing a harmful feedback loop?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

48. How would you make a job scheduler safe against clock changes and stale leaders?

**Deep explanation:** Use durable partitioned queues, stable idempotency keys, leases, jittered backoff, and priority-aware admission control. Recovery must respect downstream capacity and discard expired or superseded work.

**Interview answer:** I would use durable queues and idempotent leased workers, then drain with priorities, jitter, and downstream-aware rate limits.

49. How would you schedule millions of jobs for the same timestamp without overload?

**Deep explanation:** Use durable partitioned queues, stable idempotency keys, leases, jittered backoff, and priority-aware admission control. Recovery must respect downstream capacity and discard expired or superseded work.

**Interview answer:** I would use durable queues and idempotent leased workers, then drain with priorities, jitter, and downstream-aware rate limits.

50. How would you isolate a failing tenant using a cell-based architecture?

**Deep explanation:** Define the invariant, RTO, RPO, and which operations may lose availability. Replicate durable state across failure domains, transfer ownership through leases and fencing, and validate recovery under representative load.

**Interview answer:** I would replicate across failure domains, fence ownership during failover, retry idempotently, and prove the recovery goals with failure tests.

51. How would you route requests after moving a tenant between cells?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

52. How would you migrate a monolith into services without introducing unsafe dual writes?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

53. How would you rebuild an event-sourced read model while preserving historical interpretation?

**Deep explanation:** Keep immutable versioned events and deterministic transformation code. Rebuild beside the live path, replay from a checkpoint, validate invariants and parity, then switch through a versioned pointer with rollback.

**Interview answer:** I would replay versioned events into a parallel model, verify it, and cut over atomically while retaining rollback.

54. How would you handle schema evolution in events that must remain replayable for years?

**Deep explanation:** Keep immutable versioned events and deterministic transformation code. Rebuild beside the live path, replay from a checkpoint, validate invariants and parity, then switch through a versioned pointer with rollback.

**Interview answer:** I would replay versioned events into a parallel model, verify it, and cut over atomically while retaining rollback.

55. How would you replace a Lambda architecture without losing historical accuracy?

**Deep explanation:** Keep immutable versioned events and deterministic transformation code. Rebuild beside the live path, replay from a checkpoint, validate invariants and parity, then switch through a versioned pointer with rollback.

**Interview answer:** I would replay versioned events into a parallel model, verify it, and cut over atomically while retaining rollback.

56. How would you validate a system's recovery objectives through an actual regional failure test?

**Deep explanation:** Define the invariant, RTO, RPO, and which operations may lose availability. Replicate durable state across failure domains, transfer ownership through leases and fencing, and validate recovery under representative load.

**Interview answer:** I would replicate across failure domains, fence ownership during failover, retry idempotently, and prove the recovery goals with failure tests.

57. How would you maintain service during a tenfold traffic increase arriving tomorrow?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

58. How would you trade off consistency, availability, latency, cost, and operational complexity explicitly?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

59. How would you identify the assumption most likely to invalidate your proposed architecture?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

60. How would you defend a simpler architecture when the interviewer requests unnecessary complexity?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

61. How would you handle stragglers and speculative execution in a MapReduce-style batch system?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

62. How would you prevent skewed shuffle keys from dominating a distributed aggregation?

**Deep explanation:** Keep immutable versioned events and deterministic transformation code. Rebuild beside the live path, replay from a checkpoint, validate invariants and parity, then switch through a versioned pointer with rollback.

**Interview answer:** I would replay versioned events into a parallel model, verify it, and cut over atomically while retaining rollback.

63. How would you keep CQRS read models sufficiently fresh for a critical user action?

**Deep explanation:** Keep immutable versioned events and deterministic transformation code. Rebuild beside the live path, replay from a checkpoint, validate invariants and parity, then switch through a versioned pointer with rollback.

**Interview answer:** I would replay versioned events into a parallel model, verify it, and cut over atomically while retaining rollback.

64. How would you evolve a cell-based system when one tenant exceeds a cell's capacity?

**Deep explanation:** Start with the user-visible invariant and SLO, then separate the authoritative state transition from asynchronous derived work. Apply idempotency, versioned ownership, bounded staleness, backpressure, observability, and tested rollback while documenting consistency, availability, latency, cost, and complexity tradeoffs.

**Interview answer:** I would state the invariant, keep one authoritative transition, make asynchronous work idempotent, and choose the simplest design that meets measured SLOs.

65. How would you choose between materialized views, CQRS, and event sourcing for a changing product?

**Deep explanation:** Keep immutable versioned events and deterministic transformation code. Rebuild beside the live path, replay from a checkpoint, validate invariants and parity, then switch through a versioned pointer with rollback.

**Interview answer:** I would replay versioned events into a parallel model, verify it, and cut over atomically while retaining rollback.

