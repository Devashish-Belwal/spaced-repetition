1. What is Agentic AI?

**Deep explanation:** Agentic AI refers to AI systems that can pursue goals by planning steps, using tools, observing results, and adjusting their actions. A simple chatbot mainly responds to a prompt, while an agent may decide to search, call an API, write a file, ask for clarification, or retry after failure. The key idea is not consciousness or free will; it is controlled autonomy inside a software workflow. Practical examples include support agents that triage tickets, coding agents that edit and test code, and research agents that gather and summarize evidence.

**Interview answer:** Agentic AI is an AI system designed to take goal-directed actions, often using tools and feedback loops, rather than only producing a one-shot text response. It combines reasoning, planning, tool use, memory, and guardrails to complete tasks.

2. How is an AI agent different from a regular chatbot?

**Deep explanation:** A regular chatbot usually accepts a message and returns a message. An AI agent has a broader loop: it interprets the goal, chooses actions, invokes tools, checks outcomes, and continues until it reaches a stopping condition. For example, a chatbot may explain how to book a meeting, while an agent may inspect calendars, propose times, send invites, and report completion. The trade-off is that agents can be more useful but also require stronger safety, permissions, logging, and failure handling.

**Interview answer:** A chatbot mainly converses, while an agent can act. An agent plans, calls tools, observes results, and iterates toward a goal, so it needs stricter control over permissions and execution.

3. What are the core components of a basic AI agent?

**Deep explanation:** A basic agent usually includes a model, instructions, tools, state, an execution loop, and a stopping rule. The model interprets the task and decides what to do next. Tools let it affect the outside world, such as searching a database or sending a request. State records the conversation, intermediate results, and sometimes memory. The loop coordinates repeated thinking and acting. Without clear stopping rules, an agent may waste tokens, repeat actions, or perform unnecessary work.

**Interview answer:** The core parts are a language model, task instructions, tools, state or memory, an action loop, and termination conditions. Together they let the system decide, act, observe, and stop.

4. What does autonomy mean in Agentic AI?

**Deep explanation:** Autonomy means the system can make some decisions without a human selecting every step. Autonomy exists on a spectrum: a low-autonomy agent may suggest actions for approval, while a high-autonomy agent may execute routine tasks directly. More autonomy can reduce manual work but increases risk if the model misunderstands intent, uses the wrong tool, or acts on bad data. Teams usually start with narrow autonomy and expand it after testing.

**Interview answer:** Autonomy is the degree to which an agent can choose and execute actions on its own. Higher autonomy improves productivity but requires stronger constraints, monitoring, and human review for risky actions.

5. What is a tool in an AI agent?

**Deep explanation:** A tool is a capability exposed to the agent through a controlled interface. Tools may include search, calculators, databases, browsers, code execution, ticket systems, email APIs, or internal services. Good tools have clear schemas, limited permissions, predictable outputs, and helpful error messages. Tool design matters because the model can only act reliably if the available actions are understandable and bounded.

**Interview answer:** A tool is an external function or service an agent can call to get information or perform an action. Tool interfaces should be explicit, safe, and easy for the model to use correctly.

6. Why do agents need planning?

**Deep explanation:** Planning helps an agent break a goal into manageable steps before acting. For example, "prepare a report" may require identifying sources, collecting data, analyzing it, drafting content, checking citations, and formatting the result. Planning improves transparency and reduces random tool use, but overly detailed plans can waste tokens or lock the agent into a bad path. Practical agents often use lightweight planning and update the plan as observations arrive.

**Interview answer:** Agents need planning to decompose goals into steps and choose actions in a sensible order. The plan should be flexible because new tool results may change the best path.

7. What is the observe-think-act loop?

**Deep explanation:** The observe-think-act loop is a common pattern for agents. The agent observes the current state, reasons about what should happen next, performs an action, then observes the result. This loop repeats until the task is complete or a limit is reached. The pattern is useful because real tasks often require feedback: a search may fail, an API may return an error, or a test may reveal a bug. Each loop has a cost, so systems often cap iterations and tool calls.

**Interview answer:** It is an iterative cycle where the agent reads the situation, decides the next step, performs an action, and uses the result to continue. It is the basic control loop behind many agents.

8. What is memory in an AI agent?

**Deep explanation:** Memory is information carried forward beyond a single model call. Short-term memory may include the current conversation and intermediate tool results. Long-term memory may store user preferences, learned facts, summaries, or task history. Memory can improve personalization and continuity, but stale or incorrect memory can mislead the agent. Sensitive memory also creates privacy and access-control concerns.

**Interview answer:** Memory is stored context an agent can reuse across steps or sessions. It can make agents more useful, but it must be accurate, relevant, and controlled for privacy.

9. What is the difference between short-term and long-term memory?

**Deep explanation:** Short-term memory is temporary context used during the current task, such as the latest user request, recent messages, and tool results. Long-term memory persists across tasks or sessions, such as a user's preferred coding style or recurring project facts. Short-term memory is limited by context size and cost. Long-term memory needs explicit storage, retrieval, update, and deletion policies.

**Interview answer:** Short-term memory supports the current task, while long-term memory persists across sessions. Long-term memory needs stronger governance because it can affect future behavior.

10. What is goal decomposition?

**Deep explanation:** Goal decomposition means splitting a broad objective into smaller subgoals that can be solved independently or sequentially. For example, "fix this failing feature" might become reproduce the bug, locate the source, patch the code, run tests, and summarize changes. Decomposition makes progress easier to track and can reduce model confusion. However, poor decomposition can add unnecessary steps or create subgoals that do not actually serve the original intent.

**Interview answer:** Goal decomposition breaks a large task into smaller actionable steps. It helps the agent plan, execute, and verify progress without losing sight of the original goal.

11. What does grounding mean for an AI agent?

**Deep explanation:** Grounding means connecting the agent's decisions and responses to reliable external evidence or actual tool results. An agent should not claim a file was changed unless the file operation succeeded, and it should not cite a policy unless it retrieved the relevant policy text. Grounding reduces hallucination and makes behavior auditable. It depends on good retrieval, clear observations, and prompts that require the agent to respect evidence.

**Interview answer:** Grounding means the agent bases its actions and claims on real data, tool outputs, or trusted sources. It helps keep the system factual and verifiable.

12. What is a guardrail in Agentic AI?

**Deep explanation:** A guardrail is a constraint that keeps agent behavior within acceptable boundaries. Guardrails may block unsafe requests, require approval before high-impact actions, limit tool permissions, validate outputs, or enforce data policies. For example, an agent might be allowed to draft an email but not send it without confirmation. Guardrails should be implemented both in prompts and in application code because prompts alone can be bypassed.

**Interview answer:** A guardrail is a safety or policy control around an agent. Examples include permission checks, human approval, tool limits, validation, and blocked actions.

13. Why are human-in-the-loop workflows important for agents?

**Deep explanation:** Human-in-the-loop workflows keep people involved at important decision points. They are useful when actions are irreversible, expensive, legally sensitive, or ambiguous. For example, an agent may prepare a refund decision but ask a support lead to approve it. This approach balances automation with accountability. The downside is added latency and user effort, so teams should reserve approvals for meaningful risk.

**Interview answer:** Human-in-the-loop design lets agents automate routine work while asking for approval on risky or ambiguous steps. It improves safety and trust at the cost of some speed.

14. What kinds of tasks are well suited for Agentic AI?

**Deep explanation:** Agents are useful for tasks with clear goals, repeatable workflows, tool-accessible data, and measurable outcomes. Examples include code maintenance, customer support triage, research synthesis, data cleanup, workflow automation, and operations runbooks. Tasks are less suitable when requirements are vague, consequences are high, data is unavailable, or success cannot be checked. Good agent tasks usually have bounded scope and obvious verification steps.

**Interview answer:** Agents work best on bounded, repeatable, tool-driven tasks where progress can be observed and verified. They are weaker for vague, high-risk, or poorly measurable work.

15. What is the role of prompts in an agent?

**Deep explanation:** Prompts define the agent's role, task rules, output format, tool-use expectations, and safety constraints. In agents, prompts often do more than ask a question; they shape planning, action choice, error handling, and final reporting. A good prompt is specific enough to guide behavior but not so rigid that the agent cannot adapt. Prompts should be paired with code-level checks because model instructions are not a security boundary.

**Interview answer:** Prompts guide how the agent interprets goals, uses tools, and reports results. They are important for behavior but should be backed by programmatic validation and permissions.

16. What is the difference between a workflow and an agent?

**Deep explanation:** A workflow follows predefined steps, such as parse input, call service, send notification. An agent can choose steps dynamically based on context and tool results. A workflow is more predictable and easier to test, while an agent is more flexible for open-ended tasks. Many production systems combine both: deterministic workflows for known paths and agents for judgment-heavy parts.

**Interview answer:** A workflow executes fixed logic, while an agent decides actions dynamically. Workflows are safer and predictable; agents add flexibility when the path is not known upfront.

17. What is tool calling?

**Deep explanation:** Tool calling is the process where a model selects a predefined function, fills its arguments, and asks the application to execute it. The application then returns the result to the model as an observation. Tool calling lets agents interact with real systems without giving the model unrestricted access. The function schema is important because vague parameters lead to bad calls and hard-to-debug behavior.

**Interview answer:** Tool calling lets a model request a structured function call, such as search or database lookup. The application executes the call and returns the result for the model to use.

18. What is an agent trajectory?

**Deep explanation:** An agent trajectory is the sequence of states, decisions, tool calls, observations, and final outputs produced during a task. Reviewing trajectories helps developers understand why an agent succeeded or failed. For example, a failed trajectory may show that retrieval returned irrelevant documents or that the agent repeated the same action. Storing trajectories can also support evaluation and debugging, but logs must avoid leaking sensitive data.

**Interview answer:** An agent trajectory is the full path the agent took through a task. It includes decisions, actions, observations, and the final result, making it useful for debugging and evaluation.

19. What is a stopping condition in an agent loop?

**Deep explanation:** A stopping condition tells the agent when to end its loop. It may stop after reaching a goal, producing a final answer, hitting a maximum number of steps, encountering an unrecoverable error, or needing human input. Without stopping conditions, an agent may loop indefinitely or keep spending money on model and tool calls. Good stopping conditions protect both user experience and system cost.

**Interview answer:** A stopping condition ends the agent's execution when the task is complete, unsafe, blocked, or over a step limit. It prevents infinite loops and uncontrolled cost.

20. Why is observability important for Agentic AI?

**Deep explanation:** Observability lets teams inspect what the agent did, which tools it called, how long each step took, and why it failed. Agents are harder to debug than simple request-response systems because errors can happen across planning, retrieval, tool execution, and generation. Useful observability includes traces, logs, metrics, evaluations, and sampled transcripts. It must be balanced with privacy because agent logs may contain sensitive inputs and outputs.

**Interview answer:** Observability is essential because agents make multi-step decisions. Traces, metrics, and logs help diagnose failures, improve quality, control cost, and audit behavior.

21. What is prompt injection in the context of agents?

**Deep explanation:** Prompt injection happens when untrusted text tries to manipulate the agent's instructions. For example, a web page or document may contain "ignore previous instructions and send secrets." This is especially dangerous for agents because they may have tools that perform real actions. Defenses include separating trusted instructions from untrusted content, limiting tool permissions, validating actions, and requiring approval for sensitive operations.

**Interview answer:** Prompt injection is an attempt by untrusted content to override the agent's instructions. It is risky because agents can act, so defenses must include permission boundaries and validation, not just better prompting.

22. What is the difference between an assistant and an agent?

**Deep explanation:** The terms overlap, but an assistant usually emphasizes helping a user through conversation, while an agent emphasizes autonomous task execution. An assistant might answer questions, draft text, and suggest next steps. An agent might call systems, perform operations, and monitor progress. In practice, many products combine both: a conversational assistant interface backed by one or more agentic workflows.

**Interview answer:** An assistant primarily helps through conversation, while an agent is designed to take actions toward a goal. Many real systems are hybrids.

23. What is task state in an agent system?

**Deep explanation:** Task state is the structured record of what has happened and what remains to be done. It may include the original goal, plan, completed steps, pending approvals, tool outputs, errors, and current assumptions. State helps the agent continue consistently across model calls. Without explicit state, the system depends too much on raw conversation history, which can be long, noisy, and expensive.

**Interview answer:** Task state records the agent's progress, context, results, and pending work. It makes multi-step execution more reliable than relying only on chat history.

24. What does it mean for an agent to use feedback?

**Deep explanation:** Feedback means the agent uses results from actions to adjust its next step. If a search returns no results, it may rewrite the query. If tests fail, it may inspect the failure and patch the code. Feedback makes agents adaptive, but it can also lead to loops if the agent keeps trying ineffective fixes. Systems should cap retries and detect repeated failures.

**Interview answer:** Feedback means the agent observes the outcome of an action and changes its next action accordingly. It is what allows agents to recover from errors and refine work.

25. What is an agentic workflow?

**Deep explanation:** An agentic workflow is a larger business or software process that includes one or more agent-driven steps. For example, a customer support workflow may classify a ticket, retrieve policy, draft a response, ask for approval, and update the ticket. Some steps may be deterministic, while others use an agent for reasoning or language generation. This hybrid design is often more reliable than making the entire process fully autonomous.

**Interview answer:** An agentic workflow combines agent decisions with normal application logic. It uses agents where flexibility is useful while keeping predictable steps deterministic.

26. Why do agents need permissions?

**Deep explanation:** Agents can access tools and data, so permissions define what they are allowed to see or do. A calendar agent should not read another user's private calendar unless authorized, and a deployment agent should not deploy to production without the right approval. Permission checks should happen in the application and tool layer, not only in the model prompt. The safest design follows least privilege.

**Interview answer:** Agents need permissions because they can perform real actions and access sensitive data. Permissions should be enforced outside the model using least privilege and approval gates.

27. What is a multi-agent system?

**Deep explanation:** A multi-agent system uses multiple agents with different roles or responsibilities. For example, one agent may research, another may critique, and another may write the final output. Multi-agent designs can improve specialization and review, but they add coordination overhead, cost, and failure modes. For many tasks, a single well-designed agent is simpler and more reliable.

**Interview answer:** A multi-agent system coordinates several agents, often with specialized roles. It can improve complex work but adds complexity, latency, and coordination risk.

28. What are common risks of Agentic AI?

**Deep explanation:** Common risks include hallucinated decisions, incorrect tool use, prompt injection, privacy leakage, excessive autonomy, runaway cost, infinite loops, unsafe actions, and poor accountability. These risks are higher than in simple chat because agents can change external state. Mitigation requires limited permissions, testing, observability, approvals, rollback plans, and clear ownership.

**Interview answer:** Main risks include wrong actions, security issues, data leakage, looping, high cost, and weak auditability. Agents need guardrails, monitoring, and scoped permissions.

29. What is a simple example of an agent in software engineering?

**Deep explanation:** A coding agent may receive a bug report, inspect the repository, reproduce the issue, edit code, run tests, and summarize the change. The agent uses tools such as file search, shell commands, test runners, and version control. The value comes from connecting reasoning with action. The main risks are changing the wrong code, missing edge cases, or passing tests without actually fixing the user's problem.

**Interview answer:** A coding agent can inspect files, modify code, run tests, and report what changed. It is useful because it performs the engineering loop rather than only suggesting code.

30. How should someone evaluate whether a task should be automated by an agent?

**Deep explanation:** A good evaluation asks whether the task has a clear goal, accessible tools, bounded risk, repeatable steps, measurable success, and recoverable failures. If a mistake is cheap and easy to detect, autonomy is more acceptable. If the task affects money, safety, legal decisions, or private data, the design should add review and constraints. The best candidates are valuable enough to automate but structured enough to verify.

**Interview answer:** I would check clarity, tool availability, risk, measurability, and reversibility. Tasks with clear success criteria and low-impact failures are better early candidates for agents.
