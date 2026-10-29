1. How would you reshard a live database without losing or duplicating writes?

**Deep explanation:** Copy a consistent snapshot into the new shard layout, then replay source-log changes after the snapshot position. Make replay idempotent, switch routing through versioned metadata, validate checksums and high-water marks, and retain the old shards for rollback.

**Interview answer:** I would snapshot-copy, catch up with CDC, and use idempotent writes during a versioned routing cutover. I would validate parity before retiring the old shards.

2. How would you route requests during shard migration?

**Deep explanation:** Keep per-range states such as source-only, copying, dual-write, and target-only in a strongly consistent shard map. Routers attach an epoch so stale routing is rejected; reads move only after catch-up and can temporarily fall back during verification.

**Interview answer:** I would use an authoritative, epoch-versioned shard map. It controls where reads and writes go at each migration stage and prevents stale routers from writing to the former owner.

3. How would you handle transactions that span shards?

**Deep explanation:** Prefer partitioning that colocates frequently transacted data. Use durable two-phase commit when strict atomicity is essential, or an idempotent saga with compensations when temporary intermediate states are acceptable; 2PC costs latency and can block, while sagas complicate business logic.

**Interview answer:** I would avoid cross-shard transactions by design, use 2PC for truly atomic cases, and use sagas for workflows that can tolerate and compensate intermediate states.

4. How would you preserve uniqueness across partitions without a global bottleneck?

**Deep explanation:** Make uniqueness local by including the shard key when possible. For global uniqueness, hash the unique value to a reservation partition and use a conditional insert; coordination is distributed across many owners, though each individual value still has one serialization point.

**Interview answer:** I would prefer shard-scoped uniqueness. For global keys, I would deterministically route each value to a distributed reservation shard and conditionally claim it before creating the record.

5. How would you compare quorum reads with leader-based reads?

**Deep explanation:** Leader reads are simple and can be linearizable when leadership is safely confirmed, but their latency and availability depend on the leader. Quorum reads avoid a fixed read leader but add fan-out and reconciliation; their exact guarantee depends on membership, versioning, and write protocol.

**Interview answer:** Leader reads are simpler and often strongly consistent; quorum reads can improve placement and availability but cost more work and need reliable version ordering. Neither is automatically linearizable without protocol guarantees.

6. Under what assumptions do overlapping read and write quorums provide useful guarantees?

**Deep explanation:** With (N) replicas, (R + W > N) makes reads intersect prior writes, while (W > N/2) makes write quorums intersect. This assumes the same replica configuration and trustworthy version or epoch ordering; sloppy quorums, clock-only ordering, and reconfiguration can weaken the result.

**Interview answer:** I need (R + W > N), usually (W > N/2), stable membership, and reliable version ordering. Quorum overlap alone does not guarantee linearizability.

7. How would you handle split-brain during database failover?

**Deep explanation:** Require majority consensus or a witness for promotion and fence the old primary with epochs, leases, storage tokens, or revoked credentials. If no quorum exists, stop writes; if both sides already accepted writes, preserve both histories and reconcile by domain rules.

**Interview answer:** I would require quorum to promote and fence the former primary before enabling writes. Without quorum I would favor consistency, and any existing divergence would be reconciled explicitly.

8. How would you prevent a stale primary from accepting writes after failover?

**Deep explanation:** Assign a monotonically increasing leadership term or fencing token and require the storage layer to reject older terms. This remains safe when a paused or partitioned primary returns; network isolation by itself does not.

**Interview answer:** Every leadership change gets a higher fencing token, and the durable write path rejects old tokens. A stale primary therefore cannot commit even if it reconnects.

9. How would you quantify acknowledged-write loss under asynchronous replication?

**Deep explanation:** Track the primary's acknowledged log position against each replica's durable position and express the gap in transactions, bytes, and time. Model the actual promotion policy across failure windows; the loss is the acknowledged set absent from the promoted replica.

**Interview answer:** I would measure acknowledged-primary LSN minus durable-replica LSN and report its distribution as the effective RPO, including the replica the failover policy would actually choose.

10. How would you reconcile concurrent updates in a multi-leader database?

**Deep explanation:** Use causal metadata to distinguish ordered from concurrent changes. Resolve by operation: CRDTs for mergeable sets or counters, deterministic domain merges where valid, and explicit workflow or human resolution for non-commutative updates; last-write-wins can silently discard work.

**Interview answer:** I would detect concurrency with causal versions and choose conflict resolution per data type. Mergeable data uses CRDT-style rules; important non-commutative changes require domain or human resolution.

11. How would you design multi-region data placement for latency and residency constraints?

**Deep explanation:** Classify data by residency, consistency, durability, and traffic, then encode allowed regions as placement constraints. Put leaders near writers, add permitted local read replicas, budget cross-region consensus latency, and apply the same policy to backups, CDC, and analytics.

**Interview answer:** I would turn residency into enforceable placement rules, locate leaders near write demand, and use compliant read replicas. I would also verify failover and every downstream copy obey those rules.

12. How would you handle a tenant that outgrows every other tenant by a hundred times?

**Deep explanation:** Promote it from shared placement to dedicated shards or a database, and sub-shard within the tenant if one node is insufficient. Isolate connections, CPU, and maintenance so it cannot starve smaller tenants while preserving a stable logical routing interface.

**Interview answer:** I would give the tenant dedicated placement and, if needed, shard it by a stable secondary key. Resource pools and routing would isolate it without changing the application's tenant abstraction.

13. How would you move one tenant between databases with minimal disruption?

**Deep explanation:** Copy a consistent tenant snapshot, stream later changes, and manage movement through a per-tenant routing state. At cutover, briefly fence writes or use idempotent dual writes, atomically switch routing, verify checksums, and keep the source read-only for rollback.

**Interview answer:** I would snapshot and CDC-catch up the tenant, briefly control writes at cutover, atomically change its route, validate parity, and retain the source through a rollback window.

14. How would you compare shared tables, separate schemas, and separate databases for tenants?

**Deep explanation:** Shared tables maximize density but demand strong tenant predicates and noisy-neighbor controls. Separate schemas improve logical isolation but multiply migrations; separate databases give the best blast-radius, tuning, and residency isolation at the highest fleet-management cost.

**Interview answer:** Shared tables are cheapest, schemas add logical separation, and separate databases maximize isolation and flexibility. I would choose by compliance, scale, and operational cost, often using multiple tiers.

15. How would you enforce global invariants in an eventually consistent store?

**Deep explanation:** Strict global invariants require a coordination point: consensus-backed conditional writes, a single authority, transactional log, or escrowed rights for bounded resources. Without coordination, redesign the rule as convergent or compensatable and explicitly accept temporary violations.

**Interview answer:** I would coordinate over the smallest possible domain using consensus or conditional writes; escrow can distribute bounded capacity. Arbitrary strict global invariants cannot be guaranteed by eventual consistency alone.

16. How would you detect and repair silent corruption or replica divergence?

**Deep explanation:** Periodically scrub end-to-end checksums and compare replicas through range hashes or Merkle trees. Quarantine mismatches, select a trustworthy copy from quorum, logs, or verified backups, repair only affected ranges, and revalidate them.

**Interview answer:** I would continuously checksum and compare replica ranges, quarantine divergence, reconstruct from a trusted quorum or backup, and verify the repaired data while investigating recurring causes.

17. How do compaction strategies affect write amplification and read latency?

**Deep explanation:** Leveled compaction reduces overlapping SSTables and read amplification but repeatedly rewrites data. Size-tiered compaction favors write throughput but increases read and space amplification; time-window compaction suits expiring time-series data but needs care with late writes and tombstones.

**Interview answer:** Leveled compaction trades more writes for predictable reads, size-tiered favors writes at a read cost, and time-window fits retention-based time series. I would choose from the workload and storage budget.

18. How can tombstones affect performance and correctness in an LSM store?

**Deep explanation:** Tombstones must be checked across SSTables until compaction safely removes both the marker and older values, raising read, disk, and compaction cost. Purging before every replica has learned the delete can resurrect stale data after an outage.

**Interview answer:** Tombstones preserve deletes but create read and compaction overhead. I would monitor density and retain them beyond the repair window so stale replicas cannot resurrect deleted values.

19. How would you design a deletion policy that survives replica outages and backup retention?

**Deep explanation:** Retain versioned delete markers longer than the maximum outage and replay horizon, and rebuild stale replicas before expiry. Propagate deletion to indexes, caches, CDC consumers, and backups through expiry, cryptographic erasure, or restore-time deletion manifests.

**Interview answer:** I would keep durable delete markers beyond the repair window and ensure all downstream copies consume them. Backups would expire or be cryptographically erased, and restores would reapply a deletion ledger before serving.

20. How would you investigate long-running transactions that prevent cleanup?

**Deep explanation:** Map the oldest cleanup-blocking snapshot to its session, query, locks, and application owner. Cancel useful-but-runaway work or terminate idle/abandoned transactions, then prevent recurrence with snapshot-age alerts, transaction timeouts, pool hygiene, and smaller batches.

**Interview answer:** I would identify the oldest snapshot holding back cleanup, trace it to the request, and safely cancel or terminate it. Then I would add age-based alerts and transaction limits.

21. How would you keep CDC snapshots and subsequent log events consistent?

**Deep explanation:** Bind the consistent snapshot to an exact WAL or binlog position, copy from that view, then replay events strictly after the boundary. Use idempotent application and atomically checkpoint offsets with results so overlap and retries neither lose nor duplicate state.

**Interview answer:** I would capture the snapshot and log boundary in one consistency protocol, load the snapshot, and replay from that position with atomic, idempotent checkpoints.

22. How would you recover a consumer after its required change log has expired?

**Deep explanation:** Stop applying incrementally because the missing interval makes state untrustworthy. Rebuild from a fresh consistent snapshot tied to a new log position, catch up in parallel, verify, atomically switch, and then increase retention or improve lag alerts.

**Interview answer:** I would not guess across the gap. I would create a fresh snapshot-plus-log baseline, rebuild and catch up, validate it, and switch atomically.

23. How would you rebuild derived indexes without missing concurrent changes?

**Deep explanation:** Build a shadow index from a consistent snapshot and remember its log position. Replay subsequent versioned mutations until caught up, validate coverage and checksums, atomically swap the alias, and retain the old index for rollback.

**Interview answer:** I would bulk-build a shadow index, CDC-catch it up from the snapshot boundary, verify parity, and atomically switch the index alias.

24. How would you compare database-managed distributed SQL with application-managed sharding?

**Deep explanation:** Distributed SQL supplies transparent routing, transactions, and rebalancing but adds consensus latency and platform constraints. Application sharding offers control and targeted isolation but makes the application own routing, migrations, fan-out, and cross-shard correctness.

**Interview answer:** Distributed SQL reduces application complexity at the cost of consensus overhead and less control. Manual sharding gives control but transfers major correctness and operational work to the application.

25. How would you evaluate external consistency requirements for a global financial ledger?

**Deep explanation:** Define which operations must respect real-time order—posting, balances, limits, and settlement may differ. Use consensus-backed serializable commits, safe timestamps or commit-wait, immutable audit entries, and idempotency where prior completion must be globally visible; budget the cross-region latency explicitly.

**Interview answer:** I would map external consistency to specific money-moving invariants and use real-time-ordered serializable commits for them. I would accept and measure global coordination latency, relaxing only explicitly safe views.

26. How would you perform a database-engine migration with rollback capability?

**Deep explanation:** Backfill from a consistent snapshot, replicate ongoing changes, and shadow-read to uncover semantic differences. Canary the cutover while retaining a replayable log or reverse replication, and postpone source-incompatible schema changes until the rollback window closes.

**Interview answer:** I would backfill, stream changes, shadow-compare, and canary traffic before full cutover. The old engine remains recoverable and current until rollback is no longer required.

27. How would you prove data parity during dual reads and dual writes?

**Deep explanation:** Compare canonicalized values so type, collation, precision, and defaults do not create false mismatches. Use range counts, checksums, semantic query samples, and operation IDs, comparing only after both systems cross the same durable boundary and accounting for expected lag.

**Interview answer:** I would define canonical equality, compare partition checksums and representative reads, and reconcile writes by operation ID after both sides have applied the same operation set.

28. How would you prevent dual-write migration failures from becoming permanent divergence?

**Deep explanation:** Avoid two unrelated writes with no durable recovery record. Commit the authoritative write and an outbox or intent atomically, then apply the second idempotently with retries, dead-letter handling, reconciliation, and lag alerts.

**Interview answer:** I would make one write authoritative and record a transactional outbox event. The second system is updated idempotently and continuously reconciled, turning failures into visible backlog rather than divergence.

29. How would you handle failover when replicas have different schema versions?

**Deep explanation:** Use expand-and-contract schemas that overlap across all live versions and record each replica's schema capability. The failover controller must reject promotion of an incompatible replica; destructive changes wait until applications, replicas, and backfills have converged.

**Interview answer:** I would keep deployments schema-compatible and make schema capability part of promotion eligibility. Cleanup occurs only after every possible failover target supports the new contract.

30. How would you design point-in-time recovery after accidental mass deletion?

**Deep explanation:** Keep tested backups plus continuous archived logs for the required detection window. Restore in isolation to just before deletion, validate, then recover affected rows or cut over while preserving legitimate later writes; secure backup credentials separately from production.

**Interview answer:** I would restore an isolated copy and replay logs to immediately before the deletion, validate it, and recover affected data while merging valid later changes. Regular drills prove the RPO and RTO.

31. How would you test disaster recovery without risking production data?

**Deep explanation:** Restore backups into an isolated network with outbound side effects blocked, then run integrity checks, application tests, and timed RPO/RTO measurements. Separately perform guarded failover exercises with clear abort criteria to validate routing, credentials, runbooks, and people.

**Interview answer:** I would regularly restore into isolation, block integrations, verify data and applications, and measure recovery targets. Controlled failover drills would test the remaining production path with strict guardrails.

32. How would you establish a database capacity model using CPU, IOPS, memory, and connections?

**Deep explanation:** Measure per-request CPU, logical and physical I/O, memory working set, and connection cost by workload class using realistic data and skew. Project peak mix plus replication, maintenance, and failure headroom, identify the binding resource, load-test it, and track prediction error.

**Interview answer:** I would quantify each resource per workload class, apply the expected peak mix and safety headroom, then validate the predicted bottleneck with load tests and production telemetry.

33. How would you reason about tail latency caused by storage compaction or checkpoints?

**Deep explanation:** Correlate p95 through p99.9 latency with bytes compacted, checkpoint duration, dirty pages, queue depth, and I/O wait. Background bursts can create queues despite healthy averages, so smooth or throttle work, reserve I/O headroom, and test under sustained writes.

**Interview answer:** I would correlate tail spikes with compaction and checkpoint telemetry, especially I/O queueing. Then I would smooth background work, preserve headroom, and validate under sustained load.

34. How would you evaluate a new database against actual workload and failure requirements?

**Deep explanation:** Specify transaction shapes, data growth, skew, consistency, availability, residency, RPO/RTO, and operational constraints. Replay representative traffic and inject node, zone, network, disk, upgrade, and resharding failures; score correctness, tail latency, recovery, operability, and total cost.

**Interview answer:** I would test a production-like workload and data distribution against an explicit correctness and failure contract. The decision would include p99 latency, recovery, upgrades, operations, and cost—not just peak throughput.

35. How would you retire obsolete indexes, partitions, and data safely?

**Deep explanation:** Confirm non-use through plans, telemetry, dependencies, retention policy, and owner approval. First make the object invisible or detach it, observe a full business cycle, keep a recovery artifact, and rate-limit physical deletion to avoid locks and I/O spikes.

**Interview answer:** I would prove non-use, disable or detach before dropping, monitor through a representative period, and retain rollback. Cleanup would be throttled and auditable.
