1. How would you diagnose a query whose estimated and actual row counts differ greatly?

**Deep explanation:** Compare estimated versus actual rows at each plan node with `EXPLAIN ANALYZE`, starting at the earliest large divergence. Common causes are stale statistics, data skew, correlated predicates, expressions without statistics, or parameter-sensitive plans. Refresh or increase statistics, add extended statistics where supported, and rewrite non-sargable predicates; remember that executing an actual plan can affect production.

**Interview answer:** I compare estimated and actual rows node by node and fix the first major estimation error. I check statistics freshness and granularity, skew, correlated columns, parameters, and non-sargable predicates, then validate the corrected plan with representative values.

2. How can data skew and correlated columns mislead a query planner?

**Deep explanation:** Basic statistics often assume uniform values and independent predicates. A rare status may be concentrated in one region, so multiplying separate selectivities severely underestimates or overestimates rows and can select a bad join or scan. Histograms, higher statistics targets, multicolumn/extended statistics, filtered indexes, and representative plan tests reduce this risk.

**Interview answer:** Planners commonly estimate uniform distributions and predicate independence, which skew and correlation violate. I use histograms or extended multicolumn statistics, suitable indexes, and representative parameter tests to improve estimates.

3. How would you investigate a query plan that changes after a parameter value changes?

**Deep explanation:** Capture plans, timings, row counts, and parameter values for selective and nonselective cases. Determine whether the database reuses a generic/cached plan or compiles a custom one—often called parameter sniffing—and whether statistics accurately model both values. Possible remedies include better statistics/indexes, query-shape separation, controlled recompilation, or plan controls, chosen only after measuring workload-wide effects.

**Interview answer:** I compare plans for representative parameters and inspect plan-cache behavior and estimates. If one plan cannot serve both selective and broad values, I improve statistics/indexes or deliberately split/recompile the query rather than blindly forcing one plan.

4. How would you distinguish lock waits from slow execution in a query timeout?

**Deep explanation:** Inspect active sessions and wait events while the timeout occurs. A blocked query shows a lock wait plus a blocker chain and little CPU or I/O progress; genuinely slow execution accumulates CPU, reads, spills, or other resource waits. Correlate database activity, lock views, query plans, and application timeout logs because the client may report both as the same timeout.

**Interview answer:** During the incident I inspect wait events and blocking chains. Lock waits identify a blocker and minimal execution progress; slow queries show CPU, I/O, spills, or costly plan operators, so I correlate those facts with the client timeout.

5. How would you analyze a deadlock involving several SQL statements?

**Deep explanation:** Use the database deadlock graph/log to reconstruct the wait-for cycle: transactions, locked resources, lock modes, statements, and acquisition order. Map statements back to full transaction boundaries, not just the victim statement. Fix inconsistent access order, excessive transaction scope, missing indexes, or unnecessarily strong locks; retries handle victims but do not remove the cause.

**Interview answer:** I read the deadlock graph, rebuild the resource cycle, and trace every statement to its transaction. I then standardize lock order and shorten transactions, improving indexes or lock modes as needed, while safely retrying the chosen victim.

6. How would you design retries for serialization failures?

**Deep explanation:** Retry the entire transaction from a clean transaction state, not only the failed statement, because its earlier reads are invalid. Use a small bounded attempt count with exponential backoff and jitter, make external side effects idempotent or defer them through an outbox, and record retry metrics. Return a clear retriable error after exhaustion.

**Interview answer:** I retry the whole transaction with a fresh snapshot, bounded exponential backoff, and jitter. I keep side effects idempotent or publish them after commit, and monitor retry rates so contention is fixed rather than hidden.

7. How would you demonstrate write skew using a real business invariant?

**Deep explanation:** Model an on-call rule requiring at least one doctor available. Two concurrent transactions each read two available doctors, see the invariant satisfied, and independently mark a different doctor unavailable; under snapshot isolation both commits can succeed because they update different rows, leaving none available. Serializable isolation, explicit locking of a shared invariant row/set, or a redesigned constraint prevents it.

**Interview answer:** I use the “at least one doctor on call” example: two snapshot transactions read both doctors and each removes a different one, so no write conflict occurs but the invariant breaks. Serializable isolation or locking a shared invariant resource prevents it.

8. How would you choose between explicit locking and serializable isolation?

**Deep explanation:** Explicit locking is useful when the exact invariant rows and lock order are clear; it can be efficient but is easy to omit and may deadlock. Serializable isolation protects broader predicate-based invariants automatically but can abort transactions and requires retry logic. Choose using contention, invariant complexity, database implementation, latency targets, and measured abort/blocking rates.

**Interview answer:** I prefer explicit locks for a small, well-defined resource set and serializable isolation for complex or predicate-based invariants. I compare blocking and deadlock risk against serialization aborts, and always design the required retry behavior.

9. How would you claim queue jobs using row locks without blocking other workers?

**Deep explanation:** In one short transaction, select eligible jobs in deterministic order using row locks plus `SKIP LOCKED`, limit the batch, and atomically mark them claimed with worker ID and lease expiry—often via `UPDATE ... RETURNING`. Commit before doing long work. A lease and idempotent processing allow recovery after worker failure.

**Interview answer:** I select a small ordered batch `FOR UPDATE SKIP LOCKED`, atomically mark ownership and lease expiry, return the rows, and commit immediately. Processing happens outside that transaction and is idempotent so expired claims can be retried.

10. How would you avoid starvation when using SKIP LOCKED?

**Deep explanation:** `SKIP LOCKED` improves throughput but repeatedly bypassed or newly prioritized rows may never run. Use stable age-based ordering, bounded priority aging, short claim transactions, lease expiry, and a periodic sweeper that targets old unprocessed jobs without skipping indefinitely. Track oldest-job age rather than only queue throughput.

**Interview answer:** I combine deterministic age ordering with priority aging, short leases, and a sweeper for overdue jobs. I monitor maximum queue age so high throughput cannot conceal a starved row.

11. How would you create an index on a busy production table without excessive blocking?

**Deep explanation:** Use the engine's online or concurrent index-build feature, verify disk, I/O, replication, and transaction-age headroom, and throttle or schedule around peak load. Long transactions can delay completion, and online builds may still take brief metadata locks. Afterward verify validity and plan adoption; remove a failed invalid artifact using the engine's safe procedure.

**Interview answer:** I use an online/concurrent build, first checking long transactions, capacity, replica lag, and the operation's brief lock phases. I monitor progress and workload impact, then validate the index and query plan before treating it as complete.

12. How would you add a non-null constraint to a large existing table safely?

**Deep explanation:** First make new writes supply the value, backfill existing nulls in small resumable batches, and continuously verify none remain. Where supported, add an equivalent `CHECK (col IS NOT NULL)` without a full scan, validate it online, then convert or attach the formal `NOT NULL` metadata with a short lock. Keep deployment steps backward-compatible and separately reversible.

**Interview answer:** I stop new nulls, batch-backfill old rows, validate an equivalent constraint online, and only then promote it to `NOT NULL` during a controlled short-lock step. I monitor null counts, blocking, and replication throughout.

13. How would you backfill a new column while old and new application versions coexist?

**Deep explanation:** Follow expand-and-contract: add the nullable column, deploy code that can read either representation and dual-write safely, then backfill in keyed, idempotent batches. Reconcile mismatches while mixed versions run, switch reads after completion, enforce constraints, and remove legacy behavior only after all old versions disappear. Define which field wins if concurrent updates differ.

**Interview answer:** I use expand-and-contract with compatible reads, idempotent dual writes, and a throttled key-range backfill. After reconciliation and full rollout, I switch reads, add constraints, and later remove the old path.

14. How would you optimize a query that spills sorting or hashing to disk?

**Deep explanation:** Confirm spill operators, volume, estimates, and memory grants in the actual plan. Reduce input early with selective predicates and joins, add an index that supplies required order or join keys, remove unnecessarily wide columns, and correct cardinality estimates. Increase per-query memory only after concurrency analysis because many larger grants can exhaust server memory.

**Interview answer:** I identify the spilling operator and why its input or grant is wrong. I first reduce and narrow rows or provide useful ordering/indexes, fix estimates, and only then tune memory with workload concurrency in mind.

15. How would you evaluate whether a partial or covering index is worthwhile?

**Deep explanation:** Match the index to frequent, important query predicates and confirm the optimizer can imply a partial-index predicate. Estimate selectivity, lookup elimination, index size, cache benefit, and read latency against write amplification and storage. Test representative plans and production-like load; included columns cover reads without unnecessarily enlarging the search key.

**Interview answer:** I measure whether the target workload repeatedly uses the filter and columns, then compare latency and lookup savings with index size and write cost. I validate actual plans and usage before and after deployment.

16. How would you avoid excessive write cost from redundant indexes?

**Deep explanation:** Inventory index definitions and real usage, then find exact duplicates and indexes whose leading key prefixes and included columns are subsumed by another. Consider uniqueness, sort direction, predicates, constraints, and rare operational queries before removal. Disable or observe cautiously where supported, remove one at a time, and monitor plans and write latency.

**Interview answer:** I combine index-definition analysis with usage and workload evidence. I remove only indexes truly covered by another, preserving unique, filtered, ordering, and constraint semantics, and monitor after each staged change.

17. How would you diagnose table and index bloat?

**Deep explanation:** Compare logical live data with physical relation/index size and inspect dead tuples, page density, free space, update patterns, and cleanup history using engine-specific tools. Identify root causes such as long snapshots, ineffective vacuum/cleanup, low-fill updates, or unused indexes. Choose routine cleanup, online rebuild/repack, or partition replacement based on reclaimable space and locking impact.

**Interview answer:** I quantify physical size versus live data and correlate dead tuples and page density with workload and cleanup history. Then I fix the cause and choose the least disruptive reclaim method, measuring whether rebuilding is actually worthwhile.

18. How would you distinguish PostgreSQL vacuuming behavior from other databases' cleanup mechanisms?

**Deep explanation:** PostgreSQL MVCC creates new tuple versions; `VACUUM` marks dead versions reusable, advances freeze horizons, maintains visibility information, and normally does not return table space to the OS. `VACUUM FULL` rewrites and locks the table. Other engines may use undo segments, clustered-page purging, garbage collection, or different space-reclamation semantics, so names and operational effects are not interchangeable.

**Interview answer:** PostgreSQL vacuum reclaims dead tuple space for reuse and prevents transaction-ID problems, but ordinary vacuum usually does not shrink the file. I compare that with the target engine's MVCC storage, purge process, locking, and physical space behavior rather than assuming equivalence.

19. How would you choose partition keys and verify partition pruning?

**Deep explanation:** Choose a key that appears in common filters and lifecycle operations, produces balanced partitions, and keeps partition count manageable—often time plus an additional distribution strategy. Align predicates and data types with partition boundaries. Verify static and runtime pruning through actual plans and partition-scan counts using representative parameters, since functions or implicit casts can defeat pruning.

**Interview answer:** I choose a key around dominant filters, retention operations, and balanced partition size. I then inspect actual plans for representative literal and parameterized queries to prove only expected partitions are scanned.

20. How would you execute a cross-partition query without scanning unnecessary data?

**Deep explanation:** Express explicit sargable bounds on the partition key so pruning excludes irrelevant partitions, then apply local indexes and selective predicates within the remainder. For aggregates, compute partial results per partition and combine them; summaries may serve repeated historical queries. Avoid wrapping the key in functions, mismatched types, or broad `OR` conditions that obstruct pruning.

**Interview answer:** I give the optimizer direct partition-key ranges, confirm pruning in the actual plan, and use aligned local indexes. For large aggregates I push partial aggregation into selected partitions or use maintained summaries.

21. How would you refresh a materialized view while preserving read availability?

**Deep explanation:** Use a concurrent/online refresh if supported and its required unique key exists. Otherwise build the new result into a shadow table, validate row counts and checksums, create indexes, then atomically swap names or a routing view during a brief metadata lock. Ensure readers get one complete version and plan for extra storage and changes arriving during the build.

**Interview answer:** I refresh concurrently when the engine supports it; otherwise I build and validate a fully indexed shadow copy and atomically swap it in. Readers continue seeing the old complete version until the new one is ready.

22. How would you maintain an aggregate table incrementally and repair drift?

**Deep explanation:** Apply changes from a durable ordered source such as CDC or an outbox, using idempotency keys and upserts so replay is safe. Handle updates and deletes as subtraction plus addition, checkpoint progress, and define late-event behavior. Periodically recompute source-of-truth aggregates by bounded range, compare checksums/counts, and repair discrepancies without blocking normal updates.

**Interview answer:** I consume an ordered durable change stream idempotently, checkpoint it, and correctly reverse updates and deletes. I also run periodic partitioned recomputation and reconciliation so incremental bugs or missed events cannot create permanent drift.

23. How would you find cycles in a recursively queried graph?

**Deep explanation:** A recursive CTE carries both the current node and the path of visited node IDs. Before expanding an edge, test whether its destination is already in the path; if so, emit a cycle, otherwise append and continue. Add depth/resource limits and indexes on edge endpoints; native `CYCLE` syntax can manage path and cycle flags where available.

**Interview answer:** I use a recursive CTE that carries a visited path and flags an edge whose destination is already present. I index edge endpoints and enforce a depth limit, or use the database's native `CYCLE` clause.

24. How would you implement sessionization over timestamped events?

**Deep explanation:** Partition events by user/device and order by timestamp plus a deterministic tie-breaker. Use `LAG` to compare each event with its predecessor; mark a new session when the gap exceeds the threshold, then cumulatively sum that flag to form a session ID. Aggregate by user and session ID, explicitly defining boundary equality and duplicate/out-of-order behavior.

**Interview answer:** I use `LAG` per user to detect gaps above the inactivity threshold, then a running sum of new-session flags creates session IDs. I add a stable tie-breaker and define exact boundary and late-event rules.

25. How would you calculate historical balances when transactions arrive late?

**Deep explanation:** Store immutable transactions with effective time, recording time, stable ID, and signed amount. A historical effective balance is a cumulative sum ordered by effective time and ID, filtered by the requested knowledge cutoff if an “as known then” result is needed. Late arrivals require recomputing affected ranges or propagating deltas through versioned snapshots; never silently overwrite audit history.

**Interview answer:** I separate when a transaction took effect from when we recorded it. Balances use an ordered running sum with an optional recorded-time cutoff, and late entries invalidate or adjust only affected snapshots while preserving the audit trail.

26. How would you implement bitemporal queries for effective time and recorded time?

**Deep explanation:** Represent each version with two half-open intervals: valid/effective time and system/recorded time, typically `[start, end)`. Query the row whose valid interval contains the business timestamp and whose system interval contains the knowledge timestamp. On correction, close the old system interval and insert a new version; exclusion/overlap constraints and composite indexes protect and accelerate interval semantics.

**Interview answer:** I store valid-time and system-time intervals for every version and filter both with half-open containment predicates. Corrections append a new system version rather than erasing history, with constraints preventing invalid overlaps.

27. How would you design SQL for a double-entry ledger that always balances?

**Deep explanation:** Store immutable journal entries and postings, with every posting using one sign convention and currency. Enforce that each journal's signed postings sum to zero—often through a controlled posting procedure plus a deferred constraint/validation because a row check cannot aggregate sibling rows. Commit the header and all lines atomically, require idempotency keys, and correct mistakes using reversal entries.

**Interview answer:** I model immutable journals with at least two signed postings whose per-currency sum must be zero, commit them atomically through one controlled interface, and use idempotency keys. Corrections are reversals, never edits, and balance validation occurs at transaction completion.

28. How would you prevent cross-tenant data exposure through joins and subqueries?

**Deep explanation:** Include `tenant_id` in every tenant-owned key and join predicate, and use composite foreign keys such as `(tenant_id, object_id)` so cross-tenant references are structurally impossible. Add row-level security as defense in depth using trusted session identity, test nested queries/views and bypass roles, and avoid accepting tenant identity solely from client input.

**Interview answer:** I make tenant identity part of keys, foreign keys, and every join, then enforce row-level security from trusted connection context. I test views, subqueries, admin roles, and missing predicates specifically for leakage.

29. How would you evaluate row-level security policies for correctness and performance?

**Deep explanation:** Test positive and negative access for each role and operation, including ownership changes, `WITH CHECK`, views, functions, prepared statements, and privileged/bypass accounts. Inspect plans with RLS enabled to ensure policy predicates are sargable and supported by tenant-leading indexes. Load-test many tenants and skewed tenant sizes because policy correctness can coexist with disastrous plans.

**Interview answer:** I build an access matrix and adversarial tests for reads and writes, including bypass paths and views. Then I inspect real plans under each role, index policy predicates, and load-test both small and very large tenants.

30. How would you reconcile two large tables with minimal production impact?

**Deep explanation:** Compare stable key ranges or partitions in small batches, first using counts and robust hashes, then row-level comparison only for mismatching buckets. Read from a consistent snapshot or replica where appropriate, throttle I/O, checkpoint progress, and account for concurrent changes with a cutoff or CDC tail. Hashes reduce transfer but require canonical serialization and collision-aware final verification.

**Interview answer:** I partition the comparison by key range, compare counts and canonical hashes, and drill into only mismatched ranges. I use a consistent cutoff, checkpoint and throttle the job, and reconcile changes after that cutoff separately.

31. How would you produce a consistent export without holding a harmful long-running transaction?

**Deep explanation:** Prefer a database-native snapshot/export mechanism or take a snapshot on a replica; export chunks against the same snapshot token so they share one point in time. If snapshot sharing is unavailable, record a high-water mark, export immutable history up to it, and capture concurrent changes via CDC. Monitor retained versions/WAL because even replica snapshots can delay cleanup.

**Interview answer:** I use a shared consistent snapshot, ideally on a replica, and parallelize chunks within that same snapshot. Otherwise I combine a high-water-mark export with CDC, while monitoring version and log retention.

32. How would you optimize deeply paginated queries over billions of rows?

**Deep explanation:** Replace `OFFSET` pagination, whose work grows with page depth, with keyset/seek pagination. Use a deterministic ordering such as `(created_at, id)` and query lexicographically after the last seen values, backed by a matching composite index. Encode the cursor and define snapshot/change semantics; arbitrary page-number jumps require a separate anchor or approximate navigation strategy.

**Interview answer:** I use keyset pagination with a unique deterministic sort key and a matching index, passing the last key as a cursor. That makes each page roughly `O(log N + page_size)` instead of scanning all skipped rows.

33. How would you validate query equivalence when refactoring a critical report?

**Deep explanation:** Define equivalence precisely: duplicates, ordering, null semantics, numeric rounding, and snapshot time. Run old and new queries on the same consistent snapshots across production-shaped and adversarial fixtures, comparing both directions with set/bag-aware differences plus row counts and canonical hashes. Investigate every mismatch and shadow-run before switching, then compare performance separately from correctness.

**Interview answer:** I specify the exact output semantics, run both queries on identical snapshots and edge-case data, and perform bidirectional, duplicate-aware comparisons plus hashes. I shadow the new report and treat correctness and performance as separate gates.

34. How would you investigate database-specific NULL, collation, and isolation behavior before migrating SQL?

**Deep explanation:** Build executable characterization tests on both source and target for three-valued logic, null ordering/uniqueness, empty strings, case and accent sensitivity, Unicode normalization, sort order, and concurrent anomaly schedules. Review authoritative engine documentation and configuration because behavior can vary by version and collation. Record divergences and encode required semantics explicitly in SQL, schema, and tests.

**Interview answer:** I create a compatibility suite and run it on both engines for NULL truth tables, uniqueness and ordering, collation edge cases, and concurrency anomalies. Any divergence becomes an explicit migration rule and regression test.

35. How would you review generated ORM SQL for correctness under concurrency?

**Deep explanation:** Capture actual SQL, bound parameters, transaction boundaries, isolation, and query count for complete workflows. Look for read-modify-write races, missing predicates, lost updates, N+1 queries, unexpected cascades, and locks acquired in inconsistent order. Test concurrent schedules, then use atomic updates, version columns, constraints, upserts, or explicit locks rather than relying on object-level assumptions.

**Interview answer:** I inspect the exact SQL and transaction boundaries, not just ORM code, and run concurrent tests for lost updates and invariant violations. I enforce correctness with atomic statements, optimistic versions, constraints, or locks and also check query shape and count.

36. How would you prevent a trigger from hiding expensive or recursive writes?

**Deep explanation:** Keep triggers small, deterministic, documented, and observable; avoid network calls and unbounded queries. Guard recursion with trigger-depth/session mechanisms or design idempotent logic, and index every lookup the trigger performs. Expose trigger time and affected-row metrics, test bulk operations and cascades, and move complex asynchronous work to an outbox/worker.

**Interview answer:** I restrict triggers to bounded transactional invariants, guard recursion, index their queries, and instrument their cost. Complex or external work goes through an outbox, and bulk/cascade tests reveal hidden amplification.

37. How would you secure a stored procedure that executes with elevated privileges?

**Deep explanation:** Grant execute narrowly and give the procedure owner only required privileges. Fully qualify objects, pin or clear the search path, avoid unsafe dynamic SQL, validate inputs, and use parameter binding/identifier quoting when dynamic SQL is unavoidable. Revoke default/public access, audit calls, and account for ownership chaining and row-security bypass behavior.

**Interview answer:** I apply least privilege to both caller and owner, fully qualify objects, lock down the search path, and parameterize any dynamic SQL. I revoke public access, validate inputs, audit execution, and test RLS and ownership-bypass behavior.

38. How would you choose between enforcing a rule in SQL constraints and application code?

**Deep explanation:** Put invariants that must hold across all writers in declarative database constraints when expressible: types, checks, uniqueness, foreign keys, and exclusions are atomic and race-safe. Application code is better for external facts, evolving workflows, or user-friendly prevalidation, but should not be the only guard for critical data integrity. Procedures/triggers may bridge complex transactional rules with added maintenance cost.

**Interview answer:** I enforce durable, race-sensitive invariants in the database and duplicate checks in the application for good feedback. Rules depending on external systems or workflow stay in application logic, with a controlled transactional mechanism when cross-row integrity demands it.

39. How would you migrate a case-sensitive uniqueness rule to a case-insensitive rule safely?

**Deep explanation:** Define exact normalization and collation semantics first, then scan for collisions such as `Alice` versus `alice` and resolve them with a business-approved mapping. Build a unique index on normalized data—such as a generated normalized column or supported case-insensitive collation—using an online method, while preventing new collisions during migration. Switch validation/writes, verify, then remove the old constraint.

**Interview answer:** I choose a precise normalization, identify and resolve existing collisions, prevent new ones, and build the normalized unique index online. After applications use the same normalization and validation succeeds, I retire the case-sensitive constraint.

40. How would you reason about deferrable constraints when inserting mutually related records?

**Deep explanation:** A deferrable constraint can postpone validation until transaction commit, allowing temporary intermediate states such as two new rows whose foreign keys reference each other. Set only the needed constraint deferred, insert both records, and ensure the final state is valid before commit. This simplifies ordering but moves failure later, can retain work/locks longer, and is not supported equally by all engines or constraint types.

**Interview answer:** I defer the specific foreign key so both mutually referencing rows can be inserted within one transaction, then let commit validate the final graph. I keep the transaction short and handle commit-time failure explicitly.
