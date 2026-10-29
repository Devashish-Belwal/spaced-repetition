1. How would you choose chunk size and overlap for a RAG system?
**Deep explanation:** Chunk size should match the structure of the content and the type of questions users ask. Small chunks, such as 100 to 300 tokens, support precise retrieval but may miss definitions, examples, or constraints from nearby text. Larger chunks, such as 500 to 1,000 tokens, preserve more context but increase prompt cost and can dilute similarity scores. Overlap helps preserve meaning across boundaries, but too much overlap increases index size and duplicate retrieval. A good approach is to start with structure-aware chunks, evaluate recall@k and answer quality, then tune using real queries.
**Interview answer:** I would choose chunk size based on document structure, question type, and evaluation results. Smaller chunks improve precision, larger chunks preserve context, and overlap helps boundary cases but increases storage and duplicate results.

2. What is hybrid retrieval, and when would you use it?
**Deep explanation:** Hybrid retrieval combines semantic vector search with lexical search such as BM25. Vector search handles paraphrases and conceptual similarity, while lexical search handles exact names, error codes, IDs, rare terms, and keywords. For example, a query for "ERR_CONN_RESET" should not depend only on semantic similarity. Hybrid retrieval usually merges or reranks results from both methods. The trade-off is extra complexity and latency, but it often improves recall in real applications where queries contain both concepts and exact identifiers.
**Interview answer:** Hybrid retrieval combines vector search and keyword search. I would use it when users ask about exact terms, IDs, names, or error codes as well as semantic concepts.

3. How should metadata filters be used in RAG?
**Deep explanation:** Metadata filters restrict retrieval to relevant subsets before or during search. Common filters include tenant ID, access level, product, language, document type, date, region, and version. They improve relevance, security, and performance by narrowing the candidate set. The trade-off is that overly strict filters can hide useful documents and reduce recall. In multi-tenant systems, security filters must be mandatory and enforced server-side, not merely passed as optional prompt instructions.
**Interview answer:** Metadata filters narrow retrieval by attributes like tenant, permission, product, date, or document type. They improve relevance and access control, but must be designed carefully so they do not accidentally remove needed evidence.

4. What is reranking, and why is it useful after initial retrieval?
**Deep explanation:** Reranking is a second-stage ranking step that reorders candidate chunks using a stronger relevance model, often a cross-encoder or LLM-based scorer. Initial vector retrieval is fast and broad, but it may rank semantically similar yet unhelpful chunks too highly. Reranking compares the query and each candidate more deeply, improving the final context sent to the LLM. The cost is additional latency and compute, so many systems retrieve a larger candidate pool, such as top 50, then rerank down to the best 5 to 10 chunks.
**Interview answer:** Reranking takes the initially retrieved chunks and sorts them with a stronger relevance model. It improves context quality, but adds latency and cost.

5. How would you handle stale, updated, or deleted documents in a RAG index?
**Deep explanation:** RAG indexes must stay synchronized with source systems. Updated documents should trigger re-parsing, re-chunking, re-embedding, and replacement of old chunks. Deleted documents should be removed or tombstoned so they cannot be retrieved. Version metadata helps avoid mixing old and new content in one answer. A practical ingestion pipeline uses document IDs, content hashes, timestamps, and idempotent jobs. Without this, the model may confidently answer from outdated or unauthorized content.
**Interview answer:** I would track source document IDs, versions, hashes, and deletion events. Updates should re-index affected chunks, and deletions must remove or block old chunks from retrieval.

6. Why can a RAG system still hallucinate even when retrieval is enabled?
**Deep explanation:** RAG can fail when retrieval returns irrelevant context, misses the needed evidence, includes conflicting documents, or gives the model too much noisy text. The generator can also overgeneralize, merge facts incorrectly, or answer beyond the evidence. Prompt instructions help, but they are not a guarantee. Better defenses include stronger retrieval evaluation, reranking, conflict detection, citation requirements, abstention when evidence is weak, and answer verification against the retrieved context.
**Interview answer:** RAG can still hallucinate if the wrong context is retrieved, the right context is missing, documents conflict, or the model goes beyond the evidence. Retrieval improves grounding but does not replace evaluation and guardrails.

7. How would you evaluate the retriever separately from the generator?
**Deep explanation:** The retriever should be tested with questions that have known relevant documents or passages. Metrics like recall@k, precision@k, mean reciprocal rank, and normalized discounted cumulative gain show whether the right evidence is being found and ranked well. The generator should then be tested with fixed retrieved context to measure faithfulness, correctness, and citation accuracy. Separating these evaluations is important because a bad answer may come from poor retrieval, poor generation, or both. It also makes debugging more precise.
**Interview answer:** I would use labeled queries to test whether the retriever returns the right passages, then test generation using controlled context. This separates retrieval failures from answer synthesis failures.

8. How can a RAG system avoid overloading the model's context window?
**Deep explanation:** Context windows are limited and expensive, so a RAG system should send only the most useful evidence. Techniques include chunk deduplication, reranking, contextual compression, summarizing long passages, metadata filtering, and limiting per-source diversity. The system can also retrieve hierarchically: first find documents or sections, then retrieve smaller passages inside them. The trade-off is that compression and summarization can remove details, so they should be evaluated against tasks that require exact wording or numeric facts.
**Interview answer:** I would use filtering, deduplication, reranking, compression, and careful top-k limits. The goal is to include enough evidence without filling the prompt with repetitive or irrelevant text.

9. How should access control be implemented in a RAG application?
**Deep explanation:** Access control must be enforced before retrieved content reaches the prompt. If a user is not allowed to see a document, the model should never receive that document as context. Common approaches include indexing by tenant, storing permissions as metadata, applying mandatory server-side filters, and checking authorization during ingestion and retrieval. Prompting the model to ignore restricted content is not sufficient because the content has already leaked into the model input. Audit logs are also useful for regulated environments.
**Interview answer:** Access control should happen at retrieval time with server-side permission filters. Restricted content should never be placed in the model prompt.

10. What are the key stages of a production ingestion pipeline for RAG?
**Deep explanation:** A production ingestion pipeline usually discovers source documents, extracts text, cleans boilerplate, preserves metadata, chunks content, computes embeddings, writes chunks to an index, and verifies indexing success. It should handle retries, partial failures, duplicate documents, deletes, and schema changes. For large sources, ingestion is often asynchronous and incremental. Time complexity is mostly proportional to the amount of source text and number of chunks, while embedding cost scales with total tokens processed.
**Interview answer:** The main stages are source discovery, extraction, cleaning, metadata capture, chunking, embedding, indexing, and validation. Production pipelines also need retries, incremental updates, deletes, and monitoring.

11. What are query rewriting and query expansion in RAG?
**Deep explanation:** Query rewriting transforms the user's input into a search-friendly form, while query expansion adds related terms or alternate phrasings. This helps when user questions are vague, conversational, or depend on chat history. For example, "What about pricing?" may be rewritten as "What is the pricing policy for the enterprise plan?" using conversation context. The trade-off is that rewriting can distort intent, so systems may generate multiple search queries and merge results rather than relying on one rewritten query.
**Interview answer:** Query rewriting makes a user query clearer for retrieval, and query expansion adds related terms or variants. They can improve recall, especially for vague or conversational questions, but they must preserve the user's intent.

12. How would you balance latency, cost, and quality in a RAG system?
**Deep explanation:** RAG quality often improves with more retrieval candidates, reranking, larger context, and stronger models, but each adds latency and cost. A practical design uses fast paths for simple questions and heavier paths for complex ones. Caching embeddings, retrieval results, and final answers can reduce repeated work. Smaller models may handle routing, query rewriting, or compression, while larger models handle final synthesis. The right balance depends on service-level objectives, answer risk, traffic volume, and user expectations.
**Interview answer:** I would tune retrieval depth, reranking, context size, model choice, and caching based on the use case. High-risk answers may justify more cost, while common or simple queries should use faster paths.

13. How would you choose between vector search, keyword search, and structured queries?
**Deep explanation:** Vector search is best for semantic similarity and paraphrases. Keyword search is better for exact words, names, IDs, error messages, and rare terms. Structured queries are best when the answer depends on fields, filters, joins, ranges, or aggregations. For example, "refund policy for enterprise customers" may use vector search, while "ticket ABC-123" should use exact lookup, and "customers in region X with plan Y" should use SQL or a filtered API. Many practical RAG systems route queries across all three methods.
**Interview answer:** I would use vector search for meaning, keyword search for exact terms, and structured queries for precise fields or relationships. Real systems often combine them.

14. What are common causes of poor retrieval quality?
**Deep explanation:** Poor retrieval can come from bad chunking, weak embeddings, missing metadata, stale indexes, noisy source documents, overly strict filters, or queries that are too vague. It can also happen when the embedding model does not match the domain language, such as medical, legal, or code terminology. Debugging should inspect the actual retrieved chunks, not just the final answer. Fixes may include better parsing, query rewriting, hybrid retrieval, reranking, and evaluation datasets.
**Interview answer:** Poor retrieval often comes from bad chunking, weak embeddings, noisy documents, stale indexes, bad filters, or vague queries. I would debug by inspecting retrieved chunks and measuring recall.

15. How would you handle duplicate or near-duplicate chunks?
**Deep explanation:** Duplicate chunks waste index space and can crowd out diverse evidence in the top-k results. They may come from repeated templates, copied documentation, mirrored pages, or overlapping chunks. Deduplication can be done with content hashes for exact duplicates and similarity checks for near duplicates. The trade-off is that aggressive deduplication may remove context that differs only slightly but matters, such as version-specific instructions. A good system deduplicates during ingestion and again during result assembly.
**Interview answer:** I would remove exact duplicates with hashes and handle near duplicates with similarity checks or result diversification. This improves context diversity and reduces wasted prompt space.

16. What is contextual compression in RAG?
**Deep explanation:** Contextual compression reduces retrieved content to the parts most relevant to the query. It can be done by extracting matching sentences, summarizing passages, or using a model to remove irrelevant text. This helps fit more useful evidence into the context window. The risk is losing details, qualifiers, or exact wording. Compression is safer for broad explanatory answers than for legal, compliance, or numerical questions where exact text matters.
**Interview answer:** Contextual compression trims retrieved chunks to the parts relevant to the question. It saves tokens, but it must be used carefully because it can remove important details.

17. How would you design fallback behavior when retrieval returns no useful results?
**Deep explanation:** A RAG system should not blindly answer when retrieval fails. Fallback options include asking a clarifying question, broadening filters, trying keyword search, using a different query rewrite, searching a different source, or giving a transparent refusal. The right fallback depends on risk. For a public FAQ bot, a general answer may be acceptable; for internal policy or medical content, unsupported answers should be avoided. Logging no-result queries also helps improve coverage.
**Interview answer:** I would try safe fallbacks like query rewriting, broader retrieval, or clarification. If evidence is still missing, the system should say it cannot answer from the available sources.

18. How would you handle tables and structured content in RAG documents?
**Deep explanation:** Tables often lose meaning when converted to plain text without headers, units, or row relationships. A good ingestion pipeline preserves table structure, captions, column names, and nearby explanatory text. For some questions, structured querying is better than embedding table text. For example, pricing tiers may be represented both as searchable text and as structured rows. The trade-off is ingestion complexity, but it prevents wrong answers caused by flattened or ambiguous table content.
**Interview answer:** I would preserve headers, rows, units, captions, and nearby context. For exact table questions, I might use structured queries instead of relying only on vector retrieval.

19. How would you support multilingual RAG?
**Deep explanation:** Multilingual RAG can use multilingual embeddings, per-language indexes, translation, or a combination. Multilingual embeddings allow cross-language retrieval, while per-language indexes can improve relevance and filtering. Translation can help when documents and queries use different languages, but it may distort domain-specific terms. Metadata such as language codes is important for filtering and ranking. Evaluation should include real queries in each supported language.
**Interview answer:** I would use multilingual embeddings or language-specific indexes, store language metadata, and evaluate per language. Translation can help, but it must preserve domain terms.

20. How would you handle conversational follow-up questions in retrieval?
**Deep explanation:** Follow-up questions often omit key details, such as "What about the enterprise plan?" after a pricing discussion. The system can rewrite the follow-up into a standalone query using conversation history, then retrieve against that query. It should include only relevant history to avoid drift. A common failure is retrieving based on the wrong earlier topic, so query rewriting should be logged and evaluated.
**Interview answer:** I would rewrite the follow-up into a standalone query using relevant conversation history, then retrieve with that rewritten query. The rewrite should be checked for intent drift.

21. What is result diversification, and why can it help RAG?
**Deep explanation:** Result diversification prevents the final context from being dominated by many similar chunks from the same source. It can select chunks across different documents, sections, dates, or viewpoints. This is helpful when the top results are near duplicates or when the question needs broader coverage. The trade-off is that diversification may include slightly lower-scoring chunks, so it should be balanced against relevance. Techniques include maximum marginal relevance and per-document limits.
**Interview answer:** Result diversification selects relevant chunks that are not all repetitive. It improves coverage and reduces the chance that one duplicated source dominates the prompt.

22. How would you log and debug a bad RAG answer?
**Deep explanation:** Debugging requires seeing the query, rewritten query, filters, retrieved chunks, scores, reranked order, prompt, model output, citations, and latency. These logs should protect sensitive data through redaction and access controls. The goal is to determine whether the failure happened in retrieval, prompt assembly, generation, or source quality. Good logs also allow replaying a request after changing the retriever or prompt.
**Interview answer:** I would inspect the query, filters, retrieved chunks, scores, final prompt, answer, and citations. That tells me whether retrieval, generation, or source data caused the failure.

23. How would you decide whether to fine-tune a model instead of using RAG?
**Deep explanation:** RAG is better when the system needs current facts, private documents, citations, or frequent updates. Fine-tuning is better for changing style, format, domain behavior, or repeated task patterns that do not require looking up external facts. Fine-tuning does not reliably memorize large changing knowledge bases and can be expensive to update. Some systems use both: RAG for facts and fine-tuning for response style or task-specific behavior.
**Interview answer:** I would use RAG for changing or source-grounded knowledge, and fine-tuning for behavior, style, or task format. They solve different problems and can be combined.

24. How would you prevent irrelevant retrieved context from hurting answer quality?
**Deep explanation:** Irrelevant context can distract the model and cause unsupported claims. Defenses include better query rewriting, metadata filtering, reranking, score thresholds, deduplication, and prompt instructions to ignore irrelevant context. The system can also ask for clarification when confidence is low. There is a trade-off between strict thresholds and recall: too strict may miss useful evidence, while too loose adds noise.
**Interview answer:** I would improve filtering and reranking, use score thresholds, remove duplicates, and allow abstention or clarification when context is weak. The goal is to avoid feeding noisy evidence to the model.

25. How would you handle source documents with images or diagrams?
**Deep explanation:** Images and diagrams may contain important information that plain text extraction misses. Options include OCR, image captioning, multimodal embedding, manual alt text, or linking the image as a source. For diagrams, surrounding text and captions are often essential. The trade-off is complexity and accuracy: generated captions may omit details, while OCR may fail on dense visuals. For high-value sources, layout-aware and multimodal processing can improve retrieval.
**Interview answer:** I would use OCR, captions, layout parsing, or multimodal embeddings depending on the content. The system should preserve links back to the original visual source.

26. How would you handle long documents that contain many topics?
**Deep explanation:** Long documents should be split using structure-aware chunking based on headings, sections, paragraphs, and semantic boundaries. Metadata should preserve document title, section path, page number, and version. Hierarchical retrieval can first find the relevant document or section, then retrieve smaller chunks inside it. This avoids retrieving unrelated passages from the same large document. The trade-off is a more complex index and retrieval pipeline.
**Interview answer:** I would chunk by document structure and preserve section metadata. For very long documents, I would use hierarchical retrieval to find the right section before selecting passages.

27. How would you test whether citations are accurate?
**Deep explanation:** Citation accuracy means each cited source actually supports the claim it is attached to. Testing can include manual review, automated claim-to-source checks, and adversarial examples where retrieved context contains related but non-supporting text. It is not enough that a cited chunk was retrieved; it must justify the answer. Citation errors are risky because they create false confidence.
**Interview answer:** I would check whether each cited passage directly supports the corresponding claim. This can be tested with human review, automated claim checks, and adversarial examples.

28. How would you handle numerical or calculation-heavy questions in RAG?
**Deep explanation:** LLMs can make mistakes with arithmetic, aggregation, and exact comparisons. If a question requires calculations over retrieved data, the system should use a calculator, SQL query, spreadsheet engine, or deterministic code where possible. RAG can retrieve the relevant inputs, but computation should be delegated to reliable tools. The answer should cite both the data source and the calculation method. This is especially important for finance, analytics, and operational dashboards.
**Interview answer:** I would use RAG to retrieve the relevant data, then use deterministic tools for calculations. The LLM should explain the result, not perform fragile arithmetic by itself.

29. How would you design a feedback loop for improving RAG quality?
**Deep explanation:** Feedback can come from user ratings, thumbs-down reasons, corrected answers, unresolved queries, citation clicks, and support escalations. The system should categorize failures into retrieval miss, bad source, generation error, stale content, permission issue, or unclear query. High-quality feedback can become evaluation data for regression tests. The trade-off is that user feedback can be noisy, so it should be sampled, reviewed, and combined with automated metrics.
**Interview answer:** I would collect feedback, classify failure types, and turn reliable examples into evaluation tests. This helps improve chunking, retrieval, prompts, and source quality over time.

30. How would you decide when a RAG system should ask a clarifying question?
**Deep explanation:** Clarifying questions are useful when the user query is ambiguous, underspecified, or could map to multiple sources with different answers. For example, "What is the limit?" may need product, plan, region, or date. Asking too often frustrates users, while guessing can produce wrong answers. A practical system can use retrieval confidence, conflicting top results, missing filters, and intent classification to decide when clarification is better than answering.
**Interview answer:** I would ask for clarification when the query is ambiguous, retrieval confidence is low, or top sources conflict. The system should clarify rather than guess when the answer depends on missing details.
