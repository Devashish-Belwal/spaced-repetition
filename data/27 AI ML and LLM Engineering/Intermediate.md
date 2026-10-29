1. How would you choose a baseline before using a complex model?

**Deep explanation:** Start with the simplest system that reflects the real task: a business rule, majority-class predictor, linear model, or basic retrieval method. Evaluate it with the same split and metrics planned for the complex model; the baseline establishes minimum value, exposes data problems, and shows whether added complexity earns its cost in latency, maintenance, and interpretability.

**Interview answer:** I would build the cheapest credible baseline and evaluate it under the same protocol as later models. I would adopt a complex model only if its measurable gain justifies its operational and interpretability costs.

2. How would you split time-series data without leaking future information?

**Deep explanation:** Preserve chronology: train on earlier observations, validate on a later window, and test on the latest untouched window. For robust estimates, use expanding-window or rolling-window backtesting, and add a gap when labels or features span time so adjacent samples cannot share future information.

**Interview answer:** I would never randomly shuffle time-series rows. I would use chronological holdouts or walk-forward validation, with a gap when the prediction horizon could cause overlap.

3. How would you handle missing values and categorical features?

**Deep explanation:** First determine why values are missing; missingness can itself be predictive or indicate a collection failure. Fit numeric imputers and categorical encoders on training data only, consider missing-indicator features, use an explicit unknown category, and choose one-hot, ordinal, target, or native categorical handling based on cardinality and model type.

**Interview answer:** I would investigate the missingness mechanism, impute using training-only statistics, and often add a missing flag. For categories, I would use an encoding appropriate to cardinality and ensure unseen values map safely at inference.

4. How would you prevent preprocessing from leaking test-set information?

**Deep explanation:** Put every learned transformation—imputation, scaling, feature selection, encoding, and resampling—inside a pipeline fitted separately within each training fold. The validation or test set may only be transformed with parameters learned from its corresponding training data; the final test set remains untouched until selection is complete.

**Interview answer:** I would encapsulate preprocessing and modeling in one pipeline and fit it inside cross-validation. Nothing, including feature selection or imputation statistics, may learn from the test set.

5. How would you handle imbalanced classes beyond measuring accuracy?

**Deep explanation:** Choose metrics aligned with the minority-class cost, such as precision, recall, F-beta, PR-AUC, or cost-weighted loss, and inspect the confusion matrix by subgroup. Techniques include class weights, careful over/undersampling inside training folds, threshold tuning, anomaly detection, and collecting more positive examples; calibration should be rechecked after resampling.

**Interview answer:** I would define the cost of false positives and false negatives, evaluate precision-recall and cost-sensitive metrics, then try class weighting or fold-local resampling. I would tune the decision threshold rather than rely on the default 0.5.

6. How would you choose a classification threshold using business costs?

**Deep explanation:** Estimate the cost or value of each confusion-matrix outcome, then compute expected cost across thresholds on representative validation data. Include operational constraints such as review capacity and minimum recall, check calibration and subgroup behavior, and confirm the chosen threshold on an untouched test set.

**Interview answer:** I would sweep thresholds and select the one minimizing expected business cost subject to constraints such as review volume or minimum recall. I would validate it on held-out, representative data and monitor it after deployment.

7. How would you compare ROC-AUC and precision-recall metrics?

**Deep explanation:** ROC-AUC measures ranking across true-positive and false-positive rates and can look strong when negatives dominate. Precision-recall focuses on positive predictions and is usually more informative for rare positives; always compare PR-AUC with the positive prevalence baseline and inspect operating points rather than relying on either area alone.

**Interview answer:** ROC-AUC is useful for overall ranking, but it can hide poor positive-class performance under heavy imbalance. For rare events I emphasize the precision-recall curve and choose an operating point tied to business costs.

8. How would you assess probability calibration?

**Deep explanation:** A calibrated model predicts events at their observed frequency—for example, cases scored near 0.8 should be positive about 80% of the time. Use reliability diagrams, Brier score, log loss, and calibration error on held-out data; if needed, fit Platt scaling or isotonic regression on a separate calibration set.

**Interview answer:** I would compare predicted probabilities with observed frequencies using a reliability plot and proper scoring rules such as Brier score or log loss. If calibration is poor, I would fit a held-out calibration model and retest it.

9. How would you detect data drift and concept drift?

**Deep explanation:** Data drift is a change in input distributions, while concept drift is a change in the relationship between inputs and outcomes. Monitor feature and prediction distributions with statistical distances and slice analysis, then measure performance when delayed labels arrive; alerts need practical thresholds, seasonality awareness, and a response such as investigation or retraining.

**Interview answer:** I would monitor input and prediction distributions for data drift, and labeled performance over time for concept drift. I would segment by important cohorts and connect alerts to an investigation and retraining policy.

10. How would you explain attention and the transformer architecture at a high level?

**Deep explanation:** Attention lets each token compute how strongly it should use information from other tokens by comparing queries with keys and combining the corresponding values. Transformers stack multi-head attention and feed-forward layers with residual connections and normalization; positional information supplies order, and the parallel architecture scales better than recurrent processing during training.

**Interview answer:** Attention is a learned way for each token to gather relevant information from other tokens. A transformer stacks multi-head attention and feed-forward blocks, adds position information, and uses residuals and normalization for stable, parallel training.

11. How do pretraining, supervised fine-tuning, and preference optimization differ?

**Deep explanation:** Pretraining learns broad language patterns from large corpora, commonly through next-token prediction. Supervised fine-tuning teaches desired input-output behavior from demonstrations, while preference optimization uses ranked or feedback-derived comparisons—through methods such as RLHF or DPO—to make outputs better match human preferences and policies.

**Interview answer:** Pretraining builds general capability, supervised fine-tuning demonstrates the target behavior, and preference optimization aligns competing valid outputs with human preferences. Each stage uses a different signal and solves a different problem.

12. How would you select a model based on quality, latency, context, and cost?

**Deep explanation:** Build a representative evaluation set and compare candidate models on task-specific quality, tail latency, context-window fit, throughput, reliability, and full per-request cost. Test realistic prompts and concurrency, then choose the smallest model meeting quality and safety requirements; routing hard requests to a stronger model can improve the tradeoff.

**Interview answer:** I would benchmark candidates on our own workload, including quality, p95 latency, context needs, throughput, and total cost. I would select the cheapest model that meets the acceptance bar, possibly with routing or fallback for harder cases.

13. How would you build a chatbot with persistent conversation state?

**Deep explanation:** Store messages and structured facts in a durable database keyed by conversation and tenant, rather than relying on a model's context window. On each turn, retrieve a bounded combination of recent messages, summaries, and relevant memories, enforce authorization and retention rules, and use idempotent writes so retries do not duplicate turns.

**Interview answer:** I would persist turns and structured state server-side, then construct each prompt from recent context plus relevant summarized memory. I would enforce tenant access, token limits, retention, and idempotency independently of the model.

14. How would you summarize conversation history without losing important facts?

**Deep explanation:** Separate durable facts, decisions, constraints, and unresolved tasks from conversational wording, and preserve recent turns verbatim. Use incremental, structured summaries with source turn IDs, validate critical fields, and periodically regenerate or reconcile summaries to prevent compounding errors.

**Interview answer:** I would keep recent turns verbatim and summarize older history into structured facts, decisions, constraints, and open items with provenance. Critical user facts should live in explicit state, not only in a lossy prose summary.

15. How would you build a document ingestion pipeline for RAG?

**Deep explanation:** Ingest from trusted sources, record identity and version, parse and normalize content, preserve structure and permissions, chunk it, create embeddings, and upsert chunks plus metadata into searchable stores. Make stages idempotent and observable, quarantine failures, track lineage from chunk to source, and support reprocessing when parsers or embedding models change.

**Interview answer:** I would build an idempotent pipeline for acquisition, parsing, normalization, permission-aware chunking, embedding, and indexed upsert. Every chunk would retain source, version, and lineage so updates, debugging, and citations are reliable.

16. How would you extract useful text from PDFs, tables, and scanned documents?

**Deep explanation:** Detect document type and use layout-aware PDF parsing for native text, table extraction for structured regions, and OCR for scanned pages. Preserve page numbers, headings, reading order, cells, and bounding boxes; measure extraction quality and route low-confidence or malformed documents for alternate parsers or human review.

**Interview answer:** I would use a layout-aware parser, table-specific extraction, and OCR only where needed. I would retain page and structural metadata, score extraction confidence, and fall back or review low-quality results.

17. How would you choose chunk size, overlap, and document metadata?

**Deep explanation:** Chunk at semantic boundaries so each unit contains enough context to answer a likely question without diluting retrieval; overlap helps facts crossing boundaries but increases duplicates and cost. Tune these choices empirically using retrieval evaluation, and store metadata such as document ID, section path, page, version, timestamp, and permissions for filtering and citations.

**Interview answer:** I would start with structure-aware chunks sized for the embedding model and expected questions, add modest overlap, then tune on retrieval metrics. Metadata must support filtering, authorization, updates, and precise citations.

18. How would you compare dense, sparse, and hybrid retrieval?

**Deep explanation:** Sparse retrieval such as BM25 excels at exact terms, identifiers, and rare words; dense retrieval captures semantic similarity but can miss exact constraints. Hybrid retrieval combines normalized or rank-fused results and often improves recall, at the cost of more infrastructure and tuning; evaluate all options on real queries and slices.

**Interview answer:** Sparse search is strong for exact lexical matches, dense search for semantic matches, and hybrid search covers both. I would compare recall, ranking quality, latency, and cost on representative queries before choosing.

19. How would you evaluate retrieval separately from answer generation?

**Deep explanation:** Create queries with relevance judgments or known supporting passages, then measure retrieval using recall@k, precision@k, MRR, or nDCG without invoking generation. Separately evaluate whether generation uses the supplied evidence correctly; this decomposition shows whether a bad answer came from missing evidence or poor synthesis.

**Interview answer:** I would maintain query-to-relevant-document labels and evaluate the retriever with recall@k and ranking metrics. Generation gets a separate grounded-answer evaluation, so failures can be attributed to retrieval or synthesis.

20. How would you add reranking to a search pipeline?

**Deep explanation:** Retrieve a broad candidate set cheaply, then score query-document pairs with a more accurate cross-encoder, late-interaction model, or LLM and return the top few. Tune candidate count and reranker size against relevance and p95 latency, cache where safe, and retain deterministic fallback when reranking fails.

**Interview answer:** I would use fast retrieval for high recall, then apply a stronger pairwise scorer to the top candidates. I would tune the candidate depth to gain relevance without violating latency and cost budgets.

21. How would you attach citations that actually support generated claims?

**Deep explanation:** Give the model source chunks with stable IDs and require claim-level references, then verify that each cited passage entails the associated claim rather than merely discussing the topic. Preserve page or section provenance, reject invalid IDs, and either remove unsupported claims or return an explicit uncertainty response.

**Interview answer:** I would require citations to stable source IDs at claim level and validate that the quoted evidence actually supports each claim. Unsupported claims should be removed, revised, or marked uncertain.

22. How would you handle a question that has no answer in the retrieved documents?

**Deep explanation:** Estimate answerability from retrieval scores, coverage, and an evidence-grounded model check rather than forcing an answer. If evidence is insufficient, state that clearly, optionally ask a clarifying question or broaden retrieval, and provide useful next steps without presenting model knowledge as document-grounded fact.

**Interview answer:** I would set an evidence threshold and instruct the system to abstain when the retrieved material is insufficient. It can clarify or retry retrieval, but it must not fabricate a document-backed answer.

23. How would you update or delete documents and their embeddings consistently?

**Deep explanation:** Assign stable document IDs and versions, derive chunk IDs deterministically, and treat source metadata plus vector entries as one logical update. Use transactional outbox or staged indexing with status markers, idempotent upserts, tombstones for deletion, and reconciliation jobs to detect orphaned or stale chunks.

**Interview answer:** I would version documents and use deterministic chunk IDs with idempotent writes. Updates and deletes would flow through an outbox or staged process, followed by reconciliation so the source store and vector index converge.

24. How would you isolate retrieval results by user and tenant permissions?

**Deep explanation:** Carry authenticated tenant and principal identity into retrieval and enforce access filters in the search layer before results reach the model. Index ACL metadata or maintain tenant-separated indexes where stronger isolation is needed, deny by default, test adversarial cross-tenant queries, and reindex promptly when permissions change.

**Interview answer:** Authorization must happen during retrieval, not in the prompt or after generation. I would apply server-controlled tenant and ACL filters, default deny, and test that no cross-tenant result can enter model context.

25. How would you compare vector-search products against your workload?

**Deep explanation:** Benchmark with the real vector count, dimensions, filters, update/delete rate, query distribution, concurrency, and relevance labels. Compare recall-latency curves, metadata filtering, consistency, multi-tenancy, operations, failure recovery, portability, and total cost; advertised queries per second alone is not representative.

**Interview answer:** I would run a workload-shaped benchmark measuring recall against exact search, p95 latency, filtering, ingestion, updates, scaling, and cost. Operational fit and permission support matter as much as raw query throughput.

26. How would you design structured output validation and repair?

**Deep explanation:** Define a strict schema with types, bounds, enums, and cross-field invariants, use constrained decoding when supported, then parse and validate server-side. For invalid output, return concise validation errors to a bounded repair attempt; never silently coerce dangerous values, and fall back or escalate after the retry limit.

**Interview answer:** I would use schema-constrained generation plus independent server-side validation. Invalid results get a limited repair pass with exact errors, then a safe fallback rather than unbounded retries or unsafe coercion.

27. How would you handle a tool call with invalid or missing arguments?

**Deep explanation:** Validate arguments against the tool schema and business rules before execution, including authorization and resource existence. Return structured, non-sensitive errors that let the model correct the call, cap retries, and require user confirmation for ambiguous or high-impact defaults rather than guessing.

**Interview answer:** I would reject the call before execution, return field-level validation errors, and allow a small number of corrected retries. I would never invent sensitive or destructive arguments; ambiguity should trigger clarification.

28. How would you limit an agent's tool permissions?

**Deep explanation:** Give each agent a short-lived, least-privilege capability scoped by tool, resource, tenant, action, and environment. Enforce policy outside the model, validate every call, sandbox execution, redact secrets, require approval for high-impact actions, and maintain tamper-resistant audit logs.

**Interview answer:** I would treat the model as untrusted and enforce least privilege in the tool gateway. Calls need scoped credentials, policy checks, sandboxing, approvals for risky actions, and complete auditability.

29. How would you prevent an agent from repeating an external side effect?

**Deep explanation:** Attach a stable idempotency key to each logical action and store the result atomically before returning it; retries then receive the prior result. Combine this with operation state, deduplication windows, transactional outbox patterns, and read-before-write or confirmation for APIs that lack native idempotency.

**Interview answer:** Every side-effecting action should carry an idempotency key and durable execution state. Retries must return the original outcome rather than execute again, with extra confirmation where the external API cannot deduplicate.

30. How would you set time, token, and tool-call budgets?

**Deep explanation:** Derive budgets from the user-facing latency SLO, cost ceiling, and maximum useful reasoning depth, then allocate limits per step with reserve for cleanup or fallback. Enforce hard deadlines, token ceilings, tool allowlists, per-tool call limits, loop detection, and cancellation propagation while logging which budget ended a run.

**Interview answer:** I would translate latency and cost SLOs into hard per-run and per-step limits, including tokens, tool calls, and wall time. The orchestrator must enforce them, stop loops, cancel outstanding work, and degrade gracefully.

31. How would you design an evaluation dataset for customer-support answers?

**Deep explanation:** Sample real, privacy-safe requests across products, intents, difficulty, languages, customer segments, rare cases, and policy-sensitive scenarios. Freeze relevant knowledge snapshots, define expert rubrics and reference evidence, include unanswerable and adversarial cases, and keep separate development and blind test sets while refreshing production-drift slices.

**Interview answer:** I would build a stratified, privacy-safe set representing real traffic plus rare and high-risk cases. Each case would have source evidence and a clear rubric, with separate tuning and blind test sets and periodic refreshes.

32. How would you distinguish factuality, relevance, completeness, and style in evaluation?

**Deep explanation:** Score separate dimensions with explicit rubrics: factuality asks whether claims are supported, relevance whether the response addresses the request, completeness whether required points are covered, and style whether presentation follows communication rules. Independent scores make regressions diagnosable and prevent a fluent but incorrect answer from receiving one misleading overall grade.

**Interview answer:** I would define separate rubric dimensions and examples for factuality, relevance, completeness, and style. I would not collapse them too early because an answer can be polished and relevant while still unsupported or incomplete.

33. How would you test prompt changes before deploying them?

**Deep explanation:** Version prompts and run the proposed change against a frozen regression suite plus current traffic samples, measuring quality, safety, latency, tokens, and tool behavior. Review meaningful regressions and slice results, then use shadow traffic, canaries, or an A/B test with rollback criteria before full rollout.

**Interview answer:** I would treat prompts like code: version them, run offline regression and safety evaluations, and compare cost and latency. Passing changes would move through shadow or canary deployment with monitoring and rollback thresholds.

34. How would you assess the limitations of using one model to judge another?

**Deep explanation:** Model judges can share biases with the system being evaluated, favor verbosity or familiar phrasing, be sensitive to prompt and answer order, and miss domain-specific errors. Calibrate them against blinded human ratings, randomize ordering, use multiple judges or deterministic checks where useful, and report agreement and uncertainty rather than treating scores as ground truth.

**Interview answer:** I would validate an LLM judge against human experts and test order, style, and self-preference biases. It is a scalable noisy metric, not ground truth, so high-impact or ambiguous cases still need human or deterministic verification.

35. How would you use human review for ambiguous or high-impact outputs?

**Deep explanation:** Route cases using risk, uncertainty, policy triggers, novelty, and value of review, and give reviewers the source evidence, model trace, and a precise rubric. Use dual review or escalation for severe decisions, measure reviewer consistency and turnaround time, protect sensitive data, and feed adjudicated labels back into evaluation and improvement.

**Interview answer:** I would triage review by impact and uncertainty, present reviewers with evidence and a clear rubric, and escalate disagreements on critical cases. The reviewed outcomes become auditable decisions and high-quality evaluation data.

36. How would you cache model responses without leaking user data?

**Deep explanation:** Cache only when authorization, tenant, model version, prompt template, safety settings, and relevant context are part of a canonical key. Prefer tenant-scoped caches, encrypt data, minimize sensitive content, apply short retention and deletion controls, and avoid shared semantic caching unless privacy-equivalence is proven.

**Interview answer:** I would scope cache keys and storage by tenant and authorization context, include all response-affecting versions, and avoid caching sensitive prompts by default. Encryption, TTLs, deletion, and access auditing are mandatory.

37. How would you handle provider throttling and transient failures?

**Deep explanation:** Use bounded retries with exponential backoff and jitter for retryable errors, respect retry headers, and enforce global rate and concurrency limits. Add timeouts, circuit breakers, queues with backpressure, idempotency for tool effects, and a tested fallback model or degraded response without retrying permanent errors.

**Interview answer:** I would combine rate limiting, bounded exponential backoff with jitter, timeouts, and circuit breakers. Retry only transient failures, preserve idempotency, and use a controlled fallback or graceful degradation when the provider remains unavailable.

38. How would you measure time to first token and total response latency?

**Deep explanation:** Record timestamps at request receipt, provider dispatch, first streamed byte or token, last token, and post-processing completion using a consistent clock. Report distributions such as p50, p95, and p99, break them down by model, prompt size, output size, region, and cache status, and trace queueing and tool time separately.

**Interview answer:** I would instrument request start, provider start, first token, final token, and completion. I would monitor percentile distributions and decompose queue, retrieval, model, tool, and post-processing time to find the actual bottleneck.

39. How would you add AI summarization without inventing facts absent from the source?

**Deep explanation:** Restrict the model to supplied source material, request evidence-linked statements, and instruct it to omit or flag unsupported details. Preserve important numbers and named entities, validate claims against source spans with deterministic checks or a verifier, and evaluate faithfulness, coverage, and abstention on representative documents.

**Interview answer:** I would make the task explicitly extractive-grounded, require source references, and verify important claims and numbers. If the source is silent or contradictory, the summary should say so rather than fill gaps.

40. How would you integrate a code assistant into a workflow with independent verification?

**Deep explanation:** Run generated changes in an isolated branch or sandbox and gate them through formatting, static analysis, tests, security scans, and a human-reviewed diff. Give the assistant least-privilege repository and command access, prohibit direct production deployment, and retain prompts, patches, and verification results for auditability.

**Interview answer:** I would treat generated code as an untrusted proposal. It must pass automated checks and human diff review in isolation, with least-privilege access and no direct path to production.

41. How would you choose between k-means and a density-based clustering method?

**Deep explanation:** K-means is fast and scalable when clusters are roughly spherical, similarly sized, and well represented by centroids, but it requires choosing k and is sensitive to scale and outliers. DBSCAN or HDBSCAN can find irregular shapes and label noise without a fixed k, but density parameters become difficult in high dimensions or varying-density data.

**Interview answer:** I would use k-means for large, scaled data with compact centroid-like clusters and a meaningful k. I would prefer DBSCAN or HDBSCAN for irregular clusters and noise, after checking dimensionality and density variation.

42. How would you use PCA while avoiding data leakage and overinterpreting components?

**Deep explanation:** Fit scaling and PCA only on each training fold, choose component count using validation performance or explained variance, and apply the learned transform unchanged to validation and test data. Components are variance-maximizing linear combinations, not automatically meaningful causal factors; inspect loadings and stability before assigning interpretations.

**Interview answer:** I would put scaling and PCA inside the training pipeline and select the number of components without touching the test set. I would use PCA for compression or denoising but avoid treating unstable loadings as causal concepts.

43. How would you compare bagging and boosting on noisy training data?

**Deep explanation:** Bagging trains models independently on resampled data and averages them, mainly reducing variance and often tolerating label noise well. Boosting trains sequentially to correct errors and can reduce bias, but aggressive boosting may chase noisy labels or outliers; compare cross-validated robustness and regularize through depth, learning rate, early stopping, or robust losses.

**Interview answer:** Bagging is often safer when variance and noisy observations dominate because averaging stabilizes predictions. Boosting can achieve higher accuracy but may focus on noise, so I would regularize it and compare both on noise-aware validation slices.

44. How would you choose a learning rate and diagnose unstable optimization?

**Deep explanation:** Start with optimizer-appropriate defaults or a learning-rate range test, then tune with validation curves and possibly warmup and decay. Diverging or oscillating loss, exploding gradients, NaNs, and highly variable updates indicate instability; lower the rate, inspect normalization and data, clip gradients when justified, and verify numerical precision.

**Interview answer:** I would use a small logarithmic sweep or range test and choose the largest stable rate that converges well, then apply a schedule if helpful. For instability I would inspect losses, gradient norms, NaNs, scaling, data, and precision before lowering the rate or clipping gradients.

45. How would you distinguish model parameters from hyperparameters during evaluation?

**Deep explanation:** Parameters such as weights are learned by the training algorithm from the training data. Hyperparameters—learning rate, tree depth, regularization strength, architecture—are selected by an outer process using validation data; final performance must be reported once on untouched test data to avoid optimistic bias from tuning.

**Interview answer:** Parameters are learned within a training run, while hyperparameters configure that learning and are chosen through validation. I keep test data outside both processes and use nested cross-validation when data is limited.
