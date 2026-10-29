1. How would you design a single-agent execution loop?

**Deep explanation:** I would represent the task as explicit state, then repeatedly call the model with the goal, current state, available tools, and recent observations. The loop would validate any proposed tool call, execute it through the application, append the observation, and stop on completion, approval need, error, or budget limit. Time complexity is roughly proportional to the number of model calls plus tool calls, while space grows with stored state and logs. The main design trade-off is giving the model enough context to act well without letting the loop become slow, costly, or hard to control.

**Interview answer:** I would build a controlled loop: provide state to the model, validate the chosen action, execute a tool, record the observation, and repeat until completion or a limit. The loop needs step limits, error handling, and clear state management.

2. How would you choose between a deterministic workflow and an agent?

**Deep explanation:** I would use deterministic workflows when the process is known, compliance-sensitive, or easy to express as code. I would use an agent when the path depends on interpretation, unstructured input, tool results, or judgment. A practical system often mixes both: deterministic orchestration for boundaries and an agent for flexible substeps. Workflows are easier to test and reason about; agents are more adaptable but less predictable.

**Interview answer:** I would prefer deterministic code for stable, well-defined processes and agents for open-ended or context-dependent decisions. The best design often wraps agent steps inside a controlled workflow.

3. How would you define tool schemas for reliable agent use?

**Deep explanation:** Tool schemas should describe a small, clear action with typed parameters, required fields, constraints, and examples. Ambiguous tools such as `do_task` invite bad calls, while precise tools such as `search_tickets(query, status, limit)` are easier for the model to use. The application should validate arguments before execution and return structured errors. A good schema reduces prompt burden and makes behavior easier to test.

**Interview answer:** I would make tools narrow, typed, well documented, and validated. Clear input schemas and structured outputs help the model call tools correctly and help the system reject unsafe arguments.

4. How would you handle tool failures inside an agent?

**Deep explanation:** Tool failures should be returned as structured observations that distinguish retriable errors, user-correctable errors, permission failures, and system failures. The agent may retry transient errors with backoff, adjust invalid parameters, or ask for human input when required. Unlimited retries are dangerous because they create cost and latency spikes. Logging should capture the failed tool, arguments, error category, and retry count.

**Interview answer:** I would classify tool errors, allow bounded retries for transient failures, ask for help on missing information, and stop on permission or unrecoverable errors. Failures should be logged with enough detail for debugging.

5. How would you prevent an agent from entering an infinite loop?

**Deep explanation:** Infinite loops happen when an agent repeats actions without making progress, such as running the same failing command or searching the same query. Defenses include maximum step counts, maximum retries per action, progress checks, repeated-state detection, and budget limits. The agent should summarize why it stopped rather than hiding partial progress. These controls bound time complexity by limiting the number of iterations.

**Interview answer:** I would use step limits, retry limits, progress detection, repeated-action checks, and budget caps. If the agent cannot progress, it should stop clearly and report the blocker.

6. How would you decide what context to pass to the model at each step?

**Deep explanation:** The model needs the goal, relevant state, available tools, recent observations, and constraints. Passing the entire history may be expensive and can distract the model, so I would keep structured state and summarize older events. Important facts, pending decisions, and irreversible actions should remain explicit. The trade-off is between completeness and context noise; too little context causes mistakes, while too much increases latency and reduces focus.

**Interview answer:** I would pass the goal, compact state, recent observations, and relevant constraints. Older history should be summarized into structured state instead of blindly appending everything.

7. How would you implement human approval for risky tool calls?

**Deep explanation:** I would classify tools and arguments by risk, then require approval before actions that are irreversible, expensive, external-facing, or security-sensitive. The approval request should show the proposed action, inputs, expected effect, and source evidence. After approval, the system should execute exactly the approved operation, not let the model silently change it. Approvals should be logged for auditability.

**Interview answer:** I would add a policy layer that intercepts risky tool calls, presents the exact proposed action for approval, and logs the decision. The approved action should be immutable between review and execution.

8. How would you test an agent beyond checking its final answer?

**Deep explanation:** Agent testing should inspect trajectories, tool calls, state transitions, safety decisions, and final outputs. A test can verify that the agent chose the right tool, did not call forbidden tools, handled failures, and stopped within limits. Unit tests can cover tools and policies, while scenario tests cover full task execution. Because models are probabilistic, tests often use stable fixtures, mocked tools, and tolerance-based assertions.

**Interview answer:** I would test the full trajectory, not only the final text. Tests should check tool selection, argument validity, safety gates, recovery behavior, stopping conditions, and output quality.

9. How would you evaluate whether an agent is using tools correctly?

**Deep explanation:** I would create tasks with known required actions and compare the agent's tool calls against expected sequences or acceptable alternatives. Metrics include tool-call precision, tool-call recall, invalid argument rate, unnecessary call rate, success rate after tool errors, and final task completion. For some tasks, multiple valid paths exist, so evaluation should focus on correctness and efficiency rather than exact sequence alone.

**Interview answer:** I would measure whether the agent calls the right tools with valid arguments and avoids unnecessary or unsafe calls. The evaluation should allow multiple valid paths but still track efficiency and failures.

10. How would you manage agent memory safely?

**Deep explanation:** I would separate ephemeral task state from persistent memory, require explicit policies for what can be stored, and support deletion or correction. Persistent memory should store compact, source-labeled facts rather than raw transcripts when possible. Retrieval should be scoped by user, tenant, and relevance. Memory writes may need user confirmation because incorrect or sensitive memories can affect future behavior.

**Interview answer:** I would keep short-term state separate from long-term memory, store only useful and permitted facts, label sources, and enforce access controls. Users should be able to correct or delete memory.

11. How would you design an agent to ask clarifying questions?

**Deep explanation:** The agent should ask clarifying questions when missing information materially affects the result or when acting without it would be risky. It should not ask for details it can safely infer or retrieve. A good design distinguishes blocking ambiguity from optional preference. This improves user experience because the agent stays proactive while still avoiding dangerous assumptions.

**Interview answer:** I would have the agent ask only when ambiguity blocks progress or creates risk. Otherwise it should proceed with reasonable assumptions and make them visible.

12. How would you reduce latency in an agentic system?

**Deep explanation:** Latency comes from model calls, tool calls, retries, retrieval, and approval waits. I would reduce model steps through better planning, use smaller models for simple decisions, parallelize independent tools, cache stable results, stream progress, and set clear budgets. Some latency is worth paying for accuracy on high-risk tasks. The trade-off is that aggressive optimization can reduce reasoning quality or observability.

**Interview answer:** I would cut unnecessary loops, parallelize independent work, cache stable calls, use the right model size, and stream progress. I would optimize latency only within the required quality and safety bar.

13. How would you control cost for an AI agent?

**Deep explanation:** Agent cost grows with model tokens, number of steps, tool calls, retrieval volume, and retries. Controls include step budgets, token budgets, model routing, context compression, caching, cheaper tools for simple tasks, and early stopping. Cost metrics should be tied to task outcome, not only per-call spend. A cheap failed agent is still expensive from a product perspective.

**Interview answer:** I would control cost with step limits, token budgets, model routing, caching, summarization, and early stopping. I would measure cost per successful task, not just cost per model call.

14. How would you design an agent for customer support ticket triage?

**Deep explanation:** The agent would classify the issue, retrieve customer and policy context, detect urgency, suggest routing, draft a response, and escalate sensitive cases. It should not reveal private customer information or make high-impact decisions without policy support. Deterministic rules can handle priority thresholds and compliance requirements, while the agent handles messy language and summarization. Evaluation should include accuracy, escalation recall, response quality, and privacy checks.

**Interview answer:** I would combine rules, retrieval, and an agent. The agent can classify and draft, while deterministic policy checks enforce privacy, escalation, and approval for sensitive actions.

15. How would you design an agent for code maintenance?

**Deep explanation:** A code agent needs repository search, file editing, test execution, dependency inspection, and version-control awareness. It should make small changes, run focused tests, and report what changed. The agent must respect existing code style and avoid unrelated modifications. Failure modes include overbroad refactors, brittle fixes, missing tests, and misreading generated output.

**Interview answer:** I would give the agent scoped repo tools, require small focused edits, run tests, and summarize changes. Guardrails should prevent unrelated rewrites and unsafe commands.

16. How would you handle conflicting tool outputs?

**Deep explanation:** Conflicts happen when two sources disagree, a cached value differs from a live API, or retrieval returns contradictory documents. The agent should compare source trust, freshness, permissions, and provenance rather than averaging answers. It may need to retrieve more evidence or ask for human review. For high-impact tasks, the system should prefer abstention over unsupported resolution.

**Interview answer:** I would preserve provenance, compare source authority and freshness, and escalate or abstain when the conflict cannot be resolved. The agent should not hide contradictions.

17. How would you design rollback for agent actions?

**Deep explanation:** Rollback depends on the action type. For database updates, transactions or compensating actions may work. For emails or external notifications, true rollback may be impossible, so approval is more important before execution. The agent should log action IDs, inputs, timestamps, and affected resources. Designs should favor reversible steps and dry runs before irreversible operations.

**Interview answer:** I would make actions reversible where possible using transactions, versioning, or compensating operations. Irreversible actions need stronger approval and audit logs before execution.

18. How would you handle sensitive data in agent logs?

**Deep explanation:** Agent logs can contain user prompts, tool arguments, documents, secrets, and generated outputs. I would minimize what is logged, redact known sensitive fields, separate secure trace storage from analytics, and enforce retention limits. Debugging value must be balanced against privacy and compliance. Access to logs should be audited because logs can become a second copy of production data.

**Interview answer:** I would log enough for debugging but redact or avoid sensitive content, apply retention policies, and restrict access. Agent traces should be treated as sensitive production data.

19. How would you design permissions for tools?

**Deep explanation:** I would give each tool a least-privilege scope and enforce authorization in the tool service, not in the model. Tools should know the user identity, tenant, action, and requested resource. Some tools may be read-only, while write tools require stronger checks or approval. Fine-grained permissions reduce blast radius if the agent is manipulated or mistaken.

**Interview answer:** I would enforce permissions at the tool layer using user identity, resource scope, and action type. Prompts can guide behavior, but authorization must be programmatic.

20. How would you handle prompt injection from retrieved documents?

**Deep explanation:** Retrieved documents should be treated as untrusted data, even if they come from internal sources. The system should clearly separate instructions from content, tell the model that document text is evidence only, and prevent documents from granting tool permissions. Sensitive actions should be validated against application policy. Detection can help, but containment through permissions and approval is more reliable.

**Interview answer:** I would treat retrieved text as untrusted evidence, separate it from system instructions, and enforce tool permissions outside the model. Prompt injection should not be able to create authority.

21. How would you use retrieval in an agentic system?

**Deep explanation:** Retrieval can supply documents, policies, past cases, code snippets, or memory relevant to the agent's current step. The agent may retrieve at the start or adaptively when it lacks evidence. Retrieval improves grounding but can introduce irrelevant or malicious content. The agent should cite or track retrieved sources and avoid using retrieval results as instructions.

**Interview answer:** I would use retrieval to ground decisions in relevant evidence and make actions traceable. Retrieved content should be source-labeled, filtered, and treated as data rather than commands.

22. How would you decide when an agent should stop and escalate?

**Deep explanation:** Escalation is appropriate when confidence is low, required permissions are missing, repeated attempts fail, evidence conflicts, or the action has high impact. The system can define thresholds based on step count, error categories, safety policies, and business rules. Escalation should include a concise state summary so the human does not restart from scratch. Stopping too early hurts automation value; stopping too late creates risk and frustration.

**Interview answer:** I would escalate on low confidence, repeated failure, missing authority, conflicting evidence, or high-impact decisions. The agent should hand off a clear summary and supporting context.

23. How would you make an agent's actions auditable?

**Deep explanation:** Auditability requires recording who requested the task, what goal was given, which model and prompt version were used, what tools were called, what data was accessed, what approvals occurred, and what final changes were made. Logs should be tamper-resistant for regulated workflows. The challenge is storing enough detail for accountability while protecting sensitive data. Structured traces are easier to search and analyze than raw transcripts alone.

**Interview answer:** I would store structured traces with user identity, prompt and model versions, tool calls, data access, approvals, and final effects. Audit logs must be secure and privacy-aware.

24. How would you compare ReAct-style agents with plan-and-execute agents?

**Deep explanation:** ReAct interleaves reasoning and acting step by step, which is flexible and responsive to observations. Plan-and-execute creates a broader plan first, then carries it out, which can improve coherence for longer tasks. ReAct may drift or loop; plan-and-execute may overcommit to a bad initial plan. Many systems use a hybrid: initial lightweight plan plus step-by-step updates.

**Interview answer:** ReAct adapts after each observation, while plan-and-execute emphasizes upfront structure. ReAct is flexible, planning is coherent, and hybrids are common for real tasks.

25. How would you design state persistence for long-running agents?

**Deep explanation:** Long-running agents need durable state so they can resume after process restarts, approvals, rate limits, or delayed external events. The state should include task status, plan, completed steps, pending actions, tool results, and idempotency keys. Persisting raw context alone is fragile; structured state supports recovery and inspection. Space complexity grows with trace detail, so retention and compaction matter.

**Interview answer:** I would persist structured task state, including progress, pending approvals, tool results, and idempotency keys. This lets the agent resume safely after interruptions.

26. How would you make agent tool calls idempotent?

**Deep explanation:** Idempotency ensures repeating a tool call does not create duplicate side effects. For write operations, tools can accept idempotency keys, detect duplicate requests, and return the original result. This is critical when agents retry after timeouts or crashes. Without idempotency, a retry might send two emails, create two tickets, or charge twice.

**Interview answer:** I would attach idempotency keys to side-effecting tool calls and have tools deduplicate repeated requests. This makes retries safer in unreliable execution environments.

27. How would you handle rate limits in agent tools?

**Deep explanation:** Agents may trigger bursts of calls during loops or parallel work. Rate-limit handling should include backoff, queuing, budget-aware retries, and alternative paths when available. The agent should observe rate-limit errors as temporary constraints rather than keep retrying immediately. System-wide throttling is important because many agents can overload shared APIs.

**Interview answer:** I would use backoff, queues, retry budgets, and global throttles. The agent should treat rate limits as operational feedback and stop or reschedule when needed.

28. How would you design output validation for an agent?

**Deep explanation:** Output validation checks whether the agent's final response or proposed action meets format, factual, safety, and business rules. Simple validations include JSON schema checks, required fields, and type constraints. Harder validations include citation support, policy compliance, and consistency with tool results. Validation can trigger repair, rejection, or human review, but repeated repair loops should be bounded.

**Interview answer:** I would validate structure, policy compliance, and consistency with observed evidence. Invalid outputs should be repaired within limits or escalated.

29. How would you debug a poorly performing agent?

**Deep explanation:** I would inspect traces to locate where failure begins: user-intent understanding, planning, retrieval, tool selection, tool arguments, tool execution, memory, or final synthesis. Then I would create a reproducible test case with mocked tools if possible. Fixes may involve better schemas, prompts, policies, retrieval, or deterministic code. Debugging only the final answer often misses the real failure point.

**Interview answer:** I would examine the trajectory step by step, identify the first bad decision or bad observation, reproduce it, and fix that layer. Agent debugging is trace debugging.

30. How would you decide whether to use one agent or multiple agents?

**Deep explanation:** I would start with one agent unless there is a clear need for role separation, parallel work, independent critique, or specialized tools. Multiple agents add coordination, cost, latency, and new failure modes such as disagreement or duplicated work. A single agent with good tools is often simpler. Multi-agent designs are justified when specialization measurably improves quality or throughput.

**Interview answer:** I would default to one well-instrumented agent and add more agents only when specialization, parallelism, or independent review improves outcomes enough to justify the complexity.
