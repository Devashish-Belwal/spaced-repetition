1. What does exactly-once processing mean inside a broker pipeline versus an external system?

**Deep explanation:**
Inside a broker, consumed offsets and produced records can share one atomic transaction. An external database, API, or email service is outside that boundary unless it participates in the same transaction, so it needs idempotency, deduplication, or reconciliation.

**Interview answer:**
Exactly once is scoped: Kafka can atomically commit offsets and outputs, but unrelated external effects require idempotency or deduplication.

2. How would you identify the transaction boundary of an exactly-once claim?

**Deep explanation:**
List every state change and determine which share one atomic commit. Inject crashes between operations; if one can succeed while another aborts, it lies outside the boundary and needs recovery logic.

**Interview answer:**
I trace all commits and test every failure point. The exactly-once boundary contains only changes that commit or roll back together.

3. How would you coordinate Kafka transactions, offsets, and downstream state?

**Deep explanation:**
For Kafka-to-Kafka work, produce results and send consumed offsets within one transaction; consumers use `read_committed`. Changelog-backed local state can align with this, while external databases require an outbox or idempotent writes.

**Interview answer:**
I atomically commit Kafka outputs and input offsets. External state is coordinated through idempotency or an outbox, not assumed to be in Kafka's transaction.

4. How would you handle a successful external side effect followed by a failed acknowledgment?

**Deep explanation:**
Redelivery is expected, so send a stable idempotency key. The receiver records completed keys and returns the prior result; ambiguous irreversible operations require reconciliation rather than blind retries.

**Interview answer:**
I make the side effect idempotent with a stable operation ID, so retrying after a lost acknowledgment cannot repeat the effect.

5. How do producer idempotence and application-level deduplication address different failures?

**Deep explanation:**
Producer idempotence suppresses duplicate broker writes caused by transport retries. Application deduplication uses durable business IDs to suppress repeated commands or effects across restarts and longer time windows.

**Interview answer:**
Producer idempotence handles producer-to-broker retries; application deduplication protects business processing and external effects.

6. How would you configure durability and availability expectations around replication acknowledgments?

**Deep explanation:**
Use replicas across failure domains, `acks=all`, and `min.insync.replicas` greater than one. This protects acknowledged data but can reject writes during failures, so settings must follow explicit RPO and availability goals.

**Interview answer:**
I require multiple in-sync copies before acknowledgment and explicitly accept reduced write availability to meet the durability target.

7. How would you reason about data loss after an unclean leader election?

**Deep explanation:**
An out-of-sync replica may become leader, discarding the former leader's acknowledged tail. Potential loss equals the missing offset range; disabling unclean election favors consistency over availability.

**Interview answer:**
Unclean election trades durability for availability, and the lost data can be the acknowledged records absent from the promoted replica.

8. How would you recover a stream processor's state after a crash?

**Deep explanation:**
Restore a valid checkpoint or snapshot, then replay the changelog from the matching offset. Warm standbys reduce recovery time; checksums prevent using corrupt partial state.

**Interview answer:**
I restore state and offsets from one consistent point, then replay the remaining changelog.

9. How do checkpoints, changelogs, and local state stores interact?

**Deep explanation:**
The local store is the fast working copy, the changelog durably records mutations, and a checkpoint marks consistent progress to reduce replay. State and offsets must never advance inconsistently.

**Interview answer:**
Local state serves processing, the changelog rebuilds it, and checkpoints define where recovery resumes.

10. How would you rebalance stateful processing with minimal interruption?

**Deep explanation:**
Use cooperative rebalancing, sticky assignments, gradual movement, and warm standbys. Drain and checkpoint planned departures, and throttle restoration so it does not overwhelm brokers.

**Interview answer:**
I move only affected partitions and keep standby state warm, minimizing both pause time and restoration work.

11. How would you split a hot partition while preserving business ordering?

**Deep explanation:**
Define the smallest domain requiring order, then add shards outside it. If one indivisible key is hot, strict ordering makes it serial; parallelism requires redesigning that aggregate or relaxing order.

**Interview answer:**
I repartition at a finer business boundary while keeping each ordered entity together; a single hot ordered key cannot be safely parallelized.

12. How would you prevent one tenant from dominating a shared topic?

**Deep explanation:**
Apply per-tenant ingress quotas, fair scheduling, bounded buffers, and tenant-level monitoring. Shard large tenants where ordering permits, and isolate extreme workloads on dedicated topics.

**Interview answer:**
I enforce tenant quotas and fair scheduling, then isolate noisy tenants when shared capacity cannot satisfy fairness.

13. How would you migrate topic partitioning without breaking consumers?

**Deep explanation:**
Create a versioned topic, backfill if needed, dual-publish or bridge new events, and validate shadow consumers. Cut over at a watermark using stable IDs and per-key sequences.

**Interview answer:**
I migrate through a new topic, validate it in parallel, and cut over at a defined watermark with deduplication and rollback support.

14. How would you perform a schema migration involving several independent teams?

**Deep explanation:**
Use registry compatibility rules and expand-contract: add optional fields, deploy tolerant readers before writers, run contract tests, measure adoption, then deprecate old fields.

**Interview answer:**
I coordinate an additive readers-first rollout, enforce compatibility in CI, and remove old fields only after usage proves migration complete.

15. How would you manage event deletion requirements in immutable logs?

**Deep explanation:**
Minimize sensitive data, use erasable references or per-subject encryption keys, enforce retention, and propagate deletion to views, backups, and derived stores. Keep audit evidence without retaining deleted content.

**Interview answer:**
I design for deletion with data minimization, crypto-shredding or retention, and verified propagation to every derived copy.

16. How would you rebuild a materialized view from a compacted topic?

**Deep explanation:**
Replay from the earliest offset into a new view, applying values by key and tombstones as deletes. Catch up, validate counts or checksums, then atomically switch readers.

**Interview answer:**
I rebuild a separate view from the compacted log, honor tombstones, validate it, and switch after it reaches the cutover watermark.

17. What limitations does log compaction impose on complete historical replay?

**Deep explanation:**
Compaction preserves current keyed state, not every intermediate update; old values and tombstones may disappear. Full audit or temporal replay therefore needs a separately retained append-only history.

**Interview answer:**
A compacted topic can rebuild current state but cannot guarantee complete historical replay.

18. How would you design multi-region replication without creating event loops?

**Deep explanation:**
Preserve immutable event IDs, origin region, and route metadata. Use directional topology and filters that prevent sending events back to an origin or visited region, plus deduplication and amplification alerts.

**Interview answer:**
I preserve provenance, constrain replication routes, and filter or deduplicate events already seen by the destination.

19. How would you reconcile messages produced independently during a regional partition?

**Deep explanation:**
Merge by globally unique ID and apply domain-specific conflict rules such as commutative updates or fencing tokens. Non-mergeable financial or inventory conflicts need compensations or review, with originals retained.

**Interview answer:**
I preserve both histories and resolve conflicts using domain semantics, not timestamps alone, emitting auditable compensations where necessary.

20. How would you prevent an event-driven workflow from executing forever in a feedback loop?

**Deep explanation:**
Model allowed state transitions, propagate correlation and causation IDs, emit only on real state changes, and impose hop, retry, and time limits. Quarantine cyclic or exhausted workflows.

**Interview answer:**
I use an explicit state machine, idempotent handlers, causation metadata, and bounded hops and retries.

21. How would you design a saga orchestrator that survives restarts and duplicate events?

**Deep explanation:**
Persist saga state, version, commands, and received IDs. An inbox deduplicates replies; an outbox atomically records state and outgoing commands; every action and compensation is idempotent.

**Interview answer:**
I durably persist the state machine and use inbox/outbox patterns, stable IDs, and version checks so retries are safe.

22. How would you detect missing events when sequence numbers are not globally ordered?

**Deep explanation:**
Track gaps within the scope that is ordered—entity, producer, or partition—and allow a grace period for reordering. Without sequences, reconcile immutable IDs, manifests, counts, or checksums.

**Interview answer:**
I detect gaps per ordered scope and use ID-based reconciliation when no global sequence exists.

23. How would you validate end-to-end delivery guarantees through fault injection?

**Deep explanation:**
Define measurable invariants, then inject crashes around commits, lost acknowledgments, partitions, failovers, rebalances, disk pressure, and late delivery. Reconcile stable IDs and external effects after recovery.

**Interview answer:**
I convert guarantees into invariants and repeatedly fault every commit boundary, proving outcomes by reconciliation.

24. How would you estimate broker disk requirements from throughput, retention, and replication?

**Deep explanation:**
Estimate ingress bytes per second × retention seconds × replication factor, adjusted for compression. Add indexes, compaction lag, bursts, reassignments, skew, and free-space headroom.

**Interview answer:**
I calculate retained replicated bytes, then add measured overhead and operational headroom at both cluster and broker level.

25. How would you diagnose high lag caused by skew, slow consumers, or broker limits?

**Deep explanation:**
Inspect lag and rates per partition. Concentrated lag suggests skew; broad lag with high handler latency suggests consumers; broad lag with disk, network, request latency, or throttling suggests broker capacity.

**Interview answer:**
I correlate partition-level lag with consumer processing and broker saturation metrics to isolate the bottleneck.

26. How would you choose a maximum event-time lateness bound for financial analytics?

**Deep explanation:**
Measure the tail of arrival delays by source and failure mode, then balance completeness, latency, and state cost against settlement deadlines. Often publish provisional results and retain a longer correction window.

**Interview answer:**
I choose the bound from measured tail lateness and business deadlines, with explicit correction handling beyond it.

27. How would you correct published aggregates after very late data arrives?

**Deep explanation:**
Recompute the affected key or window and emit a versioned upsert or a retraction plus replacement. Consumers apply changes idempotently, and the correction remains auditable.

**Interview answer:**
I publish a versioned correction keyed to the aggregate so downstream systems replace, rather than double-count, the prior result.

28. How would you implement retractions and updates in a streaming join?

**Deep explanation:**
Retain keyed join state and stable output IDs. When inputs change, expire, or arrive late, retract the old result and upsert the new one; watermarks and TTL bound how long correction remains possible.

**Interview answer:**
I represent join output as a keyed changelog with idempotent retractions and upserts backed by retained join state.

29. How would you deploy a new stream-processing algorithm while validating output parity?

**Deep explanation:**
Run both versions over identical immutable input into separate sinks. Normalize nondeterministic fields, compare by key/window, test recovery and resource use, then cut over at a checkpoint with rollback.

**Interview answer:**
I shadow the new version, reconcile outputs and operational metrics, and cut over only after explained parity at a defined checkpoint.

30. How would you decide when a batch pipeline is simpler and more reliable than streaming?

**Deep explanation:**
Compare required freshness with the cost of continuous state, late data, backpressure, and recovery. Batch fits bounded inputs, affordable recomputation, and hourly or daily results; streaming is justified when low latency creates concrete value.

**Interview answer:**
I choose batch when coarse freshness and deterministic recomputation outweigh latency; streaming must earn its added operational complexity.
