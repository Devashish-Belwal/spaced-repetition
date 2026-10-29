1. What is Retrieval Augmented Generation, and what problem does it solve?
**Deep explanation:** Retrieval Augmented Generation, or RAG, is a pattern where an application retrieves relevant external information and gives it to a language model as context before generation. It solves the problem that an LLM's internal knowledge may be outdated, incomplete, private-data-blind, or too general for a specific task. For example, a support bot can retrieve the latest refund policy from company documents instead of relying only on model training. The trade-off is that the answer quality now depends on both retrieval quality and generation quality. A basic RAG request usually adds retrieval latency, but avoids retraining the model for every document update.
**Interview answer:** RAG combines search with generation. It retrieves relevant documents or passages, puts them into the model prompt, and asks the model to answer using that context. It is useful when answers must depend on current, private, or domain-specific information.

2. How is RAG different from asking an LLM a question directly?
**Deep explanation:** A direct LLM call relies only on the model's learned parameters and the prompt. RAG adds a retrieval step that supplies external evidence at request time. This means the model can answer questions about data that was never part of training, such as internal documentation or newly published policies. The benefit is better grounding and easier updates. The downside is extra system complexity: documents must be ingested, indexed, searched, ranked, and formatted into context.
**Interview answer:** Direct prompting asks the model to answer from memory. RAG first searches external sources, then asks the model to answer from the retrieved context, which makes it better for fresh or private knowledge.

3. What is the difference between parametric knowledge and retrieved knowledge?
**Deep explanation:** Parametric knowledge is information stored inside the model's weights during training. Retrieved knowledge is information fetched from an external source at query time. Parametric knowledge is fast to access but hard to inspect, update, or guarantee. Retrieved knowledge is easier to update and cite, but retrieval can fail if the query, chunking, or index is poor. A practical RAG system uses the model's parametric knowledge for language understanding and reasoning, while using retrieved knowledge for facts that must be grounded.
**Interview answer:** Parametric knowledge lives inside the LLM's weights. Retrieved knowledge comes from external documents during the request. RAG uses retrieved knowledge to make answers more current, inspectable, and domain-specific.

4. What are the main components of a simple RAG pipeline?
**Deep explanation:** A basic RAG pipeline has ingestion, indexing, retrieval, prompt assembly, generation, and often citation or logging. In ingestion, source documents are cleaned and split into chunks. In indexing, chunks are converted into embeddings and stored in a vector index, sometimes with metadata. At query time, the user's question is embedded, similar chunks are retrieved, the best context is inserted into the prompt, and the LLM generates an answer. Each component has failure modes: bad parsing loses content, bad chunking breaks meaning, bad retrieval returns irrelevant text, and bad prompting can cause unsupported claims.
**Interview answer:** The main pieces are document ingestion, chunking, embedding, indexing, retrieval, prompt construction, and LLM generation. Many systems also add citations, evaluation, caching, and monitoring.

5. What is an embedding in the context of RAG?
**Deep explanation:** An embedding is a numeric vector that represents the meaning of text. In RAG, both document chunks and user queries are converted into embeddings so the system can compare semantic similarity. For example, "reset my password" and "I cannot access my account" may have related embeddings even though they use different words. The storage cost is roughly proportional to the number of chunks times the vector dimension, or O(n * d). Search cost depends on the index: brute-force similarity is O(n * d), while approximate vector indexes trade some accuracy for faster lookup.
**Interview answer:** An embedding is a vector representation of text meaning. RAG uses embeddings to find document chunks that are semantically similar to a user's question.

6. What is a vector database or vector index used for in RAG?
**Deep explanation:** A vector database stores embeddings and supports similarity search. Given a query embedding, it returns the nearest document embeddings according to a distance metric such as cosine similarity, dot product, or Euclidean distance. Some systems use a full vector database, while others use a vector index inside a search engine or application database. The key design trade-off is speed versus recall: approximate nearest neighbor indexes are fast at scale, but may miss the exact closest vectors. Metadata filtering is often used alongside vector search to limit results by tenant, product, time range, or document type.
**Interview answer:** A vector database stores text embeddings and retrieves the most similar chunks for a query. It makes semantic search efficient enough to use inside a RAG application.

7. What is chunking, and why is it important?
**Deep explanation:** Chunking is splitting source documents into smaller passages before embedding and indexing them. It matters because LLM context windows and embedding models work better with focused pieces of text than with huge documents. Small chunks improve precise retrieval but may lose surrounding context. Large chunks preserve context but can include irrelevant material and waste prompt space. A practical strategy often uses paragraph or section-aware chunking with overlap so important information is not split awkwardly across boundaries.
**Interview answer:** Chunking breaks documents into retrievable passages. Good chunks are large enough to preserve meaning but small enough to retrieve precise, relevant context.

8. What does top-k retrieval mean?
**Deep explanation:** Top-k retrieval means returning the k most relevant chunks for a query. If k is too small, the answer may miss necessary evidence. If k is too large, the prompt may contain noise, increase cost, and confuse the model. For example, retrieving 3 chunks may work for a simple FAQ, while a legal or research question may need more context plus reranking. The right value depends on chunk size, context window, retrieval quality, and answer complexity.
**Interview answer:** Top-k retrieval returns the k best matching chunks. Choosing k is a trade-off between enough evidence and too much irrelevant context.

9. How does retrieved context get used by the language model?
**Deep explanation:** Retrieved context is usually inserted into the prompt with instructions such as "answer using only the provided context" or "cite the relevant sources." The model then uses its language and reasoning ability to synthesize an answer. Context formatting matters: clear separators, source labels, and short instructions reduce confusion. If the prompt mixes user input and retrieved text carelessly, the model may follow malicious or irrelevant text from a document, so many systems mark context as untrusted evidence rather than instructions.
**Interview answer:** The application places retrieved passages into the prompt, usually with source labels and instructions. The LLM then generates an answer grounded in that context.

10. Why can RAG reduce hallucinations?
**Deep explanation:** RAG reduces hallucinations by giving the model concrete evidence to base its answer on. Instead of guessing from broad training data, the model can quote or summarize retrieved passages. This is especially useful for company policies, product specs, and technical documentation. However, RAG does not eliminate hallucinations. If retrieval returns irrelevant or incomplete context, or if the prompt allows unsupported reasoning, the model can still produce incorrect claims. Good RAG systems add citation checks, answer abstention, and evaluation.
**Interview answer:** RAG reduces hallucinations because the model receives relevant source material at answer time. It still needs good retrieval, prompting, and validation because bad or missing context can still produce wrong answers.

11. What kinds of data sources can be used in a RAG system?
**Deep explanation:** RAG can use many sources: PDFs, web pages, knowledge bases, tickets, wikis, code repositories, database rows, logs, emails, and API results. Each source requires different cleaning and permission handling. PDFs may need layout-aware parsing, code needs syntax-aware chunking, and database records may need structured filters instead of pure vector search. The practical goal is to transform source data into retrievable units while preserving enough metadata to trace answers back to the original source.
**Interview answer:** RAG can use documents, web pages, wikis, tickets, code, database records, and API outputs. The important part is converting the source into clean, searchable chunks with useful metadata.

12. What basic metrics can be used to evaluate a RAG system?
**Deep explanation:** RAG quality can be evaluated at both retrieval and answer levels. Retrieval metrics include recall@k, precision@k, mean reciprocal rank, and whether the needed source appears in the returned context. Generation metrics include answer correctness, faithfulness to context, citation accuracy, and refusal quality when evidence is missing. Latency and cost are also important operational metrics. Evaluation often needs a labeled question set because a system can sound fluent while retrieving the wrong evidence.
**Interview answer:** Common metrics include retrieval recall@k, precision@k, answer correctness, faithfulness, citation accuracy, latency, and cost. Good evaluation separates whether the system found the right context from whether it used that context correctly.

13. What is the difference between retrieval and generation in RAG?
**Deep explanation:** Retrieval is the search part of the system: it finds relevant information from an external source. Generation is the language-model part: it uses the retrieved information to produce a human-readable answer. Keeping these roles separate helps debugging. If an answer is wrong, the retrieved context may be missing, or the model may have ignored or misused good context. Retrieval cost usually scales with the number of indexed chunks and the search method, while generation cost scales with prompt and output tokens.
**Interview answer:** Retrieval finds the evidence, and generation turns that evidence into an answer. RAG works well only when both stages perform well.

14. What is semantic search, and why is it useful for RAG?
**Deep explanation:** Semantic search retrieves information by meaning rather than exact word matching. This is useful because users often phrase questions differently from the documents. For example, a user might ask "How do I get my money back?" while the document says "refund procedure." Embeddings make these meanings comparable. The trade-off is that semantic search may miss exact codes, names, or rare terms, which is why some systems combine it with keyword search.
**Interview answer:** Semantic search finds text with similar meaning, not just matching words. It helps RAG retrieve useful context even when the user's wording differs from the document.

15. What is cosine similarity in vector search?
**Deep explanation:** Cosine similarity measures the angle between two vectors. In RAG, it is often used to compare a query embedding with document embeddings. If two vectors point in a similar direction, their texts are likely semantically related. The calculation is O(d), where d is the vector dimension. Cosine similarity is popular because it focuses on direction rather than vector magnitude, though the best metric depends on the embedding model and index configuration.
**Interview answer:** Cosine similarity measures how close two embedding directions are. RAG uses it to estimate whether a document chunk is semantically related to a query.

16. What is a prompt in a RAG application?
**Deep explanation:** A prompt is the full input sent to the language model. In RAG, it usually includes system instructions, the user's question, and retrieved context. A good prompt clearly separates instructions from evidence and tells the model how to behave when context is missing. For example, a support assistant prompt may say to answer only from provided sources and cite document IDs. Poor prompt design can make the model over-answer, ignore citations, or treat retrieved text as instructions.
**Interview answer:** A prompt is the input given to the LLM. In RAG, it includes the user's question plus retrieved context and instructions for how to answer.

17. What does grounding mean in RAG?
**Deep explanation:** Grounding means tying the model's answer to specific retrieved evidence instead of unsupported model memory. A grounded answer should be traceable to documents, passages, database rows, or tool outputs. Grounding matters for trust, audits, and correctness, especially in business or technical settings. However, grounding is only as good as the retrieved sources and the system's ability to ensure the final answer actually follows them.
**Interview answer:** Grounding means the answer is based on provided evidence. In RAG, that evidence usually comes from retrieved documents or structured data.

18. What are citations in RAG, and why are they useful?
**Deep explanation:** Citations point the user to the source passages used to create an answer. They make answers easier to verify and help users decide whether to trust the response. Citations are especially useful for policies, research, legal content, and technical documentation. The challenge is citation accuracy: the system should cite passages that actually support the claim, not merely passages that were retrieved nearby.
**Interview answer:** Citations link an answer back to its supporting sources. They improve trust and make it easier to verify whether the answer is grounded.

19. What is an index in a RAG system?
**Deep explanation:** An index is a data structure that makes retrieval efficient. In RAG, it may store vector embeddings, text chunks, metadata, or keyword-search structures. Without an index, the system might need to compare a query against every document chunk, which becomes slow as data grows. Indexes trade storage and build time for faster query time. For example, approximate vector indexes can search large collections quickly but may occasionally miss the exact nearest neighbor.
**Interview answer:** An index organizes document chunks so they can be searched quickly. RAG commonly uses vector indexes, keyword indexes, or both.

20. What is document ingestion in RAG?
**Deep explanation:** Document ingestion is the process of bringing source data into the RAG system. It usually includes extracting text, cleaning it, splitting it into chunks, attaching metadata, generating embeddings, and storing everything in an index. Good ingestion preserves source meaning and traceability. Bad ingestion can remove important tables, mix unrelated sections, or create chunks that are hard to retrieve.
**Interview answer:** Ingestion prepares documents for retrieval. It extracts, cleans, chunks, embeds, and indexes content so the RAG system can search it later.

21. Why is metadata important in a RAG system?
**Deep explanation:** Metadata describes a chunk beyond its text. It can include source title, URL, author, tenant, date, product, language, access level, and version. Metadata helps filter results, show citations, enforce permissions, and debug answers. For example, if a user asks about the latest API version, date and version metadata can prevent old documentation from being retrieved. Metadata adds storage overhead but greatly improves practical usefulness.
**Interview answer:** Metadata helps filter, secure, cite, and debug retrieved chunks. It gives the system context about where a chunk came from and when it applies.

22. What is a knowledge base in the context of RAG?
**Deep explanation:** A knowledge base is the collection of information that the RAG system can retrieve from. It might be a set of help articles, internal wiki pages, manuals, FAQs, or product documentation. The knowledge base is not the same as the model itself; it is an external source that can be updated without retraining the model. Its quality, freshness, and organization strongly affect answer quality.
**Interview answer:** A knowledge base is the external information source used by RAG. It may contain documents, FAQs, wikis, or records that the model can use as context.

23. What does context window mean for an LLM?
**Deep explanation:** The context window is the maximum amount of input and output text the model can handle in one request. In RAG, retrieved chunks must fit inside this limit along with instructions, conversation history, and the user's question. A larger context window allows more evidence, but it can increase cost and may add noise. Good RAG systems select the most relevant context instead of blindly filling the window.
**Interview answer:** The context window is the model's input and output limit. RAG must choose retrieved context carefully so useful evidence fits inside that limit.

24. Why might a RAG system answer "I don't know"?
**Deep explanation:** A well-designed RAG system should abstain when it lacks enough evidence. This is better than inventing an answer. The system might say "I don't know" when retrieval finds no relevant chunks, sources conflict, or the question is outside the knowledge base. The trade-off is user experience: refusing too often feels unhelpful, but refusing too rarely increases hallucination risk.
**Interview answer:** A RAG system should say it does not know when the retrieved context is missing, weak, or conflicting. This prevents unsupported answers.

25. What is the role of conversation history in RAG?
**Deep explanation:** Conversation history helps interpret follow-up questions. If a user first asks about "vector databases" and then asks "Which one is cheaper?", the system needs prior context to understand the follow-up. However, including too much history can waste tokens and introduce irrelevant details. Many systems summarize history or rewrite the latest question into a standalone query before retrieval.
**Interview answer:** Conversation history helps resolve follow-up questions. RAG systems often use it to rewrite the current query, but they must avoid sending unnecessary history.

26. What is the difference between a document and a chunk?
**Deep explanation:** A document is the original source item, such as a PDF, web page, or article. A chunk is a smaller piece created from that document for retrieval. RAG systems usually search chunks because entire documents are too large and unfocused. The document remains useful for metadata, citations, and showing the original source. The choice of chunk boundaries affects both retrieval accuracy and prompt efficiency.
**Interview answer:** A document is the full source. A chunk is a smaller passage from that source that can be embedded, indexed, and retrieved.

27. Why is source quality important in RAG?
**Deep explanation:** RAG does not magically make bad sources reliable. If the knowledge base contains outdated, duplicated, contradictory, or low-quality content, the model may produce poor answers from it. Source quality includes correctness, freshness, clarity, authority, and coverage. Improving documents can sometimes produce larger quality gains than changing models or indexes.
**Interview answer:** RAG answers are only as good as the sources it retrieves. Clean, current, authoritative documents are essential for reliable output.

28. What is an embedding model?
**Deep explanation:** An embedding model converts text into vectors that represent meaning. It is different from the generation model, though some providers offer both. The embedding model's quality affects retrieval because it determines which chunks look similar to a query. Different embedding models may perform better for different languages, domains, or text lengths. Changing the embedding model usually requires re-embedding the indexed content.
**Interview answer:** An embedding model turns text into vectors for similarity search. Its quality directly affects which documents a RAG system retrieves.

29. What is the difference between open-book and closed-book question answering?
**Deep explanation:** Closed-book question answering relies on the model's internal knowledge, like answering from memory. Open-book question answering uses external references during the answer, like looking up a manual before responding. RAG is an open-book approach. It is useful when facts change, sources must be cited, or the model was not trained on the needed data. The trade-off is that the system must retrieve the right material first.
**Interview answer:** Closed-book answering uses model memory. Open-book answering uses external sources. RAG is open-book because it retrieves evidence before answering.

30. What are common beginner-friendly use cases for RAG?
**Deep explanation:** Common RAG use cases include customer-support bots, internal documentation assistants, policy search, onboarding helpers, codebase question answering, research assistants, and product help chat. These use cases work well because users ask natural-language questions over a known body of documents. RAG is less ideal when the task requires only arithmetic, pure creativity, or highly transactional workflows without a searchable knowledge source.
**Interview answer:** Common use cases are support assistants, internal knowledge-base chat, documentation Q&A, policy lookup, code search, and research help. RAG is best when answers should come from a specific source collection.
