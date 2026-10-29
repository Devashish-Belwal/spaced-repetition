1. How would you design analyzers for several languages?

**Deep explanation:** Use a language-specific analyzer per field or per language-specific index: Unicode normalization, appropriate tokenization, lowercase rules, stopwords, and stemming or lemmatization. Detect language at ingestion when it is unknown, but retain the original text and provide a conservative fallback analyzer for mixed or uncertain content. Test each analyzer with representative queries because stemming and stopwords can improve recall while damaging names or precision.

**Interview answer:** I would route documents to language-specific fields or indexes and use analyzers tailored to each language. I would preserve the original text, fall back conservatively for mixed-language content, and validate token output and relevance using real queries.

2. How would you handle punctuation, identifiers, names, and product codes differently?

**Deep explanation:** Natural-language text usually benefits from punctuation-aware tokenization, but identifiers and product codes often need exact matching and carefully chosen delimiters. Map a value into multiple fields: a normalized keyword field for exact lookup, a text field for partial search, and possibly edge n-grams for prefixes. Avoid aggressive stemming or punctuation removal for names and codes because `C++`, `AB-123`, and `O'Connor` carry meaning in those characters.

**Interview answer:** I would use multi-fields: normalized keyword fields for exact matches and specialized text or prefix fields for discovery. Names and codes get conservative analysis so meaningful punctuation and token boundaries are preserved.

3. How would you implement synonyms without damaging precision?

**Deep explanation:** Start with domain-approved, directional synonym rules rather than treating every term as universally equivalent. Prefer search-time expansion because rules can change without reindexing, and use synonym-graph handling for multiword phrases. Measure per-query impact, limit expansion, and distinguish true equivalence such as abbreviations from broader related terms that should receive a lower boost.

**Interview answer:** I would maintain curated, often directional synonyms and expand them at query time with graph-aware analysis. Exact user terms keep the strongest boost, while expanded terms are weaker, and offline relevance tests guard against precision regressions.

4. How would you rank exact-title matches above weak body matches?

**Deep explanation:** Query title and body separately with different boosts, adding a strong exact-match clause against a normalized title keyword field and a phrase-match clause against the analyzed title. The body remains a lower-boost recall source. Use a dis_max-style structure or explicit function so one strong title signal is not diluted by many weak body matches, then tune boosts on judged queries.

**Interview answer:** I would combine a highly boosted exact normalized-title match, a boosted title phrase match, and a lower-boost body match. I would tune those weights with relevance judgments so an exact title reliably outranks documents with incidental body occurrences.

5. How would you combine text relevance with popularity and freshness?

**Deep explanation:** Keep lexical relevance as the foundation, then add bounded popularity and freshness features through a ranking function. Transform popularity logarithmically so viral items do not dominate, and use time decay with a business-appropriate half-life. Normalize or cap feature effects, apply them only when relevant, and evaluate by query class because evergreen and news queries need different freshness behavior.

**Interview answer:** I would blend BM25 with capped log-popularity and a time-decay feature. Text relevance must remain dominant, and I would tune separate weights or models for query types such as evergreen versus time-sensitive searches.

6. How would you implement personalized ranking while preserving useful defaults?

**Deep explanation:** First produce a strong non-personalized candidate ranking, then rerank using bounded features such as user interests, locale, history, or organization context. Back off to cohort or global defaults when evidence is sparse, exclude sensitive attributes, and let users clear or disable personalization. Evaluate both aggregate quality and segments so personalization does not create filter bubbles or harm new users.

**Interview answer:** I would retrieve with a robust global ranker and apply personalization only as a bounded reranking signal. Sparse users fall back to cohort or global behavior, and I would monitor segment quality, privacy, and the ability to opt out.

7. How would you evaluate search using precision at k, recall, MRR, and NDCG?

**Deep explanation:** Precision@k measures how many top results are relevant; recall measures how much relevant material was retrieved; MRR rewards placing the first relevant result early; NDCG rewards the ordering of multiple graded-relevance results. Choose metrics based on the experience: navigational search often favors MRR, a short result page favors precision@k or NDCG@k, and exhaustive discovery needs recall. Report metrics by query segment and pair offline results with online behavior.

**Interview answer:** I would select metrics from the user task: MRR for finding one answer, precision@k or NDCG for top-ranked quality, and recall when coverage matters. I would use graded judgments, segment results by query type, and validate offline gains with online experiments.

8. How would you build a relevance test set from real user queries?

**Deep explanation:** Sample queries from logs across frequency, intent, language, zero-result cases, and business-critical segments rather than using only head queries. Pool candidate results from current and proposed systems, remove system identity, and have trained judges assign graded relevance using clear guidelines and overlap checks. Protect user privacy, version the judgments, and refresh the set as content and behavior change.

**Interview answer:** I would stratify real queries by frequency and intent, pool results from multiple rankers, and obtain blinded graded judgments with quality checks. I would anonymize logs, retain difficult tail cases, and regularly refresh the benchmark.

9. How would you distinguish retrieval problems from ranking problems?

**Deep explanation:** Check whether known relevant documents appear in a large candidate set before examining their final position. If they are absent, inspect analysis, filters, mappings, and candidate-generation recall; if present but low, inspect scoring features, boosts, and reranking. Logging clause matches and intermediate ranks makes this diagnosis repeatable.

**Interview answer:** I would test relevant-document recall at a generous candidate cutoff. Missing candidates indicate retrieval or filtering issues; present-but-low candidates indicate ranking issues. I would use query explanations and intermediate-stage logs to locate the failure.

10. How would you implement spelling correction without overcorrecting rare names?

**Deep explanation:** Generate suggestions from edit distance, phonetics, and a vocabulary model, then rank them using corpus frequency and query context. Apply corrections automatically only at high confidence, especially when the original yields no or poor results; otherwise show “did you mean” and also search the original. Protect known entities, names, codes, and user dictionary terms, and learn thresholds from correction acceptance.

**Interview answer:** I would rank contextual spelling candidates but auto-correct only with strong evidence. Rare entities and codes are protected, the original query remains searchable, and ambiguous cases get a suggestion rather than a silent rewrite.

11. How would you support phrase queries using positional information?

**Deep explanation:** Store token positions in postings so the engine can verify that terms occur in the required order and within an allowed distance. Exact phrases require consecutive positions; slop permits gaps or limited reordering. Analyzer behavior matters: stopword removal, synonyms, and multi-position tokens must preserve correct position increments, and positional indexes cost additional space.

**Interview answer:** I would index term positions and execute phrase queries by intersecting postings and checking positional offsets. I would support configurable slop and test analyzers carefully so stopwords and multiword synonyms do not create false phrase matches.

12. How would you model nested documents and avoid incorrect cross-object matches?

**Deep explanation:** Flattening arrays of objects loses the relationship between their fields, so `color:red` can incorrectly combine with `size:L` from another object. Store each object as a nested document or a child entity, then run both predicates inside the same nested scope and join matches back to the parent. Nested modeling improves correctness but increases document and update cost.

**Interview answer:** I would use a nested or parent-child model when fields from one object must match together. Queries execute within the same nested object, preventing cross-object matches, with the tradeoff of extra indexing and update complexity.

13. How would you manage dynamic mappings without uncontrolled field growth?

**Deep explanation:** Use explicit templates and allowlists for known field patterns, and reject or ignore unknown fields rather than mapping everything automatically. Put arbitrary metadata into a flattened map or key-value structure instead of creating one indexed field per key. Monitor field counts and mapping updates because mapping explosion consumes cluster state, heap, and query resources.

**Interview answer:** I would keep mappings explicit, use dynamic templates only for controlled patterns, and store unbounded metadata in a flattened representation. I would enforce field-count limits and alert on unexpected mapping growth.

14. How would you choose shard count for expected data and query volume?

**Deep explanation:** Estimate retained index size, growth, update throughput, query concurrency, recovery time, and node capacity, then target shard sizes that are large enough to avoid overhead but small enough to relocate and recover. Benchmark realistic workloads because more shards increase parallelism only until coordination and heap overhead dominate. Plan rollover and future scale, since primary shard count is costly to change without reindexing.

**Interview answer:** I would size shards from expected data volume, throughput, and recovery objectives, then validate with load tests. I would avoid oversharding, use rollover to keep shard sizes healthy, and leave capacity for replicas, failures, and growth.

15. How would you implement bulk indexing with backpressure?

**Deep explanation:** Batch records by both count and bytes, use a bounded worker pool, and cap in-flight requests. Observe latency, rejection rate, and queue depth to reduce concurrency dynamically when the cluster is saturated; retry transient failures with exponential backoff and jitter. Durable checkpoints or a queue prevent data loss while idempotent document writes make retries safe.

**Interview answer:** I would use size-bounded batches and limited concurrency, adjusting throughput from latency and rejection signals. Transient failures get jittered backoff, writes are idempotent, and durable checkpoints ensure the producer cannot overwhelm or lose work.

16. How would you handle failed items in a partially successful bulk request?

**Deep explanation:** Inspect every item because a successful HTTP response can contain individual failures. Classify errors into retryable conditions such as throttling and timeouts, permanent document errors such as invalid mappings, and conflicts that require version logic. Retry only failed retryable items, send permanent failures to a dead-letter stream with diagnostics, and record metrics and correlation IDs.

**Interview answer:** I would parse item-level outcomes, acknowledge successes, retry only transient failures with backoff, and dead-letter permanent failures for repair. Version conflicts follow explicit ordering rules so blind retries do not overwrite newer data.

17. How would you propagate database changes into a search index?

**Deep explanation:** Prefer change data capture or a transactional outbox so a database commit reliably produces an indexing event without dual-write inconsistency. Consumers transform events into idempotent upserts or deletes and checkpoint their offsets. Track end-to-end lag, retain events for replay, and periodically reconcile the index against the source of truth.

**Interview answer:** I would use CDC or a transactional outbox, consume changes asynchronously, and apply idempotent versioned writes to the index. I would monitor lag, support replay, and run reconciliation because the database remains authoritative.

18. How would you handle out-of-order updates and deletions?

**Deep explanation:** Include a monotonic source version or sequence number with every event and accept a write only if it is newer than the indexed version. Represent deletes with versioned tombstones so a delayed update cannot resurrect a record; retain tombstones long enough to exceed maximum event delay. Make retries idempotent and define behavior for gaps or version collisions.

**Interview answer:** I would attach source versions to all updates and deletes and use conditional writes that reject stale events. Versioned tombstones prevent resurrection, while idempotency and replay-safe consumers handle duplicates.

19. How would you rebuild an index behind an alias?

**Deep explanation:** Create a new versioned index with the desired settings and mappings, bulk-load a consistent snapshot, then catch up changes from a log or CDC stream. Validate counts, samples, and relevance before atomically switching the read/write alias. Keep the old index for a defined rollback window and ensure writers cannot miss events during the cutover.

**Interview answer:** I would build a versioned index, load a snapshot, replay changes until caught up, validate it, and atomically move the alias. The previous index stays available for rollback until the new index proves healthy.

20. How would you choose between offset pagination and search-after pagination?

**Deep explanation:** Offset pagination is convenient for shallow pages and random page access, but deep offsets force each shard to collect and discard many earlier hits. Search-after uses the last result's stable sort values, making sequential deep browsing efficient and nearly stateless. It cannot jump directly to arbitrary pages and requires a deterministic tie-breaker.

**Interview answer:** I would use offsets for small, shallow result sets and search-after for deep sequential pagination. Search-after scales better but needs a stable unique sort key and a cursor, and it does not naturally support random page jumps.

21. How would you keep pagination stable while indexed data changes?

**Deep explanation:** Use a consistent snapshot or point-in-time handle across pages, and sort by deterministic fields plus a unique tie-breaker. Encode the last sort values and snapshot identifier in an opaque cursor. Without snapshot isolation, inserts, deletes, and score changes can cause duplicates or omissions even with search-after.

**Interview answer:** I would pin pagination to a point-in-time snapshot and use search-after with a deterministic sort and unique tie-breaker. The opaque cursor carries the snapshot and last sort values, preventing shifting pages during updates.

22. How would you support cursor-based browsing using a point-in-time view?

**Deep explanation:** Open a point-in-time view with a bounded lifetime, run the first query with a stable sort, and return an opaque signed cursor containing the PIT ID, query fingerprint, sort values, and expiry. Subsequent requests validate the cursor and use search-after against the same PIT. Refresh keep-alive only within limits and close views when finished to control retained resources.

**Interview answer:** I would create a PIT, sort deterministically, and return a signed opaque cursor with the PIT ID and last sort values. Each page validates the cursor and uses search-after, with short expirations and resource limits.

23. How would you implement aggregations without excessive memory use?

**Deep explanation:** Aggregate on keyword, numeric, or other doc-values-backed fields rather than analyzed text. Bound bucket counts, use composite pagination for high-cardinality dimensions, filter early, and prefer approximate algorithms such as cardinality sketches when exactness is unnecessary. Enforce request limits and circuit breakers, and precompute frequent expensive summaries when possible.

**Interview answer:** I would use doc values, filter early, cap buckets, and page high-cardinality aggregations with composite cursors. Approximate or precomputed aggregates are appropriate when exact results would consume too much memory.

24. How would you monitor slow queries, indexing lag, and rejected requests?

**Deep explanation:** Collect percentile latency and slow logs by query type, trace representative requests, and correlate them with CPU, heap, disk I/O, cache behavior, and shard skew. Measure indexing lag from source-event time to searchable time, not just queue size. Alert on sustained rejection rates for search and write thread pools, with dashboards tied to user-facing SLOs.

**Interview answer:** I would monitor p95/p99 search latency, slow-query samples, event-to-searchable indexing lag, and read/write rejections. I would correlate those with node and shard health and alert on sustained SLO violations rather than isolated spikes.

25. How would you prevent expensive wildcard and regular-expression queries from overloading a cluster?

**Deep explanation:** Restrict leading wildcards and complex regexes, cap determinized automaton states, query length, timeout, and result work, and allow these features only on suitable fields. Provide n-gram or prefix indexes for common substring and autocomplete needs. Apply per-user rate limits and cost accounting, and reject queries whose estimated expansion is unsafe.

**Interview answer:** I would constrain patterns and automaton complexity, enforce timeouts and rate limits, and block leading wildcards on large fields. For common use cases I would build prefix or n-gram fields so users do not need expensive runtime expansion.

26. How would you combine lexical and vector search?

**Deep explanation:** Retrieve candidates independently with BM25 and approximate nearest neighbors, then fuse their ranks using reciprocal-rank fusion or normalized weighted scores. Lexical search excels at exact terms, identifiers, and rare words; vectors capture semantic similarity. Deduplicate candidates, preserve filters, and optionally rerank the fused set using richer features.

**Interview answer:** I would run lexical and vector retrieval in parallel, merge candidates with RRF or calibrated weights, and optionally rerank the top set. That preserves exact-match strength while adding semantic recall.

27. How would you choose between prefiltering and postfiltering vector results?

**Deep explanation:** Prefiltering restricts the ANN search to eligible documents, improving correctness and efficiency when the filter is supported, though very selective filters can hurt graph traversal or recall. Postfiltering is simpler but may return too few results because filtered-out candidates consumed the ANN budget. Choose from selectivity, index support, latency, and recall tests; oversample when postfiltering.

**Interview answer:** I prefer prefiltering when the vector index supports it reliably, especially for permissions and selective constraints. If I must postfilter, I oversample candidates and measure whether enough valid results survive within the latency budget.

28. How would you add a reranker within a latency budget?

**Deep explanation:** Use a fast first-stage retriever to generate a small, high-recall candidate set, then apply the expensive cross-encoder or learning-to-rank model only to the top N. Benchmark latency by batch size and hardware, set a strict timeout, and fall back to first-stage ranking on failure. Tune N against quality gains, cache safe features, and monitor tail latency.

**Interview answer:** I would rerank only a bounded top-N candidate set, batch model inference, and enforce a deadline with graceful fallback to the initial rank. I would tune N from the relevance-gain versus p99-latency curve.

29. How would you cache frequent search queries without serving stale permissions?

**Deep explanation:** Never share cached results across authorization contexts unless permissions are applied safely afterward. Include tenant, role or permission version, query, filters, locale, and index generation in the cache key, or cache only public candidate IDs and reauthorize every response. Use short TTLs and event-driven invalidation for permission changes, and avoid caching highly personalized or sensitive results.

**Interview answer:** I would make authorization part of the cache boundary, keyed by tenant and permission version, or recheck every cached candidate before returning it. Short TTLs and permission-change invalidation limit stale access, and sensitive personalized queries may bypass caching.

30. How would you test autocomplete for multilingual and mobile input?

**Deep explanation:** Build test cases across scripts, diacritics, transliteration, mixed languages, IME composition, right-to-left text, emoji, typos, and mobile autocorrect. Measure prefix coverage, top-k relevance, keystrokes saved, latency, zero-suggestion rate, and harmful or offensive suggestions. Test real device event sequences, slow networks, cancellation, accessibility, privacy, and small-screen presentation.

**Interview answer:** I would test representative languages and scripts plus IME, RTL, transliteration, typos, and mobile event behavior. I would measure relevance, keystrokes saved, zero-result rate, and p95 latency while checking safety, privacy, accessibility, and cancellation on real devices.
