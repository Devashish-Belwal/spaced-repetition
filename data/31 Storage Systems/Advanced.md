1. How would you compare replication and erasure coding for durability, latency, and repair cost?

**Deep explanation:** Replication stores complete copies, such as three replicas. It gives simple, low-latency reads and repairs because any healthy copy can serve the whole object, but its storage overhead is high. Erasure coding splits data into `k` data and `m` parity fragments; any `k` fragments reconstruct the object. It achieves similar durability with much less capacity, but writes and degraded reads require coding work and fragment coordination. Repair can read data from many nodes, consuming more network and CPU, so small or hot objects often use replication while cold, large objects use erasure coding.

**Interview answer:** Replication trades capacity for simplicity and low latency: three copies cost 3× storage but make reads and repair straightforward. A `k+m` erasure code uses much less space and survives `m` fragment losses, but degraded reads, writes, and repairs need more coordination, bandwidth, and CPU. I would choose based on access pattern and failure domain—replication for hot or latency-sensitive data, erasure coding for large durable data where capacity efficiency matters.

2. How would you design repair after losing a storage node containing many fragments?

**Deep explanation:** A repair controller first identifies lost fragments from durable placement metadata, then prioritizes objects by remaining redundancy, access importance, and failure-domain risk. Workers reconstruct fragments from healthy sources and place replacements on nodes that restore rack or zone diversity. Work should be sharded, checkpointed, idempotent, and rate-limited; leases prevent duplicate repair, while generation checks prevent repairing an obsolete version. Repairs are verified by checksum before metadata commits the new location, and the failed location is removed only afterward.

**Interview answer:** I would inventory the missing fragments, prioritize objects closest to losing durability, and distribute reconstruction across many workers. Each repair uses a lease and version check, chooses a destination in the correct failure domain, verifies the reconstructed checksum, then atomically records the new placement. The process is checkpointed, idempotent, and throttled so a node loss does not become a repair storm.

3. How would you prevent repair traffic from overwhelming normal reads and writes?

**Deep explanation:** Treat repair as a lower-priority workload with explicit budgets for disk IOPS, network bandwidth, CPU, and concurrent operations per source and destination. Admission control and token buckets enforce those budgets, while feedback from foreground p99 latency, queue depth, and error rate dynamically reduces repair. Priorities still allow emergency repair for data below a safety threshold. Randomized scheduling, source diversity, and locality-aware reconstruction avoid hotspots, and repair resumes faster during quiet periods.

**Interview answer:** I would isolate and throttle repair with per-node and cluster-wide resource budgets, give foreground traffic priority, and use latency and queue-depth feedback to adjust repair concurrency. Critical under-replicated data gets an emergency lane, but ordinary repair backs off under load. I would also spread reads and destinations to prevent hotspots.

4. How would you detect bit rot and verify stored data over time?

**Deep explanation:** Compute a strong checksum when data enters the system, store it in independently protected metadata, and verify it on every read. A background scrubber periodically reads objects or fragments, recomputes checksums, and compares replicas or parity to distinguish a corrupt copy from correct data. Scrubs should cover all bytes on a measurable schedule, prioritize older and rarely read data, and record results. On corruption, reconstruct from a verified source, write to a new location, verify again, and alert if redundancy is insufficient.

**Interview answer:** I would checksum data at ingestion, protect the checksum separately, verify on reads, and continuously scrub the entire corpus. When a checksum fails, I would use another replica or erasure fragments to reconstruct a known-good copy, verify it, and atomically replace the corrupt one. Coverage, time since last scrub, and unrecoverable-corruption counts would be monitored.

5. How would you design metadata availability separately from bulk-data durability?

**Deep explanation:** Metadata is small, frequently mutated, and needed to locate or authorize data, so it usually belongs in a strongly consistent replicated database with quorum writes, consensus, backups, and fast failover. Bulk data is large and mostly immutable, so replication or erasure coding across failure domains is more economical. Separate SLOs and recovery plans are essential: durable bytes are useless if namespace metadata is unavailable, while available metadata must not point to lost bytes. Store object identities, checksums, and version state transactionally, and rebuild indexes from authoritative records where possible.

**Interview answer:** I would put namespace and placement metadata in a strongly consistent, quorum-replicated store and bulk bytes in a separately durable replicated or erasure-coded layer. Each gets its own SLO, backup, and recovery procedure. Metadata commits must reference verified object versions, and the system should be able to rebuild derived indexes without confusing metadata availability with byte durability.

6. How would you atomically publish a file whose chunks are stored across many objects?

**Deep explanation:** Upload chunks under immutable, unique identifiers and verify each object before exposing the file. Then create a manifest containing ordered chunk IDs, sizes, checksums, and a file version. A single conditional metadata transaction changes the namespace pointer from the old manifest to the new one. Readers follow only committed manifests, so they see either the complete old file or complete new file. Failed uploads leave unreachable chunks for later garbage collection; idempotency keys make retries safe.

**Interview answer:** I would stage immutable chunks first, verify them, and build an immutable manifest. Publishing is one compare-and-swap or metadata transaction that points the filename to that manifest. Readers never observe staged chunks, so publication is atomic; abandoned chunks are safely reclaimed later using a grace period.

7. How would you implement garbage collection for unreferenced chunks safely?

**Deep explanation:** Use mark-and-sweep over a stable metadata snapshot: mark every chunk reachable from live files, retained versions, snapshots, and in-progress uploads, then identify unmarked candidates. Never delete immediately; record a tombstone and wait longer than the maximum transaction, replication, and client-staleness window. Before physical deletion, recheck current references and object generation. Epochs or barriers ensure the marker cannot miss a reference created concurrently, while idempotent deletion and audit logs make retries safe.

**Interview answer:** I would mark reachability from a consistent snapshot, including snapshots and active uploads, and treat unmarked chunks only as candidates. Candidates enter quarantine for a conservative grace period, then are revalidated against current metadata and generation before deletion. Epoch barriers, idempotency, and audit logs protect against concurrent publication and retries.

8. How would you protect chunks still referenced by old snapshots or offline clients?

**Deep explanation:** Snapshots must be first-class roots in the reachability graph, not merely entries hidden from the current namespace. Offline clients need an explicit retention contract: leases, version pins, or a bounded reconciliation window. A client renews its lease while it may still reference an old manifest; expired leases allow collection according to policy. Tombstones and version vectors help returning clients distinguish deletion from absence. Unlimited offline retention is operationally unbounded, so the product must define expiry and recovery behavior.

**Interview answer:** I would include every retained snapshot and active client pin as a garbage-collection root. Offline access would use renewable leases or a documented maximum offline window, with tombstones retained beyond that window. GC cannot reclaim a chunk until all snapshot references and valid client leases are gone.

9. How would you design copy-on-write snapshots and incremental synchronization?

**Deep explanation:** Represent files as immutable chunks and manifests, and directories as immutable or versioned nodes. A snapshot is then a cheap root pointer; modifications write new chunks and copy only nodes along the changed path, sharing everything else. For incremental sync, compare root versions or Merkle hashes and traverse only differing subtrees, transferring missing content-addressed chunks. Reference tracking or tracing GC preserves shared data. The tradeoff is greater metadata complexity and possible fragmentation, offset by fast snapshots and bandwidth-efficient sync.

**Interview answer:** I would use immutable content-addressed chunks plus a persistent tree of manifests. A snapshot stores a root pointer, and updates copy only changed chunks and ancestor nodes. Incremental sync compares Merkle hashes to find changed subtrees and sends only missing chunks; GC understands that many roots can share the same content.

10. How would you resolve concurrent file renames, edits, and deletes?

**Deep explanation:** Give each file a stable identity separate from its path and attach versions or causal metadata to operations. Non-conflicting edits may merge, while rename changes the parent/name link without changing identity. Concurrent operations need explicit deterministic rules: for example, an edit concurrent with rename follows the file identity, two renames create a surfaced conflict, and delete creates a tombstone rather than silently erasing an unseen edit. A transaction log or CRDT can implement the model, but user-visible conflict copies are often safer than lossy automatic resolution.

**Interview answer:** I would separate file identity from pathname and record operations with versions or causal clocks. Renames move the identity, edits target it, and deletes create tombstones. I would merge only demonstrably non-conflicting changes; competing renames or delete-versus-edit become deterministic, visible conflicts rather than silent data loss.

11. How would you preserve filesystem semantics on top of an object store?

**Deep explanation:** Object stores generally lack atomic rename, directories, locking, and POSIX-style consistency, so a metadata service must implement the namespace and synchronization semantics. Store file content as immutable objects, while the metadata layer tracks inodes, paths, permissions, versions, and leases. Atomic operations occur as metadata transactions; write-close publishes a new manifest. Caches require fencing tokens or leases to prevent stale writers. Full POSIX behavior can be expensive, so clearly define unsupported features and consistency guarantees.

**Interview answer:** I would treat the object store as an immutable byte layer and implement filesystem semantics in a strongly consistent metadata service. Stable inode-like IDs, transactional directory entries, manifests, leases, and fencing provide atomic rename and safe writes. I would explicitly document where semantics differ from POSIX because pretending an object store natively supplies them causes correctness bugs.

12. How would you support atomic directory moves without rewriting every descendant object?

**Deep explanation:** Model directories and files with stable IDs, and store parent-child edges in metadata rather than encoding the full path into every object key. Moving a directory changes one edge—its parent and name—in a transaction conditioned on source and destination versions. Descendants remain addressed through their IDs, so no content rewrite occurs. The transaction must reject cycles, handle destination conflicts, and invalidate or version path caches. Very large subtree quotas may require asynchronously recomputed aggregates.

**Interview answer:** I would decouple object identity from full path. A directory move becomes one transactional update to the directory's parent edge and name, with checks for cycles and destination conflicts. Descendant IDs and content stay unchanged; path caches are invalidated using namespace versions.

13. How would you manage petabytes of metadata without one central bottleneck?

**Deep explanation:** Partition metadata by a stable key such as tenant plus inode or hashed directory ID, then replicate each shard with consensus. A routing layer maps keys to shards and supports online splitting and rebalancing. Avoid operations that require global locks or scans; maintain secondary indexes and aggregates asynchronously where exact immediacy is unnecessary. Hot directories may need finer-grained partitioning, cached reads, or dedicated shards. Cross-shard transactions should be rare and use a coordinator only when semantics demand them.

**Interview answer:** I would shard metadata by stable IDs, replicate each shard for strong consistency, and use a versioned routing service for placement and online splits. The schema avoids global scans and locks, hot tenants or directories can be isolated, and derived indexes are asynchronous. Cross-shard transactions are minimized and used only for operations requiring atomicity.

14. How would you migrate storage providers while keeping uploads and downloads available?

**Deep explanation:** Introduce a provider-independent object abstraction and migrate in phases. First dual-write new objects, recording per-provider versions and checksums; reads prefer the new provider but fall back to the old. Backfill existing objects with bounded workers, verify each copy, and maintain a durable migration state machine so retries are idempotent. Reconcile changes that race with copying using generations. After coverage and read-fallback metrics prove safety, stop old writes, wait through rollback and retention windows, then decommission.

**Interview answer:** I would use dual writes, fallback reads, and an idempotent background backfill. Every object has generation and checksum metadata, so a racing update cannot be overwritten by an older copy. I would cut reads and then writes over gradually, validate coverage and errors, retain rollback capability, and remove the old provider only after a defined safety window.

15. How would you validate data integrity during a large storage migration?

**Deep explanation:** Compare strong source and destination checksums tied to object identity and generation, not merely object counts or sizes. The copier verifies after upload and records immutable evidence in a migration ledger. Independent reconciliation scans find missing, extra, stale, or corrupt objects, while stratified sampling and actual read tests validate the end-to-end path. Manifests or Merkle trees make large comparisons efficient. Do not delete the source until all expected generations are verified and discrepancies resolved.

**Interview answer:** I would verify a cryptographic checksum and generation for every copied object and store that result in a durable ledger. Independent reconciliation compares manifests or Merkle trees and performs end-to-end reads, not just count checks. Source deletion is gated on complete verified coverage, resolved exceptions, and a rollback window.

16. How would you design cross-region replication with explicit recovery guarantees?

**Deep explanation:** Begin with business RPO and RTO. Synchronous quorum replication can provide near-zero RPO but adds inter-region latency and may reduce write availability during partitions. Asynchronous replication preserves local latency and availability but permits a measurable replication lag and data loss on failover. Track durable log positions, expose lag, and define promotion fencing so two regions cannot accept conflicting primary writes. Regular failover drills must prove DNS, metadata, keys, dependencies, and capacity—not just copied bytes—meet the stated guarantees.

**Interview answer:** I would derive the design from explicit RPO and RTO: synchronous cross-region quorum for zero or near-zero RPO, or asynchronous log shipping for lower latency with bounded loss. Failover uses durable replication positions, fencing, and a controlled promotion process. Continuous lag metrics and rehearsed regional recovery demonstrate the guarantee.

17. How would you handle a successful metadata write followed by a lost object write?

**Deep explanation:** Avoid publishing metadata before object durability is confirmed. Use a state machine: create an upload record, write and verify the immutable object, then transactionally mark the manifest committed and visible. If metadata already points to a missing object, readers should receive a controlled unavailable state while reconciliation retries from a staging copy, replica, or client upload—not corrupt or partial bytes. Timeouts leave recoverable pending records, and a sweeper aborts or repairs them.

**Interview answer:** I would prevent this ordering with stage-then-publish: the object is durably written and checksum-verified before one metadata transaction makes it visible. Upload states and idempotency handle uncertain outcomes. If an invariant violation still occurs, reconciliation quarantines the version and repairs it from another source rather than serving incomplete data.

18. How would you restore consistency after partial replication of file versions?

**Deep explanation:** Each version should have an immutable ID, parent or causal history, manifest checksum, and commit status. Regions exchange version inventories or logs and fetch missing chunks before marking a version complete. A committed head may advance only to a fully verified manifest. If independent heads arose during partition, apply the product's conflict policy: choose by consensus, merge when safe, or retain both as conflict versions. Tombstones replicate as versions so deletions are not resurrected.

**Interview answer:** I would reconcile immutable version histories, not overwrite files in place. A region fetches and verifies every chunk before marking a version complete or advancing the head. Divergent committed heads are resolved through an explicit merge or conflict policy, and tombstones participate in replication to prevent resurrection.

19. How would you prevent deduplication from revealing that another tenant stores a specific file?

**Deep explanation:** Cross-tenant deduplication creates a confirmation oracle if upload time, quota use, or network behavior differs when content already exists. The safest design deduplicates only within a tenant or trust domain, using tenant-scoped keyed hashes and encryption keys. If global deduplication is unavoidable, authorization and accounting must remain per tenant and responses should be indistinguishable, but timing and side channels are hard to eliminate. Convergent encryption also enables guessing attacks on predictable files and is generally unsuitable across untrusted tenants.

**Interview answer:** I would avoid cross-tenant deduplication and scope content IDs, encryption, and deduplication to each tenant. That prevents an attacker from testing whether another tenant owns known content through timing or quota side channels. Global deduplication offers savings, but its confirmation and convergent-encryption risks usually outweigh them in a multi-tenant service.

20. How would you reconcile deletion requests with immutable backups and legal holds?

**Deep explanation:** Classify every copy by purpose, jurisdiction, retention schedule, and legal-hold status. Delete live data and normal replicas promptly, then let expired backup versions disappear through documented retention and media-recycling processes. A valid legal hold suspends normal deletion for precisely scoped records, with access restricted and actions audited. The privacy response should accurately disclose delayed erasure where law permits. Avoid indefinite backups, and design indexes or cryptographic keys so records can be located and expired reliably.

**Interview answer:** I would enforce a documented retention policy across live stores, replicas, backups, and logs. Deletion removes active copies immediately and schedules backup expiry; legal holds override expiry only for narrowly identified data under audited authorization. I would minimize retention, restrict held-data access, and provide evidence when each eligible copy is destroyed.

21. How would you implement cryptographic erasure and verify key destruction boundaries?

**Deep explanation:** Encrypt data with per-object or small-scope data-encryption keys, wrap those keys with a tenant or retention-domain key in a KMS, and keep plaintext keys out of persistent caches and logs. Erasure destroys all wrapped key material and every recoverable version of the relevant wrapping keys, including replicas, escrow, snapshots, and HSM backups. Key hierarchy boundaries determine the deletion granularity. Verification combines KMS destruction attestations, inventory reconciliation, access-denial tests, and audit trails; ciphertext may remain but must be computationally unrecoverable.

**Interview answer:** I would envelope-encrypt data with narrowly scoped data keys and destroy every recoverable copy of the required key material in the KMS and its backups. The hierarchy is designed so deleting one tenant or object does not affect others. Audit evidence, inventory checks, and attempted decrypts verify the boundary, while acknowledging that cryptographic erasure depends on keys never leaking outside it.

22. How would you design ransomware-resistant backups with separate identities and recovery paths?

**Deep explanation:** Backups should use a separate security account and credentials that production administrators and workloads cannot use to delete or shorten retention. Store versioned, immutable or WORM copies with delayed deletion and multi-party approval for destructive changes. Pull-based backup reduces production's authority over the repository. Recovery needs clean-room infrastructure, offline or break-glass credentials, protected configuration and keys, malware scanning, and regularly tested runbooks. Isolation matters more than simply making another online copy.

**Interview answer:** I would isolate backups in a separate account and identity plane, use immutable retention with multi-party deletion controls, and let the backup system pull data. Production credentials cannot alter history. Recovery uses independently protected break-glass credentials and clean-room automation, and frequent restore drills prove that data, keys, and configuration are usable.

23. How would you test restoration when the primary identity provider is unavailable?

**Deep explanation:** Maintain an emergency authentication path whose credentials, MFA devices, documentation, and authorization policies do not depend on the primary identity provider. In a scheduled exercise, isolate the recovery environment from that provider, activate break-glass access under dual control, retrieve backups and keys, and rebuild critical services. Audit every action and rotate emergency secrets afterward. The drill must also test DNS, certificate issuance, cloud control planes, and communication channels that may indirectly depend on the same identity system.

**Interview answer:** I would run a failover drill with the primary IdP deliberately unavailable. Independently stored, hardware-protected break-glass identities under dual control must access the backup account, keys, infrastructure, and runbooks. We restore in an isolated environment, validate service and data, capture timings, then rotate credentials and fix every hidden IdP dependency found.

24. How would you estimate restore time for a very large archive before promising an RTO?

**Deep explanation:** Model each stage: archive retrieval delay, provider request limits, effective read throughput, network transfer, decryption/decompression, object creation, metadata rebuild, and application validation. Total time is governed by the critical path and slowest bottleneck, not the sum of advertised bandwidths. Include object-count overhead, throttling, retries, capacity ramp-up, and tail latency. Benchmark representative samples and full-scale drills, then state an RTO with percentile, assumptions, headroom, and data-prioritization plan.

**Interview answer:** I would build and benchmark an end-to-end throughput model, including archive thaw time, request rate, bytes, network, compute, metadata reconstruction, and validation. I would use measured effective rates and tail behavior, identify the bottleneck, add retry and capacity headroom, and promise an RTO only with explicit assumptions and a tested confidence level.

25. How would you choose which data to prewarm after a regional recovery?

**Deep explanation:** Rank data using business criticality, expected near-term demand, dependency order, latency penalty when cold, and warming cost. Restore authentication, configuration, metadata, and high-value working sets before rarely accessed archives. Recent access history and predictive models help, but stale regional patterns should not override recovery priorities. Keep an on-demand path for misses and dynamically adjust based on live requests, queue depth, and cache effectiveness.

**Interview answer:** I would prewarm the dependency-critical control data first, then rank application data by business impact, predicted demand, cold-read penalty, and cost. Historical hot sets seed the plan, while live traffic continuously reprioritizes it. Rarely used data remains on demand so warming does not delay service recovery.

26. How would you manage object counts and listing cost at billion-object scale?

**Deep explanation:** Avoid using provider-wide listing as a database operation. Keep an authoritative, sharded metadata index for namespace queries, partition object keys to distribute load, and use immutable manifests for batches or collections. Lifecycle and reconciliation operate by partition, checkpoint, and inventory snapshots rather than repeated full scans. Aggregate tiny objects into larger containers when access patterns allow, reducing request and metadata overhead, but retain an index for range lookup and garbage collection.

**Interview answer:** I would make listings come from a sharded metadata index, not from scanning the object store. Keys and maintenance work are partitioned, inventories are incremental and checkpointed, and small immutable objects may be packed into larger containers. Full provider listings are reserved for periodic reconciliation, not serving requests.

27. How would you design storage quotas that remain correct under concurrent uploads?

**Deep explanation:** Reserve quota before accepting bytes. A strongly consistent counter transaction checks `used + reserved + request <= limit`, then creates a lease-bound reservation. On successful publication, convert reserved bytes to used bytes atomically; on failure or expiry, release them. Multipart uploads can extend reservations incrementally. Idempotency keys prevent retry double-charging, and background reconciliation compares counters with authoritative manifests. Distributed approximate counters may improve admission speed but require a hard authoritative boundary to prevent overshoot.

**Interview answer:** I would use transactional quota reservations with leases. Upload admission atomically reserves expected bytes, completion converts the reservation to usage, and abort or expiry releases it. Idempotency handles retries, and reconciliation repairs drift. That prevents concurrent uploads from each seeing the same remaining capacity and exceeding the limit.

28. How would you support customer-managed encryption keys that can be disabled unexpectedly?

**Deep explanation:** Treat key unavailability as an expected dependency failure. Store ciphertext durably, cache plaintext data keys only briefly in protected memory according to the customer's policy, and return a clear retryable or access-denied error without corrupting metadata. Writes should not publish unless required encryption succeeds. Queue operations only when their semantics and retention are safe, and never silently switch to a provider-owned key. Monitor KMS health and key state, isolate impact per tenant, and give customers recovery guidance.

**Interview answer:** I would fail closed: no plaintext fallback and no publishing writes that were not encrypted with the customer's key. Existing ciphertext remains safe, while reads and writes return explicit key-unavailable errors. Short protected caches may absorb brief outages if policy permits, and per-tenant isolation, monitoring, retries, and runbooks keep one disabled key from affecting others.

29. How would you preserve availability during key rotation and re-encryption?

**Deep explanation:** Envelope encryption separates bulk ciphertext from its small wrapped data key. Rotation can often rewrap data keys under the new key version without rewriting objects. During migration, metadata records the wrapping-key version, and readers support both old and new versions. Workers rewrap idempotently with compare-and-swap, verify decryptability, and checkpoint progress. Keep the old key enabled until coverage, backups, caches, and replicas are reconciled; then disable it, observe, and destroy it only after rollback windows expire.

**Interview answer:** I would use envelope encryption and rotate by rewrapping data keys rather than rewriting all data. Readers accept both key versions while idempotent workers migrate records and atomically update version metadata. The old key stays available until verified coverage and rollback windows pass, so rotation does not create downtime or unreadable objects.

30. How would you prove that a stored object can be recovered after the failures your design claims to tolerate?

**Deep explanation:** A durability claim needs both a model and empirical evidence. Define failure domains and assumptions, calculate loss probability from replica or erasure-code parameters and correlated-failure estimates, and continuously verify placement, checksums, and redundancy. Then inject claimed failures—disk, node, rack, zone, metadata loss, and network partition—in production-like exercises, restore the object through the real path, and validate its checksum. Track repair time versus the window for additional failures and retain auditable test results.

**Interview answer:** I would specify the exact failure model, show that placement and coding meet it analytically, and continuously audit actual redundancy and checksums. Then I would run fault-injection and restore drills that remove the claimed disks, nodes, or zones and recover through the real metadata, key, and data paths. A matching final checksum and measured repair time provide evidence, not merely a configuration claim.
