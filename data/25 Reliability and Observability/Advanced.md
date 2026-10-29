1. How would you model availability when dependencies fail independently versus together?

**Deep explanation:**
For independent serial dependencies, multiply their availabilities; parallel redundancy fails only when every alternative fails. Shared infrastructure, deploys, or operators create correlation, so model common-cause states explicitly and validate assumptions against incidents.

**Interview answer:**
I map required and redundant paths, use probability products only for genuinely independent failures, and add explicit common-cause scenarios. I validate the result with incident data and sensitivity analysis rather than claiming false precision.

2. How would you account for correlated failures across zones and regions?

**Deep explanation:**
Zones may share DNS, identity, networks, control planes, software, and procedures. Use a hierarchical fault model with conditional zone, region, and global scenarios; scenario ranges are often more credible than multiplying nominal SLAs.

**Interview answer:**
I inventory shared failure domains, model conditional regional and global events, and test evacuation paths. I treat replicas as independent only when evidence supports it.

3. How would you allocate error budgets across a multi-service user journey?

**Deep explanation:**
Start with a user-boundary journey SLO, then assign internal guardrails based on criticality, historical contribution, and latency—not equal division. Track end-to-end impact as authoritative so overlapping failures are not double-counted.

**Interview answer:**
I measure the customer journey directly, allocate component budgets according to their risk contribution, and retain headroom for unknowns. Service budgets drive ownership, but the journey budget remains the source of truth.

4. How would you avoid misleading SLOs caused by excluding timed-out or abandoned requests?

**Deep explanation:**
Define the denominator at client or edge acceptance so timeouts, lost traces, and excessive-latency abandonments remain visible. Reconcile accepted, completed, canceled, and missing requests, excluding only clearly intentional cancellations.

**Interview answer:**
I count attempts at a durable boundary and treat timeouts and unexplained abandonments as bad outcomes. I reconcile layer counts so overload cannot suppress its own evidence.

5. How would you design multi-window, multi-burn-rate alerting?

**Deep explanation:**
Burn rate is observed errors divided by the SLO's allowed error rate. Require matching short- and long-window breaches: high burn pages quickly, while sustained low burn creates a ticket without alerting on brief noise.

**Interview answer:**
I derive thresholds from how quickly the budget would be exhausted, pair a fast detection window with a confirmation window, and validate thresholds by replaying incidents.

6. How would you choose tail-based trace sampling without dropping important partial traces?

**Deep explanation:**
Route each trace consistently, buffer for a bounded time, and retain errors, high latency, important transactions, and suspiciously incomplete traces. A deterministic baseline sample protects evidence when collectors fail or spans arrive late.

**Interview answer:**
I use consistent trace ownership, bounded late-span waiting, and always-keep rules for errors and anomalous partial traces. I monitor dropped spans and keep a small head-sampled baseline.

7. How would you keep observability operational during the outage it must diagnose?

**Deep explanation:**
Isolate telemetry capacity and dependencies, buffer locally, enforce quotas, and preserve a minimal golden-signal path under cardinality floods. Alternate access, cached runbooks, and regional ingestion reduce circular dependencies.

**Interview answer:**
I give critical telemetry separate capacity, local buffering, and overload controls, plus break-glass access that does not depend on the failed system. I test the observability stack during resilience exercises.

8. How would you cap telemetry cost while retaining rare-failure evidence?

**Deep explanation:**
Aggregate common successes while retaining errors, rare dimensions, and important transactions. Adaptive sampling, cardinality budgets, sketches, exemplars, quotas, and tiered retention preserve diagnostic value at bounded cost.

**Interview answer:**
I always keep rare failures and high-value events, then sample repetitive success traffic and tier old data. I measure sampling decisions to verify known failure classes remain discoverable.

9. How would you handle clock skew when reconstructing a distributed incident timeline?

**Deep explanation:**
Use wall time as uncertain evidence, monotonic clocks for local duration, and request IDs or sequence numbers for causal ordering. NTP offset data and send-before-receive constraints help estimate corrected ranges.

**Interview answer:**
I anchor reliable boundaries, use causal relationships where timestamps conflict, and show uncertainty explicitly. I never force a precise total order that the clocks cannot support.

10. How would you measure queueing time separately from service time?

**Deep explanation:**
Record monotonic timestamps at admission, processing start, and completion. Export separate queue and execution distributions; for brokers, carry the original enqueue timestamp in message metadata.

**Interview answer:**
Queue time is start minus admission, and service time is completion minus start. Separate histograms reveal whether latency comes from waiting, computation, or downstream work.

11. How would you detect coordinated omission in load-test results?

**Deep explanation:**
A generator that waits for responses sends less traffic during stalls and hides tail latency. Use scheduled open-loop arrivals, measure from intended send time, and compare offered with achieved throughput.

**Interview answer:**
I schedule arrivals independently of response completion and inspect whether offered load collapses during stalls. If closed-loop testing is necessary, I also report omission-corrected latency.

12. How would you design a load test that captures burstiness and realistic key distributions?

**Deep explanation:**
Derive bursts, sessions, payloads, and key popularity from production traces. Hot-key skew, cold caches, retries, and diurnal patterns expose bottlenecks that average uniform traffic misses.

**Interview answer:**
I reproduce production arrival and key-frequency distributions, including bursts and hot keys, and test both warm and cold states. I verify the generator's actual workload before trusting results.

13. How would you prevent autoscaling from amplifying dependency overload?

**Deep explanation:**
More callers can worsen a saturated downstream through connection and retry storms. Combine scaling with dependency concurrency caps, shedding, jittered backoff, bounded scale-up, and downstream-aware signals.

**Interview answer:**
I scale on queueing and useful throughput while capping pressure on each dependency. Rate-limited scale-up, pre-warming, and admission control prevent new replicas from amplifying overload.

14. How would you apply adaptive concurrency limits to a saturated service?

**Deep explanation:**
Compare current latency with an unloaded baseline: increase admitted in-flight work cautiously and reduce quickly when queueing appears. Enforce the limit before expensive work and bound oscillation.

**Interview answer:**
I use latency inflation and outcomes as feedback for slow increases and faster decreases. I monitor rejection, utilization, latency, and oscillation, with separate limits where resources differ.

15. How would you prioritize requests under overload while avoiding starvation?

**Deep explanation:**
Reserve capacity for critical work and shed low-value requests, but avoid strict priority through weighted fairness, minimum shares, aging, or deadlines. Authenticate priority metadata and measure outcomes per class.

**Interview answer:**
I define a few auditable classes, reserve critical capacity, and guarantee lower classes a minimum share or aging. I reject early when deadlines cannot be met and monitor fairness.

16. How would you design retries with an end-to-end budget across multiple teams' services?

**Deep explanation:**
Propagate an absolute deadline and attempt metadata. Retry only safe transient failures when another attempt fits, using one retry owner, idempotency, capped jittered backoff, and quotas to prevent multiplication.

**Interview answer:**
I propagate deadline and attempt count, assign retry ownership, and retry only idempotent transient failures within remaining time. Shared metrics expose amplification and exhausted budgets.

17. How would you choose chaos experiments with a bounded blast radius?

**Deep explanation:**
Choose credible risks, define steady state, hypothesis, abort thresholds, owner, scope, and duration. Progress from test to canary or one cell, expanding only when evidence supports it.

**Interview answer:**
I start with the smallest representative experiment, explicit health guardrails, and an automatic kill switch. An incident-ready owner watches, captures evidence, and expands scope gradually.

18. How would you validate regional evacuation without hiding dependency coupling?

**Deep explanation:**
Exercise representative traffic plus state, DNS, identity, queues, quotas, third parties, and operational access. Observe shared dependencies and destination capacity, and test data lag, cached routing, and failback.

**Interview answer:**
I shift a bounded slice of real traffic and validate every dependency and correctness invariant in the destination. I disclose simulations, detect shared bottlenecks, and expand to full evacuation and failback in stages.

19. How would you detect a silent data-corruption incident before users report it?

**Deep explanation:**
Layer checksums, schema checks, business invariants, independent ledger reconciliation, and periodic restore scrubs. Replica agreement is insufficient when the same bad write reaches every copy; retain immutable source evidence.

**Interview answer:**
I continuously reconcile independently derived totals, validate data on reads and backups, and alert on invariant violations. I quarantine suspect data and preserve provenance before repair.

20. How would you distinguish durability loss from availability loss during recovery?

**Deep explanation:**
Availability means data is currently reachable; durability means acknowledged data still exists. Reconcile acknowledged-write logs, replication positions, backups, checksums, and business invariants to quantify any permanent gap.

**Interview answer:**
I report reachability and confirmed completeness separately. I do not declare recovery complete until acknowledged writes are reconciled and any lost interval is explicitly quantified.

21. How would you restore service when the control plane is unavailable?

**Deep explanation:**
Let the data plane continue with signed last-known-good configuration, cached credentials, bounded leases, and pre-provisioned capacity. Provide tested out-of-band routing and rollback, then reconcile state when control returns.

**Interview answer:**
I design fail-operational data-plane behavior and narrowly scoped, audited manual controls. Before automation resumes, I reconcile actual and desired state to avoid conflicting changes.

22. How would you design a break-glass process that remains auditable?

**Deep explanation:**
Issue named, least-privilege, short-lived access with strong authentication and urgency-appropriate approval. Record justification, issuance, actions, and revocation in tamper-resistant logs outside the affected domain.

**Interview answer:**
Emergency access is attributable, scoped, and automatically expires. Every use triggers immutable logging, credential rotation where needed, and post-incident review.

23. How would you prevent recovery actions from destroying forensic evidence?

**Deep explanation:**
Before mutation, safely capture volatile data, snapshots, logs, hashes, timestamps, custody, and responder actions. Analyze immutable copies, while allowing incident command to prioritize immediate containment over collection when harm is ongoing.

**Interview answer:**
I build evidence capture into recovery runbooks and prefer snapshots or clones before destructive repair. I document every action and explicitly record when safety requires containment first.

24. How would you manage an incident involving correctness failures rather than downtime?

**Deep explanation:**
Define the violated invariant, scope, and propagation path; uptime may remain green. Contain bad writes, establish a trusted source, preserve evidence, repair idempotently, and validate business outcomes.

**Interview answer:**
I declare impact in terms of wrong outcomes, stop further corruption, and scope affected entities with independent reconciliation. Recovery requires a validated repair and stakeholder communication, not merely healthy endpoints.

25. How would you choose between stopping writes and continuing with possible inconsistency?

**Deep explanation:**
Compare downtime harm with inconsistency harm, emphasizing reversibility, safety, regulation, observability, and repairability. Read-only, limited-write, or queued-intent modes make the decision less binary.

**Interview answer:**
I stop irreversible, safety-critical, or poorly observable writes. If operations are identifiable and compensatable, I may permit scoped audited writes or queue intents for later replay.

26. How would you assess whether redundancy introduces more failure modes than it removes?

**Deep explanation:**
Compare fault trees including coordination, replication lag, split brain, common-mode failure, failover transitions, and operational burden. Regular failover and failback tests reveal whether redundancy is usable.

**Interview answer:**
I weigh failures masked against failures and complexity introduced, using incident and exercise evidence. I retain redundancy only when customer outcomes improve after transition risk and maintenance cost are included.

27. How would you establish reliability ownership for a shared platform?

**Deep explanation:**
Publish service owners, SLOs, dependency contracts, consumer obligations, and escalation paths. Joint journeys need shared error-budget reviews, while ownership must include authority and resources for capacity and reliability work.

**Interview answer:**
The platform owns promised capabilities; consumers own correct usage, with explicit boundaries and joint review for shared journeys. Named owners get launch-gate authority, funding, and incident responsibilities.

28. How would you justify reliability investment using customer impact and operational cost?

**Deep explanation:**
Translate risk into lost tasks or revenue, churn, support, penalties, engineer interruption, and compliance exposure. Compare expected loss ranges with investment cost and estimated risk reduction, including release-speed and on-call benefits.

**Interview answer:**
I quantify customer and operational impact for credible scenarios, state uncertainty, and rank controls by expected impact reduction per unit cost. That connects reliability work to business outcomes.

29. How would you verify that postmortem actions actually reduce repeat incidents?

**Deep explanation:**
Link each action to a causal factor and define an owner, indicator, and validation test. Replay failures or inject faults, track recurrences and near misses, and revisit effectiveness after real exposure.

**Interview answer:**
Closure requires demonstrated risk reduction, not a checked ticket. I test the control, monitor its leading indicator and recurrence rate, and revise it if evidence shows it ineffective.

30. How would you make a system recoverable by engineers who did not build it?

**Deep explanation:**
Use discoverable ownership and dependencies, reproducible infrastructure, automated backups, safe tooling, and runbooks with prerequisites, expected output, rollback, and escalation. Exercises by unfamiliar engineers expose tribal knowledge.

**Interview answer:**
I automate common recovery and document the remaining decisions and verification steps. Engineers outside the owning team regularly perform realistic restores, and their failures drive design and runbook improvements.
