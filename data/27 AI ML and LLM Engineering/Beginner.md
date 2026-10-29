1. How do artificial intelligence, machine learning, and deep learning differ?

**Deep explanation:** Artificial intelligence (AI) is the broad goal of making machines perform tasks that normally require human intelligence, such as planning, perception, or language use. Machine learning (ML) is a subset of AI in which systems learn patterns from data instead of relying only on hand-written rules. Deep learning is a subset of ML based on multilayer neural networks; it excels on large, complex datasets such as images and text but usually needs more data, computation, and careful tuning.

**Interview answer:** AI is the umbrella field. Machine learning is an AI approach that learns from data, and deep learning is an ML approach using multilayer neural networks, especially for complex unstructured data.

2. How do supervised, unsupervised, and reinforcement learning differ?

**Deep explanation:** Supervised learning learns a mapping from inputs to known labels, such as predicting whether an email is spam. Unsupervised learning works without target labels and discovers structure, such as customer clusters. Reinforcement learning trains an agent through interaction: actions produce rewards or penalties, and the agent learns a policy that maximizes long-term reward. They differ mainly in the feedback available during learning.

**Interview answer:** Supervised learning uses labeled examples, unsupervised learning finds patterns in unlabeled data, and reinforcement learning learns actions from rewards received through interaction with an environment.

3. How do classification and regression differ?

**Deep explanation:** Classification predicts a discrete category, such as fraud versus legitimate, while regression predicts a continuous numeric value, such as a house price. Their outputs and evaluation metrics differ: classifiers often use precision, recall, or log loss, whereas regressors commonly use MAE, MSE, or R-squared. A numeric-looking target can still be categorical if its values are merely class identifiers.

**Interview answer:** Classification predicts categories; regression predicts continuous numbers. For example, spam detection is classification, while predicting delivery time is regression.

4. What are features, labels, training data, and predictions?

**Deep explanation:** Features are the input variables a model uses, such as square footage and location. A label is the target value to learn, such as sale price. Training data consists of examples—usually feature-label pairs—used to fit model parameters. A prediction is the model's estimated output for an input after or during training.

**Interview answer:** Features are model inputs, labels are the correct targets, training data contains examples used to learn, and predictions are the outputs the trained model produces.

5. Why are training, validation, and test sets separated?

**Deep explanation:** The training set fits model parameters. The validation set guides choices such as features, hyperparameters, and early stopping. The test set is held back for a final, unbiased estimate of performance on unseen data. Reusing test results to tune the model leaks information and makes the reported score overly optimistic; splits should also respect time, users, or groups where relevant.

**Interview answer:** Training data fits the model, validation data selects and tunes it, and untouched test data estimates final generalization. Separation prevents evaluation information from influencing training decisions.

6. What is overfitting?

**Deep explanation:** Overfitting occurs when a model learns training-specific noise or details rather than general patterns. It performs very well on training data but poorly on unseen data. Causes include excessive model complexity, too little data, leakage, or training too long. Regularization, more representative data, cross-validation, pruning, and early stopping can reduce it.

**Interview answer:** Overfitting is memorizing training-specific patterns so training performance is high but validation or test performance is poor. I address it with regularization, simpler models, more data, or early stopping.

7. What is underfitting?

**Deep explanation:** Underfitting occurs when a model is too simple, insufficiently trained, or given inadequate features to capture the real relationship in the data. It performs poorly on both training and validation sets. Remedies include improving features, increasing model capacity, reducing excessive regularization, or training longer.

**Interview answer:** Underfitting means the model has not captured the underlying pattern, so it performs poorly even on training data. A richer model, better features, or more training may help.

8. How do bias and variance affect a model?

**Deep explanation:** Bias is systematic error from assumptions that are too restrictive; high-bias models tend to underfit. Variance is sensitivity to the particular training sample; high-variance models tend to overfit. Increasing complexity often reduces bias but raises variance, so model selection and regularization seek a balance that minimizes error on unseen data.

**Interview answer:** High bias means the model is too simple and underfits; high variance means it changes too much with the training data and overfits. Good modeling balances the two for strong generalization.

9. What is data leakage?

**Deep explanation:** Data leakage occurs when training inputs contain information that would not legitimately be available when making a real prediction, or when validation/test information influences training. Examples include using a post-outcome field, normalizing before splitting, or putting the same user's records in both train and test sets. Leakage creates unrealistically high offline scores and often causes production failure.

**Interview answer:** Data leakage is accidental access to future, target, validation, or test information during training. It inflates evaluation results, so I split first and fit every preprocessing step only on training data.

10. Why can accuracy be misleading for imbalanced classes?

**Deep explanation:** Accuracy counts all correct predictions equally. If 99% of transactions are legitimate, a model that always predicts legitimate achieves 99% accuracy yet detects no fraud. Metrics such as precision, recall, F1, precision-recall AUC, and class-specific confusion-matrix counts reveal minority-class performance. The right metric depends on the costs of false positives and false negatives.

**Interview answer:** With imbalanced data, predicting only the majority class can produce high accuracy while being useless. I examine precision, recall, F1, and the confusion matrix based on business error costs.

11. How do precision, recall, and F1 differ?

**Deep explanation:** Precision is `TP / (TP + FP)`: among predicted positives, how many were correct. Recall is `TP / (TP + FN)`: among actual positives, how many were found. F1 is the harmonic mean, `2PR / (P + R)`, and rewards models that keep both reasonably high. Precision matters when false alarms are costly; recall matters when missing a positive is costly.

**Interview answer:** Precision measures the correctness of positive predictions, recall measures coverage of actual positives, and F1 balances both with their harmonic mean.

12. What does a confusion matrix show?

**Deep explanation:** A binary confusion matrix counts true positives, true negatives, false positives, and false negatives. It shows which kinds of mistakes a classifier makes rather than hiding them in one aggregate score. For multiclass problems, rows and columns represent actual and predicted classes, exposing commonly confused class pairs.

**Interview answer:** A confusion matrix compares actual and predicted classes and counts correct results plus false positives and false negatives. It makes the model's error types visible.

13. How do embeddings represent text or other data?

**Deep explanation:** An embedding maps an item—such as a word, document, image, or user—into a dense numeric vector learned so related items lie near one another. The individual dimensions are usually not directly interpretable; meaning comes from relative geometry. Embeddings support semantic search, recommendations, clustering, and retrieval, though quality depends on the model, domain, and input representation.

**Interview answer:** Embeddings convert data into dense vectors whose distances capture learned similarity. Similar meanings tend to have nearby vectors, enabling search, clustering, and recommendations.

14. How do cosine similarity and Euclidean distance differ?

**Deep explanation:** Cosine similarity compares the angle between vectors, emphasizing direction and largely ignoring magnitude. Euclidean distance measures straight-line distance and is affected by both direction and vector length. Cosine is common for semantic embeddings; Euclidean can be appropriate when magnitude carries meaning. With unit-normalized vectors, their rankings are directly related.

**Interview answer:** Cosine similarity measures directional alignment, while Euclidean distance measures absolute geometric separation. The choice depends on whether vector magnitude should matter.

15. What is a vector database useful for?

**Deep explanation:** A vector database stores embeddings and efficiently retrieves nearest neighbors, usually through approximate nearest-neighbor indexes. It is useful for semantic search, recommendations, duplicate detection, and RAG. Production systems often combine vector similarity with metadata filters or keyword search. Tradeoffs include retrieval latency, index memory, update cost, and approximate rather than guaranteed exact results.

**Interview answer:** A vector database indexes embeddings for fast similarity search. It is commonly used to find semantically related documents for search, recommendations, or RAG.

16. What is a language model predicting?

**Deep explanation:** An autoregressive language model predicts a probability distribution for the next token given preceding tokens. During generation, one token is selected, appended to the context, and the process repeats. Training this next-token objective produces broad language capabilities, but it optimizes plausible continuation rather than guaranteed truth or reasoning correctness.

**Interview answer:** A typical language model predicts the next token from the tokens already in context, repeating that process to generate text. It predicts likely language, not truth directly.

17. What is a token?

**Deep explanation:** A token is a unit of text processed by a language model. Tokenizers may represent a whole short word, part of a word, punctuation, whitespace, or bytes as one token. Tokenization varies by model and language, so token count cannot be inferred reliably from word count alone. Usage limits, latency, and cost are commonly based on tokens.

**Interview answer:** A token is a model's basic text unit, which may be a word, word fragment, punctuation mark, or byte sequence. Models read and generate token sequences.

18. How do token limits differ from character limits?

**Deep explanation:** Characters are written symbols, while tokens are tokenizer-defined units that can contain one or several characters. The character-to-token ratio changes with language, formatting, code, and tokenizer, so a fixed character count does not imply a fixed token count. Model context and output limits are normally measured in tokens, so applications should count using the target model's tokenizer.

**Interview answer:** Character limits count literal symbols; token limits count tokenizer units consumed by the model. Because the mapping varies by content, I use the model's tokenizer instead of a fixed conversion.

19. What is a context window?

**Deep explanation:** The context window is the maximum number of tokens a model can consider in one request, generally including instructions, conversation history, retrieved content, tool results, and generated output. If content exceeds it, the application must truncate, summarize, or retrieve selectively. A larger window permits more information but can increase cost and latency, and relevant information may still be overlooked.

**Interview answer:** The context window is the token budget the model can consider for a request, including input and usually output. Applications must manage history and retrieved content within that budget.

20. How do temperature and sampling settings affect generated output?

**Deep explanation:** Temperature reshapes token probabilities: lower values concentrate probability on likely tokens and tend to produce more repeatable output; higher values increase diversity and risk. Top-p restricts sampling to the smallest high-probability token set whose cumulative mass reaches `p`. These settings influence randomness, not factual knowledge, and exact deterministic behavior can still depend on the provider and model.

**Interview answer:** Lower temperature makes output more conservative and repeatable; higher temperature makes it more varied. Top-p limits sampling to a probability mass. Neither setting makes the model inherently more factual.

21. What is a prompt?

**Deep explanation:** A prompt is the information supplied to a model to guide its response. It can include system or developer instructions, a user request, examples, background context, constraints, and desired output format. Effective prompts state the task and success criteria clearly, while applications still need validation because prompting cannot guarantee behavior.

**Interview answer:** A prompt is the set of instructions and context given to a model. A good prompt clearly defines the task, relevant constraints, and expected output.

22. How do instructions, examples, and context serve different purposes in a prompt?

**Deep explanation:** Instructions specify what the model should do and what constraints to follow. Examples demonstrate the intended behavior, style, or format through patterns the model can imitate. Context supplies facts or source material needed to complete the task. Keeping these roles clear and resolving conflicts explicitly improves reliability; trusted instructions should be separated from untrusted retrieved text.

**Interview answer:** Instructions define the task, examples demonstrate the desired result, and context provides the information needed to answer. I separate them clearly and prioritize trusted instructions.

23. What is a hallucination?

**Deep explanation:** A hallucination is model-generated content that is unsupported, fabricated, or inconsistent with the relevant facts or supplied sources. It may appear as invented citations, incorrect claims, or details absent from the evidence. Mitigations include retrieval, grounding, constrained outputs, tool use, verification, and allowing the model to say it lacks enough information; none eliminates the risk entirely.

**Interview answer:** A hallucination is a plausible-sounding claim that is false or unsupported. I reduce risk through grounding, retrieval, validation, and explicit uncertainty handling.

24. Why can a fluent model response still be wrong?

**Deep explanation:** Language models are trained primarily to produce likely continuations, so linguistic fluency is not proof of factual accuracy. Training data can be incomplete or outdated, the prompt can be ambiguous, retrieved context can be wrong, and multistep reasoning can fail. High-stakes responses therefore require source checks, deterministic tools, domain validation, or human review.

**Interview answer:** Fluency reflects skill at generating plausible language, not guaranteed truth. I verify important claims against sources, tools, and domain checks rather than trusting confidence or style.

25. What is retrieval-augmented generation?

**Deep explanation:** Retrieval-augmented generation (RAG) first searches an external knowledge source for relevant material, then includes that material in the model's context to generate an answer. A typical pipeline chunks documents, creates indexes or embeddings, retrieves candidates, optionally reranks them, and asks the model to answer from those sources. RAG can improve freshness and traceability, but poor retrieval produces poor grounding.

**Interview answer:** RAG retrieves relevant external documents at request time and gives them to the model as context. It helps produce grounded, current answers without retraining the model.

26. How does RAG differ from fine-tuning?

**Deep explanation:** RAG changes the information available at inference time by retrieving external content; it is well suited to current, private, or citeable knowledge. Fine-tuning changes model parameters using training examples; it is better for consistent behavior, style, formats, or specialized task patterns. Fine-tuning is not a dependable database for frequently changing facts, and systems can use both approaches together.

**Interview answer:** RAG supplies knowledge dynamically at runtime, while fine-tuning changes the model's learned behavior through training. I use RAG for changing facts and fine-tuning for repeatable task behavior or style.

27. What is a model API?

**Deep explanation:** A model API is a programmatic interface for sending inputs to a hosted or local model and receiving generated output. Requests commonly specify messages, model, sampling controls, output constraints, or tools; responses may include text, structured data, usage, and finish status. Applications must handle authentication, privacy, validation, latency, failures, and cost around the API call.

**Interview answer:** A model API lets software send prompts or structured inputs to a model and receive generated results. I treat it like any external dependency, with authentication, validation, observability, and failure handling.

28. How would you handle API errors and rate limits?

**Deep explanation:** Classify failures into retryable cases—such as timeouts, transient server errors, and rate limits—and permanent cases—such as invalid input or authorization failure. Retry only safe operations, use exponential backoff with jitter, honor server retry guidance, cap attempts, and set timeouts. Add concurrency limits, queues, idempotency where needed, logging, monitoring, and graceful degradation; never retry blindly.

**Interview answer:** I classify errors, retry transient failures with capped exponential backoff and jitter, honor rate-limit headers, and avoid retrying invalid requests. I also use timeouts, concurrency controls, observability, and fallbacks.

29. What is streaming generation useful for?

**Deep explanation:** Streaming sends output chunks as they are generated instead of waiting for the full response. It improves perceived latency, supports live interfaces, and lets users see progress or cancel early. It does not necessarily reduce total generation time, and consumers must handle partial text, connection failure, incremental rendering, and moderation or validation before taking actions.

**Interview answer:** Streaming improves perceived responsiveness by delivering tokens incrementally. It is useful for chat and long output, though the client must handle partial results, cancellation, and errors.

30. What is an AI agent compared with a fixed workflow?

**Deep explanation:** A fixed workflow follows a predefined sequence and branches encoded by developers. An AI agent uses a model to choose some next actions dynamically—such as which tool to call or whether more information is needed—based on its state and goal. Agents offer flexibility for open-ended tasks but add nondeterminism, cost, and safety risk, so bounded workflows are preferable when the process is known.

**Interview answer:** A fixed workflow follows predetermined steps; an agent lets a model decide some steps and tool calls dynamically. Agents are more flexible but require stronger limits, validation, and monitoring.

31. What is tool calling?

**Deep explanation:** Tool calling lets a model request a defined function—such as searching, querying a database, or calculating—using structured arguments. The application validates and executes the call, then returns the result to the model. The model does not directly gain arbitrary access; permissions, schemas, authentication, confirmation rules, and output validation must be enforced by the host application.

**Interview answer:** Tool calling is when a model selects a permitted function and supplies structured arguments. The application validates, authorizes, executes it, and returns the result to the model.

32. What is prompt injection?

**Deep explanation:** Prompt injection is an attack or accidental instruction in untrusted content that tries to override the application's intended rules, reveal data, or trigger unsafe actions. It can arrive directly from a user or indirectly through webpages, documents, or tool results. Defenses include isolating trusted instructions, least-privilege tools, access control, input/output handling, confirmation for consequential actions, and treating retrieved instructions as data.

**Interview answer:** Prompt injection is untrusted text attempting to manipulate model behavior or tool use. I mitigate it with instruction separation, least privilege, authorization checks, validation, and confirmation for sensitive actions.

33. Why should model output be treated as untrusted data?

**Deep explanation:** Model output can be incorrect, maliciously influenced, malformed, or contain unsafe code and commands. Passing it directly into SQL, a shell, HTML, APIs, or business actions can cause injection, data loss, or unauthorized behavior. Applications should validate against schemas and business rules, escape for the destination, restrict capabilities, and require approval where consequences are significant.

**Interview answer:** Model output is probabilistic and may be wrong or attacker-influenced. I validate, sanitize, and authorize it before using it in code, queries, tools, or consequential actions.

34. How would you review code produced by an AI assistant?

**Deep explanation:** Review it as untrusted third-party code: understand the intended behavior, inspect the diff, and check correctness, edge cases, security, privacy, dependencies, performance, and maintainability. Run formatters, static analysis, tests, and targeted adversarial cases in an isolated environment. Verify unfamiliar APIs against authoritative documentation and ensure no secrets, unsafe commands, or unrelated changes were introduced.

**Interview answer:** I review AI code like any external contribution: understand every change, check security and edge cases, verify APIs, and run tests and static analysis. I never merge code solely because it looks plausible.

35. What information should you avoid sending to an external model without authorization?

**Deep explanation:** Avoid secrets such as passwords, tokens, private keys, credentials, and proprietary source code, as well as personal, customer, health, financial, legal, or regulated data. Internal documents and incident details may also be confidential. Follow organizational policy, data classification, contracts, retention settings, and least-data principles; redact or anonymize only when that genuinely removes risk.

**Interview answer:** I do not send secrets, credentials, personal or regulated data, customer information, or confidential company material without explicit authorization and an approved data-handling path.

36. How do linear regression and logistic regression differ in purpose?

**Deep explanation:** Linear regression predicts a continuous value by modeling it as a weighted sum of features, commonly minimizing squared error. Logistic regression is mainly a classifier: it passes a linear score through a logistic function to estimate a probability for a class and is commonly trained with log loss. Despite its name, logistic regression solves classification problems.

**Interview answer:** Linear regression predicts continuous values. Logistic regression estimates class probabilities—usually for binary classification—by applying a logistic function to a linear score.

37. How does a decision tree choose a split?

**Deep explanation:** A decision tree evaluates candidate feature thresholds or categories and selects the split that most improves node purity or reduces prediction error. Classification trees often maximize information gain or reduce Gini impurity; regression trees often reduce squared error or variance. This repeats recursively until stopping criteria are met, while depth limits or pruning help prevent overfitting.

**Interview answer:** A tree tests candidate splits and chooses the one that most reduces impurity for classification or prediction error for regression, then repeats recursively with stopping or pruning controls.

38. How do random forests and gradient boosting combine multiple trees differently?

**Deep explanation:** A random forest trains many trees largely independently on bootstrapped samples and random feature subsets, then averages or votes. This parallel diversity mainly reduces variance. Gradient boosting builds trees sequentially, with each new tree correcting residual errors or gradients from the current ensemble; it can achieve high accuracy but is more sensitive to tuning, noise, and overfitting.

**Interview answer:** Random forests build diverse trees independently and aggregate them, mainly reducing variance. Gradient boosting builds trees sequentially to correct earlier errors, often gaining accuracy with more tuning sensitivity.

39. What is gradient descent trying to minimize?

**Deep explanation:** Gradient descent tries to minimize an objective or loss function that measures model error, often plus regularization. It computes the gradient with respect to parameters and updates them in the opposite direction. The learning rate controls step size: too large can diverge, while too small can converge slowly. Variants use full datasets, mini-batches, momentum, or adaptive step sizes.

**Interview answer:** Gradient descent minimizes a loss function by repeatedly moving model parameters opposite the loss gradient. The learning rate determines how large each update is.

40. What is regularization intended to control?

**Deep explanation:** Regularization discourages a model from fitting noise by penalizing complexity or otherwise constraining learning. L2 regularization shrinks weights smoothly, L1 can drive some weights to zero, and techniques such as dropout, pruning, and early stopping have related regularizing effects. Stronger regularization can reduce variance and overfitting, but too much increases bias and causes underfitting.

**Interview answer:** Regularization controls model complexity to improve generalization and reduce overfitting. Examples include L1, L2, dropout, and early stopping, with excessive regularization risking underfitting.
