1. How do object, block, and file storage differ?

**Deep explanation:** Object storage keeps whole objects addressed by keys and is ideal for scalable unstructured data such as images and backups. Block storage exposes raw fixed-size blocks to a host, which builds a filesystem or database on top; file storage exposes shared files and directories through protocols such as NFS or SMB. Object storage scales easily but lacks normal filesystem semantics, while block storage usually offers the lowest-latency random I/O.

**Interview answer:** Object storage manages key-addressed objects, file storage manages shared hierarchical files, and block storage gives a machine raw volumes. I would use objects for blobs, files for shared directory access, and blocks for databases or operating-system disks.

2. What is a blob in an application storage system?

**Deep explanation:** A blob, or binary large object, is an opaque sequence of bytes such as an image, video, document, or archive. The storage system generally does not interpret its internal structure; the application keeps metadata separately so it can find, authorize, and process the blob.

**Interview answer:** A blob is file-like binary content treated as opaque bytes by storage, usually referenced by an ID or object key and described by separate metadata.

3. How do object contents and object metadata differ?

**Deep explanation:** Contents are the actual bytes being stored, while metadata describes those bytes—for example content type, size, checksum, owner, or creation time. Metadata is small and searchable or useful for policy decisions; changing it may not require downloading and rewriting the content.

**Interview answer:** Object content is the payload itself; metadata is descriptive information used to identify, validate, authorize, and manage that payload.

4. What is a storage bucket or container?

**Deep explanation:** A bucket or container is a top-level logical namespace for objects. It commonly provides a boundary for naming, access policies, lifecycle rules, versioning, logging, region, and sometimes billing; it is not necessarily a physical disk or ordinary directory.

**Interview answer:** A bucket is a logical collection and namespace for objects, with policies and configuration applied at that boundary.

5. How do object keys differ from ordinary filesystem paths?

**Deep explanation:** An object key is usually one complete identifier inside a bucket, even if it contains slashes such as `users/42/photo.jpg`. Many object stores have a flat namespace and merely interpret prefixes as folders for listing, so directory operations, atomic renames, and filesystem locking may not exist or may be expensive.

**Interview answer:** A filesystem path traverses real directories, while an object key is normally a single string; slash-separated “folders” are often only key prefixes.

6. Why would an application store large files outside its relational database?

**Deep explanation:** Object or file storage is optimized for large byte streams, cheap capacity, range reads, CDN delivery, and independent scaling. Keeping large blobs out of the database reduces backup size, replication load, transaction-log growth, and cache pollution, while the database can retain a storage key and searchable metadata. The tradeoff is coordinating consistency between two systems.

**Interview answer:** I would keep large files in object storage and store their key and metadata in the database. That is usually cheaper and more scalable and avoids burdening database backups, replication, and caches.

7. How would you store a file's owner, size, checksum, and upload status?

**Deep explanation:** Store these fields in a database record keyed by a generated file ID, along with the object key and timestamps. Use a constrained status such as `pending`, `uploading`, `ready`, or `failed`, update it transactionally, and derive authorization from the owner or an access-control relation. Treat client-supplied size and checksum as claims until the server verifies them.

**Interview answer:** I would create a file-metadata row containing owner ID, object key, expected and verified size, checksum, and a constrained upload status, then mark it ready only after validation succeeds.

8. What is a multipart upload?

**Deep explanation:** Multipart upload divides a large object into independently uploaded parts, often in parallel, and asks the storage service to assemble them after all parts arrive. Failed parts can be retried without retransmitting the entire file, but abandoned sessions must be expired or aborted to avoid storage charges.

**Interview answer:** It uploads a large file as separately retryable parts and completes the object only after every part has been accepted.

9. Why are resumable uploads useful?

**Deep explanation:** Network interruptions are common, especially for large files and mobile clients. A resumable protocol records an upload session and confirmed offset or parts, allowing transfer to continue from the last durable point instead of restarting; this saves bandwidth and time but needs session expiry and idempotent retry handling.

**Interview answer:** Resumable uploads survive interruptions by continuing from the last confirmed byte or part, which is especially valuable for large files or unreliable networks.

10. How would you report upload progress?

**Deep explanation:** On the client, track acknowledged bytes divided by total bytes and emit throttled progress events to the UI. For direct-to-storage or asynchronous processing, the backend can expose uploaded-part state and separate stages such as uploading, validating, and processing. Progress should be based on confirmed bytes, not merely bytes read from disk.

**Interview answer:** I would report confirmed uploaded bytes over total bytes, throttle UI updates, and show post-upload validation or processing as separate states.

11. What is a checksum intended to detect?

**Deep explanation:** A checksum is a compact value computed from content and compared later to detect accidental corruption, truncation, or transmission errors. Strong hashes such as SHA-256 make undetected accidental changes extremely unlikely, but an untrusted attacker can replace both content and an unauthenticated checksum.

**Interview answer:** A checksum verifies integrity by detecting whether stored or transferred bytes differ from the expected content; by itself it does not prove who created the data.

12. How do checksums and cryptographic signatures differ?

**Deep explanation:** A checksum or hash detects changed bytes when compared with a trusted expected value. A digital signature signs a digest with a private key, so verification with the public key also establishes authenticity and integrity. Signatures add key-management and computational costs that ordinary corruption checks do not require.

**Interview answer:** A checksum detects content changes; a cryptographic signature additionally proves that the content was signed by the holder of a private key.

13. What is compression useful for?

**Deep explanation:** Compression reduces stored and transferred byte counts, lowering capacity costs, bandwidth, and sometimes latency. It consumes CPU and can add delay, so it is most beneficial for compressible formats such as text, JSON, and logs, and less useful for tiny or already-compressed content.

**Interview answer:** Compression trades CPU for fewer bytes, reducing storage and network costs when the data is sufficiently compressible.

14. How do lossless and lossy compression differ?

**Deep explanation:** Lossless compression reconstructs the original bytes exactly and suits source code, documents, and data that must not change. Lossy compression discards less perceptible information to achieve much smaller media files, as with JPEG or many audio codecs, but introduces irreversible quality loss.

**Interview answer:** Lossless compression is perfectly reversible; lossy compression sacrifices some information and quality for greater size reduction.

15. Why do already-compressed images often compress poorly again?

**Deep explanation:** Formats such as JPEG, PNG, and WebP have already removed or encoded most repeated patterns that general-purpose compression could exploit. Compressing them again often yields negligible savings and may even increase size because of new headers; lossy re-encoding can reduce size but may degrade quality.

**Interview answer:** Their format has already exploited most redundancy, so another compression pass usually saves little and may add overhead or quality loss.

16. How do encryption at rest and encryption in transit differ for stored files?

**Deep explanation:** Encryption in transit, commonly TLS, protects bytes while they move between clients and services. Encryption at rest protects persisted media, snapshots, and backups, typically with storage-managed or customer-managed keys. Both are needed because they address different exposure points, and neither replaces authorization or secure key management.

**Interview answer:** In-transit encryption protects files over the network; at-rest encryption protects persisted copies. I would use both and control access to the data and keys separately.

17. What is object versioning?

**Deep explanation:** Versioning retains previous variants when an object key is overwritten or deleted, assigning each variant a version identifier. It helps recover from accidental changes and supports audit needs, but increases storage cost and requires lifecycle rules because deleting the current view may only add a delete marker.

**Interview answer:** Object versioning preserves older versions of a key so overwrites or deletes can be recovered, at the cost of additional storage and management.

18. What is a lifecycle policy?

**Deep explanation:** A lifecycle policy automatically transitions or expires objects based on age, prefix, tags, version state, or other conditions. For example, it can move logs to archival storage after 30 days and delete them after a year, reducing cost and enforcing retention—but rules must account for restore requirements and compliance holds.

**Interview answer:** It is an automated rule that moves, expires, or otherwise manages objects over time according to retention and cost requirements.

19. How do hot, cool, and archival storage tiers differ?

**Deep explanation:** Hot storage has low access latency and higher capacity cost for frequently read data. Cool storage lowers capacity cost but typically charges more for reads or requires a minimum storage duration; archival storage is cheapest to retain but may take minutes or hours to restore and can carry retrieval fees. Selection should reflect access frequency and recovery-time needs.

**Interview answer:** Hot is fast and expensive for frequent access, cool is cheaper for occasional access, and archive is cheapest to retain but slowest and often costlier to retrieve.

20. What is a backup compared with a replica?

**Deep explanation:** A replica is a synchronized copy used for availability and quick failover, so corruptions or accidental deletes may propagate to it. A backup is an independent, point-in-time recoverable copy kept to restore past state, ideally isolated and immutable. Replication improves continuity; backup protects recoverability.

**Interview answer:** A replica keeps service available with a current copy, while a backup preserves recoverable historical state. Replication is not a substitute for backup because bad changes can replicate too.

21. How do full, incremental, and differential backups differ?

**Deep explanation:** A full backup copies everything. An incremental copies changes since the latest backup of any type, minimizing backup time and space but requiring the full backup plus the entire incremental chain to restore. A differential copies changes since the latest full backup, grows over time, and restores from only the full plus the latest differential.

**Interview answer:** Full copies all data; incremental copies changes since the last backup; differential copies changes since the last full. Incrementals are smallest, while differentials usually make restoration simpler.

22. What is a restore test?

**Deep explanation:** A restore test actually recovers data from backups into a safe environment and verifies completeness, integrity, permissions, and application usability. It proves that backup procedures, credentials, keys, documentation, and recovery-time objectives work in practice; merely seeing a successful backup job does not do that.

**Interview answer:** It is a planned recovery from backup followed by validation that the restored system is correct and usable within recovery objectives.

23. How do storage durability and availability differ?

**Deep explanation:** Durability is the probability that stored data will not be permanently lost over time. Availability is the probability that the service can successfully serve that data when requested. Redundant offline copies can be highly durable but temporarily unavailable, while a responsive system without adequate redundancy can be available yet insufficiently durable.

**Interview answer:** Durability means the bytes continue to exist; availability means they can be accessed now. A storage design must set separate targets for both.

24. What is retention?

**Deep explanation:** Retention defines how long data or versions must be kept before deletion is allowed or required. Policies may serve business recovery, legal, privacy, or regulatory goals, and immutable retention can prevent even administrators from deleting objects until a deadline. Keeping data indefinitely also has cost and privacy risks.

**Interview answer:** Retention is the rule governing how long data must remain and when it should or may be deleted.

25. How would you restrict who can upload or download a file?

**Deep explanation:** Authenticate the caller, authorize each operation against ownership, roles, or an ACL, and grant only the necessary bucket or object permissions. Prefer short-lived scoped credentials or signed URLs for direct transfers, keep buckets private by default, validate keys server-side, and log sensitive access.

**Interview answer:** I would keep storage private, authenticate users, authorize access from application policy, and issue short-lived permissions scoped to one operation and object.

26. What is an expiring signed URL?

**Deep explanation:** It is a URL containing a cryptographic authorization that lets its holder perform a narrowly defined storage request until a deadline without receiving permanent storage credentials. It is useful for direct uploads or downloads, but it behaves like a bearer token, so its lifetime, method, object key, and optional size or content constraints should be limited.

**Interview answer:** It is a time-limited bearer URL signed by a trusted service that grants a specific upload or download directly against storage.

27. How would you validate a file's size and format?

**Deep explanation:** Enforce size limits while streaming so an attacker cannot exhaust memory or storage. Check the file's magic bytes and parse it with a trusted library rather than trusting its extension or client-provided MIME type; for risky formats, scan or transform it in quarantine before marking it ready. Validation limits abuse but does not make arbitrary content safe to execute.

**Interview answer:** I would enforce a streaming size limit, inspect magic bytes, parse with a safe library, and quarantine or scan risky content before publishing it.

28. How would you generate image thumbnails?

**Deep explanation:** After upload, enqueue a job that decodes the source with a hardened image library, applies orientation, resizes with the aspect ratio preserved, strips unsafe metadata, and writes deterministic thumbnail variants. Run workers asynchronously with memory and pixel limits, retries, and idempotent output keys so large or malformed images cannot block the request path.

**Interview answer:** I would generate thumbnails asynchronously in a constrained worker, validate and decode the image safely, preserve aspect ratio, and store predictable variants for CDN delivery.

29. How would you deliver static files through a CDN?

**Deep explanation:** Put the origin in object storage or behind an HTTP service, configure the CDN to fetch and cache it, and use suitable `Cache-Control`, content type, compression, and CORS headers. Use content-hashed or versioned URLs for long caching and invalidate only when necessary; keep private origins protected and use signed CDN access for restricted files.

**Interview answer:** I would place a CDN before the origin, serve versioned URLs with long cache headers, configure correct content headers, and secure private content with restricted origin access and signed requests.

30. How would you handle a failed upload without presenting the file as ready?

**Deep explanation:** Create metadata in a non-ready state and upload to a temporary or quarantine key. Only after storage completion and server-side validation should an atomic database update mark the file `ready` and expose its final reference; failures become `failed` and a cleanup process removes abandoned parts or temporary objects. Idempotent completion prevents retries from publishing twice.

**Interview answer:** I would keep the record pending and the object private or temporary, then atomically mark it ready only after upload and validation succeed; failures are recorded and cleaned up asynchronously.
