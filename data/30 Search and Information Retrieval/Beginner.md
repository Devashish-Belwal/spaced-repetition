1. How does full-text search differ from a database equality lookup?

**Deep explanation:** Full-text search analyzes language: it tokenizes text, may normalize words, and ranks documents by relevance. An equality lookup tests whether a field exactly equals a value, usually using a B-tree or hash index, and returns an unordered exact set. Searching `running shoes` can match and rank documents containing related normalized terms; `status = 'active'` cannot.

**Interview answer:** An equality lookup finds exact field values, while full-text search analyzes text and returns relevance-ranked matches. Full-text search supports behavior such as stemming, phrase matching, and typo tolerance that ordinary equality indexes do not.

2. What is an inverted index?

**Deep explanation:** An inverted index maps each searchable term to the documents—and often positions—where it occurs. It is “inverted” because it goes from term to documents rather than scanning each document for the term. This makes retrieval roughly proportional to the matching posting lists instead of the whole corpus, at the cost of storage and index-update work.

**Interview answer:** An inverted index is a term-to-document lookup structure. For each term it stores a posting list of matching document IDs, often with frequencies and positions, so search avoids scanning every document.

3. What are documents, terms, and posting lists?

**Deep explanation:** A document is the indexed unit, such as a product, article, or email. Terms are the normalized tokens produced from its searchable fields. A posting list is the collection of entries for one term; each posting identifies a document and may include frequency, positions, or field information used for phrase matching and scoring.

**Interview answer:** Documents are the records being searched, terms are their analyzed tokens, and a posting list records which documents contain a given term, optionally including frequency and position data.

4. What is tokenization?

**Deep explanation:** Tokenization splits input text into searchable units called tokens. A simple tokenizer may split on whitespace, while language-aware tokenizers handle punctuation, contractions, compound words, URLs, or languages without spaces. Tokenization choices affect both recall and precision because they determine what can be matched.

**Interview answer:** Tokenization converts text into searchable units. The tokenizer must fit the language and data—for example, whitespace splitting is insufficient for some languages, URLs, and compound words.

5. How do stemming and lemmatization differ?

**Deep explanation:** Stemming applies rules that chop words to a common stem, so `connect`, `connected`, and `connecting` may become `connect`; the result need not be a real word. Lemmatization uses vocabulary and grammatical context to return a valid base form, such as `better` to `good`. Stemming is usually faster but rougher; lemmatization is more linguistically accurate but more expensive.

**Interview answer:** Stemming heuristically strips affixes and may produce nonwords; lemmatization finds the linguistically correct dictionary form. Stemming is simpler and faster, while lemmatization usually gives cleaner normalization.

6. What are stop words, and when can removing them be harmful?

**Deep explanation:** Stop words are very common words such as `the`, `is`, or `to` that some analyzers omit to reduce index size and noise. Removal can destroy meaning in names and phrases such as `The Who`, `to be or not to be`, or legal text, and it can break exact phrase matching. Modern ranking often handles common words well, so removal should follow measured needs.

**Interview answer:** Stop words are frequent words an analyzer may exclude. Removing them can save space, but it can damage phrase queries, titles, names, and meaning, so I would validate it against the product’s actual queries.

7. How do case folding and Unicode normalization affect search?

**Deep explanation:** Case folding maps case variants to a comparable form, allowing `Apple` and `apple` to match when case is not meaningful. Unicode normalization converts equivalent character encodings—such as composed and decomposed accented characters—to a consistent representation. Applying compatible normalization at indexing and query time prevents visually identical text from failing to match, though locale-sensitive cases require care.

**Interview answer:** Case folding normalizes uppercase and lowercase variants, while Unicode normalization makes equivalent character sequences consistent. Both should usually be applied identically at index and query time, with locale-specific behavior considered.

8. How do exact, prefix, phrase, and fuzzy matching differ?

**Deep explanation:** Exact matching requires the indexed value or token to match exactly. Prefix matching finds terms beginning with input, such as `dev` matching `developer`. Phrase matching requires analyzed terms in the specified order and usually adjacent positions. Fuzzy matching allows a bounded edit distance, helping with typos but consuming more computation and sometimes reducing precision.

**Interview answer:** Exact matching requires equality, prefix matching matches a term’s beginning, phrase matching preserves term order and proximity, and fuzzy matching tolerates character edits. Each trades broader recall for cost and possible false positives.

9. What is a search analyzer?

**Deep explanation:** A search analyzer is the pipeline that turns text into terms used by the index or query. It commonly combines character filters, a tokenizer, and token filters such as lowercase, stemming, synonym expansion, or stop-word handling. Analyzer design is part of the search schema because mismatched analysis can make expected results unreachable.

**Interview answer:** A search analyzer is a configurable text-processing pipeline: character filters, tokenization, then token filters. It determines the terms stored or queried and therefore strongly affects matching behavior.

10. How do indexing-time and query-time analysis differ?

**Deep explanation:** Indexing-time analysis processes documents before storing their terms; changing it normally requires reindexing. Query-time analysis processes the user’s input for lookup and can change without rebuilding the index. They must produce compatible terms, but need not be identical—for example, query-time synonym expansion can avoid inflating every indexed document.

**Interview answer:** Index-time analysis creates the stored terms and requires reindexing when changed. Query-time analysis transforms each search request; it should be compatible with the index analyzer, though it may differ for features such as synonyms.

11. What is relevance ranking?

**Deep explanation:** Relevance ranking orders matching documents by an estimate of how well each satisfies the query. A score may combine lexical evidence such as term rarity and frequency with field boosts, freshness, popularity, personalization, or semantic similarity. Ranking quality is product-specific: a technically relevant old article may still be worse than a current one.

**Interview answer:** Relevance ranking assigns scores to matching documents and orders them by expected usefulness. The score can combine textual relevance with business signals such as freshness, popularity, and personalization.

12. How do term frequency and document frequency affect scoring?

**Deep explanation:** Term frequency measures how often a query term occurs in a document, usually with diminishing returns because ten occurrences are not ten times as useful as one. Document frequency measures how many documents contain the term; rare terms carry more discriminating power than ubiquitous ones. Ranking functions such as TF-IDF and BM25 combine these ideas.

**Interview answer:** More occurrences within a document generally increase its score, with saturation. Terms appearing in fewer documents are more informative and usually receive greater weight than common terms.

13. What is BM25 intended to estimate?

**Deep explanation:** BM25 is a probabilistic lexical ranking function intended to estimate how relevant a document is to a query from term matches. It rewards rare query terms, saturates repeated term frequency, and normalizes for document length so long documents do not win merely by containing more words. Its parameters tune term-frequency saturation and length normalization.

**Interview answer:** BM25 estimates lexical relevance using term frequency, inverse document frequency, and document-length normalization. It improves on simple term counting by saturating repetition and controlling the advantage of long documents.

14. How do filtering and ranking differ?

**Deep explanation:** Filtering makes a yes-or-no eligibility decision, such as `price < 100` or `tenant_id = 7`; filters are often cacheable and do not affect relevance scores. Ranking assigns relative scores to eligible matches and sorts them. Applying selective filters before expensive scoring also reduces work and enforces hard constraints.

**Interview answer:** Filters decide which documents are allowed to match, while ranking orders those matches by relevance. I use filters for hard constraints and scoring for preferences.

15. What is a search facet?

**Deep explanation:** A facet is a category and count derived from the current result set, such as brand, file type, or price range. Facets let users narrow results interactively and show how many results each choice would retain. They are typically computed as aggregations over keyword, numeric, or date fields rather than analyzed free text.

**Interview answer:** A facet is a filterable result dimension with counts, such as `Brand: Acme (24)`. It helps users understand and refine a result set.

16. How would you implement basic autocomplete?

**Deep explanation:** Normalize the user’s partial input, retrieve matching prefixes from a trie or edge n-gram index, and rank candidates by popularity, textual fit, recency, and possibly user context. Debounce requests, limit results, cache common prefixes, and enforce access controls. Log selections to improve ranking, but avoid exposing sensitive or offensive historical queries.

**Interview answer:** I would index normalized suggestions for prefix lookup, query after a short debounce, and rank results by prefix quality and popularity. I would cache hot prefixes, enforce permissions, and use selection data to improve ranking.

17. What is an n-gram?

**Deep explanation:** An n-gram is a contiguous sequence of `n` units, usually characters or words. Character trigrams for `search` include `sea`, `ear`, `arc`, and `rch`. N-grams enable partial and fuzzy-like matching, but small values create large indexes and many noisy candidates, while large values miss short or heavily misspelled input.

**Interview answer:** An n-gram is a contiguous sequence of n characters or words. Character n-grams support substring, autocomplete, and typo-tolerant retrieval, with an index-size and precision tradeoff.

18. How do prefix tries and n-gram indexes differ?

**Deep explanation:** A trie stores terms by shared prefixes, making prefix enumeration efficient and compact when many terms share beginnings. An n-gram index stores fragments and can match substrings or tolerate errors beyond the start of a term. Tries are ideal for strict autocomplete; n-grams are more flexible but consume more space and require candidate scoring.

**Interview answer:** A trie is optimized for exact prefix lookup, while an n-gram index can match fragments anywhere in a term and better supports typo tolerance. N-grams usually cost more storage and produce more candidates.

19. What is typo tolerance?

**Deep explanation:** Typo tolerance retrieves intended results despite misspellings, transpositions, missing characters, or keyboard errors. Common techniques include edit-distance queries, n-gram candidate generation, phonetic matching, and spelling correction based on term frequency. The tolerance should depend on token length and confidence because broad fuzziness can return irrelevant or expensive matches.

**Interview answer:** Typo tolerance allows near matches for misspelled queries, often using edit distance or n-grams. I would bound it by word length and rank exact matches higher to control false positives and cost.

20. What is an Elasticsearch or OpenSearch index?

**Deep explanation:** An index is a logical collection of JSON documents with mappings and settings, somewhat analogous to a database table but built for distributed search. Internally it is divided into shards, each backed by Lucene segments containing inverted and other indexes. The index defines analyzers, field types, shard counts, and related behavior.

**Interview answer:** An Elasticsearch or OpenSearch index is a named collection of documents plus mappings and settings. It is distributed across shards, which maintain the underlying search structures.

21. What are primary shards and replica shards?

**Deep explanation:** Primary shards partition an index’s documents; each document is routed to one primary. Replica shards are copies of primaries placed on other nodes, providing failover and additional read capacity. More shards increase parallelism but add coordination and memory overhead, while replicas improve availability and reads but increase storage and write replication.

**Interview answer:** Primaries hold the authoritative partitions of an index. Replicas copy primaries onto other nodes for availability and read scaling, at the cost of storage and additional write work.

22. What is a document mapping?

**Deep explanation:** A mapping defines how document fields are indexed: their types, analyzers, whether they are searchable or aggregatable, and sometimes nested relationships. Correct mappings prevent problems such as treating dates as text or aggregating on analyzed tokens. Dynamic mapping is convenient, but explicit mappings are safer for important production fields.

**Interview answer:** A mapping is the search index’s schema. It defines each field’s type and indexing behavior, including analyzers and whether the field supports search, sorting, or aggregation.

23. How do keyword and text fields differ?

**Deep explanation:** A `text` field is analyzed into tokens for full-text matching and relevance scoring. A `keyword` field is indexed as one exact value for filtering, sorting, grouping, and exact matching. A product name may use both through multi-fields: text for search and keyword for exact aggregation or sorting.

**Interview answer:** Text fields are analyzed for full-text search; keyword fields preserve the whole value for exact matches, filters, sorting, and aggregations. The same logical value often needs both representations.

24. Why might an indexed document not appear in search immediately?

**Deep explanation:** Many search engines are near-real-time: writes first enter buffers or logs and become searchable only after a refresh creates or exposes a new segment. Refresh intervals improve indexing throughput but introduce visibility delay. Other causes include querying a replica before refresh, incorrect routing, analyzer mismatch, failed ingestion, filters, or permissions.

**Interview answer:** Search is often near-real-time, so a successful write may not be visible until the next refresh. I would also check ingestion errors, routing, analyzers, filters, replicas, and access controls.

25. What is semantic search?

**Deep explanation:** Semantic search tries to match meaning rather than only shared words. It commonly embeds queries and documents into vectors and retrieves nearby vectors, so `car repair` may match `automobile maintenance`. It improves vocabulary mismatch but can be less explainable and may miss exact identifiers, so hybrid lexical-and-vector search is often stronger.

**Interview answer:** Semantic search retrieves by meaning, commonly using embeddings and vector similarity. It handles synonyms and paraphrases well, but I often combine it with lexical search for exact terms and identifiers.

26. What is an embedding-based nearest-neighbor query?

**Deep explanation:** An embedding model converts the query into a numeric vector in the same space as precomputed document vectors. The system then finds documents whose vectors are closest under a metric such as cosine similarity, dot product, or Euclidean distance. Results depend heavily on model quality, consistent embedding versions, chunking, and the chosen similarity metric.

**Interview answer:** It embeds the query as a vector and retrieves document vectors with the smallest distance or highest similarity. Query and documents must use the same embedding model and compatible similarity metric.

27. How do exact and approximate nearest-neighbor search differ?

**Deep explanation:** Exact nearest-neighbor search compares the query with every eligible vector, guaranteeing the true nearest results but costing roughly linear work in the corpus size. Approximate nearest-neighbor methods such as HNSW search a graph or compressed structure, greatly reducing latency at the cost of memory, build time, and occasionally missing true neighbors. The recall-latency tradeoff is tunable.

**Interview answer:** Exact search scores every candidate and guarantees the true nearest vectors but scales poorly. Approximate search uses an index to be much faster, accepting a tunable chance of missing some true neighbors.

28. How would you measure whether search results are useful?

**Deep explanation:** Offline, use judged query-document sets and metrics such as precision, recall, mean reciprocal rank, or NDCG, segmented by query type. Online, measure successful clicks, reformulations, zero-result rate, dwell time, conversion, and latency through controlled experiments. No single metric is sufficient: clicks contain position bias, and business conversion may not reflect informational satisfaction.

**Interview answer:** I would combine offline relevance metrics such as NDCG or MRR with online signals such as successful clicks, reformulations, zero-result rate, conversion, and latency. I would validate ranking changes through segmented A/B tests.

29. How would you handle a search with no results?

**Deep explanation:** First preserve user trust by clearly saying no exact results were found. Then offer useful recovery paths: spell correction, progressively relaxed filters, synonym or fuzzy matching, broader categories, and query suggestions, while explaining removed constraints. Log zero-result queries to find missing content, vocabulary gaps, and analyzer problems; never silently broaden into misleading results.

**Interview answer:** I would show that no exact results matched, suggest corrected or broader queries, and let the user relax filters explicitly. I would analyze zero-result logs to improve content, synonyms, and indexing.

30. How would you prevent private documents from appearing in public search?

**Deep explanation:** Enforce authorization during retrieval, not only in the UI. Index tenant and access-control metadata, apply mandatory server-side filters derived from the authenticated identity, and ideally separate security domains when the risk justifies it. Keep caches permission-aware, handle ACL changes and deletions promptly, test for cross-tenant leakage, and redact sensitive fields from index contents and logs.

**Interview answer:** I would make authorization a mandatory server-side part of every search using tenant and ACL filters, with permission-aware caching and prompt ACL updates. For strong isolation, I would consider separate indexes and continuously test for data leakage.
