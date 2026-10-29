1. How do relational and nonrelational databases differ?

**Deep explanation:** Relational databases organize data into tables with defined schemas, relationships, constraints, and SQL; they excel at transactions and joins. Nonrelational databases use models such as documents, key-value pairs, graphs, or wide columns and often favor flexible schemas or horizontal scaling. The choice depends on access patterns, consistency needs, and data shape—not merely data size.

**Interview answer:** Relational databases use structured tables and support joins and strong transactional guarantees. Nonrelational databases use specialized models with more schema flexibility or scaling options. I choose based on the data relationships, query patterns, and consistency requirements.

2. When would a key-value store fit an application?

**Deep explanation:** A key-value store fits when each item is retrieved primarily by a unique key and complex filtering or joins are unnecessary. Common uses include caches, sessions, shopping carts, feature flags, and counters. It offers fast, scalable lookups but limited querying across values.

**Interview answer:** I would use a key-value store for simple, high-volume access by known keys, such as sessions or caching. It is fast and scalable, but it is a poor fit when the application needs joins or rich ad hoc queries.

3. When would a document database fit an application?

**Deep explanation:** A document database suits aggregate-shaped data whose fields vary or evolve, such as product catalogs, content, or user profiles. Related fields can live together in one JSON-like document, making common reads simple. Duplication and cross-document transactions or joins may require extra care.

**Interview answer:** I would choose a document database when data maps naturally to self-contained JSON-like objects and the schema changes frequently. It works well for catalogs and content, provided cross-document relationships and transactions are not dominant.

4. When would a graph database fit an application?

**Deep explanation:** A graph database fits when relationships are central and queries traverse several hops, such as social networks, fraud detection, recommendations, or dependency graphs. It stores nodes and edges directly, avoiding repeated relational joins. It is less compelling for simple tabular reporting or key-based retrieval.

**Interview answer:** I would use a graph database when multi-hop relationship traversal is the core workload—for example fraud rings or social connections. It makes connected-data queries natural and efficient compared with many recursive joins.

5. When would a wide-column database fit an application?

**Deep explanation:** A wide-column database fits massive, distributed workloads with predictable queries, sparse attributes, and high write throughput, such as telemetry or event feeds. Data is modeled around partition and clustering keys rather than normalized joins. Poor key design can create hotspots or expensive scans.

**Interview answer:** I would choose a wide-column store for very large, write-heavy datasets with known access patterns and a need for horizontal scale. The tradeoff is query-driven modeling and limited joins or ad hoc querying.

6. When would a time-series database fit an application?

**Deep explanation:** A time-series database is optimized for timestamped measurements such as metrics, sensor readings, and financial ticks. It commonly provides efficient ingestion, retention policies, compression, time-window aggregation, and downsampling. It is unnecessary when time is not the primary query dimension.

**Interview answer:** I would use a time-series database for timestamped, append-heavy data queried by time ranges, such as monitoring metrics. Its retention, compression, and time aggregation features make that workload efficient.

7. How do OLTP and OLAP workloads differ?

**Deep explanation:** OLTP handles many short, concurrent transactions that read or change a small number of rows, prioritizing low latency and correctness. OLAP scans and aggregates large datasets for reporting and analysis, prioritizing throughput. OLTP commonly uses normalized row storage; OLAP often uses denormalized schemas and column storage.

**Interview answer:** OLTP serves frequent, small operational transactions such as orders and payments. OLAP serves large scans and aggregations for analytics. Their access patterns differ enough that they are often optimized or hosted separately.

8. How do row-oriented and column-oriented storage differ?

**Deep explanation:** Row-oriented storage keeps all columns of a record together, making full-row lookups and writes efficient. Column-oriented storage keeps values from the same column together, improving compression and allowing analytics to read only needed columns. Column stores generally favor scans and aggregates over frequent single-row updates.

**Interview answer:** Row storage is best for transactional access to complete records. Column storage is best for analytical scans over a subset of columns because it reduces I/O and compresses well.

9. What do atomicity, consistency, isolation, and durability mean?

**Deep explanation:** Atomicity means a transaction fully succeeds or has no effect. Consistency means it preserves declared invariants and constraints. Isolation controls how concurrent transactions observe one another. Durability means committed changes survive failures, typically through logs and persistent storage.

**Interview answer:** ACID means transactions are all-or-nothing, preserve database rules, behave safely under concurrency, and remain committed after failures.

10. How does database consistency differ from distributed read consistency?

**Deep explanation:** In ACID, consistency means a transaction moves the database between valid states according to constraints and application invariants. Distributed read consistency describes what versions replicas may return—such as eventual, read-your-writes, or linearizable consistency. One concerns validity; the other concerns visibility and ordering across nodes.

**Interview answer:** ACID consistency means transactions preserve invariants. Distributed read consistency specifies how fresh and ordered reads are across replicas. A database can enforce constraints while still serving stale replica reads.

11. What is normalization intended to prevent?

**Deep explanation:** Normalization reduces duplicated facts and prevents update, insertion, and deletion anomalies. For example, storing a customer's address in every order can produce conflicting addresses when only some rows are updated. Splitting facts into appropriately related tables improves integrity, though joins may increase.

**Interview answer:** Normalization stores each fact in the right place to reduce duplication and prevent inconsistent updates, awkward inserts, and accidental information loss on deletion.

12. How do first, second, and third normal forms differ?

**Deep explanation:** First normal form requires atomic values and no repeating groups. Second normal form adds that every non-key attribute depends on the whole candidate key, preventing partial dependency on a composite key. Third normal form removes transitive dependencies, so non-key attributes depend on the key rather than other non-key attributes.

**Interview answer:** 1NF makes values atomic; 2NF removes dependencies on only part of a composite key; 3NF removes dependencies between non-key attributes. Each step reduces redundancy and anomalies.

13. What is denormalization, and what does it cost?

**Deep explanation:** Denormalization intentionally duplicates or precomputes data to reduce joins and speed reads, such as storing an order total. It costs extra storage, more complex writes, and a risk of inconsistent copies. It should be driven by measured access patterns and accompanied by a reliable update strategy.

**Interview answer:** Denormalization duplicates or precomputes data for faster reads. The tradeoffs are more storage, more complicated writes, and the need to keep duplicated values consistent.

14. How would you model one-to-one, one-to-many, and many-to-many relationships?

**Deep explanation:** For one-to-one, place a unique foreign key on one table or share its primary key. For one-to-many, put the parent's foreign key on the many-side. For many-to-many, use a junction table containing foreign keys to both entities, often with a composite unique constraint and relationship attributes.

**Interview answer:** I model one-to-one with a unique foreign key, one-to-many with a foreign key on the many-side, and many-to-many with a junction table joining both keys.

15. How would you choose a primary key?

**Deep explanation:** A primary key must be unique, non-null, stable, and compact enough for indexes and references. A meaningful natural key is useful only if it truly never changes; otherwise a generated surrogate key avoids coupling identity to business rules. In distributed systems, key generation and insertion locality also matter.

**Interview answer:** I choose a unique, immutable, non-null, reasonably compact key. I prefer a natural key only when it is permanently stable; otherwise I use a generated surrogate and enforce business uniqueness separately.

16. How do natural keys and surrogate keys differ?

**Deep explanation:** A natural key comes from the business domain, such as an ISBN, while a surrogate key is generated solely as an identifier. Natural keys express business identity but may be wide or change. Surrogates are compact and stable but require separate unique constraints to prevent duplicate business records.

**Interview answer:** Natural keys have domain meaning; surrogate keys are generated identifiers. Surrogates usually make stable references easier, while business uniqueness still needs its own constraint.

17. What is a database constraint useful for?

**Deep explanation:** Constraints enforce rules at the data boundary regardless of which application writes the data. Primary keys, foreign keys, unique constraints, checks, and non-null constraints prevent invalid or contradictory states. They complement application validation and protect against races or alternate write paths.

**Interview answer:** Constraints make invariants enforceable by the database—for example uniqueness, required values, valid ranges, and referential integrity. They are a final defense beyond application validation.

18. How do indexes affect reads and writes?

**Deep explanation:** An index maintains an additional searchable structure that can avoid full scans and accelerate filtering, joins, ordering, or uniqueness checks. Every insert, update, or delete may also update relevant indexes, consuming CPU, I/O, and storage. Good indexes match actual queries; excessive or poorly ordered indexes hurt write performance.

**Interview answer:** Indexes speed reads by providing efficient access paths, but they consume storage and add maintenance work to writes. I index frequent selective queries and verify usage with query plans.

19. What is database replication?

**Deep explanation:** Replication maintains copies of data on multiple database nodes by transmitting changes from a leader or coordinating among peers. It can improve availability, disaster tolerance, and read scale. It introduces concerns such as lag, conflict handling, failover, and consistency guarantees.

**Interview answer:** Replication copies data across database nodes for availability, resilience, or read scaling. The design must account for lag, failover, and how consistency is maintained.

20. What is a read replica?

**Deep explanation:** A read replica receives changes from a primary database and serves read-only queries, reducing read load on the primary. Replication is often asynchronous, so its data may lag. Writes and freshness-sensitive reads should go to the primary unless the system provides stronger guarantees.

**Interview answer:** A read replica is a replicated database node used to scale reads and isolate reporting load. Because it may lag behind the primary, it should not serve reads that require the latest write.

21. How do replication and backups differ?

**Deep explanation:** Replication keeps another live copy for availability or scaling, but it can quickly reproduce accidental deletion or corruption. A backup is a point-in-time, independently retained copy used for restoration. Robust systems usually need both, plus tested recovery procedures.

**Interview answer:** Replication provides live redundancy, while backups provide recoverable historical copies. Replicas can copy mistakes immediately, so replication is not a substitute for backups.

22. How do partitioning and sharding differ?

**Deep explanation:** Partitioning divides a logical dataset into smaller pieces, possibly within one database instance. Sharding is horizontal partitioning distributed across multiple independent database nodes. Both improve manageability or scale, but sharding adds routing, cross-shard query, rebalancing, and failure complexity.

**Interview answer:** Partitioning splits data into subsets; sharding specifically distributes those subsets across database servers. Sharding scales beyond one node but adds operational and query complexity.

23. What is a shard key?

**Deep explanation:** A shard key determines which shard stores a record and routes queries to it. A good key has high cardinality, distributes load and storage evenly, and appears in common queries. A poor key creates hotspots or requires scatter-gather queries; changing it later is expensive.

**Interview answer:** A shard key maps records and queries to shards. I choose one that distributes traffic evenly and aligns with common access patterns to avoid hotspots and cross-shard queries.

24. What is a database migration?

**Deep explanation:** A database migration is a versioned change to schema or data, such as adding a table, index, or backfilled column. Safe migrations are repeatable, reviewed, and compatible with rolling application deployments. Large changes may use expand-and-contract steps to avoid long locks and downtime.

**Interview answer:** A database migration is a controlled, versioned schema or data change. I make migrations repeatable and deployment-compatible, using staged changes for large or breaking updates.

25. What is a connection pool intended to control?

**Deep explanation:** A connection pool reuses a bounded set of database connections instead of opening one for every request. This reduces connection setup cost and prevents the application from overwhelming the database. Pool size and timeouts should match database capacity and application concurrency; too many pooled connections can worsen contention.

**Interview answer:** A connection pool reuses connections and caps database concurrency. It reduces setup overhead while preventing request spikes from exhausting the database's connection limit.

26. What is a database lock?

**Deep explanation:** A lock coordinates concurrent access to a resource such as a row, page, table, or key range. Shared and exclusive modes can permit compatible reads while blocking conflicting writes. Locks preserve isolation but may cause waiting, deadlocks, or reduced throughput, so transactions should be short and consistently ordered.

**Interview answer:** A database lock prevents conflicting concurrent operations so transactions remain isolated. The cost is contention and possible deadlocks, which I reduce with short transactions and consistent access order.

27. How do pessimistic and optimistic concurrency control differ?

**Deep explanation:** Pessimistic control locks data before modification, assuming conflicts are likely; it prevents conflicting work but can block. Optimistic control allows concurrent work and detects conflicts at commit, often with a version column, then retries or rejects one update. Optimistic control suits low contention; pessimistic control can suit frequent or costly conflicts.

**Interview answer:** Pessimistic control locks first and blocks conflicts. Optimistic control proceeds without locks, detects a version conflict when writing, and retries or fails. I choose based on contention and the cost of retries.

28. What is replication lag?

**Deep explanation:** Replication lag is the delay between a change committing on the source and becoming visible on a replica. It can grow because of network latency, heavy writes, slow replay, long queries, or failures. Lag produces stale reads and can affect failover recovery objectives, so it should be monitored.

**Interview answer:** Replication lag is the time a replica trails the primary. It causes stale reads and potentially greater data loss during failover, so I monitor it and route freshness-sensitive reads appropriately.

29. Why can a successful write be invisible on a subsequent replica read?

**Deep explanation:** With asynchronous replication, the primary can acknowledge a commit before a replica has received and replayed it. An immediate read routed to that replica may therefore return the previous version. Read-your-writes can be achieved by reading from the primary, using session stickiness, waiting for a replication position, or choosing stronger consistency.

**Interview answer:** The write committed on the primary, but asynchronous replication has not applied it to the replica yet. For read-your-writes behavior, I would temporarily read from the primary or use a consistency mechanism tied to the write position.

30. How would you choose storage for a small e-commerce application?

**Deep explanation:** Start with a relational database because products, customers, inventory, orders, and payments have relationships, constraints, and transactional updates. Add object storage for images and perhaps a cache or search engine only when demonstrated needs justify them. For a small system, one well-managed relational database minimizes operational complexity while preserving correctness.

**Interview answer:** I would start with a relational database for transactional integrity and relational queries, plus object storage for product images. I would add caching or dedicated search only after measuring a need, keeping the initial architecture simple.
