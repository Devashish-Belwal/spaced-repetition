1. How would you tune HNSW indexing and query parameters against recall and memory targets?

**Deep explanation:** Benchmark a labeled, production-like query set and measure recall@k, p95 latency, build time, and bytes per vector. Higher `M` improves graph connectivity but costs memory; `efConstruction` trades build cost for graph quality; `efSearch` trades query latency for recall. Select the cheapest configuration meeting the SLO under realistic concurrency and filters.

**Interview answer:** I would tune `M` and `efConstruction` during representative builds, then use `efSearch` as the runtime recall-latency control. I would choose based on recall, tail latency, memory, and indexing cost under load.

2. How would you compare graph-based ANN, inverted-file indexes, and product quantization?

**Deep explanation:** Graph indexes such as HNSW usually offer high recall and low latency but consume substantial memory. IVF partitions vectors into clusters and probes selected lists, giving controllable speed at the risk of cluster imbalance. PQ compresses vectors greatly but loses accuracy, so IVF-PQ retrieval is often followed by full-precision reranking.

**Interview answer:** HNSW favors recall and latency, IVF favors scalable candidate pruning, and PQ favors memory savings. I would benchmark the workload and often combine compressed retrieval with exact reranking.

3. How would you migrate embedding dimensions or models without corrupting similarity results?

**Deep explanation:** Different embedding models do not share a comparable vector or score space. Create a versioned parallel index, backfill it, dual-write new changes, and query old and new versions independently during validation. Compare coverage, relevance, latency, and score distributions before gradual traffic migration.

**Interview answer:** I would treat the new model as a new index version and never mix its vectors with the old space. I would backfill, dual-write, shadow-test, reconcile coverage, and cut over gradually with rollback.

4. How would you evaluate hybrid retrieval across head and long-tail queries?

**Deep explanation:** Stratify evaluation by frequency, intent, language, and difficulty so head traffic cannot hide long-tail failures. Compare lexical, vector, and fused rankings using judged recall, NDCG, zero-result rate, and latency per slice. Validate offline gains online with reformulation and abandonment guardrails.

**Interview answer:** I would score head and long-tail slices separately, compare lexical, semantic, and hybrid retrieval, and tune fusion without assuming raw scores are comparable. Then I would validate user outcomes online.

5. How would you prevent popularity signals from permanently suppressing new content?

**Deep explanation:** Raw clicks create a feedback loop because exposed items collect more clicks. Apply time decay, Bayesian smoothing, and controlled exploration so new items can gather evidence. Randomized exposure or contextual bandits help estimate value without inheriting position bias.

**Interview answer:** I would decay and smooth popularity, reserve safe exploration for new content, and learn from randomized exposure. That prevents historical visibility from becoming permanent rank advantage.

6. How would you detect position bias in click-based relevance feedback?

**Deep explanation:** Randomly rotate or swap results for a small safe sample, then measure the same item's click probability at different positions. Estimate examination propensities and use click models or inverse-propensity weighting to debias labels. Also inspect dwell time and task completion because clicks are ambiguous.

**Interview answer:** I would run controlled position randomization, estimate click propensity by rank, and debias training examples with those propensities. I would confirm findings with satisfaction signals beyond clicks.

7. How would you train a learning-to-rank model without leaking future outcomes?

**Deep explanation:** Build every feature as it existed at ranking time, using point-in-time joins and immutable feature definitions. Split data chronologically, keep future conversions only as labels, and prevent later aggregates from entering features. Evaluate on a future holdout and shadow the model before launch.

**Interview answer:** I would enforce point-in-time correct features, chronological splits, and versioned lineage. Labels can use a future window, but features cannot contain information after the ranking event.

8. How would you evaluate query rewriting that can change the user's intended meaning?

**Deep explanation:** Measure both relevance gain and meaning-preservation, including high-risk slices such as names, identifiers, and ambiguous terms. Human judgments should track catastrophic intent changes separately from average NDCG. Search original and rewritten queries together, gating aggressive rewrites by confidence.

**Interview answer:** I would evaluate rewrite precision and retrieval gain, with an explicit catastrophic meaning-change metric. I would keep the original query as a fallback and use confidence thresholds for semantic rewrites.

9. How would you design distributed top-k retrieval across shards?

**Deep explanation:** Each shard returns an oversampled local candidate set, and a coordinator merges or globally rescores candidates. Comparable scoring statistics, deterministic ties, and enough oversampling are essential for stable global results. Deadlines, replica hedging, and cancellation control tail latency.

**Interview answer:** I would fan out, collect oversampled local top-k results, normalize or globally rescore them, and merge centrally. I would add strict deadlines, replica fallback, cancellation, and deterministic tie-breaking.

10. How would you reason about approximate aggregate results across distributed shards?

**Deep explanation:** First define whether results must be exact, bounded, or merely useful. Shards can return mergeable sketches, samples, or heavy hitters with error metadata; the coordinator combines them and exposes confidence bounds. Test against exact answers under skew, filtering, and missing shards.

**Interview answer:** I would define an explicit accuracy contract and use mergeable sketches or stratified samples. Responses should expose error bounds and missing-shard status, validated under realistic skew.

11. How would you prevent shard-level scoring differences from producing unstable global rankings?

**Deep explanation:** Local term statistics make scores incomparable when shard composition changes. Use global collection statistics or centrally rescore an oversampled candidate set with one feature definition. Version scoring inputs and use deterministic ties so rebalancing does not cause arbitrary churn.

**Interview answer:** I would avoid merging uncalibrated local scores. I would distribute global statistics or centrally rescore candidates, version every scoring input, and use deterministic tie-breaking.

12. How would you split a hot search index while preserving query semantics?

**Deep explanation:** Choose partitioning that spreads load without breaking routing, filters, or tenant isolation. Build new shards from a consistent snapshot, replay ordered changes, shadow reads, and compare counts, deletes, and result overlap. Cut over with an atomic routing-version switch and retain rollback.

**Interview answer:** I would backfill a semantics-aware partitioning from a snapshot, replay the change log, and validate shadow results including deletes. Then I would atomically switch versioned routing with rollback available.

13. How would you serve search during a shard failure or partial regional outage?

**Deep explanation:** Replicate shards across failure domains and route to healthy replicas within per-shard deadlines. If the product permits degradation, return clearly marked partial or stale results with coverage metadata; otherwise fail fast. Never cache a partial response as complete.

**Interview answer:** I would use cross-zone replicas, deadline-aware fan-out, and automatic failover. Depending on the request contract, I would return labeled partial or stale results with coverage, or fail fast.

14. How would you define acceptable partial results for a search request?

**Deep explanation:** Define minimum corpus or shard coverage, required sources, maximum staleness, and allowed relevance loss by query intent. Browse queries may tolerate gaps, while compliance or exact-ID queries may not. Mark degradation in the API and UI, and exclude partial responses from normal caches and training.

**Interview answer:** I would create an intent-specific contract for required sources, minimum coverage, freshness, and relevance loss. High-risk requests would fail rather than mislead, while allowed partial responses would be explicit.

15. How would you balance refresh frequency, merge cost, indexing throughput, and query latency?

**Deep explanation:** Frequent refreshes improve freshness but create small segments, increasing query fan-out and later merge work. Larger batches reduce overhead but delay visibility, while merges compete for CPU and I/O. Start from the freshness SLO, then tune batching, merge throttling, and backpressure under realistic update load.

**Interview answer:** I would choose the longest refresh interval allowed by freshness, then load-test segment count, merge debt, indexing rate, and p99 query latency. I would use throttling and backpressure before resource contention cascades.

16. How would you investigate a cluster dominated by segment merges?

**Deep explanation:** Inspect merge backlog, segment sizes, refresh and flush rates, update/delete volume, disk throughput, CPU, and throttling. Typical causes are tiny indexing batches, frequent refreshes, update-heavy workloads, poor merge-policy settings, or slow storage. Change one factor at a time and verify freshness remains acceptable.

**Interview answer:** I would correlate merge debt with segment creation, updates, disk saturation, and query latency. Then I would test refresh cadence, batch size, merge policy, and storage capacity individually.

17. How would you handle billions of small documents without excessive metadata overhead?

**Deep explanation:** Per-document metadata can exceed tiny payloads. Use compact columnar encodings, shared dictionaries, sparse fields, and large immutable segments; avoid indexing or storing unused fields. Coalesce records only when doing so preserves independent updates, permissions, and scoring.

**Interview answer:** I would profile bytes per document, remove unused indexed fields, and use compact encodings and larger segments. I would group records only if it does not break update, ACL, or relevance semantics.

18. How would you enforce fine-grained document permissions at scale without cache leaks?

**Deep explanation:** Enforce authorization during candidate retrieval using indexed ACLs or security filters, not after results are returned. Cache keys must include an immutable permission context or contain only permission-safe shared data. Apply the same policy to facets, snippets, suggestions, logs, and invalidation after permission changes.

**Interview answer:** I would filter by ACL inside retrieval and treat every derivative—including counts and snippets—as protected. Caches would be keyed by a stable permission version and invalidated or superseded on changes.

19. How would you remove a user's documents from indexes, snapshots, and derived ranking features?

**Deep explanation:** Track provenance across indexes, caches, features, training data, and backups. An idempotent deletion pipeline should tombstone live records, propagate ordered deletion events, and prevent replay from resurrecting them. Immutable snapshots require approved expiration or cryptographic erasure, with acknowledgments and a content-free audit trail.

**Interview answer:** I would use provenance-aware deletion with durable tombstones and sequence numbers. I would track completion across live indexes, features, caches, and backup retention, then verify the deletion without retaining the content.

20. How would you perform a zero-downtime analyzer migration and validate relevance parity?

**Deep explanation:** Analyzer changes require a new versioned index because tokenization changes existing terms. Backfill, dual-write, and shadow representative queries against both versions; compare tokens, coverage, judged relevance, result overlap, and latency. Canary traffic, then atomically move an alias while retaining rollback.

**Interview answer:** I would build a parallel index, backfill and dual-write it, and compare token output, relevance, and performance in shadow traffic. After a canary, I would switch a versioned alias with rollback.

21. How would you version ranking experiments independently from index schema changes?

**Deep explanation:** Give the index schema, feature contract, model, and ranking configuration separate version identifiers. A compatibility matrix determines valid combinations, while experiment assignment selects ranking behavior without changing corpus representation. Log every version and assignment for reproducibility.

**Interview answer:** I would independently version index, features, model, and ranking configuration. Requests would carry all versions, incompatible combinations would be rejected, and experiments could change rankers without schema rollout.

22. How would you implement geographic, textual, and availability constraints in one search experience?

**Deep explanation:** Generate candidates with text relevance and a coarse spatial index, then perform exact geometry checks. Treat availability as a hard filter when unavailable results are invalid, while ranking eligible items using calibrated text and distance features. Define inventory freshness and radius-expansion behavior explicitly.

**Interview answer:** I would combine textual and spatial candidate generation, exact geographic validation, and authoritative availability filtering. Eligible results would be ranked with calibrated relevance and distance signals.

23. How would you detect adversarial keyword stuffing and ranking manipulation?

**Deep explanation:** Combine repetition and unnatural term distributions with hidden-content, behavioral, provenance, and account-network signals. Use time-split adversarial evaluation and features costly to fake. Apply graded responses such as demotion or review, and monitor false positives across languages and categories.

**Interview answer:** I would combine content anomalies with behavior and provenance instead of relying on keyword density. I would evaluate against evolving attacks, use graded enforcement, and monitor cohort-level false positives.

24. How would you provide search explanations without revealing private ranking signals?

**Deep explanation:** Expose approved, user-actionable reason categories such as text match, freshness, or distance—not raw weights, private features, or anti-abuse rules. Generate them through a policy-filtered explanation layer and test for inference attacks. Keep richer traces behind audited internal access controls.

**Interview answer:** I would provide coarse, truthful, allowlisted reason codes. Raw model details and sensitive signals would remain private, with detailed diagnostics restricted to authorized internal users.

25. How would you design a search service for rapidly changing inventory?

**Deep explanation:** Keep stable descriptive retrieval separate from highly volatile stock when constant full reindexing is impractical. Retrieve extra candidates, batch-check authoritative availability, and discard stale ones; stream stock changes into a fast filter where possible. Checkout must revalidate with stronger consistency than search display.

**Interview answer:** I would stream inventory updates, oversample search candidates, and validate stock against an authoritative service before display or checkout. Stable text can remain indexed independently to reduce update cost.

26. How would you compare precomputed suggestions with live prefix search?

**Deep explanation:** Precomputed suggestions are fast, cheap, stable, and easy to moderate but less fresh. Live prefix search improves freshness and coverage but increases cost, tail latency, abuse risk, and possible information leakage. A common design combines a curated cached head with a guarded live fallback.

**Interview answer:** Precomputed suggestions optimize latency and moderation; live prefix search optimizes freshness and coverage. I would compare acceptance, coverage, freshness, cost, and p99 latency, often using a hybrid.

27. How would you recover an index from source-of-truth data while maintaining deletion correctness?

**Deep explanation:** Rebuild from a consistent snapshot with a known change-log watermark, then replay all later versioned mutations, including durable tombstones. Retain deletion records longer than the oldest recoverable snapshot so replay cannot resurrect data. Reconcile counts, versions, samples, and delete sets before cutover.

**Interview answer:** I would rebuild from a versioned snapshot and replay ordered changes, including tombstones, from its watermark. Version checks make replay idempotent and prevent resurrection before traffic switches.

28. How would you define a search-quality SLO rather than only a latency SLO?

**Deep explanation:** Define user-success measures such as judged NDCG, successful-query rate, zero-result rate, reformulation, abandonment, and freshness coverage. Set thresholds for important query slices so aggregate head traffic cannot hide failures. Use offline judgment sets for regression gates and online outcomes for confirmation.

**Interview answer:** I would set slice-level targets for relevance and successful outcomes—for example minimum NDCG and success rate plus bounded zero-result and reformulation rates. Offline gates would catch regressions, and online metrics would confirm impact.

29. How would you select a search technology using realistic relevance and operational tests?

**Deep explanation:** Define requirements for relevance, query features, scale, update rate, latency, security, availability, staffing, and cost. Run shortlisted systems on the same production-like corpus and queries, testing judged relevance, concurrent indexing, p99 latency, recovery, rebalancing, and failures. Include growth and migration costs rather than relying on feature checklists.

**Interview answer:** I would run a workload-based bake-off with realistic data, traffic, updates, filters, and failures. I would compare relevance, tail latency, recovery, security, total cost, and team operability.

30. How would you determine whether search complexity belongs in a dedicated engine or a relational database?

**Deep explanation:** A relational database is often sufficient for modest scale, simple full-text or prefix queries, transactional consistency, and low operational overhead. A dedicated engine is justified by measured needs for sophisticated analysis, fuzzy or semantic retrieval, faceting, advanced relevance, or independent scaling. Account for synchronization, recovery, and operational cost before adding another system.

**Interview answer:** I would keep search in the database while its indexing meets relevance, scale, and latency requirements. I would adopt a dedicated engine only when measured advanced-search or scaling needs justify the consistency and operational complexity.
