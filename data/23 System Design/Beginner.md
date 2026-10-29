1. What should you clarify before proposing a system architecture?
**Deep explanation:** Clarify users, core flows, scope, scale, latency, availability, consistency, security, and constraints; these determine what the design must optimize.
**Interview answer:** I confirm the main use cases, scale, SLOs, constraints, and out-of-scope items, then state my assumptions.
2. How do functional and nonfunctional requirements differ?
**Deep explanation:** Functional requirements say what the system does; nonfunctional requirements specify qualities such as latency, availability, durability, and cost.
**Interview answer:** “Upload a photo” is functional; “complete within two seconds” is nonfunctional.
3. How would you choose the most important user flows for an interview?
**Deep explanation:** Prioritize flows by business value, frequency, and technical risk, then cover a few end to end instead of every edge case.
**Interview answer:** I select the highest-value, highest-volume, or riskiest flows and confirm that scope with the interviewer.
4. How would you make assumptions explicit when traffic numbers are missing?
**Deep explanation:** Pick plausible round values for users, actions, payloads, and peaks, write them down, and show how results change if they differ.
**Interview answer:** I state concrete assumptions, explain them briefly, and invite correction before calculating.
5. How do average throughput and peak throughput differ?
**Deep explanation:** Average throughput spreads work across time; peak throughput captures bursts and therefore drives capacity plus headroom.
**Interview answer:** Average is total work divided by time; peak is the highest short-window rate the system must handle.
6. How would you estimate requests per second from daily active users?
**Deep explanation:** Multiply DAU by requests per user, divide by 86,400, then apply peak and read/write factors.
**Interview answer:** Average RPS equals DAU times daily requests per user divided by 86,400; I then estimate peak RPS.
7. How would you estimate storage from event rate, record size, and retention?
**Deep explanation:** Multiply events per second, bytes per event, and retention seconds, then include replicas, indexes, metadata, and headroom.
**Interview answer:** I calculate raw retained bytes, then adjust for replication, indexes, compression, and growth.
8. How would you estimate bandwidth for image or video delivery?
**Deep explanation:** Multiply peak deliveries by average bytes delivered, considering bitrate, duration, renditions, CDN hit rate, and protocol overhead.
**Interview answer:** Peak bandwidth is delivery rate times payload size; CDN hits determine how much reaches the origin.
9. How would you estimate cache memory for a working set?
**Deep explanation:** Multiply hot-object count by cached size, including key overhead, then add replication and headroom and validate the hit rate.
**Interview answer:** I size the hot working set plus metadata, replicas, and safety margin.
10. How do latency percentiles differ from average latency?
**Deep explanation:** An average hides slow outliers; p99 is the threshold below which 99% of requests complete and exposes tail experience.
**Interview answer:** I use percentiles such as p95 or p99 because the mean can hide badly affected users.
11. How do availability and reliability requirements affect design?
**Deep explanation:** Higher targets require redundancy, isolation, failover, durable data, testing, and greater operational cost.
**Interview answer:** I convert the target into allowed downtime and failure cases, then design proportional redundancy and recovery.
12. How would you define an acceptable consistency model for a feature?
**Deep explanation:** Choose based on tolerable anomalies: payments may need strong consistency, while feeds can often tolerate eventual consistency.
**Interview answer:** I use the weakest consistency model that still preserves the feature’s correctness and user expectations.
13. How would you define recovery time and recovery point objectives?
**Deep explanation:** RTO limits restoration time; RPO limits acceptable data loss measured in time, driving failover and backup choices.
**Interview answer:** RTO is how long recovery may take; RPO is how much recent data may be lost.
14. How would you identify a system's source of truth?
**Deep explanation:** Identify the authoritative state from which caches, indexes, replicas, and other projections can be rebuilt.
**Interview answer:** I name one authoritative owner for each entity and treat derived stores as rebuildable.
15. How would you design APIs before choosing infrastructure products?
**Deep explanation:** Define use-case-driven contracts, errors, pagination, idempotency, and versioning; their access patterns then guide technology choices.
**Interview answer:** I establish API semantics first, then choose infrastructure that meets those contracts and SLOs.
16. How would you choose a data model from access patterns?
**Deep explanation:** List dominant reads, writes, filters, ordering, joins, and transaction boundaries, then design keys and indexes around them.
**Interview answer:** I work backward from queries and invariants, denormalizing only when the performance benefit justifies consistency cost.
17. How would you draw a high-level architecture with clear request and data flows?
**Deep explanation:** Show clients, edge, services, stores, caches, queues, and dependencies with directional arrows for synchronous and asynchronous paths.
**Interview answer:** I draw the minimum components and trace the main request and data flow end to end.
18. How do vertical and horizontal scaling differ?
**Deep explanation:** Vertical scaling enlarges one node and is simple but limited; horizontal scaling adds nodes but requires distribution and coordination.
**Interview answer:** Scale up means bigger machines; scale out means more machines, improving capacity and resilience with added complexity.
19. How would you identify a single point of failure?
**Deep explanation:** Walk every critical dependency and ask whether losing it stops service without a tested alternative.
**Interview answer:** I failure-test each critical component and require redundancy plus verified failover.
20. How would you distinguish a bottleneck from a merely busy component?
**Deep explanation:** A bottleneck limits end-to-end throughput or latency; confirm it through saturation, queue growth, and capacity experiments.
**Interview answer:** High utilization alone is insufficient; adding capacity must improve system performance.
21. When would a monolith be a sensible starting architecture?
**Deep explanation:** A modular monolith suits small teams, uncertain boundaries, moderate scale, and workflows benefiting from simple transactions.
**Interview answer:** I start modular when delivery speed and simplicity outweigh independent deployment or scaling needs.
22. What are the operational costs of microservices?
**Deep explanation:** They add network failures, contract management, tracing, deployment coordination, data consistency challenges, and on-call burden.
**Interview answer:** Microservices are worthwhile only when independent ownership, deployment, or scaling exceeds their distributed-systems cost.
23. How does service-oriented architecture compare with microservices?
**Deep explanation:** Traditional SOA often has larger services and centralized governance; microservices emphasize bounded contexts and decentralized independent deployment.
**Interview answer:** Microservices are a highly autonomous style of service orientation, distinguished mainly by ownership and deployability.
24. What is an API gateway responsible for?
**Deep explanation:** It routes edge traffic and may handle authentication, TLS, rate limits, transformation, aggregation, and observability.
**Interview answer:** A gateway centralizes cross-cutting edge concerns, but I keep domain logic out of it.
25. What is a backend-for-frontend pattern useful for?
**Deep explanation:** A BFF shapes and aggregates data for a specific client, reducing chattiness but adding services and possible duplication.
**Interview answer:** I use a BFF when web, mobile, or devices have materially different interaction needs.
26. How do synchronous and event-driven workflows differ?
**Deep explanation:** Synchronous calls give immediate results but couple latency and availability; events decouple work but add retries and eventual consistency.
**Interview answer:** I use sync when an immediate result is required and events for resilient background work or fanout.
27. What is fanout in a feed or notification system?
**Deep explanation:** Fanout expands one producer event into deliveries or views for many recipients.
**Interview answer:** It is distributing one update to many consumers, such as inserting a post into followers’ feeds.
28. How do fanout-on-write and fanout-on-read differ?
**Deep explanation:** Write fanout precomputes feeds for fast reads; read fanout assembles them later, avoiding costly celebrity writes but raising read cost.
**Interview answer:** I choose or hybridize them based on read/write ratio and follower distribution.
29. What is CQRS?
**Deep explanation:** CQRS separates write commands from read queries so each model can optimize independently, at synchronization and complexity cost.
**Interview answer:** It uses a command model for invariants and separate query projections for efficient reads.
30. How does event sourcing differ from ordinary audit logging?
**Deep explanation:** Event sourcing makes immutable events authoritative and replays them for state; audit logs merely supplement mutable authoritative data.
**Interview answer:** In event sourcing events are the source of truth; in audit logging they are supporting history.
31. How do batch and stream processing differ?
**Deep explanation:** Batch handles bounded data periodically; streaming handles unbounded arrivals continuously with windowing and state complexity.
**Interview answer:** I choose batch for throughput and recomputation, streaming when low-latency freshness is required.
32. What are Lambda and Kappa architectures intended to organize?
**Deep explanation:** Lambda combines batch and speed paths; Kappa uses one streaming path plus event replay, avoiding duplicate processing logic.
**Interview answer:** They organize large-scale data processing: Lambda has two paths, while Kappa unifies around streams.
33. What is a cell-based architecture?
**Deep explanation:** Self-contained cells serve subsets of traffic, limiting blast radius but complicating routing, balancing, and cross-cell work.
**Interview answer:** A cell is an isolated service-stack copy assigned part of the user base for repeatable scale and fault isolation.
34. How would you explain a design tradeoff without declaring one technology universally best?
**Deep explanation:** Tie the choice to requirements, compare relevant dimensions, state the accepted downside, and name what would change the decision.
**Interview answer:** Given these assumptions I choose X for benefits A and B, accept cost C, and would reconsider if D changes.
35. How would you select one component for an interview deep dive?
**Deep explanation:** Choose a central, risky component with meaningful data, scale, consistency, or failure tradeoffs.
**Interview answer:** I deep-dive the highest-risk core component and cover its schema, scaling, correctness, and failure modes.
36. How would you estimate peak QPS for 10 million daily users making 20 requests each with an eightfold peak factor?
**Deep explanation:** 200 million daily requests divided by 86,400 is about 2,315 average QPS; multiplied by eight is about 18,520 peak QPS.
**Interview answer:** About 2.3K average and 18.5K peak QPS, before safety headroom.
37. How would you estimate one year's replicated storage for 50,000 events per second at 500 bytes each?
**Deep explanation:** The 25 MB/s raw rate produces about 788 TB decimal yearly; three replicas need about 2.37 PB before overhead.
**Interview answer:** Roughly 788 TB raw per year, or 2.4 PB at 3× replication, excluding indexes and headroom.
38. How would you estimate concurrent requests from throughput and average request duration?
**Deep explanation:** Little’s Law gives concurrency approximately equal to QPS times average duration in seconds, with margin for bursts and tails.
**Interview answer:** At 2,000 QPS and 0.2 seconds, about 400 requests are in flight.
39. How would you communicate uncertainty in capacity estimates?
**Deep explanation:** Expose assumptions, ranges, formulas, sensitivity, and safety margin, then propose measurement and load testing.
**Interview answer:** I distinguish facts from estimates, show the range and dominant variables, and explain how we will validate them.
40. How would you summarize your design and its remaining risks in the final interview minutes?
**Deep explanation:** Recap requirements, main flow, source of truth, scaling and resilience choices, tradeoffs, unresolved risks, and next tests.
**Interview answer:** I show how the design meets core requirements, highlight key tradeoffs and failures, then name the top risks and next steps.
