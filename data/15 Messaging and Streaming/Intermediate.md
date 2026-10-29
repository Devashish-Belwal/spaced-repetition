1. How would you choose between Kafka, RabbitMQ, and a managed queue?

**Deep explanation:**
Choose from the workload. Kafka excels at durable, replayable streams, high throughput, partitioned ordering, and independent consumer groups. RabbitMQ fits work distribution, flexible routing, acknowledgments, and low-latency messaging. A managed queue minimizes operations but may offer less control or replay. Compare delivery guarantees, ordering, retention, ecosystem, cost, and team expertise.

**Interview answer:**
I use Kafka for replayable high-throughput event streams, RabbitMQ for rich routing and work queues, and a managed queue when operational simplicity matters most. I validate the choice against ordering, retention, guarantees, cost, and team skills.

2. How would you choose a partition key for ordered processing?

**Deep explanation:**
Use the smallest business entity whose events must stay ordered, such as `accountId`. All events for that key reach one partition, while different keys run concurrently. The key should have high cardinality and distribute traffic evenly; a coarse key such as country can create hot partitions. Split a hot entity only if weaker ordering is acceptable.

**Interview answer:**
I choose the narrowest key that defines the ordering boundary and verify that its values distribute load evenly. That preserves per-entity order without sacrificing unnecessary parallelism.

3. How does partition count limit consumer parallelism?

**Deep explanation:**
Within one consumer group, a partition normally has one active consumer, so useful parallelism cannot exceed the partition count. Extra consumers remain idle; fewer consumers each own multiple partitions. More partitions raise potential throughput but also metadata, rebalance, and operational costs.

**Interview answer:**
Useful parallelism in a consumer group is capped by partition count because each partition has one active owner. Adding consumers beyond that count does not increase throughput.

4. How would you preserve per-user ordering without global ordering?

**Deep explanation:**
Partition messages by user ID so each user's events share one ordered lane while different users run concurrently. A stable producer key is essential; per-user sequence numbers can detect gaps or duplicates. A global lock would serialize unrelated users and reduce throughput.

**Interview answer:**
I key events by user ID so one user's events reach the same ordered partition. Different users remain parallel, and sequence numbers can detect missing or reordered events.

5. When should a consumer commit its offset?

**Deep explanation:**
Commit after all required durable effects succeed, such as a database transaction. Committing first risks lost work after a crash; committing later permits redelivery, so processing must be idempotent. With concurrent batches, advance only across a contiguous range of completed offsets.

**Interview answer:**
I commit only after processing and its durable effects succeed. That provides at-least-once behavior: crashes may cause duplicates, but not silent loss.

6. How would you prevent lost work when committing offsets?

**Deep explanation:**
Disable unsafe auto-commit and acknowledge only successful processing. Use a transaction when state and offsets share a system; otherwise make effects idempotent and commit afterward. Never commit past unfinished concurrent records. Failed work must block progress, retry, or be deliberately dead-lettered before advancing.

**Interview answer:**
I acknowledge only after durable completion and never advance beyond unfinished work. Where atomic offset-and-state commits are unavailable, idempotency makes redelivery safe.

7. How would you avoid duplicate database writes after redelivery?

**Deep explanation:**
Give each logical message a stable event ID and record it in the same database transaction as the business update. A unique constraint makes concurrent duplicates harmless: the first succeeds and later attempts become no-ops. Naturally idempotent operations may instead use an upsert or version check.

**Interview answer:**
I store a stable event ID under a uniqueness constraint in the same transaction as the business write. Redelivery then becomes a no-op rather than a duplicate update.

8. How would you design a deduplication table and retention policy?

**Deep explanation:**
Store a scoped idempotency key, status, timestamps, and optionally a result or checksum. Enforce uniqueness on scope plus key and insert it atomically with the effect. Retention must exceed the maximum replay window, including queue retention and disaster recovery. Expire rows in indexed batches or time partitions.

**Interview answer:**
I enforce a unique `(consumer, event_id)` key and record it atomically with the effect. I retain entries longer than the maximum replay window and delete them incrementally.

9. How would you coordinate a database update with publishing an event?

**Deep explanation:**
A direct database commit followed by publish has a crash gap; publishing first has the inverse gap. Usually, write the business change and an outbox row in one local transaction, then publish asynchronously. Consumers still need idempotency because the relay may publish more than once.

**Interview answer:**
I use a transactional outbox: commit the business update and event record together, then publish from the outbox asynchronously. Idempotency handles repeated publishes.

10. How would you use the outbox pattern with CDC?

**Deep explanation:**
Insert an immutable outbox record in the same transaction as the domain change. A CDC connector reads committed log changes and publishes them, commonly routing by aggregate type and ID. Monitor connector lag, use stable event IDs and versions, and clean rows only after CDC has safely advanced.

**Interview answer:**
I write the domain change and outbox event atomically, then use CDC to stream committed inserts to the broker. I monitor lag and clean rows only after confirmed capture.

11. How would you handle a job that exceeds its visibility timeout?

**Deep explanation:**
Use a conservative initial timeout and extend it while the worker makes progress. Make execution idempotent because renewal and completion can race with redelivery. Split long work into checkpointed stages, cap runtime, and stop if ownership is lost.

**Interview answer:**
I renew the visibility lease during healthy processing, make the job idempotent, and checkpoint or split long jobs. If lease ownership is uncertain, the worker stops.

12. How would you renew a job lease safely?

**Deep explanation:**
Renew before expiry with jitter and enough network margin. Use a receipt or fencing token so only the current owner can renew or commit results; each acquisition gets a newer generation. Treat ambiguous failures as lost ownership and cancel the task.

**Interview answer:**
I renew early using the current lease token and stop if renewal cannot be confirmed. A fencing generation prevents stale workers from committing after reassignment.

13. How would you decide which failures are retryable?

**Deep explanation:**
Retry only when another attempt may change the outcome. Timeouts, throttling, temporary outages, and some conflicts are transient; invalid schemas, validation failures, and authorization errors are usually permanent. Use typed errors, bounded exponential backoff with jitter, and idempotency for ambiguous side effects.

**Interview answer:**
I retry transient failures such as timeouts and throttling, but dead-letter permanent failures such as malformed input. Retries are bounded, jittered, and safe through idempotency.

14. How would you prevent retry queues from causing unbounded delays?

**Deep explanation:**
Set maximum attempts and total message age, then dead-letter exhausted work. Use finite delay tiers and capped backoff. Monitor end-to-end age and retry volume, and isolate retries so they cannot consume all capacity needed by fresh traffic.

**Interview answer:**
I bound retries by attempts and total age, cap backoff, and dead-letter exhausted messages. I monitor oldest age and reserve capacity for fresh work.

15. How would you investigate and replay dead-lettered messages?

**Deep explanation:**
Retain the original payload, event ID, schema version, failure reason, attempt history, and correlation IDs. Group and reproduce failures safely, fix the consumer or data, then replay selected messages through an audited, rate-limited tool. Never blindly requeue the entire DLQ; keep consumers idempotent.

**Interview answer:**
I diagnose using failure metadata and traces, fix the cause, then replay selected messages through an audited, rate-limited path. Idempotency makes replay safe.

16. How would you implement delayed and scheduled messages?

**Deep explanation:**
Prefer native delayed delivery when its limits fit. Otherwise store schedules durably by due time and run a scheduler that claims due rows and publishes idempotently. Handle clock skew, cancellation, rescheduling, duplicate publication, and recovery explicitly.

**Interview answer:**
I prefer native scheduling; otherwise I use a durable table indexed by due time and an idempotent publisher that claims due work. The design supports cancellation and recovery.

17. How would you support message priorities without starving normal work?

**Deep explanation:**
Separate priority classes and apply weighted fair scheduling, such as several urgent items followed by one normal item. Reserve capacity for normal traffic and limit which producers can mark work urgent. Strict priority can starve normal messages indefinitely.

**Interview answer:**
I use separate priority lanes with weighted fair consumption and reserve capacity for normal traffic. I also limit priority usage and monitor queue age per class.

18. How would you handle schema evolution using Avro, Protobuf, or JSON schemas?

**Deep explanation:**
Register versioned schemas and enforce compatibility in CI or a registry. Prefer additive optional fields with defaults; preserve Protobuf field numbers and never change field meaning silently. Consumers should tolerate unknown and absent fields. Use a new event version or type for breaking semantic changes.

**Interview answer:**
I version contracts, enforce compatibility automatically, and evolve additively with optional fields and defaults. Breaking changes get a new version or event type.

19. How do backward, forward, and full schema compatibility differ?

**Deep explanation:**
Backward compatibility means new readers can consume old data. Forward compatibility means old readers can consume new data. Full compatibility guarantees both. Registry policies may compare only with the latest version or transitively with all prior versions.

**Interview answer:**
Backward means new consumers read old data; forward means old consumers read new data; full means both. I also verify whether enforcement is transitive.

20. How would you manage a consumer rebalance without dropping in-flight work?

**Deep explanation:**
On revocation, stop fetching, finish or cancel bounded in-flight work, and commit only contiguous completed offsets. Leave unfinished work uncommitted for idempotent redelivery. Cooperative rebalancing, static membership, and pause/resume can reduce disruption.

**Interview answer:**
I pause intake, drain bounded in-flight work, and commit only safely completed offsets. Unfinished records remain uncommitted and are safe to redeliver.

21. How would you measure throughput, lag, processing time, and retry rate?

**Deep explanation:**
Measure ingress and successful completion rates separately. Track offset lag plus oldest-event age because record counts alone mislead. Report processing latency as p50/p95/p99 and separate queue wait from handler time. Track retries by attempts, unique messages, cause, and terminal outcome, avoiding unbounded metric labels.

**Interview answer:**
I track produced and completed rates, offset lag and oldest age, latency percentiles, and retries by cause and terminal outcome. Alerts use trends and service objectives.

22. How would you apply backpressure to producers?

**Deep explanation:**
Use bounded buffers and block, reject, or shed work when capacity is exhausted rather than growing memory indefinitely. Reduce rate or concurrency based on acknowledgments, queue age, or throttling. Batch carefully, propagate retry hints, and define which traffic may be dropped.

**Interview answer:**
I use bounded buffers and rate or concurrency limits tied to downstream health. At saturation I block or reject explicitly with retry guidance.

23. How would you autoscale consumers when partition count is fixed?

**Deep explanation:**
Scale active consumers only up to partition count; extra replicas are standby. Use lag growth, oldest age, processing rate, and CPU, with stabilization against churn. If all partitions are occupied and lag grows, optimize handling or deliberately increase partitions after assessing ordering and cost.

**Interview answer:**
I scale on lag age and throughput, capped at partition count. If lag still grows at that cap, I optimize processing or repartition; more replicas alone will not help.

24. How would you route large payloads without placing every byte in a message?

**Deep explanation:**
Use the claim-check pattern: store content in private object storage and send a key, size, checksum, type, and authorization context. Encrypt it, define retention and cleanup, and have consumers verify integrity and handle missing objects. Avoid long-lived public URLs.

**Interview answer:**
I place large content in object storage and publish a private claim-check reference with metadata and checksum. Access, retention, deletion, and missing-object behavior are explicit.

25. How would you secure topic access and redact sensitive payloads?

**Deep explanation:**
Use least-privilege service identities and separate produce, consume, and admin ACLs. Encrypt traffic and storage, rotate credentials, audit access, and isolate sensitive topics. Minimize, tokenize, or field-encrypt sensitive data, including in logs, headers, DLQs, traces, and replay tools.

**Interview answer:**
I enforce least-privilege topic ACLs, strong identities, encryption, rotation, and auditing. I minimize or tokenize sensitive fields and apply redaction across logs, traces, DLQs, and replay tools.

26. How do processing time and event time differ?

**Deep explanation:**
Event time is when the business event occurred; processing time is when the system handled it. Processing-time windows are simple but change under delivery delay. Event-time windows remain business-correct with delayed events but require watermarks, state, and late-event policies.

**Interview answer:**
Event time is when an event happened; processing time is when it was handled. I use event time when delays or reordering must not distort results.

27. What are tumbling, sliding, and session windows?

**Deep explanation:**
Tumbling windows are fixed, adjacent, and non-overlapping. Sliding windows overlap, so one event may enter several windows. Session windows group activity until an inactivity gap occurs, making boundaries data-dependent.

**Interview answer:**
Tumbling windows are non-overlapping buckets, sliding windows overlap and update periodically, and session windows group bursts separated by inactivity.

28. How would you handle late or out-of-order events?

**Deep explanation:**
Process by event time with watermarks and keep state for an allowed-lateness interval. Late arrivals within that interval update results through upserts or retractions; later ones enter a correction path. More allowed lateness improves accuracy but increases state and delays finality.

**Interview answer:**
I use event-time windows, watermarks, and explicit allowed lateness. Timely late events revise results; extremely late ones follow a defined correction path.

29. What is a watermark used for in stream processing?

**Deep explanation:**
A watermark estimates that most events earlier than a timestamp have arrived. It lets the engine close windows, emit results, and reclaim state without waiting forever. It is not a guarantee, so late-event behavior remains necessary; idle inputs must also be detected to avoid stalling progress.

**Interview answer:**
A watermark estimates event-time progress so windows can finalize and state can be released. Because it is an estimate, late-event correction rules are still required.

30. How would you join two event streams with different arrival delays?

**Deep explanation:**
Key both streams by the join key and buffer records for a bounded event-time interval. Configure watermarks and retention for the slower delay distribution, then define inner or outer semantics and behavior for duplicates, missing matches, and arrivals beyond the horizon. Unbounded delays may favor lookup enrichment instead.

**Interview answer:**
I co-partition by join key and use a bounded event-time interval join sized for the slower stream. Watermarks close the horizon, with explicit late and missing-match behavior.

31. How would you maintain a running aggregate with corrections?

**Deep explanation:**
Store keyed aggregate state plus event IDs or versions. Represent corrections as compensating deltas or changelog before/after records, and upsert into a version-aware sink. Deduplicate input and checkpoint state atomically with stream progress; retain a changelog for rebuilding.

**Interview answer:**
I keep checkpointed keyed state and emit aggregates as versioned upserts or changelogs. Corrections use compensating deltas, with deduplication preventing repeated adjustments.

32. How would you replay historical events without repeating external side effects?

**Deep explanation:**
Separate deterministic state computation from external commands. Replay into a new consumer group, shadow topic, or rebuilt state store with side-effect adapters disabled. If effects cannot be separated, gate them with stable idempotency keys and a durable completion ledger. Tag replay traffic distinctly.

**Interview answer:**
I replay through a side-effect-free projection path into new state. If effects are unavoidable, stable idempotency keys and a durable effect ledger prevent repetition.

33. How would you test consumer logic against malformed and duplicate messages?

**Deep explanation:**
Use contract fixtures and fuzz tests for missing fields, wrong types, unknown versions, oversized values, and corrupt data. Deliver the same event repeatedly and concurrently, and inject crashes between the business write and acknowledgment. Real-broker integration tests should verify final state, retries, metrics, and DLQ behavior.

**Interview answer:**
I combine schema and fuzz tests with integration tests that redeliver duplicates and crash at acknowledgment boundaries. I assert correct final state, deduplication, retries, and dead-lettering.

34. How would you handle a message referring to a record that is not yet visible?

**Deep explanation:**
First avoid the gap by publishing through an outbox after commit. If replication or separate streams still delay visibility, treat the missing dependency as transient and use bounded backoff or a pending-reference buffer. After a maximum age, reconcile or dead-letter instead of retrying forever.

**Interview answer:**
I publish only after commit where possible. Otherwise I retry or buffer the transient missing dependency with a time limit, then send unresolved cases to reconciliation.

35. How would you define an event contract that does not expose internal database structure?

**Deep explanation:**
Model a stable business fact such as `OrderShipped`, not a table row or CRUD action. Include event ID, aggregate ID, occurrence time, schema version, and only needed business data. Avoid internal column names and relationships so storage can evolve independently.

**Interview answer:**
I publish domain facts rather than database rows, with stable identity, time, version, and minimal business fields. The contract owns business semantics independently of storage.
