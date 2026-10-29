1. What makes a system distributed?

**Deep explanation:**

A system is distributed when independent computers coordinate over a network to behave like one system. Each node has its own memory and clock, so messages can be delayed, lost, duplicated, or reordered. Distribution improves scale, resilience, and geographic reach but adds coordination and partial-failure problems.

**Interview answer:**

A distributed system has independent networked nodes cooperating toward a shared goal. Because they communicate through messages rather than shared memory, it must handle latency, concurrency, partial failure, and no perfectly shared clock.

2. Why is partial failure harder than complete failure?

**Deep explanation:**

A complete failure is obvious; a partial failure leaves some nodes running while others fail or become unreachable. Observers may disagree, and a silent node might be crashed, slow, or partitioned. The system must therefore make safe decisions with incomplete evidence.

**Interview answer:**

Partial failure is harder because the system continues running but cannot reliably distinguish a failed component from a slow or disconnected one. Different nodes can see different failures, complicating coordination and recovery.

3. How do latency and uncertainty affect communication between services?

**Deep explanation:**

Network latency varies with load, queues, and failures. A timeout means only that no response arrived in time—not that the request was unprocessed. Services need bounded timeouts, backoff, idempotency, and observability to manage these ambiguous outcomes.

**Interview answer:**

Network calls have variable latency and uncertain outcomes. If a call times out, it may have failed or completed with a lost response, so services need careful retries and idempotent operations.

4. How do consistency, availability, and durability differ?

**Deep explanation:**

Consistency governs which values operations may observe, such as whether reads see the latest write. Availability concerns whether requests receive usable responses. Durability means acknowledged data survives crashes, usually through persistent or replicated storage. A system can be durable but unavailable, or available while serving stale data.

**Interview answer:**

Consistency describes the state clients observe, availability whether the system responds successfully, and durability whether acknowledged data survives failure. They are separate properties with different tradeoffs.

5. What is a network partition?

**Deep explanation:**

A partition prevents groups of otherwise running nodes from communicating, due to link failures, routing errors, firewalls, or severe packet loss. Each side may mistake the other for failed and accept conflicting work unless the design restricts progress.

**Interview answer:**

A network partition splits nodes into groups that cannot reach one another even though they may still be running. The system must decide whether to keep serving requests or preserve one consistent state.

6. What tradeoff does the CAP theorem describe during a partition?

**Deep explanation:**

During a partition, a distributed data system cannot guarantee both linearizable consistency and availability for every request. It can reject or delay operations to preserve one history, or let separated sides respond and risk divergent state. Real networks make partition tolerance necessary.

**Interview answer:**

CAP says that during a partition, a system must choose between strong consistency and availability: refuse some requests to preserve one coherent state, or keep responding with possible divergence.

7. Why is CAP not a simple choice of two properties for every situation?

**Deep explanation:**

CAP's choice applies specifically during partitions and uses precise definitions. Without a partition, consistency and availability can coexist. Systems may also choose differently per operation—for example, available catalog reads but consistency-first payment writes—and must consider latency, durability, and weaker consistency models.

**Interview answer:**

CAP is not a permanent “pick two” menu. The consistency-versus-availability choice arises during partitions, and systems can make different choices per operation while balancing other concerns.

8. What does PACELC add to the discussion?

**Deep explanation:**

PACELC says: under a Partition, choose Availability or Consistency; Else, choose Latency or Consistency. Strong coordination gives fresher, ordered results but adds network round trips, while weaker consistency can reduce latency even during healthy operation.

**Interview answer:**

PACELC extends CAP: during a partition there is an availability-consistency tradeoff, and otherwise there is often a latency-consistency tradeoff.

9. What is eventual consistency?

**Deep explanation:**

Eventual consistency permits replicas to temporarily return different values after updates. If updates stop and communication resumes, replicas converge. It improves availability and latency but may require conflict resolution, versioning, and tolerance for stale reads.

**Interview answer:**

Eventual consistency means replicas may temporarily disagree but converge once updates stop and propagate. It favors availability and low latency at the cost of temporarily stale or conflicting data.

10. What is strong consistency intended to provide?

**Deep explanation:**

Strong consistency commonly makes operations appear to use one authoritative, current ordering; linearizability is a typical model. A completed write is visible to later reads regardless of replica. This coordination increases latency and can reduce availability during failures.

**Interview answer:**

Strong consistency aims to make the system behave like one current copy, so later reads see completed writes. It usually requires coordination and may sacrifice latency or availability.

11. What does read-your-writes consistency mean?

**Deep explanation:**

Read-your-writes is a session guarantee: after a client successfully writes, that client will not read an older version. Other clients may still see stale data. Sticky routing, version tokens, or reading a sufficiently current replica can provide it.

**Interview answer:**

Read-your-writes guarantees that a client sees its own successful updates on subsequent reads, even if other clients may temporarily see older data.

12. What is replication intended to achieve?

**Deep explanation:**

Replication maintains copies of state or services on multiple nodes to improve fault tolerance, read throughput, geographic latency, and durability. It also creates work: propagating updates, managing lag, resolving conflicts, and preventing incompatible writes.

**Interview answer:**

Replication keeps multiple copies so a system can survive failures, scale reads, and serve nearby users. The tradeoff is keeping those copies sufficiently consistent.

13. What is a leader in a replicated system?

**Deep explanation:**

A leader coordinates operations, commonly ordering writes and forwarding them to followers. One writer simplifies conflict handling, but leader failure requires election, and an isolated stale leader must be prevented from continuing as authoritative.

**Interview answer:**

A leader is the replica that coordinates writes or ordering for a group. Followers copy its updates, and the system elects a replacement if it fails.

14. What is leader election?

**Deep explanation:**

Leader election lets nodes agree which eligible node coordinates a term or epoch. Consensus protocols use majority support and increasing terms to avoid two authoritative leaders. Timeout choices trade faster failover against unnecessary elections.

**Interview answer:**

Leader election selects one coordinator after startup or failure. Safe mechanisms use quorums and terms so only one leader is recognized for a given period.

15. What is a heartbeat?

**Deep explanation:**

A heartbeat is a small periodic message indicating that a node or connection appears responsive. Missing several triggers suspicion or failover. Higher frequency detects problems sooner but uses more traffic and can cause more false suspicions.

**Interview answer:**

A heartbeat is a periodic liveness signal. Missing heartbeats suggests a problem, but it is evidence for suspicion rather than proof of failure.

16. Why can a missed heartbeat fail to prove that a node is dead?

**Deep explanation:**

A live node's heartbeat can be delayed by congestion, loss, garbage collection, CPU starvation, or a one-way partition. With no fixed network-delay bound, slowness cannot be cleanly distinguished from failure. Timeouts therefore produce suspicions, including possible false positives.

**Interview answer:**

A missed heartbeat may mean the node died, but it may instead be slow or unreachable. A timeout creates suspicion, not certainty.

17. What is a quorum?

**Deep explanation:**

A quorum is the minimum subset of replicas sufficient for an operation or decision. Majority quorums overlap, helping preserve an agreed history. In simple storage, `R + W > N` creates read/write overlap, though correctness also depends on versioning and protocol details.

**Interview answer:**

A quorum is enough replicas to make a decision, often a majority. Overlap between quorums helps decisions observe prior accepted state and prevents conflicting authorities.

18. What is consensus useful for?

**Deep explanation:**

Consensus lets non-faulty nodes agree on one value or ordered log despite failures. It supports leader election, replicated state machines, configuration, and metadata. Raft and Paxos preserve safety under stated assumptions, while progress still requires a reachable quorum.

**Interview answer:**

Consensus is useful when nodes must agree on a single decision or operation order, such as choosing a leader or maintaining a replicated log, despite failures and delays.

19. How do consensus and replication differ?

**Deep explanation:**

Replication broadly means maintaining multiple state copies. Consensus is an agreement mechanism that can make replicas choose the same ordered updates. Simple asynchronous replication may permit divergence; consensus replication coordinates to preserve a consistent log.

**Interview answer:**

Replication creates multiple copies, while consensus makes nodes agree on decisions or update order. Consensus can coordinate replication, but not every replicated system uses it.

20. What is an idempotent operation in a distributed workflow?

**Deep explanation:**

Repeating an idempotent logical request has the same intended effect as applying it once. Setting status to `paid` is naturally idempotent; incrementing a balance is not. APIs often record an idempotency key and return the first result on retries.

**Interview answer:**

An idempotent operation can be repeated without changing the result beyond its first successful application. This makes retries safe, often using an idempotency key.

21. Why can retries cause duplicate work?

**Deep explanation:**

A service may commit work but lose its response. The caller times out and retries, causing the same logical request twice. At-least-once delivery behaves similarly, so payments, emails, and other effects need deduplication keys, unique constraints, or idempotent handlers.

**Interview answer:**

A timeout does not prove the first attempt failed. If it completed but its response was lost, retrying can repeat the side effect, so requests need idempotency or deduplication.

22. What is a distributed lock?

**Deep explanation:**

A distributed lock coordinates clients on different nodes so only one should access a resource at a time. Correctness requires ownership, expiry, and safe release. Since an old holder can pause past expiration, critical resources often validate increasing fencing tokens.

**Interview answer:**

A distributed lock provides cross-node mutual exclusion. A robust design handles expired or partitioned holders and often uses fencing tokens to reject stale work.

23. What is a lease?

**Deep explanation:**

A lease grants authority only until an expiration time. It avoids permanent blocking after a crash, but the holder must renew and stop after expiry. Clock uncertainty and process pauses make epochs or fencing tokens important safeguards.

**Interview answer:**

A lease is a time-limited grant of ownership or authority. It expires unless renewed, enabling recovery from failed holders, but clock and pause issues require care.

24. What is a distributed transaction?

**Deep explanation:**

A distributed transaction coordinates changes across independent resources or services as one logical unit. It may seek atomic commit, isolation, or application-level consistency. Network and participant failures make global atomicity expensive, motivating two-phase commit or sagas.

**Interview answer:**

A distributed transaction is one logical transaction spanning multiple nodes, databases, or services. It requires coordination to keep participants consistent when failures occur.

25. What is two-phase commit?

**Deep explanation:**

A coordinator first asks participants to prepare and durably promise whether they can commit. If all vote yes it orders commit; otherwise abort. This gives atomic commit, but prepared participants can block if the coordinator is unavailable, and it adds latency.

**Interview answer:**

Two-phase commit prepares every participant, then commits only if all agree; otherwise it aborts. It provides atomicity but can block on coordinator failure and costs extra round trips.

26. What is a saga?

**Deep explanation:**

A saga splits a business transaction into local transactions connected by orchestration or events. If a later step fails, compensating actions semantically undo earlier work, such as refunding a payment. Sagas avoid long locks but expose intermediate states, and compensation may be imperfect.

**Interview answer:**

A saga coordinates local transactions and uses compensating actions after failure. It avoids a global atomic transaction but accepts visible intermediate states and more recovery logic.

27. How do synchronous and asynchronous communication differ under failure?

**Deep explanation:**

Synchronous calls make callers wait, coupling their latency and availability to callees. Asynchronous messaging can buffer outages and decouple timing, but introduces delayed results, duplicates, ordering concerns, and eventual error handling. Both can have ambiguous outcomes; they manage them differently.

**Interview answer:**

Synchronous communication waits and propagates callee latency or failure. Asynchronous communication decouples timing and absorbs outages, but requires handling duplicates, delays, ordering, and failed messages.

28. What is clock skew?

**Deep explanation:**

Clock skew is the difference between machine clock readings at the same real moment. Hardware drifts and synchronization only reduces the difference. Skew can break expiry, ordering, and last-write-wins assumptions, so correctness should not depend on perfectly synchronized timestamps.

**Interview answer:**

Clock skew is disagreement between machines' physical clocks. Because synchronization is imperfect, timestamps alone are unsafe for exact global ordering or critical decisions.

29. How do physical clocks and logical clocks differ?

**Deep explanation:**

Physical clocks approximate wall time but drift or jump during synchronization. Logical clocks represent causal or relative order rather than real time. Lamport clocks respect causality; vector clocks can identify concurrent events but carry more metadata.

**Interview answer:**

Physical clocks estimate real time but are imperfectly synchronized. Logical clocks track event ordering or causality without claiming wall-clock accuracy.

30. Why is global event ordering difficult?

**Deep explanation:**

Nodes observe events locally, messages have variable delays, and physical clocks disagree. Concurrent events may have no causal order, so no single natural order is observable. A sequencer or consensus log can impose one, but adds coordination, latency, and failure sensitivity.

**Interview answer:**

There is no perfectly shared clock, and delays let nodes observe concurrent events differently. A total order must be imposed through coordination, which adds cost and can reduce availability.
