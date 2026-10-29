1. What is retrieval-augmented generation (RAG)?

**Deep explanation:** RAG is a pattern in which an application retrieves relevant information from an external knowledge source and gives it to a generative model as context for an answer. Retrieval supplies current or private facts that may not be in the model's training data, while generation turns those facts into a useful response. The model is not retrained for every document update.

**Interview answer:** RAG retrieves relevant source material at request time and asks a model to answer from that context. It helps produce answers based on current, domain-specific information without retraining the model.

2. What are the main stages of a basic RAG system?

**Deep explanation:** A basic system first ingests documents, extracts their text, divides it into chunks, creates embeddings, and stores the chunks in an index. At query time it embeds or analyzes the question, retrieves relevant chunks, places them in a prompt, and asks a language model to answer. The application may then validate, cite, log, or evaluate the result.

**Interview answer:** The offline path parses, chunks, embeds, and indexes documents. The online path retrieves relevant chunks for a question, adds them to the prompt, generates an answer, and returns supporting sources.

3. Why use RAG instead of relying only on a language model's built-in knowledge?

**Deep explanation:** A model's learned knowledge has a cutoff, may omit private domain facts, and does not reliably reveal where an answer came from. RAG can supply recently updated and access-controlled information together with provenance. It does not guarantee correctness, but it gives the model evidence that the application can inspect and evaluate.

**Interview answer:** RAG adds fresh, private, and traceable knowledge at request time. It reduces dependence on whatever the model happened to learn during training and makes evidence-based answers possible.

4. What does grounding mean in a RAG application?

**Deep explanation:** Grounding means tying an answer to information supplied by trusted sources rather than allowing the model to answer entirely from its internal patterns. A grounded answer should make claims supported by the retrieved context and should acknowledge when the context is insufficient. Grounding reduces unsupported claims but depends on retrieving accurate, relevant evidence.

**Interview answer:** Grounding means requiring the response to be supported by retrieved source material. It is only as strong as the sources, retrieval quality, and instructions for handling missing evidence.

5. Can RAG eliminate hallucinations?

**Deep explanation:** No. The retriever can return irrelevant or misleading passages, and the model can ignore, distort, or combine them incorrectly. RAG can reduce factual errors when good evidence is retrieved, but applications still need retrieval evaluation, answer-faithfulness checks, citations, abstention behavior, and human review for high-impact uses.

**Interview answer:** RAG reduces some hallucinations by supplying evidence, but it cannot eliminate them. Failures can occur in retrieval, context selection, or generation, so the full pipeline must be evaluated.

6. What is document ingestion in a RAG pipeline?

**Deep explanation:** Ingestion is the process that turns source content into searchable records. It may fetch files or pages, extract text and structure, remove repeated boilerplate, split content into chunks, attach metadata, compute embeddings, and write records to an index. A production pipeline also tracks versions, failures, updates, and deletions.

**Interview answer:** Ingestion converts source documents into clean, versioned, searchable chunks with metadata and embeddings. It should also keep the index synchronized when sources change or disappear.

7. Why are documents split into chunks?

**Deep explanation:** Whole documents may be too large for a model's context window and too broad to retrieve precisely. Chunks create smaller searchable units so the system can return the section most relevant to a question. Chunks that are too small lose context, while chunks that are too large waste tokens and may mix unrelated topics.

**Interview answer:** Chunking makes retrieval more precise and keeps prompt size manageable. The goal is to preserve enough local meaning without indexing large passages that contain unrelated material.

8. What is chunk overlap, and why might it be used?

**Deep explanation:** Chunk overlap repeats some text at the boundary between neighboring chunks. It can preserve a sentence, definition, or dependency that would otherwise be split, improving the chance that one retrieved chunk is understandable. Too much overlap increases storage, indexing work, duplicated results, and prompt token usage.

**Interview answer:** Overlap repeats boundary content so important context is not cut in half. I would use only enough to improve retrieval because heavy overlap creates duplication and cost.

9. What is an embedding in the context of RAG?

**Deep explanation:** An embedding is a numeric vector representing the learned meaning of a query or text chunk. Related meanings tend to be located near one another in the embedding space, allowing retrieval even when the query and document use different words. Embedding quality depends on the model, language, domain, and how content is represented.

**Interview answer:** An embedding converts text into a vector whose geometry captures semantic similarity. RAG systems compare query and chunk embeddings to find conceptually related passages.

10. What role does a vector database play in RAG?

**Deep explanation:** A vector database stores embeddings together with their chunks and metadata, then performs efficient nearest-neighbor searches. Many products also support metadata filters, updates, replication, and hybrid keyword-vector search. A vector database is useful infrastructure, but it does not by itself solve parsing, chunking, permissions, ranking, or answer generation.

**Interview answer:** A vector database indexes embeddings for fast similarity retrieval and returns the associated chunks and metadata. It is one part of a complete RAG pipeline, not the entire system.

11. How do keyword search and semantic search differ?

**Deep explanation:** Keyword search matches lexical signals such as exact terms and often ranks them with algorithms such as BM25. Semantic search compares embeddings and can match related meanings even when wording differs. Keyword search is strong for names, codes, and exact phrases, while semantic search helps with paraphrases; many RAG systems combine both.

**Interview answer:** Keyword search matches words, while semantic search matches learned meaning. They have complementary strengths, so hybrid retrieval often works better than treating either one as universally superior.

12. What does similarity score mean in vector retrieval?

**Deep explanation:** A similarity score measures how close a query vector is to a stored vector according to a metric such as cosine similarity, dot product, or Euclidean distance. Its numeric value is model- and index-specific and is not automatically a probability of relevance. Useful thresholds must be calibrated on representative queries rather than guessed.

**Interview answer:** A similarity score ranks vector closeness, not guaranteed correctness. I would interpret it only within the chosen embedding model and validate any cutoff with real relevance judgments.

13. What does top-k retrieval mean?

**Deep explanation:** Top-k retrieval asks the search system for the k highest-ranked chunks. A small k may miss supporting evidence, while a large k can add noise, latency, and prompt cost. The best value depends on the corpus, reranking, question type, context budget, and measured recall rather than a universal default.

**Interview answer:** Top-k is the number of highest-ranked chunks returned for a query. I would tune it against retrieval recall, answer quality, latency, and token cost.

14. Why is metadata important in a RAG index?

**Deep explanation:** Metadata describes a chunk's source, title, section, owner, tenant, language, timestamp, version, and other useful attributes. It enables permission filters, date or product constraints, better citations, debugging, and targeted ranking. Metadata must be trustworthy and kept synchronized with the source content.

**Interview answer:** Metadata supplies context that embeddings do not capture reliably. I use it for authorization, filtering, ranking, versioning, provenance, and human-readable citations.

15. What happens to a user's question before retrieval?

**Deep explanation:** The system may normalize the question, detect language or intent, apply required permission filters, and encode it for lexical or vector search. Some systems rewrite ambiguous queries or generate several search queries, but every transformation can also change the user's meaning. The original question should remain available for generation and debugging.

**Interview answer:** The query is analyzed and converted into the representation required by the search index, with authorization constraints attached. Optional rewriting should be evaluated because it can improve recall or distort intent.

16. What is retrieved context?

**Deep explanation:** Retrieved context is the selected source material placed into the model request. It normally contains a bounded set of chunks plus identifiers or metadata that distinguish sources. More context is not always better: irrelevant or contradictory passages can distract the model and use tokens needed for the answer.

**Interview answer:** Retrieved context is the evidence supplied to the model for the current question. It should be relevant, compact, clearly separated by source, and within the prompt's token budget.

17. What should a basic RAG prompt tell the model?

**Deep explanation:** The prompt should state the task, identify the supplied sources as data, require claims to be based on those sources, and define what to do when evidence is missing or conflicting. It should specify the desired format and citation behavior. It must not assume that retrieved text is safe, because documents can contain malicious instructions.

**Interview answer:** I would tell the model to answer from the provided evidence, cite it, and say when the evidence is insufficient. Retrieved text is untrusted content and must not override application instructions.

18. How should citations work in a RAG response?

**Deep explanation:** Citations should point to the exact source and passage that supports a claim, using stable document and chunk identifiers mapped to user-readable links or locations. Simply listing all retrieved documents does not prove support. The application should preserve provenance through retrieval and verify that cited passages actually entail the nearby statements.

**Interview answer:** A citation should be attached to the claim it supports and resolve to the exact source passage. I would generate citations from tracked source IDs and validate support rather than trusting invented references.

19. What should a RAG system do when it cannot find enough evidence?

**Deep explanation:** It should avoid presenting an unsupported guess as a sourced answer. Depending on the product, it can state that the available sources are insufficient, ask a clarifying question, suggest a refined search, or route the request to a human. Abstention behavior should be explicitly tested because models often try to be helpful even without evidence.

**Interview answer:** The system should abstain, clarify, or escalate when retrieval does not provide adequate support. A transparent non-answer is better than a confident response that appears grounded but is not.

20. How can a RAG index stay current when documents change?

**Deep explanation:** The ingestion system needs a way to detect additions, updates, and deletions, such as source events, change feeds, or scheduled reconciliation. It should version records, replace changed chunks, remove stale ones, and expose indexing lag. Without deletion handling, old information may remain retrievable after the source is corrected or access is revoked.

**Interview answer:** I would synchronize source changes through versioned upserts and explicit deletions, then monitor indexing lag and reconcile periodically. Freshness includes removing stale content, not just adding new content.

21. Why must authorization be applied during retrieval?

**Deep explanation:** If private chunks are retrieved into a prompt, filtering them only from the final display is too late because the model has already received the data and may reveal it. Tenant, user, group, or document permissions must constrain retrieval before context construction. Authorization should use trusted application identity rather than model-generated decisions.

**Interview answer:** Permission checks belong before or inside retrieval so unauthorized content never reaches the model. The application enforces access with trusted identity and metadata filters; the model does not decide authorization.

22. How can you tell whether a RAG answer is good?

**Deep explanation:** Evaluate at least two layers: whether retrieval found relevant supporting evidence and whether the generated answer is correct, relevant, and faithful to that evidence. Also measure citation accuracy, abstention, latency, and cost. A good final answer can occasionally hide poor retrieval, so component-level evaluation is necessary.

**Interview answer:** I separately measure retrieval quality and generation quality, then evaluate the end-to-end response for correctness, faithfulness, citations, latency, and cost on representative questions.

23. What is an AI agent?

**Deep explanation:** An AI agent is a system in which a model helps choose actions toward a goal, often by calling tools, observing results, and deciding what to do next. The surrounding application defines available tools, permissions, state, budgets, and stopping rules. A model alone is not a reliable agentic system.

**Interview answer:** An agent combines a model with tools, state, and a control loop so it can take multiple steps toward a goal. The application, not the model, must enforce permissions and limits.

24. How does an agent differ from a normal chatbot or fixed workflow?

**Deep explanation:** A basic chatbot usually produces a response from the current conversation, while a fixed workflow follows steps chosen in advance by code. An agent can select its next action dynamically from allowed options based on intermediate results. This flexibility helps with variable tasks but introduces unpredictability, cost, security, and testing challenges.

**Interview answer:** A fixed workflow has predetermined control flow; an agent lets the model choose among permitted next actions. I use agentic behavior only when that flexibility provides value worth the additional risk and complexity.

25. What is tool calling?

**Deep explanation:** Tool calling lets a model request a structured operation such as searching documents, reading a calendar, querying a database, or creating a ticket. Application code validates the request, authorizes it, executes the operation, and returns the result to the model. The model's request is a proposal, not permission to run arbitrary code.

**Interview answer:** Tool calling is a structured interface through which the model proposes an operation and arguments. The host application validates, authorizes, executes, and records the call.

26. What is an agent loop?

**Deep explanation:** An agent loop repeatedly gives the model the goal and current state, receives a proposed action or final answer, executes an allowed action, and adds the observation to the state. The loop ends on completion, failure, human intervention, or a configured limit. Without stopping rules, agents can repeat work or consume unbounded resources.

**Interview answer:** The agent loop alternates between model decisions and tool observations until a terminal condition is reached. It needs explicit limits for steps, time, tokens, cost, and repeated actions.

27. What is agent memory?

**Deep explanation:** Agent memory is information preserved beyond the model's immediate request, such as recent messages, task state, user-approved preferences, summaries, or retrieved records. Short-term working state and durable long-term memory have different retention and trust requirements. Stored memories can become stale, incorrect, sensitive, or malicious, so they need provenance and lifecycle controls.

**Interview answer:** Agent memory is application-managed state reused across steps or sessions. I separate temporary working context from durable memory and apply consent, provenance, access, update, and deletion rules.

28. Why is human approval important for some agent actions?

**Deep explanation:** Actions such as sending a message, purchasing an item, deleting data, changing permissions, or deploying code can have material consequences. A human approval checkpoint lets the user review the exact target, parameters, and expected effect before execution. Approval should occur as close as possible to the action so later changes cannot invalidate it.

**Interview answer:** High-impact or irreversible actions require approval of the concrete operation, not a vague plan. The system should show exact arguments and revalidate them immediately before execution.

29. What is prompt injection in RAG and agent systems?

**Deep explanation:** Prompt injection occurs when untrusted content tries to manipulate the model's behavior, for example a retrieved document telling the agent to ignore its task or reveal secrets. Because models process instructions and data as text, wording alone is not a dependable security boundary. Applications must isolate trust levels and restrict tools and data independently of the model.

**Interview answer:** Prompt injection is untrusted content attempting to act like an instruction. I treat retrieved text and tool output as data and rely on application-enforced permissions, validation, and isolation rather than prompting alone.

30. Why do agents need budgets and stopping conditions?

**Deep explanation:** A faulty plan, ambiguous goal, or repeated tool error can cause an agent to loop, create load, or accumulate cost. Limits on steps, elapsed time, tokens, money, retries, and external actions bound the damage. The system should return a clear partial result or request help when a limit is reached.

**Interview answer:** Budgets keep uncertain autonomous behavior within predictable operational and safety bounds. I set explicit step, time, cost, retry, and action limits with a defined escalation or failure outcome.
