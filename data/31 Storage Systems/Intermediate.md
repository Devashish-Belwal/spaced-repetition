1. How would you design direct-to-object-storage uploads with application authorization?

**Deep explanation:** Authenticate and authorize in the application, reserve a server-generated key, then issue a short-lived presigned URL scoped to that key, method, size, and type. The client uploads directly; the application verifies completion before changing the upload record from pending to available.

**Interview answer:** I would authorize and record the upload first, then give the client narrowly scoped temporary upload access. I would verify the resulting object before publishing it.

2. How would you choose multipart chunk size and parallelism?

**Deep explanation:** Choose a part size that respects minimum-size and maximum-part-count limits; larger parts reduce request overhead but increase retry cost. Increase concurrency until bandwidth is saturated, while watching memory, throttling, errors, and request charges.

**Interview answer:** I would derive part size from object size and provider limits, benchmark moderate parallelism, and adapt it based on throughput and throttling.

3. How would you resume an upload from another device or process?

**Deep explanation:** Persist the provider upload ID, key, fixed part size, and completed-part checksums behind an authenticated application upload ID. A new process can reconcile that manifest with the provider's part list, receive fresh scoped credentials, and upload only missing parts.

**Interview answer:** I would persist multipart state server-side and let an authorized process list completed parts and continue the missing fixed-boundary parts.

4. How would you verify that a completed upload matches the expected content?

**Deep explanation:** Verify size and a cryptographic digest such as SHA-256 using a trusted calculation or provider checksum feature. Do not assume an ETag is a whole-file MD5, especially for multipart uploads, and keep the object unavailable until verification finishes.

**Interview answer:** I would compare the expected byte count and SHA-256 with a trusted final checksum, not rely on ETag semantics.

5. How would you clean up abandoned multipart uploads?

**Deep explanation:** Apply a storage lifecycle rule that aborts incomplete multipart uploads after a safe interval, plus a scheduled reconciler for expired application records. The threshold must allow legitimate slow resumes, and metrics should track orphan count and reclaimed bytes.

**Interview answer:** I would combine lifecycle cleanup with an application reconciliation job based on last activity, and monitor the storage it reclaims.

6. How would you reconcile storage objects with database metadata?

**Deep explanation:** Because the systems lack a shared transaction, model explicit states such as pending, verified, and deleted. Events handle the normal path, while an idempotent periodic scan finds missing objects, orphan objects, and stuck records after a grace period.

**Interview answer:** I would use a state machine plus idempotent events and scheduled reconciliation rather than assume database and storage updates are atomic.

7. How would you prevent users from overwriting another user's object key?

**Deep explanation:** Never accept the authoritative key from the client. Generate an opaque tenant-scoped key, store ownership in the database, presign only that exact key, and use conditional-create semantics or versioning against races.

**Interview answer:** The server generates the key and grants temporary access to exactly that object; ownership is checked from trusted metadata on every operation.

8. How would you handle duplicate filenames and concurrent file versions?

**Deep explanation:** Treat the original filename as display metadata and store every upload under an immutable unique object/version ID. Use an optimistic-lock field or conditional update when changing the pointer to the current version, preserving conflicting versions instead of overwriting them silently.

**Interview answer:** I would separate display names from object IDs, store immutable versions, and use optimistic concurrency to select the current one.

9. How would you design content-addressed storage?

**Deep explanation:** Key immutable blobs by a SHA-256 digest of canonical bytes and keep names and ownership in separate metadata references. Verify size and digest before reusing a blob, then delete unreachable blobs through reference-counted or tracing garbage collection after a grace period.

**Interview answer:** I would store blobs by SHA-256, reference them from metadata records, verify matches, and garbage-collect only unreferenced blobs safely.

10. How would you choose deduplication boundaries without leaking private content?

**Deep explanation:** Global deduplication can reveal that another user possesses known content through timing, quota, or response differences. Prefer tenant/security-domain deduplication and make hit and miss behavior indistinguishable; reserve global dedupe for explicitly public or trusted shared data.

**Interview answer:** I would default to tenant-scoped deduplication and avoid exposing whether a duplicate existed, trading some storage savings for privacy.

11. How would you scan uploads for malware before making them downloadable?

**Deep explanation:** Upload into a private quarantine area and enqueue an idempotent scan that streams the object and records engine version and verdict. Only a clean result transitions it to available; errors, timeouts, and suspicious results remain inaccessible.

**Interview answer:** Every upload stays quarantined until an asynchronous scanner returns a clean verdict, and authorization enforces that state.

12. How would you protect archive extraction from path traversal and decompression bombs?

**Deep explanation:** Canonicalize each output path and reject absolute paths, `..` escapes, links, and special files. Extract in a resource-limited sandbox with caps on entries, expanded bytes, compression ratio, nesting, memory, CPU, and elapsed time.

**Interview answer:** I would require every canonical destination to remain under the extraction root and enforce strict resource limits in an isolated worker.

13. How would you generate and track several image or video variants?

**Deep explanation:** Keep the original immutable and define versioned transformation profiles for thumbnails, previews, codecs, or bitrates. A variant table or manifest records source, profile version, output key, checksum, media properties, status, and errors.

**Interview answer:** I would track each derivative by source plus transformation version, generate it asynchronously, and retain the original as the source of truth.

14. How would you make media-processing jobs idempotent?

**Deep explanation:** Derive an idempotency key from source digest and transformation version, enforce uniqueness, and write to a temporary key before conditionally publishing the verified result. Retries then find or complete the same output instead of producing duplicates.

**Interview answer:** I would use source hash plus transform version as a unique job key and atomically publish one verified output.

15. How would you stream downloads without loading files into application memory?

**Deep explanation:** Prefer redirecting an authorized client to a short-lived signed CDN/object URL. If proxying is required, pipe the storage response through bounded buffers with backpressure, cancellation, and timeouts rather than materializing the file.

**Interview answer:** I would normally issue a signed CDN URL; otherwise I would stream with bounded buffers and close upstream work when the client disconnects.

16. How would you support byte-range requests?

**Deep explanation:** Validate the `Range` against immutable object size, issue the matching ranged storage read, and return `206` with `Content-Range`, `Content-Length`, and `Accept-Ranges`; unsatisfiable ranges get `416`. ETag and `If-Range` prevent mixing bytes from different versions.

**Interview answer:** I would validate and forward ranges, return correct 206 or 416 semantics, and use validators so resumed bytes belong to the same object version.

17. How would you apply object metadata and cache-control headers correctly?

**Deep explanation:** Set trusted content type and safe content disposition rather than trusting a filename, and validate user metadata. Fingerprinted immutable assets can use long public caching with `immutable`; private or mutable files need private/revalidation policies and version-aware validators.

**Interview answer:** I would set headers from trusted metadata and align caching with mutability and authorization: long-lived for versioned public assets, private or revalidated otherwise.

18. How would you handle signed URLs that expire during a large transfer?

**Deep explanation:** Confirm whether the provider checks expiry only when a request begins, because retries and new range requests may still fail later. Estimate TTL from size and conservative bandwidth, or use renewable short-lived URLs after reauthorization for large resumable downloads.

**Interview answer:** I would verify provider expiry behavior, allow transfer and retry margin, and prefer renewable short-lived credentials over one excessively long-lived URL.

19. How would you revoke access to a previously shared file?

**Deep explanation:** Bearer URLs usually remain usable until expiry, so keep them short-lived and issue them through a revocable share record. Urgent revocation may require changing the object path/version, rotating a scoped signing key, and purging caches; already downloaded copies cannot be recalled.

**Interview answer:** I would disable the share and stop issuing short-lived URLs; for urgent revocation I would rotate the object identity and purge caches.

20. How would you choose storage replication across zones or regions?

**Deep explanation:** Map durability, availability, RPO/RTO, latency, residency, and correlated-failure needs to failure domains. Multi-zone replication handles zone loss; cross-region replication adds disaster resilience but also lag, egress cost, and failover/failback complexity that must be tested.

**Interview answer:** I would start with business RPO/RTO and residency needs, use multi-zone for availability, and add tested cross-region recovery when regional risk justifies it.

21. How would you verify the chosen storage service's consistency guarantees?

**Deep explanation:** Read current provider documentation for create, overwrite, delete, list, and replication because guarantees may differ. Run focused concurrent tests to validate assumptions, but base correctness only on contractual guarantees and add versioning or reconciliation for eventual behavior.

**Interview answer:** I would verify guarantees operation by operation in official documentation, test our access patterns, and design only against documented semantics.

22. How would you choose between NFS-style file sharing and object storage?

**Deep explanation:** NFS-style storage fits shared POSIX semantics, directories, in-place mutation, and locks. Object storage fits durable, massively scalable immutable blobs, HTTP access, and lifecycle policies, but rename, locking, and random-write behavior are not filesystem-like.

**Interview answer:** I would choose NFS for shared filesystem semantics and object storage for scalable immutable objects, based on required access behavior rather than capacity alone.

23. How would you handle file locking in a shared filesystem?

**Deep explanation:** Verify documented cross-client lock and partition behavior first. Prefer atomic filesystem primitives or a lease-based coordinator with fencing tokens, because a lease alone cannot stop a paused former owner from writing after a new owner takes over.

**Interview answer:** I would use documented atomic operations or leases with fencing tokens, keep critical sections short, and define stale-lock recovery.

24. How would you avoid many-small-file performance problems?

**Deep explanation:** Tiny files amplify metadata work, request cost, directory contention, latency, and block overhead. Aggregate immutable items into larger segments or a database, shard hot namespaces, and index members, accepting compaction and less-direct per-item deletion.

**Interview answer:** I would measure the overhead, then batch tiny objects into indexed larger segments or store them in a database and shard hot namespaces.

25. How would you benchmark sequential throughput and random IOPS separately?

**Deep explanation:** Measure sequential MB/s with large contiguous transfers; measure random IOPS and latency percentiles with specified block size, read/write mix, queue depth, and working set. Separate warm from cold cache and ensure the load generator, CPU, or network is not the bottleneck.

**Interview answer:** I would run large-block sequential tests for throughput and controlled small-block random tests for IOPS and p50/p95/p99 latency, documenting cache and concurrency settings.

26. How would you choose compression level against CPU and bandwidth cost?

**Deep explanation:** Benchmark representative data across levels, comparing ratio, compression/decompression CPU, latency, memory, and storage or egress savings. Higher levels have diminishing returns, though expensive one-time compression can pay off for read-heavy artifacts.

**Interview answer:** I would choose from measured total cost and latency, usually selecting the lowest level that captures most savings and reserving higher levels for offline reusable content.

27. How would you manage encryption keys separately from encrypted objects?

**Deep explanation:** Use envelope encryption: a per-object data key encrypts bytes, while a KMS/HSM key encrypts that data key; only the wrapped key and algorithm metadata accompany the object. Separate policies, auditing, and duties protect keys, and rotation can rewrap data keys without rewriting all content.

**Interview answer:** I would keep master keys in KMS/HSM and store only wrapped per-object data keys with objects, with separate access controls and audit logs.

28. How would you restore a single file versus an entire application dataset?

**Deep explanation:** A single-file restore uses indexed versions, restores to a safe temporary destination, verifies integrity, then publishes deliberately. Full recovery must restore a consistent point across objects, databases, configuration, and keys in dependency order, followed by validation and controlled cutover.

**Interview answer:** I would restore and verify one file safely without accidental overwrite; for the dataset I would execute a tested point-in-time runbook covering every dependency and cutover.

29. How would you define backup retention and legal-hold behavior?

**Deep explanation:** Translate recovery, regulatory, privacy, and litigation needs into daily/monthly/yearly retention tiers. A legal hold must be precisely scoped, immutable, audited, and override ordinary expiry until authorized release, including across replicas and encryption keys.

**Interview answer:** I would define retention from RPO and compliance requirements, while making legal holds scoped, tamper-resistant, audited, and dominant over normal deletion.

30. How would you estimate total storage cost including replicas, requests, and retrieval?

**Deep explanation:** Model bytes over time after compression and versioning, multiplied by replicas and storage classes, then add operation requests, retrieval, egress, transitions, early-deletion fees, KMS, CDN, backups, and processing. Use expected and worst-case scenarios because request and egress patterns can dominate capacity.

**Interview answer:** I would build a workload model covering growth, versions, replicas, request mix, retrieval and egress, lifecycle fees, encryption, CDN, and backups, then validate it against billing data.
