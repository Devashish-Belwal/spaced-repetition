1. How would you design multi-stage retrieval for a very large, heterogeneous corpus?

**Deep explanation:** I would route by corpus, language, modality, and query intent; retrieve broadly with lexical and ANN indexes; fuse candidates; apply permission filters; and rerank a bounded set with a stronger model. Parent-child expansion or neighboring passages can restore context after precise chunk retrieval. Every stage would expose recall, latency, and rejection metrics so complexity is justified by measured gains.

**Interview answer:** I would use routed first-stage retrieval for recall, rank fusion, strict authorization, and a stronger second-stage reranker for precision. Stage-level evaluation would show whether each added component earns its latency and cost.

2. How would you enforce fine-grained permissions across billions of chunks?

**Deep explanation:** I would keep authorization attributes compact, versioned, and derived from a trusted policy source, then choose partitioning, bitmap filters, precomputed access groups, or query-time joins based on update rate and cardinality. Retrieval must fail closed when policy data is stale or unavailable. Permission changes need bounded propagation time, cache invalidation, auditability, and cross-tenant adversarial tests.

**Interview answer:** I would push trusted, versioned authorization constraints into retrieval and select an indexing strategy that matches ACL cardinality and churn. I would define and monitor a permission-revocation SLO, not just search latency.

3. How would you provide a consistent RAG answer while documents are changing during the request?

**Deep explanation:** I would assign source and index versions, then bind retrieval and citation resolution to a consistent snapshot or point-in-time view. If generation is long-running, cited passages should remain resolvable even after a new version is published. Updates and deletions can become visible atomically through an alias or generation switch, with special immediate-revocation handling for security-sensitive content.

**Interview answer:** I would retrieve from a versioned snapshot and carry that version through context assembly and citations. Publishing uses an atomic generation switch, while urgent access revocations override ordinary snapshot retention.

4. How would you design temporal retrieval for questions whose answer changes over time?

**Deep explanation:** I would store valid-time and ingestion-time metadata, preserve document versions, and parse temporal intent from the question. Ranking would combine semantic relevance with validity for the requested date, while citations would identify the exact historical version. Tests should cover late-arriving corrections, conflicting sources, and questions that omit a time reference.

**Interview answer:** I would use versioned content with explicit validity intervals and retrieve against the requested or current time. The answer and citation must name the source version used, especially after corrections.

5. How would you implement adaptive retrieval instead of always using the same pipeline?

**Deep explanation:** I would classify requests by signals such as specificity, freshness need, risk, corpus, and initial retrieval confidence, then select a bounded path: no retrieval, single search, hybrid search, reranking, clarification, or escalation. The router itself needs offline and online evaluation because a mistaken shortcut can hide relevant evidence. Hard safety and permission controls remain identical across routes.

**Interview answer:** I would route queries to the cheapest pipeline likely to meet the quality bar, with escalation when confidence is low or risk is high. Routing decisions would be logged and evaluated as a separate model.

6. How would you answer a multi-hop question whose evidence is spread across documents?

**Deep explanation:** I would decompose the question into explicit subquestions, retrieve and validate evidence for each, then join the intermediate facts using stable entities and provenance. Later searches may depend on earlier results, but the system should limit branches and avoid turning unverified generations into search facts. The final answer must cite the evidence chain, not only the last passage.

**Interview answer:** I would use bounded decomposition, retrieve each hop, and carry verified entities and source IDs into subsequent searches. Evaluation should check both the final conclusion and every supporting hop.

7. How would you combine a knowledge graph with text retrieval?

**Deep explanation:** A graph is useful for explicit entities and relationships, while text passages retain nuance and supporting language. I would link extracted entities to canonical IDs, use graph traversal to create constrained candidates or subqueries, then retrieve text that verifies each relationship. Extraction confidence and source provenance must remain visible because a graph built from model output can encode errors as facts.

**Interview answer:** I would use graph structure for entity relationships and text retrieval for evidence. Graph edges remain source-backed and confidence-scored rather than being treated as unquestionable truth.

8. How would you tune an ANN index under simultaneous recall, memory, latency, and update constraints?

**Deep explanation:** I would create a representative benchmark with filtered and unfiltered queries, measure exact-neighbor recall, and sweep index-build and query parameters at production scale. The evaluation would include memory, build time, update throughput, p95 latency, deletion behavior, and failure recovery. Different tenants or query classes may justify separate index configurations rather than one global compromise.

**Interview answer:** I would benchmark ANN configurations against exact results on the real workload and choose a Pareto point across recall, tail latency, memory, and update cost. Filtered queries and churn must be part of the test.

9. How would you prevent irrelevant evidence from overwhelming relevant evidence in a long context?

**Deep explanation:** I would use calibrated reranking, diversity controls, deduplication, per-source caps, contradiction detection, and evidence compression that retains source links. Context selection can be posed as a coverage problem under a token budget rather than taking the first k passages. I would also compare against smaller contexts because adding text can reduce answer quality even when context capacity is available.

**Interview answer:** I would optimize context for relevance, coverage, diversity, and provenance under a fixed budget. More tokens are not automatically better, so the long-context option must beat a concise baseline.

10. How would you evaluate whether query decomposition improves RAG quality?

**Deep explanation:** I would compare decomposition with direct retrieval on labeled single-hop, multi-hop, ambiguous, and adversarial queries. Metrics would include supporting-evidence recall, final correctness, extra assumptions, latency, token use, and the rate of unrecoverable bad subquestions. An ablation that supplies oracle subquestions helps separate decomposition quality from retrieval quality.

**Interview answer:** I would run a sliced A/B evaluation against direct retrieval and measure both evidence coverage and added failure modes. Oracle-subquestion ablations reveal whether decomposition or downstream retrieval is limiting performance.

11. How would you detect evaluation contamination in a RAG benchmark?

**Deep explanation:** I would search for exact and semantic overlap between benchmark questions, expected answers, indexed documents, prompts, demonstrations, and prior tuning data. Time-based holdouts and newly authored private cases reduce exposure risk. Suspiciously high performance on memorized wording should be compared with paraphrases and changed entities to test genuine retrieval and reasoning.

**Interview answer:** I would audit lexical and semantic overlap across the full pipeline, use temporal and private holdouts, and test paraphrased variants. A benchmark should measure the system, not recall of leaked answers.

12. How would you calibrate and audit an LLM-based evaluator?

**Deep explanation:** I would define a narrow rubric, collect independent human labels, measure agreement and error patterns, and blind the judge to system identity and irrelevant presentation cues. Multiple orderings or judges can expose position and style bias. I would periodically resample human audits and prevent evaluated text from injecting instructions into the judge prompt.

**Interview answer:** I would treat the judge as another fallible model, calibrate it against humans, measure slice-level bias, and protect it from prompt injection. Judge scores support decisions but do not become unquestioned ground truth.

13. How would you use counterfactual tests to validate RAG grounding?

**Deep explanation:** I would alter or remove key evidence, insert plausible distractors, swap entity values, and observe whether the answer follows the supplied sources rather than memorized expectations. A grounded system should change when authoritative context changes, abstain when evidence disappears, and resist irrelevant instructions. These tests reveal false faithfulness that ordinary reference matching misses.

**Interview answer:** I would perturb the evidence and require the answer to respond predictably: change with corrected facts, abstain without support, and ignore distractors. This tests actual dependence on context.

14. How would you define a quality SLO for a production RAG service?

**Deep explanation:** I would define measurable rates for answer correctness or task success, citation support, retrieval coverage, appropriate abstention, permission safety, freshness, and latency on a continuously sampled workload. The SLO would be sliced by high-impact use case and language, with human adjudication for a statistically meaningful subset. Error budgets would gate releases and trigger rollback or degraded modes.

**Interview answer:** A RAG SLO combines quality, grounding, safety, freshness, and latency rather than uptime alone. I would monitor representative samples and attach release and incident actions to error-budget consumption.

15. How would you defend the corpus against data poisoning?

**Deep explanation:** I would authenticate source connectors, enforce source allowlists and ownership, scan anomalous changes, retain versions, and require review for high-impact sources. Ranking should not blindly trust repetition or injected keywords, and provenance must survive every transformation. Canary queries and change-based evaluations can detect when a new document unexpectedly dominates important answers.

**Interview answer:** I would secure ingestion, preserve provenance, review sensitive source changes, and monitor retrieval shifts after updates. Rollbackable versions and canary evaluations limit the effect of poisoned content.

16. How would you model trust boundaries for prompt injection defense?

**Deep explanation:** I would classify system policy, developer configuration, user requests, retrieved content, tool output, and stored memory by origin and trust, then define allowed data flows between them. Untrusted text never grants capabilities or changes policy. Tool adapters, authorization services, sandboxes, destination controls, and output filters enforce the boundary even if the model follows malicious text.

**Interview answer:** I would build an explicit trust and data-flow model, then enforce it outside the LLM. Instructions from untrusted content cannot elevate privilege, access secrets, or authorize an action.

17. How would you prevent an agent from exfiltrating sensitive data through an allowed tool?

**Deep explanation:** Least privilege is insufficient if a tool can both read secrets and send arbitrary output. I would separate read and egress capabilities, classify sensitive values, restrict destinations, redact or tokenize data, and require approval for risky flows. Policy evaluation should consider the combination and sequence of calls, not only whether each individual tool is allowed.

**Interview answer:** I would enforce information-flow controls across tool combinations: sensitive reads cannot automatically feed unrestricted egress. Destination allowlists, redaction, scoped credentials, and approvals constrain the path.

18. How would you design capability-based tool access for agents?

**Deep explanation:** Each run would receive short-lived, narrowly scoped capabilities tied to a tenant, resource set, allowed operations, and budget. Tool services would verify capabilities independently and avoid ambient credentials shared across tools. Capabilities could be attenuated for subagents, revoked centrally, and recorded in an audit trail without exposing the underlying secrets to the model.

**Interview answer:** I would grant explicit, short-lived capabilities per run and resource instead of broad ambient credentials. Every tool enforces scope independently, and delegated agents can receive only reduced capabilities.

19. How would you make agent execution durable across crashes and deployments?

**Deep explanation:** I would represent the run as an event-sourced state machine with versioned workflow code, durable step inputs and outputs, and checkpoints around side effects. Workers can lease a step, renew ownership, and resume after failure without relying on model conversation alone. Deployment compatibility rules would ensure old runs finish under the correct prompt, schema, and tool versions or migrate explicitly.

**Interview answer:** I would persist an event log and state-machine checkpoint for every step, with versioned prompts, tools, and workflow definitions. Recovery resumes deterministically and reconciles uncertain side effects before moving forward.

20. How would you approach exactly-once effects in an agent workflow?

**Deep explanation:** Exactly-once execution across external systems is usually not achievable, so I would target effectively-once outcomes through idempotency keys, uniqueness constraints, transactional outboxes, inbox deduplication, and reconciliation. The state machine distinguishes proposed, dispatched, confirmed, failed, and unknown outcomes. An unknown timeout is never treated as permission to create a new operation.

**Interview answer:** I assume at-least-once delivery and build effectively-once business effects with durable identities, idempotent APIs, deduplication, and reconciliation. Unknown outcomes pause for status resolution rather than blind retry.

21. How would you coordinate an agent task that spans several systems without distributed transactions?

**Deep explanation:** I would model the task as a saga with durable forward steps, explicit invariants, and compensating actions where reversal is possible. Each step is idempotent and records its external operation ID. Compensation is not equivalent to rollback, so irreversible actions require stronger preconditions, approval, and a clear manual recovery path.

**Interview answer:** I would use a durable saga with idempotent steps and explicit compensations. Irreversible boundaries receive preflight validation and approval because distributed rollback cannot be assumed.

22. How would you prevent conflicting work when multiple agents operate on the same resources?

**Deep explanation:** I would give tasks stable resource identities and use optimistic version checks, leases, queues, or domain-specific locks around mutation. Agents would read fresh state before committing and surface conflicts rather than overwrite silently. Shared plans or messages are advisory; the authoritative service enforces concurrency rules and uniqueness constraints.

**Interview answer:** I would coordinate at the resource boundary with versions, leases, and transactional constraints. Agents can collaborate, but only the system of record decides whether a mutation is still valid.

23. How would you decide between planning once and replanning after every step?

**Deep explanation:** A full upfront plan is efficient for stable, predictable work but becomes stale when tools reveal new information. Continuous replanning is adaptive but can drift, loop, and increase cost. I would use a bounded hierarchical plan with explicit milestones, replan only on material observations or failures, and preserve completed commitments and safety constraints.

**Interview answer:** I prefer a lightweight milestone plan with event-driven replanning. It balances adaptability with stability, and every replan remains within the original goal, permissions, and budget.

24. How would you detect and stop an agent that is making no useful progress?

**Deep explanation:** I would track repeated tool calls, unchanged state, cycling plans, duplicate errors, token and cost burn, and distance from defined milestones. Deterministic guards can detect exact repetition, while a progress evaluator can assess semantic stagnation. On threshold breach the run should stop safely, summarize completed work, and request human direction rather than continue consuming resources.

**Interview answer:** I would define progress signals and detect repeated states, calls, and errors under hard budgets. Stagnation triggers a safe stop with a checkpoint and concise escalation.

25. How would you handle model or provider changes in a long-running agent system?

**Deep explanation:** I would version the model, prompt, schemas, tool descriptions, and decoding settings as part of each run. Provider changes would pass offline trajectory replay, shadow traffic, canaries, and rollback gates because even schema-valid behavior can shift. Active runs should either remain pinned or migrate at a documented checkpoint with compatibility validation.

**Interview answer:** I treat model behavior as a versioned dependency. Changes go through trajectory regression tests and canaries, while in-flight runs stay pinned unless an explicit migration is safe.

26. How would you protect long-term agent memory from poisoning and staleness?

**Deep explanation:** I would separate observed facts, user statements, inferred preferences, and model summaries; attach provenance, confidence, timestamps, and scope; and require stronger confirmation for sensitive facts. Retrieval would favor current, authoritative entries and expose contradictions. Users need inspection, correction, expiration, and deletion controls, and untrusted documents should not write durable memory automatically.

**Interview answer:** Long-term memory needs typed records, provenance, confidence, expiry, and user control. Untrusted or inferred content cannot silently become durable truth.

27. How would you sandbox an agent that can execute code?

**Deep explanation:** I would run code in an isolated, ephemeral environment with minimal filesystem mounts, no ambient credentials, restricted network egress, resource and time limits, and a disposable identity. Inputs and outputs would be scanned, dependencies pinned or proxied, and sensitive operations exposed only through separately authorized tools. Host isolation should not depend on the model obeying instructions.

**Interview answer:** I would use an ephemeral least-privilege sandbox with strict filesystem, network, credential, and resource boundaries. Privileged actions remain outside the sandbox behind validated APIs and approval gates.

28. How would you prevent a time-of-check-to-time-of-use flaw after human approval?

**Deep explanation:** The approval would bind to a canonical action payload, resource version, policy version, and expiry. Immediately before execution, the service would verify the signature or hash, recheck authorization and relevant preconditions, and reject any changed target or argument. If external state changed materially, the agent must produce a new proposal for approval.

**Interview answer:** Approval applies to an immutable, versioned action, not a general intention. Execution revalidates identity, policy, state, and payload so changed details require fresh approval.

29. How would you evaluate an entire agent trajectory rather than only its final answer?

**Deep explanation:** I would score task completion, intermediate state validity, tool selection, argument correctness, policy compliance, side effects, efficiency, recovery behavior, and provenance. Deterministic checks cover schemas and invariants; sandboxed simulations verify effects; calibrated human or model reviewers assess ambiguous decisions. Counterfactual and adversarial cases reveal paths that succeed accidentally or unsafely.

**Interview answer:** I would evaluate the sequence of decisions and effects, not just the final prose. A successful outcome fails the evaluation if it used unauthorized, wasteful, brittle, or irreproducible steps.

30. How would you respond to a RAG or agent security incident?

**Deep explanation:** I would stop or restrict affected runs, revoke capabilities and credentials, isolate suspicious sources, preserve privacy-aware evidence, and identify every data flow and external side effect. Recovery includes correcting indexes or memory, reconciling actions, notifying required parties, and adding targeted regression tests and controls before re-enabling features. The architecture should support per-tool, per-source, per-tenant, and global kill switches.

**Interview answer:** I would contain capabilities and egress first, preserve auditable evidence, reconcile affected data and actions, then remediate and test the exact failure path. Granular kill switches let us reduce harm without unnecessarily disabling the whole system.
