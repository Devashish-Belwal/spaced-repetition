1. How would you design an ingestion pipeline for heterogeneous documents?

**Deep explanation:** I would separate connectors, parsing, normalization, chunking, enrichment, embedding, and indexing into observable, idempotent stages. Each record would retain source ID, version, permissions, parser version, and a content checksum so retries do not duplicate data and unchanged content is skipped. Failed documents would enter a recoverable queue rather than silently disappearing.

**Interview answer:** I would build a staged, idempotent pipeline with format-specific parsers and a common versioned chunk schema. Checksums, retries, dead-letter handling, lineage, and reconciliation would make ingestion dependable.

2. How would you extract useful content from PDFs, tables, images, and scanned pages?

**Deep explanation:** I would detect the document type and choose native text extraction, layout-aware parsing, table extraction, or OCR as appropriate. The output should preserve headings, page numbers, table relationships, reading order, and links to original locations. I would measure extraction quality on representative documents because corrupted text cannot be repaired by better retrieval.

**Interview answer:** I would route each format through the right parser, using OCR only where needed, while preserving layout and source coordinates. I would test extraction separately before tuning embeddings or prompts.

3. How would you choose chunk boundaries, size, and overlap?

**Deep explanation:** I would start with semantic boundaries such as headings, paragraphs, functions, or table rows rather than fixed character counts. Then I would test several sizes and limited overlap against retrieval recall, answer quality, duplication, and token cost. Different content types may need different policies, and parent-child retrieval can combine precise small chunks with broader context.

**Interview answer:** I would chunk on meaningful structure, not arbitrary length alone, and tune size and overlap using end-to-end evaluations. The policy may vary by document type and question style.

4. How would you design metadata for retrieval and citations?

**Deep explanation:** Each chunk should have a stable ID, source and version IDs, title, section path, location, timestamps, language, tenant, permissions, and content type. Metadata fields used for filtering need controlled types and trustworthy values. Citation links should be derived from stored provenance, while content hashes help detect drift between the cited passage and current source.

**Interview answer:** I would store stable provenance, location, version, ownership, and permission metadata with every chunk. The schema should directly support filters, debugging, lifecycle operations, and resolvable citations.

5. How would you choose and evaluate an embedding model?

**Deep explanation:** I would compare candidate models on a labeled sample from the actual domain, languages, query lengths, and document types. Important factors include recall at k, robustness to terminology, vector dimension, latency, throughput, cost, hosting constraints, and version stability. Generic leaderboard performance is secondary to retrieval quality on the application's own corpus.

**Interview answer:** I would benchmark embeddings on representative query-passage relevance judgments and operational constraints. I would choose the smallest affordable model that meets recall and language requirements, then version it with the index.

6. How would you combine lexical and vector retrieval?

**Deep explanation:** I would execute BM25-style lexical search and embedding search, normalize or rank their outputs, and fuse them with a method such as reciprocal rank fusion. Lexical retrieval preserves exact names, identifiers, and rare terms; vector retrieval handles paraphrases and conceptual similarity. I would tune the blend by query class rather than assume one fixed weighting is optimal.

**Interview answer:** I would retrieve from both lexical and semantic indexes and fuse their ranks, then evaluate by query type. Hybrid search captures exact-term and paraphrase matches better than either retriever alone.

7. How would you use query rewriting without changing the user's intent?

**Deep explanation:** I would preserve the original query, generate a small set of auditable alternatives, and use rewrites only for retrieval. Rewrites can expand acronyms, resolve conversation references, or create subqueries, but they can also add assumptions. I would constrain them with conversation state, compare results with the original, and evaluate regressions on ambiguous and adversarial queries.

**Interview answer:** I would treat rewriting as a recall aid, keep the original query authoritative, and retrieve with both when useful. Representative tests must catch rewrites that silently alter meaning.

8. How would you apply metadata filters to vector search?

**Deep explanation:** Hard constraints such as tenant, permissions, product, language, or date should be built from trusted application state and applied before results enter the prompt. Prefiltering is safer and efficient when supported, but highly selective filters can reduce ANN recall depending on the index. I would measure filtered recall and consider partitioning, oversampling, or exact search for small candidate sets.

**Interview answer:** I would derive filters from trusted identity and request data, then apply them within retrieval. I would benchmark prefilter behavior because ANN indexes can lose recall under selective filters.

9. How would you add a reranker to a RAG pipeline?

**Deep explanation:** I would retrieve a wider candidate set cheaply, then use a stronger cross-encoder or model to score each query-passage pair and keep only the best evidence. Reranking can improve precision but adds latency and cost, so I would batch requests, cap candidates, and measure incremental answer quality. Permission filtering must occur before reranking.

**Interview answer:** I would use fast retrieval for recall and a more accurate reranker for precision. I would select its candidate count and cutoff using relevance gains versus p95 latency and cost.

10. How would you pack retrieved passages into a limited context window?

**Deep explanation:** I would remove near-duplicates, prioritize high-value evidence, preserve useful neighboring context, and allocate a fixed token budget across sources. Passages need clear delimiters and stable identifiers, and contradictory or diverse evidence may deserve space even if slightly lower ranked. The final budget must also leave room for instructions, conversation state, tools, and the answer.

**Interview answer:** I would deduplicate and rank evidence under an explicit token budget, keep source boundaries clear, and reserve tokens for the rest of the request and response. Packing should optimize evidence coverage, not merely concatenate top results.

11. How would you reduce the lost-in-the-middle problem?

**Deep explanation:** Models may pay less attention to evidence buried in a long prompt. I would reduce irrelevant context, put the most important passages in prominent positions, group evidence by question or subtopic, and have the model first identify supporting passages before composing the answer. Better retrieval and shorter prompts are usually more reliable than trying to fix ordering alone.

**Interview answer:** I would keep context focused, place key evidence deliberately, and structure it by source or subquestion. The primary fix is retrieving less noise, not filling the entire context window.

12. How would you generate citations that remain tied to real sources?

**Deep explanation:** I would assign each supplied passage an application-generated citation ID and require the model to reference only those IDs. After generation, the application would validate every ID, map it to a stable source location, and check that the cited passage supports the associated claim. Unsupported or missing citations would trigger repair, abstention, or review.

**Interview answer:** I would give the model fixed passage IDs, validate returned IDs, and render links from stored provenance. I would also test claim-to-passage support instead of accepting a syntactically valid citation.

13. How would you evaluate retrieval independently of generation?

**Deep explanation:** I would create query-level relevance judgments and measure recall at k, precision at k, mean reciprocal rank, or NDCG depending on whether one or several passages are relevant. I would slice results by query type, source, language, freshness, and permissions. Inspecting misses reveals whether the cause is parsing, chunking, indexing, query analysis, or ranking.

**Interview answer:** I would evaluate ranked retrieval against labeled relevant passages before involving the generator. Recall, ranking metrics, and failure slices tell me whether the evidence pipeline is working.

14. How would you evaluate answer faithfulness and completeness?

**Deep explanation:** I would break answers into verifiable claims, check whether each claim is supported by supplied evidence, and compare the response with expected answer points. Human review is the reference for high-value samples; model judges can scale evaluation after calibration and periodic auditing. Correctness, faithfulness, relevance, and completeness should remain separate dimensions.

**Interview answer:** I would score claims for support in the retrieved context and expected coverage, using calibrated model-assisted checks plus human review. A fluent answer should not pass merely because it resembles the reference wording.

15. How would you build a representative RAG evaluation set?

**Deep explanation:** I would sample real tasks across common, rare, ambiguous, multi-hop, outdated, unanswerable, multilingual, and permission-sensitive cases. Each item would record expected evidence, acceptable answer points, forbidden claims, and relevant metadata. I would keep a stable regression set while refreshing a separate set as the corpus and user behavior change.

**Interview answer:** I would derive evaluations from real usage and deliberately add edge, security, freshness, and no-answer cases. Labels would cover both supporting passages and answer expectations.

16. How would you diagnose whether a bad answer came from retrieval or generation?

**Deep explanation:** I would trace the source version, parsed text, query transformations, filters, candidate ranks, reranker scores, packed context, prompt, model version, and output. If the necessary evidence was absent, it is primarily a retrieval pipeline failure; if good evidence was present but misused, it is a generation or instruction failure. Replaying each stage independently makes that distinction testable.

**Interview answer:** I would inspect the full trace and ask first whether sufficient evidence reached the model. Missing evidence points upstream; ignored or distorted evidence points to prompting, model behavior, or output validation.

17. How would you keep an index synchronized with document updates and deletions?

**Deep explanation:** I would use source versions or change events to perform idempotent upserts and tombstone deletions, with a transactional outbox or durable queue where possible. A document manifest would map each source version to its chunks so obsolete chunks can be removed. Periodic reconciliation would compare the source of truth with the index and repair missed events.

**Interview answer:** I would process versioned change events idempotently, maintain source-to-chunk manifests, and tombstone deletes. Reconciliation and lag monitoring would catch event loss and stale records.

18. How would you migrate to a new embedding model?

**Deep explanation:** Embeddings from different models generally cannot share one similarity space. I would build a separate index with the new model, backfill it, dual-write new content, and run shadow queries against both versions. After relevance, latency, and filtered-recall checks pass, I would atomically switch query encoding and index routing, with a rollback path.

**Interview answer:** I treat the embedding model and vector index as one versioned unit. I would build and validate a parallel index, dual-write during migration, then switch both query and document encoding together.

19. How would you isolate RAG data in a multi-tenant application?

**Deep explanation:** I would bind every chunk to a tenant and access-control attributes from a trusted source, enforce filters in the retrieval service, and include negative cross-tenant tests. Depending on risk and scale, tenants may share a physically partitioned index or use separate indexes and encryption keys. Caches, logs, rerankers, and evaluation exports must preserve the same isolation.

**Interview answer:** Tenant scope must be enforced before retrieval and propagated through indexes, caches, logs, and downstream models. I would combine trusted identity filters with partitioning appropriate to the threat model.

20. How would you cache parts of a RAG pipeline safely?

**Deep explanation:** I might cache parsed documents, embeddings, retrieval results, reranker scores, or final responses, but each key must include relevant versions, tenant scope, permissions, model settings, and query normalization. Authorization changes and document deletion require invalidation or short lifetimes. Final-answer caching is riskiest because conversational context and user-specific access can differ.

**Interview answer:** I would cache stable intermediate work first and use versioned, tenant-aware keys. Permission or source changes must invalidate entries, and user-specific final responses should rarely be shared.

21. How would you reduce RAG latency without sacrificing too much quality?

**Deep explanation:** I would measure parsing-independent online stages: query processing, lexical and vector retrieval, reranking, context assembly, model queueing, and generation. Options include parallel retrieval, approximate search, smaller embedding or reranking models, batching, caching, early exits, and streaming. Each optimization would be tested against retrieval recall and end-to-end quality, especially at p95 and p99.

**Interview answer:** I would trace the latency budget by stage, parallelize independent retrieval, and optimize the measured bottleneck. Every speedup needs a quality guardrail rather than relying on average latency alone.

22. How would you control cost in a RAG application?

**Deep explanation:** I would track per-request embedding, search, reranking, input-token, output-token, and storage costs by tenant and use case. Reducing duplicate context, routing simple requests to smaller models, caching safe work, and setting output and retrieval limits often help. Cost optimization should be constrained by answer quality and security rather than simply minimizing tokens.

**Interview answer:** I would attribute cost by pipeline stage and request type, then tune retrieval depth, context size, model routing, caching, and output limits. Quality, latency, and safety remain release gates.

23. How would you design structured outputs for agent decisions?

**Deep explanation:** I would define a narrow schema for allowed actions and arguments, use model-native structured output when available, and parse it with a strict validator. Unknown fields, invalid enum values, malformed identifiers, or oversized inputs would be rejected or repaired within a small retry budget. Valid syntax still requires authorization and semantic validation.

**Interview answer:** Agent decisions should conform to an explicit schema and fail closed on invalid data. Schema validity is only the first gate; policy, permissions, and business invariants are checked in code.

24. How would you handle invalid or unsafe tool-call arguments?

**Deep explanation:** The tool adapter would validate types, ranges, resource ownership, target existence, and policy before execution. It would never concatenate model text into a shell command or query without safe parameterization. Recoverable errors could be returned as structured observations, while security violations or repeated failures would stop or escalate the run.

**Interview answer:** I treat tool arguments as untrusted input and validate them against schema, authorization, and business rules. Unsafe calls fail closed, and repeated repair attempts are bounded.

25. How would you make agent tool calls safe to retry?

**Deep explanation:** Read operations can often be retried, but mutations need idempotency keys, deduplication records, conditional writes, or a status lookup before another attempt. The run should persist the tool-call ID, requested arguments, and observed outcome. A timeout means the result is unknown, so the agent must reconcile rather than blindly repeat the action.

**Interview answer:** I would attach a durable idempotency key to each side effect and record its outcome. After a timeout, the agent checks status before retrying so it cannot duplicate payments, messages, or writes.

26. How would you persist and resume a long-running agent task?

**Deep explanation:** I would model execution as a state machine or event log with durable checkpoints after each accepted decision and tool result. State would include the goal, plan version, completed calls, pending approvals, budgets, and resumable errors. Recovery replays from the latest checkpoint and reconciles any action whose completion was uncertain.

**Interview answer:** I would persist agent state and tool outcomes at step boundaries, then resume from a checkpoint rather than reconstructing progress from prose. Uncertain side effects are reconciled before continuing.

27. How would you separate working memory from long-term agent memory?

**Deep explanation:** Working memory holds task-local observations and may expire with the run; long-term memory contains user-approved facts or preferences reused later. I would store durable facts in typed records with source, confidence, timestamps, access scope, and deletion controls rather than only in free-form summaries. Retrieval into a new task would be relevance- and permission-gated.

**Interview answer:** Task state is temporary, while long-term memory is a governed data product. Durable memories need consent, provenance, scope, freshness, and deletion support before reuse.

28. How would you add human approval to an agent workflow?

**Deep explanation:** I would classify actions by impact and pause before restricted mutations. The approval request would show the exact action, target, important arguments, source evidence, and expected consequences; approval would be bound to a hash or version of that proposal. Before execution, the system would recheck authorization and ensure the approved details have not changed.

**Interview answer:** I would gate high-impact tools with approval of a concrete, immutable proposal. The system revalidates permissions and proposal identity immediately before performing the action.

29. How would you defend an agent from instructions hidden in retrieved content or tool output?

**Deep explanation:** I would label external content as untrusted data, keep it separate from trusted instructions, and limit the agent's capabilities regardless of prompt wording. Tool access would use least privilege, sensitive data would be filtered, destinations would be allowlisted where appropriate, and suspicious content would trigger safe handling. Prompt reminders help, but enforcement must live outside the model.

**Interview answer:** Retrieved documents and tool output are hostile-input surfaces. I rely on privilege separation, data-flow controls, allowlists, validation, and approval gates; prompting is defense in depth only.

30. How would you make a RAG or agent system observable?

**Deep explanation:** I would trace each request across query transformations, filters, retrieved IDs and scores, reranking, context selection, model versions, tool calls, approvals, retries, tokens, cost, and final status. Logs would use redaction, access controls, and retention limits because prompts and documents can be sensitive. Dashboards would combine quality, safety, latency, cost, and business outcomes.

**Interview answer:** I would use end-to-end traces with versioned retrieval, model, and tool events so failures can be replayed and attributed. Observability must preserve provenance without turning sensitive content into an uncontrolled log store.
