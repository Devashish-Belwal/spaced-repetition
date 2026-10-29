1. How would you detect training-data contamination in an evaluation benchmark?

**Deep explanation:** Compare benchmark items with training corpora using normalized exact hashes, fuzzy matching, and semantic search. Look for suspiciously high performance on public items versus newly authored paraphrases, and use canaries or private post-training sets. Distinguish common factual overlap from answer leakage, then report results on a verified-clean replacement set.

**Interview answer:** I would combine provenance, exact and semantic matching, canaries, and performance comparisons on private variants. I would separate harmless overlap from answer leakage and publish clean-set results.

2. How would you design temporal and group-based evaluation splits for realistic generalization?

**Deep explanation:** Keep each real-world group—such as customer, patient, repository, or author—in one split, then train on earlier periods and test on later ones. Fit preprocessing only on training data and reproduce seasonality, cold starts, and deployment delay. Report per-time and per-group metrics because aggregates hide weak cohorts.

**Interview answer:** I would group related records to prevent leakage and place test data strictly after training data. The split should mirror production novelty, with per-group and per-period reporting.

3. How would you measure model quality when labels arrive weeks later?

**Deep explanation:** Log immutable prediction records and evaluate by prediction cohort only after its labels mature. Use drift, review samples, confidence, and calibrated proxy outcomes as early warnings, then backfill true metrics. Account for censoring when label arrival depends on the outcome.

**Interview answer:** I would monitor explicit leading indicators, but judge quality on label-mature cohorts. When labels arrive, I would backfill metrics, measure proxy reliability, and correct for biased label delay.

4. How would you compare offline metrics with online business outcomes?

**Deep explanation:** Define a chain from model behavior to user success and business value, such as retrieval recall → correctness → task completion. Validate offline metrics against randomized online experiments and analyze segments. Include latency, safety, complaints, and cost as guardrails.

**Interview answer:** I would learn which offline metrics predict online outcomes through controlled experiments, by segment. A model ships only when business impact improves without violating safety, latency, or cost guardrails.

5. How would you design an A/B test for an AI feature without exposing users to unacceptable failures?

**Deep explanation:** First pass offline safety tests, red teaming, shadow traffic, and internal or opted-in use. Ramp only low-risk eligible traffic with deterministic fallbacks, human review where needed, strict stop thresholds, and rapid rollback. Rare catastrophic risks require scenario tests, not merely statistical significance.

**Interview answer:** I would gate offline, shadow the feature, then ramp from a small low-risk cohort with automatic rollback. Unsafe or uncertain cases use a safe fallback; safety is a hard constraint, not an average metric.

6. How would you detect feedback loops caused by model-generated training data?

**Deep explanation:** Record whether every example was generated, edited, ranked, or selected by a model. Track synthetic share, duplication, diversity, and repeated errors across generations, evaluating on an untouched human-authored holdout. Use ablations, caps, and reweighting to detect and limit recursive degradation.

**Interview answer:** I would make synthetic provenance first-class and monitor repeated errors and diversity loss on a human holdout. I would cap or reweight synthetic data and run no-synthetic ablations.

7. How would you version data, features, prompts, models, and evaluation results together?

**Deep explanation:** Store an immutable run manifest containing data snapshots or hashes, feature and prompt versions, model/tokenizer IDs, code, dependencies, seeds, configuration, and evaluation version. Link registered artifacts and deployments to that manifest. Promote exact versions, never mutable aliases such as `latest`.

**Interview answer:** Every experiment gets an immutable manifest pinning all inputs and artifacts. Evaluations and deployments reference it, providing reproducibility, lineage, comparison, and rollback.

8. How would you prevent train-serving skew in a production feature pipeline?

**Deep explanation:** Reuse one feature definition across offline and online paths, with enforced schemas, point-in-time joins, event-time semantics, defaults, and versions. Replay production requests through both paths and compare vectors. Training must not use future fields or batch cleanup unavailable during serving.

**Interview answer:** I would share versioned transformations, enforce point-in-time correctness, and contract-test offline and online features with production replays. Online missingness and distributions are continuously monitored.

9. How would you choose between fine-tuning, prompting, retrieval, and changing the product workflow?

**Deep explanation:** Diagnose the gap: prompting helps instruction or format issues; retrieval supplies changing, private, citable knowledge; fine-tuning learns stable behavior from strong examples; workflow changes remove ambiguity or constrain risk. Compare quality, freshness, privacy, latency, cost, and maintenance, starting with the simplest reversible intervention.

**Interview answer:** I would map the failure to its cause and evaluate each remedy on the same task set. I prefer the simplest approach that meets requirements, including redesigning the workflow when the problem is ambiguity rather than model capability.

10. How would you evaluate quantization, batching, and model size for serving efficiency?

**Deep explanation:** Benchmark realistic input/output lengths and concurrency on target hardware. Measure task quality, time to first token, inter-token latency, p95 latency, throughput, memory, energy, and cost per successful request. Quantization can reduce quality, while batching improves utilization but increases queueing.

**Interview answer:** I would compare the full quality–latency–throughput–cost frontier under realistic load. The chosen configuration must meet quality and tail-latency SLOs, not merely maximize tokens per second.

11. How do KV-cache size and context length affect inference memory?

**Deep explanation:** The cache holds keys and values for each processed token, layer, KV head, head dimension, active sequence, and byte width, so memory grows roughly linearly in all of them. Longer contexts reduce batch capacity; GQA/MQA, paging, prefix reuse, eviction, and cache quantization reduce pressure with tradeoffs.

**Interview answer:** KV memory is approximately tokens × layers × KV heads × head dimension × two tensors × bytes, multiplied by concurrent sequences. Longer context directly consumes serving capacity even when weight memory is unchanged.

12. How would you design continuous batching without starving long requests?

**Deep explanation:** Schedule at token boundaries so finished sequences leave and new ones enter. Prevent shortest-job bias using aging, maximum wait times, weighted fair queues, or reserved capacity; account for prompt-prefill and KV occupancy. Evaluate fairness and p99 latency across length buckets under overload.

**Interview answer:** I would use iteration-level batching with an age- and class-aware scheduler. Aging or reserved capacity guarantees long jobs progress, while admission control protects latency during overload.

13. How would you compare speculative decoding with ordinary generation for a workload?

**Deep explanation:** A draft model proposes tokens and the target verifies them; benefit depends on acceptance rate, verification kernels, lengths, concurrency, and draft overhead. Benchmark identical sampling on target hardware for quality, tail latency, throughput, memory, and cost. Large batches or low acceptance may erase gains.

**Interview answer:** I would benchmark both paths on the actual traffic distribution. I would adopt speculation only if acceptance and verification produce a measurable latency or cost gain while preserving the target distribution.

14. How would you handle model-provider fallback when outputs have different quality and schemas?

**Deep explanation:** Put providers behind a canonical typed contract with adapters and strict output validation. Maintain a capability/quality policy per task rather than assuming interchangeability, plus timeouts, circuit breakers, idempotent retries, and provider-specific monitoring. If no fallback clears the safety floor, fail safely.

**Interview answer:** I would normalize providers behind an internal schema and qualify each provider by task. Fallback is policy-driven and validated; it never silently substitutes a model below the required quality or safety threshold.

15. How would you migrate embedding models without making old vectors incompatible with new queries?

**Deep explanation:** Old and new embeddings occupy different spaces, so build a versioned parallel index, backfill it, and dual-write updates. Shadow-test recall, downstream quality, latency, and cost. Switch the query encoder and index atomically, retaining rollback until the old index can be retired.

**Interview answer:** I treat encoder and index as one versioned unit. I would build and test a parallel index, dual-write during migration, then atomically switch both query encoding and routing.

16. How would you evaluate ANN recall, filtering, latency, and index-update cost together?

**Deep explanation:** Create exact-search ground truth across representative queries, filters, tenants, and update rates. Sweep index parameters and measure recall@k, filtered recall, p50/p99 latency, memory, build cost, update throughput, and freshness. Choose a Pareto point under production load.

**Interview answer:** I would benchmark against exact neighbors with realistic filters and mutations, then select the cheapest configuration clearing recall, freshness, and latency thresholds. Authorization filtering must remain correct throughout.

17. How would you design retrieval across millions of documents with fine-grained permissions?

**Deep explanation:** Carry trusted identity into retrieval and filter candidates before content reaches generation. Store permission metadata or partition indexes, scope caches by authorization, propagate revocations quickly, and recheck access when fetching source text. The model must never be responsible for hiding unauthorized content.

**Interview answer:** Access control belongs in retrieval, not prompts. Every candidate is security-trimmed using trusted identity, caches are permission-scoped, and source fetch performs a final authorization check.

18. How would you detect and mitigate adversarial instructions hidden in retrieved content?

**Deep explanation:** Treat retrieved text as untrusted data, delimit it, and prevent it from granting authority. Detection and source reputation help but are imperfect, so validate tool arguments externally, minimize privileges, omit secrets from context, and require confirmation for consequential actions. Test indirect prompt injection continuously.

**Interview answer:** I would isolate retrieved data from trusted instructions and enforce tool permissions in code. Least privilege, external validation, no secrets in context, and approval gates are the core controls.

19. How would you prevent tool outputs from overriding an agent's trusted instructions?

**Deep explanation:** Represent tool results as typed, provenance-marked data rather than concatenated instructions. The orchestrator enforces instruction priority, validates schemas, and bases authorization only on trusted state. Test malicious tool outputs containing injections and forged status.

**Interview answer:** Tool output stays in an untrusted typed channel and cannot grant capabilities. The orchestrator—not the model—enforces instruction hierarchy, schema validation, and authorization.

20. How would you contain an agent that can execute code or browse internal systems?

**Deep explanation:** Run it in an isolated sandbox with deny-by-default filesystem, network, identity, and secret access. Use allowlisted tools, short-lived scoped credentials, quotas, egress controls, audit logs, kill switches, and external policy enforcement. Separate planning from privileged execution.

**Interview answer:** I would contain it like untrusted code: sandboxing, least privilege, restricted egress, short-lived credentials, resource limits, and auditability. Privilege escalation requires an independent policy check or human approval.

21. How would you require authorization before high-impact agent actions?

**Deep explanation:** Classify actions by impact and have an external policy service check authenticated identity, resource, and scope at execution. Show an exact preview and bind approval to a normalized action hash, expiry, and idempotency key. Sensitive operations may require step-up authentication or multiple approvers.

**Interview answer:** The user approves the exact action, scope, and destination, and a short-lived signed authorization is checked at execution. General conversational consent never becomes reusable privilege.

22. How would you design durable agent execution with checkpoints and resumable tool calls?

**Deep explanation:** Use a persisted state machine or event log. Before a call, save intent, arguments, authorization, and idempotency key; afterward, atomically record result and next state. On restart, reconcile uncertain external operations rather than blindly replaying them, with versioned state and explicit retry or human-review states.

**Interview answer:** I would use a durable workflow engine with persisted transitions and idempotent activities. Recovery reconciles in-flight effects and resumes from the last committed state.

23. How would you prevent replayed agent steps from repeating payments or sending duplicate messages?

**Deep explanation:** Give each logical side effect a stable idempotency key and persist its status. Use an outbox to commit state and dispatch intent reliably, pass keys to downstream APIs, and reconcile timeouts by querying providers. Aim for exactly-once business effect despite at-least-once delivery.

**Interview answer:** I would record intent before dispatch and use stable idempotency keys end to end. After ambiguous failure, the workflow reconciles the existing operation instead of issuing another.

24. How would you compare one agent, multiple agents, and a deterministic workflow?

**Deep explanation:** Evaluate the same tasks for success, variance, latency, cost, recoverability, and safety. Deterministic workflows suit known auditable procedures; one agent handles bounded ambiguity; multiple agents add specialization or parallelism but coordination cost and attack surface. Use ablations to verify extra agents add value beyond extra compute.

**Interview answer:** I start deterministic when the process is known, use one agent for bounded flexibility, and add agents only for measured specialization or parallelism gains. I compare end-to-end quality, tail latency, cost, and recovery.

25. How would you debug an agent whose failures depend on a long interaction history?

**Deep explanation:** Capture a privacy-safe replayable trace of messages, context, versions, tools, and state. Reproduce, then use delta debugging to remove or summarize spans until the smallest causal history remains. Inspect truncation, conflicting instructions, stale memory, ordering, and accumulated false assumptions using repeated counterfactual runs.

**Interview answer:** I would replay the versioned trajectory and systematically minimize its history. Counterfactual repeated runs distinguish context bugs—such as truncation or stale state—from sampling variance.

26. How would you evaluate complete agent trajectories rather than only final answers?

**Deep explanation:** Score planning, tool choice and arguments, policy compliance, efficiency, recovery, provenance, side effects, and final success. Use deterministic checks where possible, human review for nuanced judgment, and calibrated model judges only as supporting evidence. A lucky answer cannot excuse an unsafe path.

**Interview answer:** I would instrument structured traces and score both process and outcome. Hard checks cover authorization, tool validity, side effects, and completion; human sampling covers judgment and efficiency.

27. How would you design adversarial evaluations for data exfiltration and unauthorized actions?

**Deep explanation:** Build cases from a threat model spanning malicious users, retrieved documents, tools, sites, and cross-tenant data. Seed fake secrets and test direct, indirect, encoded, and multi-step exfiltration or privilege escalation in an isolated environment. Score failures by severity and retain every successful attack as a regression test.

**Interview answer:** I would use sandboxed endpoints and canary secrets to exercise realistic multi-channel attacks. Any unauthorized access, transformation, or transmission fails the gate and becomes a permanent test.

28. How would you prevent an evaluation judge from being manipulated by the evaluated output?

**Deep explanation:** Keep the rubric in a trusted channel and quote candidate output as untrusted data. Require structured scoring, blind identities, randomize order, and test judge-directed injections. Prefer deterministic validators where possible and calibrate multiple judges or human adjudicators for important cases.

**Interview answer:** I would isolate candidate text, schema-constrain judgment, and include injection attacks in calibration. High-stakes scoring combines deterministic checks, blinded independent judges, and human adjudication.

29. How would you quantify uncertainty and disagreement in human evaluation labels?

**Deep explanation:** Collect multiple independent labels and retain their distribution. Report an appropriate agreement statistic, per-item entropy, and confidence intervals; inspect disagreement by subgroup and annotator. High disagreement may reveal an ambiguous rubric rather than noisy workers.

**Interview answer:** I would use multiple blinded raters and report agreement, label distributions, and confidence intervals. I would adjudicate contentious items and revise ambiguous rubrics, propagating label uncertainty into model comparisons.

30. How would you detect a quality regression after a provider changes a model?

**Deep explanation:** Pin versions when possible and continuously run a stable suite containing representative, safety-critical, and canary cases. Use paired shadow traffic and segmented production change detection for quality, latency, and cost. Provider aliases must pass release thresholds and support fallback or rollback.

**Interview answer:** I treat a provider change as a new release. Regression tests, paired shadow traffic, and production monitoring gate it, with rollback preventing silent degradation.

31. How would you control cost for a high-volume RAG application under traffic spikes?

**Deep explanation:** Use per-request and tenant budgets, priority queues, admission control, scoped caching, request coalescing, context reduction, smaller-model routing, and output caps. Batch work where latency permits and degrade by deferring work or returning sources—never by bypassing security. Track cost per successful task.

**Interview answer:** I would combine budgets, rate limits, priority queues, safe caching, deduplication, model routing, and strict context limits. Under overload, low-priority work degrades safely while authorization remains intact.

32. How would you design privacy-aware logging for prompts, retrieved text, and tool results?

**Deep explanation:** Default to structured metadata, hashes, and redacted samples rather than raw content. Minimize collection, detect secrets and personal data before storage, encrypt, tenant-isolate, restrict and audit access, and use short retention. Redaction is imperfect, so tightly control any break-glass raw logging.

**Interview answer:** I would log metadata and redacted samples by default, with encryption, tenant separation, least-privilege access, auditing, retention limits, and deletion support. Raw content is exceptional and tightly controlled.

33. How would you honor deletion requests across source documents, embeddings, caches, and logs?

**Deep explanation:** Maintain lineage from source IDs to chunks, vectors, derived datasets, cache keys, and log references. Tombstone immediately, fan out idempotent deletion, invalidate serving paths, and verify completion. Backups follow declared expiry or cryptographic erasure, while versioned tombstones prevent re-indexing races.

**Interview answer:** A lineage-backed workflow blocks the source immediately, deletes every derivative idempotently, and verifies it is no longer served. It records proof without retaining deleted content.

34. How would you defend an AI coding workflow against malicious repository instructions?

**Deep explanation:** Treat files, issues, comments, dependencies, and test output as untrusted data. Sandbox execution, restrict filesystem and egress, scope credentials, scan secrets and dependencies, inspect diffs, and gate sensitive commands outside the model. Prompt-injection detection alone is insufficient.

**Interview answer:** I would sandbox the coding agent, treat repository text as data, minimize credentials and network access, and require approval for sensitive effects. Changes undergo diff, dependency, secret, and isolated test review.

35. How would you validate generated code that touches authentication or financial logic?

**Deep explanation:** Define security and accounting invariants, threat-model the change, and require expert ownership and review. Apply static analysis, dependency scanning, property tests, fuzzing, and integration tests for replay, races, privilege escalation, rounding, and ledger consistency. Deploy gradually with monitoring and rollback.

**Interview answer:** I treat it as security-critical code: explicit invariants, mandatory human review, static and dynamic analysis, adversarial tests, and staged reversible deployment. Generated code gets no correctness presumption.

36. How would you design fallback behavior when retrieval works but generation is unavailable?

**Deep explanation:** Return honest, permission-checked ranked excerpts, links, and metadata, use a narrow deterministic template, or queue the task. Clearly state that synthesis is unavailable and avoid exposing raw chunks normally redacted by generation. High-risk workflows may need to fail closed.

**Interview answer:** I would degrade to authorized search results or a deterministic cited format and clearly disclose the limitation. The fallback preserves the same privacy and authorization guarantees.

37. How would you distinguish model limitations from retrieval, prompt, and product-design failures?

**Deep explanation:** Run component ablations: gold evidence tests generation, answer-bearing-document recall tests retrieval, fixed-context variants test prompts, and user research tests task/interface clarity. Trace query, ranking, context construction, generation, and workflow. Oracle tests estimate the upside of fixing each stage.

**Interview answer:** I would isolate components with gold-context, retrieval, prompt, and workflow experiments. That attributes the bottleneck before choosing an expensive or irrelevant fix.

38. How would you evaluate multilingual retrieval and generation across uneven training coverage?

**Deep explanation:** Use native-authored, culturally appropriate sets across languages, scripts, dialects, and resource levels—not translations alone. Separately measure recall, ranking, correctness, fluency, citation faithfulness, safety, and latency, including cross-lingual, transliterated, and code-switched cases. Require per-language floors.

**Interview answer:** I would test each language independently with native reviewers and separate retrieval from generation metrics. Strong English results cannot hide low-resource failures; each supported language needs a minimum quality and safety threshold.

39. How would you design a release gate that combines task success, security, latency, and cost?

**Deep explanation:** Set hard quality and security floors, latency/reliability SLOs, and a cost budget on representative traffic. Run versioned functional, adversarial, and load tests against the production baseline with confidence intervals. Hard failures cannot be averaged away; passing candidates still use canaries and rollback.

**Interview answer:** I would use hard safety and quality gates followed by latency and cost budgets. A canary ships only statistically supported improvements, and no aggregate score can compensate for a critical security regression.

40. How would you decide that a deterministic implementation is better than an AI feature?

**Deep explanation:** Prefer deterministic code when requirements are specifiable, exactness and auditability matter, and conventional logic meets the need with lower lifecycle cost. Compare quality, edge cases, latency, maintenance, privacy, and recovery. A hybrid can use AI for interpretation while deterministic code validates and performs effects.

**Interview answer:** If knowable rules solve the problem more reliably, cheaply, and audibly, I choose deterministic code. I use AI only where ambiguity creates measured value and keep validation and high-impact effects deterministic.
