1. How would you choose an SLI that reflects user experience?

**Deep explanation:** Define a measurable user outcome, such as successful checkouts divided by valid attempts, observed at the system boundary. Validate that it correlates with reported user pain; CPU or uptime alone are weak proxies.

**Interview answer:** I start with the user action, define eligible events and success precisely, measure near the user, and verify that the SLI tracks real impact.

2. How would you define an availability SLO for an asynchronous workflow?

**Deep explanation:** Enqueue success does not guarantee completion. Measure the proportion of valid jobs reaching the correct terminal state within a business deadline, while separately tracking failures and age of outstanding work.

**Interview answer:** I define availability as valid jobs completed correctly within the promised time, using durable workflow records rather than the enqueue response.

3. How would you set a latency objective for several important endpoints?

**Deep explanation:** Group endpoints by journey, cost, and expectation, then give each group a percentile and threshold. A global percentile can hide a slow critical endpoint behind abundant fast traffic.

**Interview answer:** I set separate percentile targets for meaningful endpoint groups, prioritize critical journeys, and ensure each group has enough traffic for reliable measurement.

4. How would you measure a user journey spanning multiple services?

**Deep explanation:** Instrument entry through final outcome with a shared correlation ID and measure end-to-end success and latency. Component metrics diagnose failures but cannot replace the journey-level SLI.

**Interview answer:** I measure the complete outcome at the journey boundary and use correlated traces and per-service metrics to explain any failure.

5. How would you use burn-rate alerts instead of only static thresholds?

**Deep explanation:** Burn rate measures how fast the error budget is consumed. Pair a short and long window: high sustained burn pages quickly, while slower burn creates a lower-urgency notification.

**Interview answer:** I alert on multi-window error-budget consumption so urgency reflects the risk of violating the SLO, not a momentary arbitrary threshold.

6. How would you reduce alert fatigue without hiding real failures?

**Deep explanation:** Page only for urgent, actionable user impact. Deduplicate related alerts, inhibit downstream noise, add appropriate persistence, route trends to tickets, and review false positives plus incidents users found first.

**Interview answer:** Every page must be actionable and tied to user or SLO impact; I deduplicate, tune, and regularly audit alerts for noise and missed failures.

7. How would you distinguish symptoms from causes in an alerting strategy?

**Deep explanation:** Symptoms are user-visible failures; causes are hypotheses such as CPU saturation. Page on stable symptoms and attach cause metrics for diagnosis, except predictive conditions requiring action before impact.

**Interview answer:** I page primarily on user-visible symptoms and use cause signals as diagnostic context, with rare predictive alerts for imminent failures.

8. How would you design metric labels without uncontrolled cardinality?

**Deep explanation:** Use bounded values such as region, status class, and route template. Put request IDs, user IDs, raw URLs, and free text in logs or traces; estimate and monitor series counts.

**Interview answer:** I allow only bounded labels that answer known questions, normalize routes, reject identifiers and free text, and monitor active-series growth.

9. How would you choose histogram buckets for a latency objective?

**Deep explanation:** Put a boundary exactly at the SLO threshold, add resolution near decision points and through the expected tail, and validate against production distributions. Extra buckets increase time-series cost.

**Interview answer:** I include the objective threshold, tune surrounding buckets from observed latency, and balance useful resolution against storage and cardinality.

10. Why can averaging percentiles across instances be misleading?

**Deep explanation:** Percentiles discard distribution shape and are not composable; averaging them also ignores traffic weights. Merge compatible histogram counts or samples, then calculate the fleet percentile.

**Interview answer:** Averaged percentiles are mathematically meaningless; I aggregate histogram buckets across instances and compute the percentile from the combined distribution.

11. How would you propagate trace context through queues and background jobs?

**Deep explanation:** Inject standard trace context into message metadata and extract it in workers. Use child spans for simple processing and span links for delayed, batched, fan-out, or retried work.

**Interview answer:** I propagate W3C context in headers, record message and attempt IDs, and use span links when asynchronous timing makes parent-child relationships misleading.

12. How would you connect frontend errors to backend traces?

**Deep explanation:** Propagate trace context from the client and include a safe trace ID, release, route, and sanitized error data in frontend events. Source maps make client stacks actionable.

**Interview answer:** I correlate sanitized frontend errors with backend trace IDs and release metadata, while preserving privacy and never exposing privileged trace content.

13. How would you choose sampling rates for traces and logs?

**Deep explanation:** Sample routine high-volume traffic probabilistically, but retain errors, slow requests, rare operations, and critical journeys at higher rates. Measure cost and bias, and preserve cross-signal correlation.

**Interview answer:** I use a representative baseline plus preferential sampling for diagnostically valuable events, coordinating decisions across traces and logs and reviewing cost and bias.

14. How would you redact sensitive information before telemetry leaves a service?

**Deep explanation:** Prefer allowlisted telemetry schemas, removing or tokenizing secrets before export. Enforce controls in instrumentation and again at the collector; test URLs, headers, payloads, queries, and stacks.

**Interview answer:** I emit only approved fields, redact at source, enforce collector-side defense in depth, and continuously test with representative sensitive values.

15. How would you investigate high p99 latency with normal average latency?

**Deep explanation:** Segment the tail by route, region, instance, shard, payload, cache status, and version, then inspect slow exemplars. Common causes include queueing, retries, locks, pauses, and cold starts.

**Interview answer:** I slice the distribution and inspect traces from slow buckets, looking for a small affected cohort or intermittent queueing, retry, pause, or shard problem.

16. How would you identify a retry storm from operational metrics?

**Deep explanation:** Compare logical operations with downstream attempts. Rising attempts per operation, synchronized retries, timeouts, queue depth, and dependency traffic alongside falling success reveal amplification.

**Interview answer:** I track retry reasons and attempts per original operation; rapid amplification with worsening dependency health indicates a retry storm.

17. How would you set timeouts across a chain of dependencies?

**Deep explanation:** Start with the end-to-end deadline, reserve caller work, and propagate remaining time. Downstream timeouts and bounded retries must fit inside it, with cancellation stopping useless work.

**Interview answer:** I derive every hop timeout from one propagated deadline, keep retries within that budget, and cancel work once no useful response is possible.

18. How would you configure a circuit breaker without making recovery harder?

**Deep explanation:** Trip on meaningful failure volume, open for a bounded period, then permit few jittered half-open probes. Observe transitions and ensure retries or synchronized probes cannot stampede recovery.

**Interview answer:** I use volume-aware thresholds, a short open interval, limited jittered recovery probes, observable state, and a tested fallback.

19. How would you isolate slow dependencies using bulkheads?

**Deep explanation:** Partition concurrency, connections, queues, or workers by dependency or priority, with bounded queues and fast rejection. This contains failure but may strand capacity, so monitor and tune partitions.

**Interview answer:** I give risky dependencies separate bounded resource pools so one slowdown cannot exhaust the service, then tune the isolation from utilization data.

20. How would you implement graceful degradation for a recommendation outage?

**Deep explanation:** Use a strict timeout and ordered fallback: cached personalization, popular content, then omit the module. Measure fallback use and test it regularly so the core journey remains healthy.

**Interview answer:** I fail recommendations quickly and fall back to cached or generic content, preserving the core page while monitoring and routinely testing degraded behavior.

21. How would you shed low-priority traffic while preserving critical requests?

**Deep explanation:** Authenticate priority, reserve capacity for critical classes, and reject or defer low-priority work before expensive processing. Return clear overload responses and monitor fairness and protected SLIs.

**Interview answer:** I use trusted priority classes, reserved concurrency, and early admission control to shed cheap, low-priority work while protecting critical journeys.

22. How would you plan capacity using measured saturation signals?

**Deep explanation:** Identify the resource that becomes nonlinear first, relate demand to it, and forecast peaks, growth, burstiness, and failure scenarios. Keep explicit headroom rather than sizing to averages.

**Interview answer:** I capacity-plan around the measured bottleneck, peak demand, growth, and reduced-capacity scenarios, retaining enough headroom for bursts and failures.

23. How would you design synthetic probes without confusing them with real traffic?

**Deep explanation:** Use dedicated identities, recognizable metadata, and isolated test data. Exclude probes from product analytics but keep them visible in operational traffic and ensure they safely exercise realistic paths.

**Interview answer:** I clearly label probes and isolate their data, exclude them from business metrics, but preserve their operational visibility and realistic end-to-end coverage.

24. How would you define readiness for a service with optional dependencies?

**Deep explanation:** Readiness means serving the minimum contract. Gate on essential initialization and critical capabilities; optional failures should trigger degradation, not remove every instance. Avoid amplifying outages with synchronous probe checks.

**Interview answer:** I gate readiness only on minimum viable service dependencies and expose optional dependency failures as degraded state with separate monitoring.

25. How would you test that backups meet recovery objectives?

**Deep explanation:** Restore regularly into isolation and measure actual RTO and recoverable data age against RPO. Validate integrity, consistency, keys, permissions, dependencies, and representative application behavior.

**Interview answer:** I conduct realistic restore drills, measure RTO and RPO, and verify the recovered system and data—not merely that backup files exist.

26. How would you manage an incident while several engineers investigate in parallel?

**Deep explanation:** Assign an incident commander, communications owner, and scoped investigation owners. Keep one timeline of hypotheses, evidence, actions, and results, with frequent synchronization and controlled risky changes.

**Interview answer:** I establish clear roles and parallel workstreams, centralize the timeline, synchronize findings frequently, and route risky production actions through the incident commander.

27. How would you communicate impact and uncertainty during an outage?

**Deep explanation:** Lead with confirmed user impact, scope, timing, mitigation, and workarounds. Separate facts, hypotheses, and unknowns, and state the next update time even when little changes.

**Interview answer:** I communicate confirmed impact first, label uncertainty explicitly, avoid speculative causes, and promise a concrete next update with consistent facts.

28. How would you distinguish mitigation from root-cause repair?

**Deep explanation:** Mitigation safely reduces current impact; repair removes the failure mechanism and prevents recurrence. Separating them avoids risky permanent changes during an incident and premature closure after recovery.

**Interview answer:** I mitigate first with a safe reversible action, then track and validate the permanent root-cause fix separately.

29. How would you verify a rollback has restored the user journey?

**Deep explanation:** Confirm version rollback everywhere, then evaluate the original end-to-end SLI and reproduce the journey. Watch errors, latency, queues, correctness, and delayed effects; deployment status alone is insufficient.

**Interview answer:** I verify the deployed version and prove recovery through the affected journey and SLI, including delayed processing and data correctness.

30. How would you identify useful follow-up actions from a postmortem?

**Deep explanation:** Address contributing conditions and failed defenses, not only the trigger. Actions should be specific, owned, prioritized, time-bound, and verifiable across prevention, detection, mitigation, and response.

**Interview answer:** I turn important contributing factors into owned, testable controls, prioritize by risk, and verify completed actions actually improve the failed defense.

31. How would you measure toil and prioritize automation?

**Deep explanation:** Measure repetitive work by frequency, duration, interruption, error risk, and scaling rate. Rank automation by time and reliability return versus build and maintenance cost; eliminate needless work first.

**Interview answer:** I quantify recurring operational cost and risk, remove or simplify work where possible, then automate the highest-return remaining tasks.

32. How would you test a dependency failure without risking unrelated customers?

**Deep explanation:** Inject failure only for an isolated environment, tenant, cell, header, or small canary. Define expected behavior, observability, abort thresholds, duration, and a tested kill switch.

**Interview answer:** I run a tightly scoped fault experiment with explicit hypotheses, monitoring, abort criteria, and a kill switch, ensuring unrelated traffic cannot enter the experiment.

33. How would you prepare on-call handover for an unfamiliar service?

**Deep explanation:** Cover purpose, architecture, dependencies, SLOs, dashboards, alerts, runbooks, access, recent changes, known risks, and escalation. Practice with a recent incident or simulated alert.

**Interview answer:** I provide the service map and operational essentials, walk through an incident, and explicitly transfer active risks, owners, and next actions.

34. How would you track reliability changes after a deployment?

**Deep explanation:** Tag telemetry by version and compare canary with control on journey SLIs, errors, latency, and saturation. Predefine rollback criteria and watch long enough for delayed effects.

**Interview answer:** I compare versioned canary and baseline telemetry against pre-agreed thresholds, accounting for traffic mix and monitoring delayed failures before declaring success.

35. How would you monitor a scheduled job that silently stops running?

**Deep explanation:** Use an external freshness monitor that expects a durable heartbeat or completion record. Track last attempt, last success, duration, output freshness, and schedule-aware grace periods.

**Interview answer:** I alert on missing expected completion from outside the scheduler, using last-success and output-freshness data with an appropriate scheduling grace period.
