1. What responsibilities belong to a backend service?

**Deep explanation:** A backend service receives requests, applies business rules, reads or writes data, integrates with other systems, and returns a stable response. It also enforces security, validation, reliability, and observability concerns that clients cannot be trusted to handle.

**Interview answer:** A backend owns server-side business logic, data access, authentication and authorization, integrations, and API responses. It should also validate inputs, handle failures safely, and provide logs and metrics.

2. How does a request travel from a client to a backend handler?

**Deep explanation:** The client resolves the domain through DNS, opens a network connection, and sends an HTTP request. A load balancer or reverse proxy may terminate TLS and route it to an application instance, where middleware handles concerns such as authentication and parsing before the router selects a handler. The response travels back through the same layers.

**Interview answer:** The client resolves DNS and sends an HTTP request, often through a CDN, proxy, or load balancer. The application runs middleware, matches the route, invokes the handler and its dependencies, then serializes and returns the response.

3. How do routes, controllers, services, and repositories differ?

**Deep explanation:** A route maps an HTTP method and URL to code. A controller translates HTTP input and output, a service implements business use cases, and a repository hides persistence details. Keeping these roles separate reduces coupling and makes business logic easier to test.

**Interview answer:** Routes select the endpoint, controllers handle HTTP concerns, services contain business logic, and repositories encapsulate database access. The dependency flow is usually controller to service to repository.

4. What makes an API RESTful?

**Deep explanation:** A RESTful API models addressable resources, manipulates them through standard HTTP methods, uses meaningful status codes, and keeps requests stateless. Responses may contain links or representations, while URLs generally name nouns such as `/orders/42`, not actions such as `/getOrder`.

**Interview answer:** A RESTful API exposes resources through stable URLs, uses HTTP methods and status codes according to their semantics, and keeps each request self-contained. It emphasizes a uniform interface rather than action-oriented RPC endpoints.

5. How do GET, POST, PUT, PATCH, and DELETE differ?

**Deep explanation:** GET retrieves a representation. POST creates a subordinate resource or triggers non-idempotent processing; PUT replaces the resource at a known URI; PATCH partially updates it; DELETE removes it. Their defined semantics help clients, caches, and intermediaries behave correctly.

**Interview answer:** GET reads, POST creates or invokes processing, PUT fully replaces at a known URI, PATCH partially updates, and DELETE removes. GET is safe, while PUT and DELETE are expected to be idempotent.

6. How do safe methods and idempotent methods differ?

**Deep explanation:** A safe method is intended not to change server state, as with GET or HEAD. An idempotent method may change state, but repeating the same request has the same intended effect as sending it once; PUT and DELETE are examples. Repeated requests can still produce logs or different response metadata.

**Interview answer:** Safe means the method is read-only from the client's perspective. Idempotent means retries do not create additional intended state changes, even if the first call changed state.

7. When would you return 200, 201, 202, or 204?

**Deep explanation:** Use 200 for a successful request with a response body, 201 when a resource was created, ideally with a `Location` header, and 202 when work was accepted but is still asynchronous. Use 204 when the operation succeeded and no response body is needed.

**Interview answer:** I use 200 for success with content, 201 for completed creation, 202 for accepted asynchronous work, and 204 for success with no body.

8. How do 400, 401, 403, 404, 409, and 422 differ?

**Deep explanation:** 400 means the request is malformed or generally invalid. 401 means valid authentication is missing; 403 means the caller is known but forbidden; 404 means the resource is unavailable. 409 represents a conflict with current state, while 422 is commonly used for a structurally valid request that fails semantic validation.

**Interview answer:** 400 is a bad request, 401 requires authentication, 403 denies permission, and 404 means not found. I use 409 for state conflicts such as a duplicate version and 422 for field or business validation failures.

9. How do client errors and server errors differ?

**Deep explanation:** A 4xx response says the request cannot be fulfilled as sent, so the client usually must change it or its credentials. A 5xx response says the server failed to process an otherwise plausible request, so retrying may help. Servers should not disguise their bugs as 4xx errors.

**Interview answer:** 4xx errors are attributable to the request or caller; 5xx errors indicate the server failed. That distinction tells clients whether to fix the request or potentially retry with backoff.

10. How would you design a consistent API error response?

**Deep explanation:** Define one documented shape containing a stable machine-readable code, a safe human-readable message, optional field-level details, and a correlation ID. Keep HTTP status semantics accurate and avoid exposing stack traces, SQL, secrets, or internal topology.

**Interview answer:** I would standardize on fields such as `code`, `message`, `details`, and `requestId`. Codes remain stable for client logic, messages are safe, validation details identify fields, and the request ID connects the response to logs.

11. How do path parameters, query parameters, and request bodies differ?

**Deep explanation:** Path parameters identify a resource within the URL, such as `/users/42`. Query parameters modify retrieval or provide optional controls such as filtering, sorting, and pagination. A request body carries a potentially complex representation for creation or modification.

**Interview answer:** Paths identify the target resource, queries express optional filtering or presentation controls, and bodies carry structured input for create or update operations.

12. Why should a backend validate input even when the frontend validates it?

**Deep explanation:** Frontend validation improves user experience but is bypassable through custom clients, modified JavaScript, or direct HTTP calls. The backend is the trust boundary and must protect data integrity and security for every caller.

**Interview answer:** Client validation is only a convenience because clients are untrusted and can bypass it. The backend must independently validate every request before using or persisting the data.

13. How do syntactic validation and business validation differ?

**Deep explanation:** Syntactic validation checks shape and basic constraints: required fields, types, formats, and ranges. Business validation checks rules involving meaning or current state, such as whether inventory is available or an account may perform a transfer. Business checks often require database access and transactional protection.

**Interview answer:** Syntactic validation asks whether the input is well-formed. Business validation asks whether the requested action is allowed under domain rules and current state.

14. How would you design signup, login, and logout endpoints?

**Deep explanation:** Signup validates normalized identity fields, securely hashes the password, handles duplicates without leaking sensitive account information, and may require verification. Login verifies credentials with rate limiting and issues a session or tokens. Logout invalidates the server session or refresh token and clears the client credential; all endpoints use TLS and safe audit logging.

**Interview answer:** Signup creates a verified account with a strong password hash, login checks credentials and creates a session or token pair, and logout revokes that session or refresh token. I would add TLS, generic authentication errors, rate limits, and secure cookie settings where applicable.

15. How do authentication and authorization differ in a request lifecycle?

**Deep explanation:** Authentication establishes who the caller is by validating a session, token, or credential. Authorization then decides whether that identity may perform the requested action on the specific resource. Both normally run before business mutation, and authorization must consider resource ownership as well as broad roles.

**Interview answer:** Authentication verifies identity; authorization checks that identity's permission for the requested resource and action. A request is authenticated first and then authorized before the operation runs.

16. How do session-based and token-based authentication differ?

**Deep explanation:** With sessions, the client holds an opaque ID and the server stores associated state, making revocation straightforward but requiring shared session storage when scaled. With self-contained tokens, servers can validate claims without a lookup, but revocation and claim freshness are harder. Browser sessions commonly use secure, `HttpOnly`, `SameSite` cookies; either design still needs CSRF or token-theft protections appropriate to its transport.

**Interview answer:** Sessions keep authentication state on the server and give the client an opaque cookie. Self-contained tokens carry signed claims and reduce per-request session lookups, but logout, revocation, rotation, and safe storage require more care.

17. Why should passwords be hashed rather than encrypted for ordinary login verification?

**Deep explanation:** Encryption is reversible, so compromise of the decryption key exposes every password. Password hashing uses a one-way, salted, deliberately slow function such as Argon2id, bcrypt, or scrypt; login verifies a candidate without recovering the original. Unique salts defeat precomputed tables, while cost parameters slow guessing attacks.

**Interview answer:** The server never needs to recover a password, so it should store a unique salted hash made with a slow password-hashing algorithm. Reversible encryption creates a key whose compromise reveals all passwords.

18. How would you store application configuration safely?

**Deep explanation:** Keep non-secret configuration outside code and vary it by environment. Store secrets in a managed secret store or protected runtime injection, grant least-privilege access, rotate them, and never commit or log them. Validate required settings at startup so misconfiguration fails clearly.

**Interview answer:** I externalize configuration, keep secrets in a secret manager rather than source control, restrict and rotate access, and inject values at runtime. The application validates configuration on startup and redacts secrets from logs.

19. What is an ORM, and what work does it simplify?

**Deep explanation:** An object-relational mapper maps application models and operations to relational tables and SQL. It reduces repetitive CRUD, parameter binding, relationship loading, and change tracking, but developers still need SQL knowledge to avoid inefficient queries, incorrect transactions, or leaky abstractions.

**Interview answer:** An ORM lets application code query and persist relational data through models rather than hand-writing all SQL. It simplifies common CRUD and mapping, but I still inspect generated SQL and use direct SQL when control or performance demands it.

20. How do migrations differ from automatic schema synchronization?

**Deep explanation:** A migration is a versioned, reviewed sequence of explicit schema changes that can be applied consistently across environments. Automatic synchronization infers and immediately changes the database to match models; it is convenient in disposable development databases but can cause unexpected or destructive production changes.

**Interview answer:** Migrations are explicit, version-controlled database changes with a deployment history. Auto-sync derives changes from models and is useful for local prototyping, but I avoid it in production because changes may be unsafe or unauditable.

21. Why would an API use a database transaction?

**Deep explanation:** A transaction groups related operations so they commit together or roll back together, preserving invariants. For example, transferring money must debit one account and credit another atomically. Transactions should be short because long ones retain locks or versions and reduce concurrency.

**Interview answer:** I use a transaction when multiple reads or writes form one logical operation and partial success would corrupt state. It provides atomicity and isolation, but I keep it short to limit contention.

22. What is a connection pool?

**Deep explanation:** A connection pool maintains reusable database connections because opening one for every request is expensive. Requests borrow and return connections; the pool bounds concurrency so the database is not overwhelmed. Pool size and timeouts must match application replicas and database capacity, and leaked connections can exhaust it.

**Interview answer:** A connection pool reuses a limited set of open database connections. It reduces connection setup cost and applies backpressure, but it needs sensible limits, timeouts, and guaranteed connection release.

23. What is an N+1 query problem?

**Deep explanation:** N+1 occurs when code runs one query for a list and then one additional query for each of its N rows. Latency and database load grow with the result size. Eager joins, batched `IN` queries, preloading, or a DataLoader-style batcher can reduce it, though over-fetching large joins is another tradeoff.

**Interview answer:** It is one query to fetch parent rows followed by N queries for related data. I detect it through query logs or tracing and fix it with joins, eager loading, or batched queries.

24. Why would a backend cache data?

**Deep explanation:** Caching avoids repeated expensive database calls, computation, or remote requests, improving latency and reducing load. The cost is staleness and invalidation complexity. A design must choose keys, TTLs, eviction, consistency expectations, and protection against stampedes rather than treating the cache as automatically correct.

**Interview answer:** A backend caches frequently reused or expensive results to improve response time and protect dependencies. I define acceptable staleness and an invalidation or TTL strategy, and I handle misses and stampedes safely.

25. What work belongs in a background job?

**Deep explanation:** Work belongs in a background job when it is slow, retryable, scheduled, or unnecessary for the immediate response—for example email delivery, image processing, report generation, or webhook retries. The API should durably enqueue it and return a job identifier when status matters. Jobs should be idempotent because queues may deliver more than once.

**Interview answer:** I move non-immediate, long-running, or retryable work off the request path. I enqueue it durably, expose status if needed, and make the worker idempotent with bounded retries and failure handling.

26. How do queues differ from synchronous service calls?

**Deep explanation:** A synchronous call makes the caller wait for an immediate response and couples its availability and latency to the callee. A queue stores a message for asynchronous processing, smoothing load and allowing retries, but introduces eventual consistency, duplicate delivery, ordering questions, and operational complexity.

**Interview answer:** Synchronous calls provide an immediate result but directly couple latency and availability. Queues decouple producers and consumers and absorb bursts, at the cost of eventual consistency and more complex retry, ordering, and deduplication logic.

27. What is a webhook?

**Deep explanation:** A webhook is an HTTP callback sent when an event occurs, letting systems push updates instead of being polled. Receivers should verify signatures and timestamps, acknowledge quickly, process asynchronously, deduplicate event IDs, and tolerate retries or out-of-order delivery.

**Interview answer:** A webhook is an event notification delivered to another system's HTTP endpoint. I secure it with signature verification, return quickly, enqueue processing, and make handling idempotent because deliveries can be retried.

28. What is rate limiting?

**Deep explanation:** Rate limiting restricts how many requests an identity, IP, API key, or route may make during a period. It protects capacity and reduces abuse using algorithms such as token bucket, leaky bucket, or sliding window. A rejected request commonly receives 429 plus retry guidance.

**Interview answer:** Rate limiting controls request volume per caller or resource to protect availability and prevent abuse. I choose a policy and algorithm for expected bursts, enforce it in shared infrastructure when scaled, and return 429 with useful limit headers.

29. What should backend logs contain and exclude?

**Deep explanation:** Logs should contain structured operational context such as timestamp, severity, event name, request or trace ID, service, outcome, latency, and safe identifiers. They should exclude passwords, tokens, secret keys, full payment data, and unnecessary personal information. Redaction and retention policies reduce both security risk and noise.

**Interview answer:** I log structured events with correlation IDs, outcomes, latency, and enough safe context to diagnose failures. I never log credentials or secrets, and I minimize or redact sensitive personal data.

30. How would you test a simple CRUD endpoint?

**Deep explanation:** Test the happy paths for create, read, update, and delete plus invalid input, missing resources, conflicts, permissions, and persistence effects. Unit tests can isolate business rules, while integration tests exercise routing, serialization, authentication, and a real or production-like database. Tests should reset data deterministically and assert status, response contract, and database state.

**Interview answer:** I would cover each CRUD success path and edge cases such as validation errors, not found, conflicts, and unauthorized access. I would use focused service unit tests plus API integration tests that verify status codes, response bodies, and persisted state.
