1. What does the FLP impossibility result imply, and what does it not imply about practical consensus?

**Deep explanation:**
FLP says that in a fully asynchronous system, no deterministic consensus algorithm can guarantee termination if even one process may crash. A slow node is indistinguishable from a failed one, so an adversarial schedule can keep the system undecided. It does not make practical consensus impossible: protocols preserve safety through arbitrary delays and regain liveness using partial synchrony, timeouts, or randomness.

**Interview answer:**
FLP rules out guaranteed deterministic termination in a fully asynchronous system with one possible crash. It does not rule out Raft or Paxos: they preserve safety during bad timing and make progress once a quorum can communicate under sufficiently stable timing.

2. How do safety and liveness requirements differ in consensus protocols?

**Deep explanation:**
Safety means nothing bad happens: nodes never decide conflicting values and committed entries are not lost. It must hold under every allowed failure. Liveness means something good eventually happens, such as a proposal being committed. It normally depends on an available quorum and eventual timing bounds. A sound protocol sacrifices progress, not safety, when those assumptions fail.

**Interview answer:**
Safety is an invariant that must never be violated, even during partitions. Liveness is eventual progress and requires conditions such as eventual synchrony and a reachable quorum. During a partition, the system may stop, but it must not commit conflicting values.

3. What timing assumptions are needed for a lease-based leader?

**Deep explanation:**
A safe lease needs bounded clock drift or clock uncertainty and must account for network delay, process pauses, suspend/resume, and clock jumps. The old leader stops serving before its lease could expire remotely, while a successor waits until the old lease must have expired. Without defensible bounds, time cannot prevent overlap; quorum confirmation and fencing tokens are safer.

**Interview answer:**
A lease-based leader needs a reliable bound on clock drift or uncertainty and must include pauses and delays. The old leader expires early and the new one starts late so their safe intervals cannot overlap. Without those bounds, I use quorum-backed leadership plus fencing.

4. How would you perform linearizable reads from a replicated log safely?

**Deep explanation:**
The reader must prove current leadership and read state at or beyond a committed barrier. The leader can append a no-op, obtain quorum confirmation through a ReadIndex-style protocol, or use a sound lease. It then waits until the state machine has applied through that index. Followers need an equivalent leader-issued safe index; arbitrary local follower reads are stale, not linearizable.

**Interview answer:**
I have the leader confirm authority with a quorum, obtain a committed read index in its current term, wait until its state machine applies through that index, and then read locally. I would not call an arbitrary follower read linearizable.

5. How would you change consensus-cluster membership without losing quorum safety?

**Deep explanation:**
Membership is replicated state. Joint consensus first commits a configuration requiring quorums from both old and new memberships, then commits the final new configuration. This prevents disjoint old and new majorities from deciding conflicting entries. Some protocols safely change one voter at a time, but the same overlap proof and committed transition rules are required.

**Interview answer:**
I encode membership changes in the log and use joint consensus: commit a joint old-plus-new configuration requiring majorities of both, then commit the new configuration. That preserves quorum intersection throughout the transition.

6. How would you handle a network split that isolates the current leader from a majority?

**Deep explanation:**
The isolated leader cannot commit and should stop authoritative service after losing quorum contact or lease validity. The majority elects a new leader and continues. Minority requests fail or retry; they are never reported as committed. On healing, consensus reconciles uncommitted suffixes, and fencing prevents the old leader from changing external resources.

**Interview answer:**
The minority leader stops accepting authoritative writes when it cannot confirm a quorum. The majority elects a new leader. After healing, the old leader follows the newer term and discards only uncommitted conflicts; fencing protects external side effects.

7. How would you reason about quorum overlap across a configuration change?

**Deep explanation:**
Enumerate the quorum sets allowed before, during, and after the change, then prove any two quorums capable of conflicting decisions intersect in a protocol-obeying node. Old and new majorities may be disjoint if many voters change. A joint phase bridges them by requiring an old quorum and a new quorum for decisions, including leader election and configuration activation.

**Interview answer:**
I model each configuration's quorum sets and prove intersection for every pair that could authorize conflicting commits or leaders. Since old and new majorities may not overlap, I use a committed joint phase requiring both quorums.

8. How do Byzantine failures differ from crash failures?

**Deep explanation:**
A crash-faulty node stops or omits messages; a Byzantine node may lie, equivocate, collude, or send malformed state. Crash consensus typically needs `2f + 1` replicas to tolerate `f` failures. Classic partially synchronous Byzantine consensus generally needs `3f + 1`, authenticated messages, and more communication because peers cannot trust a faulty node's claims.

**Interview answer:**
Crash failures are omissions; Byzantine failures permit arbitrary and contradictory behavior. That stronger model requires authentication, more replicas, and more communication—commonly `3f + 1` rather than `2f + 1` replicas to tolerate `f` faults.

9. When would Byzantine fault tolerance be justified in an application architecture?

**Deep explanation:**
BFT is justified when replicas cross genuinely independent trust domains, compromise is credible, and a malicious minority must not decide a high-value outcome. Examples include consortium control planes or signing services. It is weak protection when every replica shares one cloud account, deployment path, or vulnerability, because correlated compromise violates fault independence. Its latency and operating cost must match the risk.

**Interview answer:**
I choose BFT when arbitrary malicious behavior is in scope and replicas are independent across trust domains. I verify that the `3f + 1` replica and latency costs are justified. If one credential can compromise all replicas, BFT does not solve the real threat.

10. How would you design a distributed semaphore with fencing and crash recovery?

**Deep explanation:**
Keep capacity, active permits, owners, expirations, and monotonic fencing tokens in a linearizable store. Acquisition atomically checks capacity and creates a leased permit with a new token. The protected resource rejects tokens older than the greatest accepted token, stopping paused former owners. Heartbeats renew permits, expiration reclaims them after crashes, and acquire/release retries are idempotent.

**Interview answer:**
I allocate permits through a consensus-backed store and return a monotonic fencing token. Leases recover permits after crashes, while the protected resource rejects stale tokens. Acquire and release are idempotent so retries cannot consume or free capacity twice.

11. How would you evaluate a distributed-lock algorithm against pauses and clock drift?

**Deep explanation:**
Pause a holder beyond its lease, skew or jump clocks, partition it, grant the lock elsewhere, then resume it. Mutual exclusion inside the lock service is insufficient if the old client can still modify the resource. Identify every timing assumption and show violations fail safely. Fencing at the resource turns a resumed stale holder into a rejected operation.

**Interview answer:**
I test long GC pauses, suspend/resume, partitions, delayed packets, and maximum clock drift. The decisive test is whether a resumed expired holder can mutate the resource after a new owner starts. Monotonic fencing tokens should make that impossible.

12. How would you preserve invariants when using coordination-free replication?

**Deep explanation:**
Express the invariant and ask whether any two independently valid concurrent states merge into another valid state—its invariant-confluence test. If yes, use monotonic operations or CRDTs. If not, introduce scoped coordination, ownership, reservation, or escrow rights. Convergence only means replicas agree eventually; it does not preserve uniqueness, bounded totals, or references automatically.

**Interview answer:**
I test invariant confluence. If every merge of valid concurrent states remains valid, coordination-free replication works. Otherwise I add the narrowest coordination mechanism, such as escrow or single ownership, rather than assuming CRDT convergence implies business correctness.

13. Which business rules cannot be implemented by an unconstrained CRDT merge alone?

**Deep explanation:**
Global exclusion and bounded-resource rules are not generally closed under unconstrained merge. Examples include unique usernames, exactly one winner, nonnegative account balances, inventory that cannot oversell, and strict foreign-key deletion. Two replicas can each make locally valid decisions whose merge violates the rule. Coordination, allocated rights, or explicit conflict resolution is required.

**Interview answer:**
Unconstrained CRDT merge cannot enforce non-monotonic global rules such as uniqueness, at-most-one ownership, or bounded inventory. Concurrent replicas can each be locally correct but jointly invalid, so I add coordination or partitioned rights.

14. How would you design collaborative editing using OT or CRDTs?

**Deep explanation:**
Define the document model, operation identity, causality, cursor semantics, offline window, and undo first. OT transforms concurrent operations against a server-ordered history and is compact but transformation logic is subtle. Sequence CRDTs use stable identities and deterministic ordering, enabling offline or peer merging at the cost of metadata and compaction. Both need idempotent persistence and convergence tests for concurrent insert/delete cases.

**Interview answer:**
For a central online editor I might use OT; for offline-first or peer-to-peer editing I favor a sequence CRDT. I specify causality, identity, cursor anchoring, undo, and compaction, then property-test convergence under every delivery order.

15. How would you garbage-collect CRDT metadata without losing correctness?

**Deep explanation:**
Remove tombstones or version entries only after they are causally stable: every active replica has observed them and all preceding events. Compute a stable frontier from version vectors or acknowledgements. Replicas returning after the supported offline window must install a snapshot instead of replaying ancient operations. Membership changes must remove permanently absent replicas from the stability calculation safely.

**Interview answer:**
I compact only below a causally stable frontier acknowledged by every current replica. A replica returning after the retention window resynchronizes from a snapshot. Garbage collection is therefore part of the causality and membership protocol, not a time-based cleanup job.

16. How would you define causal consistency across several data stores?

**Deep explanation:**
Carry a causal context—version vector, dependency set, or suitable logical timestamp—across every service and store boundary. Writes include everything the client observed; reads route to or wait for a replica whose state dominates the context. The contract must define scope, identities, metadata compression, and unavailable-dependency behavior because independent databases are not causally consistent by default.

**Interview answer:**
I propagate a causal token with every request. Each write records its dependencies, and each read is served only after those dependencies are visible. The same contract must span every participating service and store, including behavior when a dependency is unavailable.

17. How would you design session guarantees during regional failover?

**Deep explanation:**
Give the client a token containing its observed version or causal frontier. The failover region serves the session only after reaching that frontier; otherwise it waits, fetches state, or returns retry. This supports read-your-writes and monotonic reads, while writes carry dependencies for writes-follow-reads. If acknowledged data never replicated, the guarantee requires unavailability rather than silently returning older state.

**Interview answer:**
I issue a session token for the latest state the client observed and require the failover region to catch up before serving it. Writes carry the token as a dependency. If acknowledged data was lost before replication, I fail explicitly rather than violate read-your-writes.

18. How would you implement a globally ordered log and justify its cost?

**Deep explanation:**
Use a consensus group whose leader assigns positions and commits entries after quorum replication. Batching and pipelining improve throughput, but global quorum placement imposes cross-region latency and a single order couples unrelated keys. It also stops during quorum loss. The cost is justified only when consumers need one replicated-state-machine order; per-partition or causal order is usually cheaper.

**Interview answer:**
I implement it as a consensus-replicated sequencer with batched quorum commits. Its costs are cross-region latency, bounded throughput, and a larger failure domain, so I first prove a single total order is necessary rather than partitioned or causal ordering.

19. How would you handle clock uncertainty in externally consistent transactions?

**Deep explanation:**
Treat current time as an uncertainty interval. Choose a commit timestamp after relevant prior observations, replicate the transaction, and delay visibility until the clock's earliest possible current time is beyond that timestamp. This commit-wait converts wider uncertainty into latency while preserving real-time order. Logical timestamps alone order events but do not establish their relationship to wall time.

**Interview answer:**
I use bounded clock intervals, not exact timestamps. After durably committing at timestamp `T`, I wait until the earliest possible real time is greater than `T` before exposing the result. Clock uncertainty becomes extra latency rather than an ordering bug.

20. How would you prove that a sharding migration preserves single ownership?

**Deep explanation:**
Represent ownership as an epoch-tagged state machine in authoritative metadata. The source owns epoch `e`, copies a snapshot plus subsequent changes, then an atomic cutover grants the destination epoch `e+1`. Storage validates request epochs, so stale routers and the old source cannot write afterward. Prove both mutual exclusion of accepted writers and transfer of every acknowledged pre-cutover write.

**Interview answer:**
I use consensus-backed ownership epochs. During copy only the source accepts writes; cutover atomically advances ownership, and both shards reject stale epochs. The proof covers at-most-one accepting owner plus complete snapshot and change-log transfer.

21. How would you detect stale routing tables without making every request centrally coordinated?

**Deep explanation:**
Version routing metadata with a partition epoch and include it in each request. A shard validates ownership locally and rejects or redirects stale requests with the newer epoch. Clients cache routes and refresh on mismatch; background pushes and TTLs only improve convergence. Storage-side validation, not a central lookup, provides correctness and avoids stale writes.

**Interview answer:**
I attach an ownership epoch to cached routes and requests. Each shard validates that epoch locally and returns a stale-route response with newer metadata when needed. Clients refresh only on mismatch, so normal traffic avoids central coordination.

22. How would you model an ambiguous payment outcome in a distributed state machine?

**Deep explanation:**
A timeout transitions to `Unknown`, not `Failed`. States such as `Initiated`, `Submitted`, `Unknown`, `Succeeded`, `Failed`, and `Reversed` have explicit legal transitions driven by provider idempotency keys, queries, webhooks, and reconciliation. While unknown, do not retry with a new key or assume funds were not captured. Persist evidence and make late or duplicate messages idempotent.

**Interview answer:**
A payment timeout becomes `Unknown`. I persist the provider idempotency key, reconcile by query or webhook, and transition explicitly to success, failure, or reversal. All retries reuse the same key, preventing uncertainty from becoming a duplicate charge.

23. How would you prevent saga compensation from undoing a later legitimate operation?

**Deep explanation:**
Make compensation conditional on the exact saga effect it reverses. Include saga or reservation identity and an expected entity version; release or undo only if that saga still owns the state at that version. A later legitimate action changes the predicate, making stale compensation a no-op or escalation. Compensation is an idempotent state transition, not a generic inverse command.

**Interview answer:**
I send the saga ID and expected resource version with compensation and apply it only if that saga still owns the effect. Later legitimate work changes the version, so stale compensation cannot undo it. Retried compensation remains idempotent.

24. How would you define exactly-once business effects across an unreliable external API?

**Deep explanation:**
Exactly-once transport is impossible when either request or response may be lost. Define a durable business operation ID, record intent transactionally, retry through an outbox with the same provider idempotency key, and reconcile ambiguous results before creating another operation. The receiver must durably deduplicate and return the original result. Without that support, exactly-once cannot honestly be guaranteed.

**Interview answer:**
I use a durable operation ID, transactional outbox, retries with one provider idempotency key, and reconciliation. Exactly-once is a receiver-side deduplication contract, not a network property. If the API lacks idempotency or lookup, I do not claim the guarantee.

25. How would you design a deterministic fault simulator for a replicated database?

**Deep explanation:**
Run nodes against virtual time, scheduler, network, disk, and randomness interfaces. Every delivery, timeout, crash, packet loss, and disk completion is chosen by a seeded controller and recorded for exact replay. Explore schedules systematically and assert safety continuously; check liveness separately under fair schedules. The storage model should reflect precisely the promised persistence fault model.

**Interview answer:**
I replace real time, networking, storage completion, and randomness with one deterministic scheduler. Every fault and delivery decision is seeded and logged, making failures reproducible. Then I explore schedules while continuously checking consensus and durability invariants.

26. How would you use model checking to explore a small distributed protocol?

**Deep explanation:**
Build a small abstract model with a few nodes, values, terms, and bounded messages. Define transitions for delivery, timeout, crash, recovery, and reconfiguration, plus safety invariants and temporal progress properties. Exhaustive exploration produces counterexample traces; symmetry and state reduction control explosion. Because the model is not production code, map its rules back to executable tests.

**Interview answer:**
I model a tiny instance with explicit state transitions and failure actions, then check safety across every reachable interleaving and liveness under stated fairness assumptions. Counterexample traces reveal missing cases, and I translate them into implementation tests.

27. How would you interpret a consistency test that finds no anomalies?

**Deep explanation:**
It is evidence limited to sampled histories, workload, injected faults, checker assumptions, and observation quality—not a proof. Rare schedules or untested operations may still violate consistency, and incomplete histories can hide anomalies. Strengthen confidence with adversarial scheduling, diverse faults, long recovery runs, checker validation, and complementary formal reasoning.

**Interview answer:**
“No anomalies found” means none appeared in the tested executions under the checker's model. I report the workload, faults, duration, and history limitations, and treat the result as evidence rather than proof.

28. How would you distinguish a correctness guarantee from an operational convention?

**Deep explanation:**
A guarantee follows from an enforced protocol and explicit assumptions across all allowed executions. A convention relies on people or normal timing, such as “deployments never overlap” or “the worker finishes before lease expiry.” Convert conventions into guarantees using validation, durable state machines, fencing, and fail-closed behavior, and document assumptions that remain.

**Interview answer:**
I ask what mechanism prevents violation. If the answer is procedure or typical timing, it is a convention. A guarantee has explicit assumptions, an enforced invariant, and safe failure behavior—for example, rejecting stale fencing tokens rather than trusting workers to stop.

29. How would you choose between stronger coordination and explicit conflict resolution?

**Deep explanation:**
Coordinate when concurrent success could violate an irreversible or high-cost invariant involving money, law, safety, or unique ownership. Allow conflicts when operations commute, divergence is acceptable, conflicts are observable, and deterministic or human resolution has clear product meaning. Hybrid designs coordinate scarce resources or finalization while allowing drafts and independent fields to replicate freely.

**Interview answer:**
I coordinate where an invariant must hold at decision time, such as spending a limit or assigning unique ownership. I use conflict resolution where temporary divergence is acceptable and merging has clear business semantics. Usually I scope coordination narrowly.

30. How would you simplify a distributed design without weakening its required invariants?

**Deep explanation:**
Write the invariants and failure assumptions first, then map every component and protocol to what it protects. Prefer one authoritative state machine, explicit ownership, idempotent operations, immutable events, and the smallest coordination scope. Remove caches, queues, replicas, or transitions without justified value, but re-run partition, retry, recovery, and reconfiguration arguments after each change.

**Interview answer:**
I start from explicit invariants, keep only mechanisms that enforce them, and favor single ownership, idempotency, and narrow coordination. After simplifying, I recheck partitions, retries, recovery, and membership changes to prove the guarantees are unchanged.
