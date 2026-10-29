1. How do monitoring and observability differ?

**Deep explanation:** Monitoring checks known conditions through predefined signals, such as alerting when CPU exceeds 90%. Observability is the broader ability to infer internal system state from outputs and investigate failures that were not predicted. Monitoring says something is wrong; observability helps explain why.

**Interview answer:** Monitoring tracks known signals and expected failure modes. Observability lets us explore telemetry to understand both known and unexpected system behavior.

2. What are logs, metrics, and traces useful for?

**Deep explanation:** Logs record detailed events, metrics summarize numeric behavior over time, and traces follow individual requests across components. Together they answer what happened, how often it happened, and where time or failure occurred.

**Interview answer:** Logs provide event context, metrics show trends and aggregate health, and traces follow requests across services. I use all three because they answer complementary diagnostic questions.

3. What is a structured log?

**Deep explanation:** A structured log stores named fields in a machine-readable format such as JSON rather than only free-form text. Fields like `service`, `request_id`, and `error_code` can be reliably searched and aggregated. Consistent schemas help analysis, though excessive high-cardinality fields raise cost.

**Interview answer:** A structured log represents an event as named fields, usually JSON, so tools can reliably query and aggregate it without parsing arbitrary text.

4. How do log levels help operators?

**Deep explanation:** Levels such as debug, info, warning, and error indicate importance and expected response. They let operators filter routine events and suppress verbose production output. Definitions must be consistent; marking normal behavior as errors creates noise and hides real failures.

**Interview answer:** Log levels classify severity so operators can filter noise and focus on actionable failures. I use them consistently and do not label expected business outcomes as system errors.

5. What is a metric label?

**Deep explanation:** A label is a key-value dimension attached to a metric, such as `method=GET` or `region=ap-south-1`. Labels enable filtering and grouping. Unbounded values such as user or request IDs create high cardinality, which can make monitoring expensive or unstable.

**Interview answer:** A metric label is a dimension used to filter or group a metric, such as endpoint, region, or status. I avoid unbounded label values because high cardinality is costly.

6. How do counters, gauges, and histograms differ?

**Deep explanation:** A counter only increases except on reset and suits event totals; rates are derived from it. A gauge rises or falls and represents a current value such as queue depth. A histogram places observations into buckets, enabling distributions and percentile estimates while trading precision for storage.

**Interview answer:** Counters track cumulative events, gauges track values that move up and down, and histograms capture distributions. I would use them for request totals, active connections, and latency respectively.

7. What is a distributed trace?

**Deep explanation:** A distributed trace records one request's end-to-end path across processes or services. It groups timed operations called spans under one trace ID, revealing dependencies, latency, and errors. Sampling is often used to control overhead and storage.

**Interview answer:** A distributed trace follows one request across service boundaries. Its spans show which components ran, how long each took, and where an error or bottleneck occurred.

8. How do spans relate to traces?

**Deep explanation:** A span represents one timed operation, such as an HTTP call or database query. A trace is the collection of related spans for one request. Parent-child relationships show causal flow, while attributes add context; broken context propagation can leave traces incomplete.

**Interview answer:** A span is one operation with timing and metadata, while a trace collects all related spans for an end-to-end request.

9. What is a correlation ID?

**Deep explanation:** A correlation ID is propagated through related operations and recorded in their logs or messages. It lets operators find events belonging to the same request or workflow across services. It should not contain sensitive data; a trace ID often serves a similar purpose.

**Interview answer:** A correlation ID links events from the same request or workflow across services. Propagating it in calls and logs makes troubleshooting much faster.

10. What are latency, traffic, errors, and saturation useful for measuring?

**Deep explanation:** These four golden signals summarize service health. Latency measures response time, traffic measures demand, errors measure failed work, and saturation measures proximity to resource capacity. Viewed together, they distinguish issues such as capacity pressure from code or dependency failures.

**Interview answer:** Latency shows speed, traffic shows demand, errors show unsuccessful work, and saturation shows capacity pressure. Together they describe user impact and likely operational causes.

11. How do SLIs, SLOs, and SLAs differ?

**Deep explanation:** An SLI is a measured reliability indicator, such as successful-request ratio. An SLO is an internal target for that indicator, such as 99.9% over 30 days. An SLA is a formal customer commitment that may specify remedies if missed; SLOs are often stricter to provide safety margin.

**Interview answer:** An SLI is what we measure, an SLO is the target we aim for, and an SLA is the contractual customer promise, often with consequences if missed.

12. What is an error budget?

**Deep explanation:** An error budget is the unreliability allowed by an SLO. A 99.9% target leaves 0.1% of eligible events or time as budget. Teams can spend it on change and experimentation; rapid consumption signals a need to reduce release risk and improve reliability.

**Interview answer:** An error budget is the failure allowance implied by an SLO—one minus the target. It helps balance feature velocity against reliability using actual user impact.

13. How would you calculate availability from good and total requests?

**Deep explanation:** Event-based availability is `good requests / total eligible requests`, multiplied by 100 for a percentage. If 999,000 of 1,000,000 eligible requests are good, availability is 99.9%. The definitions of eligible and good must be explicit and consistent.

**Interview answer:** I calculate availability as `good requests ÷ total eligible requests × 100%`, after defining precisely which requests are eligible and what counts as good.

14. How do mean and percentile latency differ?

**Deep explanation:** Mean latency is total latency divided by request count, so extremes can distort it and averages can hide a slow tail. A percentile such as p95 is the threshold at or below which 95% of observations fall, exposing the experience of slower users.

**Interview answer:** Mean latency gives an overall average, while p95 or p99 describes the slow tail. I prefer percentiles for user-facing objectives because averages can hide outliers.

15. What is an actionable alert?

**Deep explanation:** An actionable alert signals a meaningful condition requiring a clear human response with suitable urgency. It should reflect user impact or imminent risk and include context, ownership, and guidance. Informational or routinely ignored pages create alert fatigue.

**Interview answer:** An actionable alert reaches the right owner about a real condition needing timely intervention and provides enough context to respond. If no immediate action is required, it should not page someone.

16. How do dashboards and alerts serve different purposes?

**Deep explanation:** Dashboards support visual exploration, situational awareness, and trend analysis when someone looks at them. Alerts actively notify responders when a defined condition needs attention. Alerts commonly link to dashboards for context, but turning every dashboard anomaly into a page creates noise.

**Interview answer:** Dashboards are for observing and investigating system state; alerts interrupt someone for conditions requiring action. A good alert often links to a useful diagnostic dashboard.

17. What is a runbook?

**Deep explanation:** A runbook is an operational guide for diagnosing and responding to a known scenario. It includes symptoms, validation steps, safe mitigations, escalation paths, ownership, and rollback instructions. It must be tested and maintained because outdated commands can worsen incidents.

**Interview answer:** A runbook is a tested guide for handling an operational condition, with diagnostic checks, mitigations, escalation details, and recovery or rollback steps.

18. How do health, readiness, and liveness checks differ operationally?

**Deep explanation:** A health check broadly reports service status. Readiness asks whether an instance can receive traffic; failure removes it from load balancing without necessarily restarting it. Liveness asks whether the process is stuck and needs restart. Depending on every external service in liveness can cause restart storms.

**Interview answer:** Readiness controls traffic, liveness controls restarts, and health is a broader status view. I keep liveness simple so a dependency outage does not restart every healthy process.

19. What is a timeout?

**Deep explanation:** A timeout bounds how long an operation may wait before failing. It prevents a slow dependency from consuming threads, connections, or an entire request deadline indefinitely. Values should reflect the remaining end-to-end deadline and expected latency; too short causes false failures, too long delays recovery.

**Interview answer:** A timeout limits how long I wait so slow dependencies cannot hold resources indefinitely. I derive it from the request deadline and normal latency.

20. What is a retry budget?

**Deep explanation:** A retry budget caps retries relative to normal traffic or available capacity. It prevents a failing dependency from receiving a retry storm that amplifies load. Retries also need backoff, jitter, idempotency, and enough time remaining in the overall deadline.

**Interview answer:** A retry budget limits additional traffic caused by retries. With backoff, jitter, and idempotency, it prevents retries from turning partial failure into overload.

21. What is a circuit breaker?

**Deep explanation:** A circuit breaker stops calls after failures cross a threshold. It changes from closed to open, fails fast during a cooling period, then permits limited probes in a half-open state. It protects resources and enables recovery, though thresholds must tolerate harmless transient failures.

**Interview answer:** A circuit breaker temporarily fails fast when a dependency repeatedly fails, then probes it before restoring traffic. It prevents wasted work and cascading failure.

22. What is a bulkhead?

**Deep explanation:** A bulkhead isolates resources so one failing workload cannot consume everything. Examples include separate worker, connection, or thread pools by dependency or tenant. Isolation improves fault containment but reserves capacity less flexibly and adds configuration complexity.

**Interview answer:** A bulkhead partitions resources between workloads so one overloaded dependency or tenant cannot exhaust the whole service. Separate connection pools are a common example.

23. What is graceful degradation?

**Deep explanation:** Graceful degradation preserves essential functionality while reducing noncritical features or quality during failure. A service might return cached recommendations or omit personalization. Fallbacks must be designed and tested so they remain safe and do not silently corrupt data.

**Interview answer:** Graceful degradation keeps the core user journey working by simplifying or disabling nonessential features—for example, serving cached data when personalization is unavailable.

24. What is load shedding?

**Deep explanation:** Load shedding deliberately rejects, delays, or drops work near unsafe capacity. Admission control can prioritize critical requests and return fast `429` or `503` responses instead of letting queues grow until everything times out. Some work is sacrificed to protect overall availability.

**Interview answer:** Load shedding rejects excess or low-priority work before overload causes total collapse. Fast failures preserve capacity for critical requests and help recovery.

25. What is a single point of failure?

**Deep explanation:** A single point of failure is one component whose loss makes a required service unavailable. It may be hardware, a database, network path, credential, region, or human-controlled process. Redundancy removes the risk only when failover paths are independent and tested.

**Interview answer:** A single point of failure is any one component whose failure can take down the service. I address it with independent redundancy and tested failover.

26. How do failover and disaster recovery differ?

**Deep explanation:** Failover switches service to a healthy redundant component after failure, often automatically within normal architecture. Disaster recovery is the broader restoration plan after a major event such as region loss or corruption. It includes data, infrastructure, procedures, people, and recovery objectives; failover may be one part.

**Interview answer:** Failover redirects work to redundant capacity when a component fails. Disaster recovery covers restoring the whole business service after major disruption, including data and operational procedures.

27. How do RTO and RPO differ?

**Deep explanation:** Recovery Time Objective is the target maximum time to restore service. Recovery Point Objective is the target maximum data loss measured in time. Tighter targets require more replication, automation, testing, and cost.

**Interview answer:** RTO is how quickly service must return; RPO is how much recent data loss is acceptable. An RTO of one hour and RPO of five minutes means recovering within an hour using data no more than five minutes old.

28. What is an incident severity level?

**Deep explanation:** A severity level classifies an incident by impact, scope, urgency, and sometimes duration. It determines paging, leadership involvement, communication, and update cadence. Criteria should be objective, and severity can change as evidence clarifies impact; it describes consequences, not blame.

**Interview answer:** A severity level standardizes incident impact so the organization applies the right urgency, responders, and communication process. It can be raised or lowered as scope becomes clear.

29. What should an incident timeline record?

**Deep explanation:** A timeline records important symptoms, alerts, observations, decisions, actions, communications, ownership changes, and recovery milestones with timestamps. It should distinguish facts from hypotheses and identify key action initiators. This supports live coordination and later learning.

**Interview answer:** It should timestamp detection, impact changes, hypotheses, decisions, mitigations, communications, and recovery. I keep facts separate from assumptions so events can be reconstructed accurately.

30. What makes a postmortem useful?

**Deep explanation:** A useful postmortem is blameless, evidence-based, and focused on system improvement. It explains impact, contributing technical and organizational conditions, detection, and response. Its action items have owners and priorities; merely naming a root cause or blaming human error does not reduce future risk.

**Interview answer:** A useful postmortem explains impact and contributing conditions without blame, extracts concrete lessons, and creates prioritized action items with owners. Its value comes from resulting improvements.
