1. How would you make a parking-lot design recover after a crash between payment and exit?

**Deep explanation:** Persist payment and exit as idempotent state transitions with a stable ticket/payment key. On restart, reconcile PAID-but-not-EXITED tickets against the provider and gate sensor; retries can reopen the gate without charging again, while an audit log resolves ambiguous physical events.

**Interview answer:** “I persist a recoverable state machine, use idempotency keys, and reconcile payment and gate events so retries never double-charge.”

2. How would you coordinate several elevator controllers when one becomes unavailable?

**Deep explanation:** A supervisory dispatcher tracks controller heartbeats and assigns requests through leases with expiry. When a controller fails, its unacknowledged assignments become eligible for reassignment; each elevator still enforces local safety and deduplicates commands by ID.

**Interview answer:** “I use health-checked controllers and leased assignments; failure expires the lease and redistributes work, while local safety remains autonomous.”

3. How would you add hardware-failure recovery to a vending-machine state machine?

**Deep explanation:** Model hardware commands and acknowledgments separately from business intent. Persist the transaction before actuating, use sensor feedback to move through DISPENSING or UNCERTAIN, and reconcile on restart. An uncertain dispense requires operator review or conservative refund policy, not blind repetition.

**Interview answer:** “I persist intent, correlate hardware acknowledgments, and represent uncertain outcomes explicitly so recovery does not dispense or refund twice.”

4. How would you migrate a library catalog model without breaking existing loan records?

**Deep explanation:** Give books, copies, and loans stable IDs and make loan records reference immutable identity rather than mutable catalog shape. Use additive schema changes, backfill new fields, dual-read or dual-write during transition, then remove old fields only after compatibility and integrity checks.

**Interview answer:** “I preserve stable identifiers, migrate additively with backfill and compatibility reads, and verify referential history before cleanup.”

5. How would you simplify Splitwise debts while preserving each user's net balance?

**Deep explanation:** Compute each user’s net balance from the immutable ledger, partition creditors and debtors, and greedily match amounts until zero. This produces at most roughly `n-1` transfers, though minimum-transfer optimization is harder; simplification must not rewrite original expenses.

**Interview answer:** “I derive debtor and creditor nets, match them into settlement suggestions, and leave the source ledger untouched.”

6. How would you handle expense edits after some debts have already been settled?

**Deep explanation:** Never mutate financial history in place. Append a reversal or adjustment for the old expense and a new version, while settlements remain independent ledger entries. Recompute current net balances from all entries and require authorization and audit metadata.

**Interview answer:** “I version through compensating ledger entries rather than rewriting history; prior settlements remain recorded and balances are recomputed.”

7. How would you prevent stale seat-hold owners from confirming expired reservations?

**Deep explanation:** Confirmation performs one conditional write matching hold ID, owner token, status HELD, unexpired timestamp, and version. Database time avoids client clock differences. If zero rows change, confirmation fails even if a stale process previously read the hold as valid.

**Interview answer:** “I use a single compare-and-set on owner, status, version, and database-time expiry; stale confirmations cannot succeed.”

8. How would you reconcile a successful payment with a failed booking confirmation?

**Deep explanation:** Persist a saga state before payment and consume provider results idempotently. Retry booking confirmation while the hold is valid; if it cannot succeed, issue an idempotent refund and remain in REFUND_PENDING until confirmed. A reconciler repairs stuck states.

**Interview answer:** “A persisted saga retries confirmation or compensates with an idempotent refund, and reconciliation handles missed callbacks.”

9. How would you detect chess checkmate, stalemate, repetition, and insufficient material?

**Deep explanation:** Generate all legal moves for the side to move: none plus check means checkmate; none without check means stalemate. Track a canonical position key including turn, castling, and en-passant rights for repetition. Insufficient material uses recognized material configurations, not piece count alone.

**Interview answer:** “I combine legal-move availability with check state, canonical position history for repetition, and explicit dead-material rules.”

10. How would you support multiple game variants without filling every class with conditionals?

**Deep explanation:** Define a RuleSet composed of board setup, move-generation, validation, victory, and scoring policies. Standard and variant games assemble different policies; shared objects depend on those contracts. Validate incompatible policy combinations during construction.

**Interview answer:** “I compose each variant from cohesive rule policies instead of branching throughout pieces and Game.”

11. How would you preserve log ordering while writing concurrently to several destinations?

**Deep explanation:** Assign a monotonic sequence when events enter a single ordered stream. Each destination consumes that stream through its own worker, preserving per-destination sequence; global simultaneous completion is impossible, so define ordering as accepted or observed order and track lag independently.

**Interview answer:** “I sequence events once and give each sink an ordered consumer, guaranteeing per-sink order without coupling sink latency.”

12. How would you specify logging behavior when buffers fill or storage becomes unavailable?

**Deep explanation:** Make policy explicit per severity: block with deadline, drop newest/oldest, sample, spill, or synchronously fall back. Never recursively log logger failures. Publish queue depth, dropped counts, sink health, and a shutdown flush contract so data-loss behavior is observable.

**Interview answer:** “I define severity-aware backpressure and failure policies, bound blocking, avoid recursive failures, and expose loss and health metrics.”

13. How would you design notification workflows with provider failover and deduplication windows?

**Deep explanation:** Persist one logical notification with an idempotency key, attempt records, and a deduplication expiry. A routing policy chooses providers and fails over only for classified errors; uncertain outcomes are queried or delayed rather than immediately duplicated through another provider.

**Interview answer:** “I persist logical identity and attempts, use error-aware routing, and treat uncertain sends carefully within a dedupe window.”

14. How would you evolve notification payload schemas without breaking older consumers?

**Deep explanation:** Use versioned envelopes and additive changes with tolerant readers. Producers retain compatibility until consumer adoption is measured; a translation layer can upgrade old payloads to the current domain command. Contract tests and a schema registry prevent incompatible releases.

**Interview answer:** “I version envelopes, prefer additive evolution, translate old versions at the boundary, and enforce compatibility in contract tests.”

15. How would you make rate-limiter updates atomic across multiple processes?

**Deep explanation:** Store limiter state in a shared system that supports atomic conditional updates or server-side scripts. Update refill/window cleanup and consumption in one operation keyed consistently; include TTL for inactive keys. Local caches may approximate reads but cannot authorize independently.

**Interview answer:** “I execute the entire check-and-consume algorithm atomically in shared storage, using consistent keys and expiry.”

16. How would you define rate-limiter behavior under clock changes and storage failures?

**Deep explanation:** Use monotonic time locally or trusted server time in shared storage, clamp negative elapsed durations, and document boundary semantics. Choose fail-open or fail-closed by endpoint risk, with bounded fallback capacity, metrics, and recovery reconciliation rather than an accidental default.

**Interview answer:** “I use monotonic or server time and make storage-failure policy explicit per risk: bounded fail-open or fail-closed.”

17. How would you prevent cache stampedes without holding a global lock?

**Deep explanation:** Use per-key request coalescing or a short distributed lease so one caller refreshes while others wait or receive stale-but-valid data. Add jitter to TTLs and enforce a lease timeout; stale-while-revalidate improves availability when regeneration fails.

**Interview answer:** “I combine per-key single-flight, jittered expiry, and stale-while-revalidate, with bounded leases to avoid deadlock.”

18. How would you make a cache's eviction policy replaceable without exposing its internals?

**Deep explanation:** Cache owns storage and calls an EvictionPolicy through events such as insert, access, update, and remove; the policy returns victim keys. It never exposes linked-list nodes or entry objects, so LRU, LFU, or random policies can change without corrupting cache invariants.

**Interview answer:** “I define a key-based eviction-policy protocol and keep policy metadata private from the cache’s public API.”

19. How would you design a file system supporting snapshots and copy-on-write updates?

**Deep explanation:** Represent directories and file blocks as immutable, content-addressed nodes with a root pointer. A snapshot retains a root; mutation copies only nodes along changed paths and atomically publishes a new root. Reference counting or tracing reclaims blocks unreachable from live roots.

**Interview answer:** “Snapshots are immutable root pointers; updates path-copy changed metadata and blocks, then atomically swap the current root.”

20. How would you model atomic file moves across permission boundaries?

**Deep explanation:** Validate source delete and destination create permissions plus namespace constraints before mutation. Within one transactional namespace, atomically replace directory entries while preserving the inode; across filesystems true atomicity is unavailable, so expose copy-and-delete semantics and failure states.

**Interview answer:** “I authorize both parent directories and atomically relink within one namespace; cross-filesystem moves are explicitly non-atomic.”

21. How would you handle partial refunds, taxes, and currency conversion in checkout objects?

**Deep explanation:** Snapshot line-level charges, discounts, tax jurisdiction, tax allocation, currency, and FX rate. Refund commands allocate amounts back to lines and tax under the original policy, never exceeding captured refundable amounts; conversion and rounding differences become explicit ledger entries.

**Interview answer:** “I refund against immutable charge components, cap cumulative refunds, and preserve original tax and FX evidence with explicit rounding.”

22. How would you preserve order history when product and pricing rules change?

**Deep explanation:** Store immutable order-line snapshots containing product description, quantity, price breakdown, tax, discounts, and rule/version identifiers. Product IDs may remain links for navigation, but displaying or refunding the order must not depend on today’s catalog.

**Interview answer:** “The order snapshots all commercial facts and applied rule versions; current catalog data is never the historical source of truth.”

23. How would you design a workflow engine with persistence and resumable execution?

**Deep explanation:** Persist workflow definition version, instance state, step inputs/outputs, and transition events. Workers atomically lease ready steps and record completion idempotently; timers and external signals become durable events. Recovery scans expired leases and resumes without rerunning confirmed side effects.

**Interview answer:** “I persist the state machine and step journal, lease work, require idempotent completion, and recover expired leases and durable timers.”

24. How would you design a plugin system with versioned contracts and dependency isolation?

**Deep explanation:** Plugins declare contract version, capabilities, and dependencies in a manifest. Load them through a narrow host API and isolated classloader, process, or sandbox; resolve versions before activation and fail cleanly on incompatibility. Resource limits and signatures address operational and security risks.

**Interview answer:** “I use manifest-declared versions and capabilities, a minimal host contract, dependency resolution, and runtime isolation.”

25. How would you design an undo framework for operations with external side effects?

**Deep explanation:** External effects are rarely truly reversible. Commands therefore record outcome and define a compensating action, such as a refund rather than deleting a charge. Both forward and compensation paths need idempotency, durable status, retry handling, and explicit cases where compensation is impossible.

**Interview answer:** “Undo means durable, idempotent compensation, not time reversal; I model irreversible and uncertain outcomes explicitly.”

26. How would you make a job scheduler safe against duplicate execution after failover?

**Deep explanation:** Exactly-once execution cannot generally be guaranteed across crashes. Atomically lease each run with an execution ID, renew the lease, and let expired work retry; job handlers use that stable ID for idempotency or transactional inbox/outbox processing.

**Interview answer:** “I provide at-least-once delivery with leased runs and require idempotent handlers keyed by a stable execution ID.”

27. How would you design a rules engine with priorities, conflicts, and explainable decisions?

**Deep explanation:** Rules declare conditions, outcomes, priority, effective dates, and conflict group. Evaluation produces matched-rule evidence; a deterministic conflict resolver applies priority, specificity, or explicit aggregation. Store the ruleset version and explanation with each decision for reproducibility.

**Interview answer:** “I separate matching from deterministic conflict resolution and return an explanation containing matched rules and the ruleset version.”

28. How would you design a thread-safe object pool with timeouts and resource validation?

**Deep explanation:** Guard idle resources and counts with a lock/condition or concurrent queue plus permits. Borrow waits only until a deadline, validates outside critical sections where possible, and replaces invalid objects; a lease guarantees single return. Shutdown wakes waiters and disposes late returns.

**Interview answer:** “I combine bounded permits, deadline-based waits, health validation, scoped leases, and a shutdown state that safely handles late returns.”

29. How would you design an order aggregate that enforces invariants under concurrent updates?

**Deep explanation:** Order is the consistency boundary and accepts commands that validate against its current state, such as prohibiting item changes after submission. Persist with optimistic version checking; conflicts reload and re-evaluate the command rather than blindly retrying stale mutations.

**Interview answer:** “The aggregate owns invariants, and optimistic concurrency ensures each command is validated against the version it updates.”

30. How would you design an event-sourced aggregate with snapshot migration?

**Deep explanation:** Rehydrate from versioned events, taking a compatible snapshot as a performance hint rather than truth. Upcast old events into the current in-memory form; version snapshot schemas separately and discard/rebuild an incompatible snapshot from events. Never rewrite the audit stream casually.

**Interview answer:** “Events remain authoritative and are upcast; snapshots are versioned caches that can be migrated or rebuilt.”

31. How would you build a local transaction abstraction across several repositories?

**Deep explanation:** A UnitOfWork owns one database transaction and supplies repositories bound to that connection and identity map. Application code commits once after all changes; rollback discards them. It is local only—external calls require outbox or compensation, not inclusion in the abstraction.

**Interview answer:** “I bind repositories to one UnitOfWork and database transaction, keeping remote side effects outside via an outbox.”

32. How would you identify when an LLD problem requires a distributed-system boundary?

**Deep explanation:** Look for independently deployed owners, separate data authority, remote hardware/providers, availability isolation, or scale that cannot share one transaction. Crossing that boundary introduces latency, partial failure, retries, idempotency, and eventual consistency, which must appear in the design explicitly.

**Interview answer:** “When responsibility or data authority crosses a process boundary, I model messages, partial failure, idempotency, and consistency instead of pretending it is a method call.”

33. How would you defend class boundaries using change scenarios rather than pattern names?

**Deep explanation:** Name likely changes—new pricing rule, provider, UI, or persistence—and show which modules change for each. A good boundary localizes one reason to change and keeps invariants cohesive; if every scenario touches every class, the boundary is weak regardless of its pattern label.

**Interview answer:** “I justify boundaries by demonstrating that concrete change scenarios stay localized while domain invariants remain together.”

34. How would you test a state machine against all allowed and forbidden transitions?

**Deep explanation:** Define the transition table as data and generate tests for every state/event pair. Assert valid next state and effects, and assert invalid pairs leave state unchanged with the documented error. Property-based sequences can check invariants and reachability beyond hand-picked examples.

**Interview answer:** “I test the complete state-event matrix, then use generated event sequences to verify invariants and forbidden transitions.”

35. How would you reduce an overengineered design while preserving required extension points?

**Deep explanation:** Trace current use cases and remove abstractions that have only one implementation and no credible change pressure. Retain seams around volatile policy or external I/O, collapse pass-through layers, and protect behavior with tests before refactoring. Complexity should earn its maintenance cost.

**Interview answer:** “I keep seams for demonstrated volatility, inline speculative abstractions, and use behavior tests to simplify safely.”

36. How would an ATM design recover when cash is dispensed but the transaction acknowledgment is lost?

**Deep explanation:** Record withdrawal intent and a unique transaction ID before dispensing, then correlate dispenser sensors and bank status during recovery. Never dispense again for an uncertain ID. Mark it UNCERTAIN, query the bank, and escalate discrepancies to reconciliation with device evidence.

**Interview answer:** “I persist intent before actuation, correlate bank and dispenser records by ID, and reconcile uncertain outcomes without re-dispensing.”

37. How would you model a hotel reservation spanning rooms with different availability windows?

**Deep explanation:** Represent the stay as ReservationSegments, each assigning a room to a half-open date interval, under one reservation aggregate. Validate full, gap-free coverage and no room overlap; changes atomically replace the segment plan or use a hold/saga if inventory is partitioned.

**Interview answer:** “I model contiguous room/date segments under one reservation and atomically validate complete coverage and availability.”

38. How would you evolve a pricing engine whose rules depend on jurisdiction and effective date?

**Deep explanation:** Rules are immutable, versioned, scoped by jurisdiction, and valid over non-overlapping effective intervals. Pricing selects rules using the transaction’s business timestamp, records their IDs and inputs, and supports future publication without changing past outcomes. Regression fixtures compare versions.

**Interview answer:** “I use immutable effective-dated jurisdictional rules and persist the exact rule version and inputs used for every quote.”

39. How would you design a circuit-breaker library with concurrent callers and testable time?

**Deep explanation:** Use atomic CLOSED, OPEN, and HALF_OPEN transitions, rolling failure metrics, and a monotonic injected Clock. After timeout, permit a bounded number of probe calls; one transition closes on success or reopens on failure. Define which failures count and expose metrics.

**Interview answer:** “I implement atomic state transitions, bounded half-open probes, configurable failure classification, and an injected monotonic clock.”

40. How would you design a retry library that distinguishes attempts, deadlines, cancellation, and idempotency?

**Deep explanation:** RetryPolicy decides from attempt number, classified result, and remaining deadline; Backoff computes a jittered delay capped by that deadline. A cancellation token interrupts waits and work. The API requires or propagates an idempotency key for side effects and never retries permanent errors.

**Interview answer:** “I separate retry classification from backoff, enforce an overall deadline and cancellation, and require idempotency for retried side effects.”
