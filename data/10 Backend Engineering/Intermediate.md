1. How would you design pagination that remains predictable as records change?

**Deep explanation:** Use cursor/keyset pagination over a stable, unique ordering such as `(created_at, id)`. Encode the last tuple in an opaque cursor and query strictly after it; this avoids offset drift when rows are inserted or deleted. For a fully frozen view, add a snapshot boundary or database snapshot. Offset pagination is simpler and supports arbitrary pages, but becomes slow and inconsistent on changing, large datasets.

**Interview answer:** I would use opaque cursor pagination with a deterministic order, usually a business sort field plus the primary key as a tie-breaker. Each request fetches rows after the last seen tuple, and I would add a snapshot cutoff if the product requires a stable point-in-time result.

2. How would you validate sorting and filtering fields safely?

**Deep explanation:** Parse client input into a typed filter model, then map allowed public fields and operators to known query expressions. Never interpolate field names, operators, or values directly into SQL; bind values and whitelist structural elements. Enforce limits on ranges, list lengths, and sort columns, and reject unknown combinations so expensive or sensitive queries cannot be constructed.

**Interview answer:** I would whitelist sortable and filterable fields and operators, validate them into a typed structure, and build parameterized queries from server-owned mappings. I would also cap query complexity and reject unknown fields rather than passing client strings into SQL.

3. How would you version an API without breaking existing clients?

**Deep explanation:** Prefer additive, backward-compatible changes: add optional fields, preserve existing semantics, and tolerate unknown fields. For breaking changes, expose an explicit version through the path, header, or media type and run versions in parallel during a documented deprecation window. Use contract tests, usage telemetry, migration guides, and sunset communication before removal.

**Interview answer:** I keep changes additive whenever possible. If semantics or required fields must change, I introduce an explicit new version, support both versions during migration, test old client contracts, measure remaining usage, and retire the old version only after a communicated sunset period.

4. How would you document contracts using OpenAPI or another schema?

**Deep explanation:** Treat the schema as an executable contract: define endpoints, authentication, parameters, request and response models, error shapes, constraints, and examples. Generate or validate documentation from the same source used by implementation, lint it in CI, and run contract tests to detect drift. Reusable components and explicit nullability reduce ambiguity for client generation.

**Interview answer:** I would keep a version-controlled OpenAPI contract covering success and error responses, auth, validation rules, examples, and nullability. CI would lint it and verify the implementation against it, and we could generate client SDKs and reference documentation from that contract.

5. How would you compare REST, GraphQL, and gRPC for a backend?

**Deep explanation:** REST is broadly interoperable, HTTP-native, and cache-friendly, making it a strong public API default. GraphQL lets clients select and combine data but adds resolver performance, authorization, and query-cost controls. gRPC offers compact Protobuf messages, generated types, streaming, and low latency, but has weaker browser and human-debugging ergonomics. A system can use REST/GraphQL externally and gRPC internally.

**Interview answer:** I choose REST for simple resource APIs and broad compatibility, GraphQL when clients genuinely need flexible aggregation, and gRPC for typed, low-latency service-to-service calls or streaming. The decision depends on clients, caching, latency, schema evolution, and operational complexity.

6. How would you prevent N+1 queries in a GraphQL resolver?

**Deep explanation:** Batch and deduplicate child lookups per request with a DataLoader-style component, keyed by ID, then return results in the original key order. Alternatively, fetch known relationships with joins or preloading when the query shape supports it. Request-scoped caches must not leak authorization-dependent data across users, and query-count tests should detect regressions.

**Interview answer:** I would use request-scoped batching and caching, such as DataLoader, so many resolver calls become one `WHERE id IN (...)` query. For predictable relationships I may preload or join, and I would test query counts and keep caches scoped to the authenticated request.

7. How would you limit GraphQL query depth, cost, and response size?

**Deep explanation:** Parse the query before execution and reject it if depth, aliases, node count, or a field-weighted cost exceeds a role-specific budget. Require bounded pagination, cap list sizes and response bytes, apply timeouts, and rate-limit by calculated cost rather than request count alone. Persisted queries further restrict production traffic to reviewed operations.

**Interview answer:** I would perform pre-execution depth and weighted-cost analysis, require pagination, cap list and response sizes, and enforce time and rate budgets. For high-control environments I would allow only persisted queries, with larger budgets granted explicitly to trusted callers.

8. How would you implement an idempotency key for a payment request?

**Deep explanation:** Store a client-scoped idempotency key with a canonical request hash, operation status, and final response in durable storage under a unique constraint. Atomically claim the key before contacting the provider; concurrent duplicates wait for or read the same outcome. Retain records for a documented window, and pass an idempotency key downstream when the provider supports it.

**Interview answer:** I would atomically insert a unique key scoped to the client, along with a hash of the normalized request. The first request performs the payment and stores the result; retries with the same payload return that result, while concurrent requests cannot create a second payment.

9. What should happen if one idempotency key is reused with a different payload?

**Deep explanation:** Compare the canonical payload hash with the one recorded for the key. If it differs, reject the request with a conflict or validation error and do not execute it. Silently treating it as a retry could return an unrelated result; treating it as new would defeat duplicate protection.

**Interview answer:** I would reject it, typically with `409 Conflict`, because an idempotency key identifies one logical operation. The response should explain that the key was already bound to a different request, without exposing sensitive payload details.

10. How would you handle a successful operation whose response never reaches the client?

**Deep explanation:** This is an ambiguous outcome: the client cannot infer failure from a timeout. Make the operation idempotent, persist its result before replying, and let the client retry with the same key or query operation status. The server must return the recorded success rather than execute the side effect again.

**Interview answer:** I assume a timeout does not mean the operation failed. The client retries with the same idempotency key or checks a status endpoint, and the server returns the durable prior result so the successful side effect is not repeated.

11. How would you implement optimistic concurrency using versions or ETags?

**Deep explanation:** Return a version or ETag with the representation and require it on updates through a condition such as `If-Match`. Perform one atomic update with `WHERE id = ? AND version = ?`, incrementing the version; zero affected rows means the resource changed. Return `412 Precondition Failed` or `409 Conflict`, allowing the caller to reload and merge.

**Interview answer:** I would expose a version-derived ETag and require `If-Match` on writes. The database update compares and increments the version atomically; if no row matches, I reject the stale write so the client can fetch the latest state and resolve the conflict.

12. How would you design a multi-step order workflow?

**Deep explanation:** Model the workflow as an explicit state machine or saga with durable steps such as validate, reserve inventory, authorize payment, and confirm. Each transition should be transactional locally, idempotent, and driven by durable commands/events through an outbox. Define compensations—release inventory or void authorization—for failures, plus retry and manual-recovery paths.

**Interview answer:** I would implement a durable saga with explicit states and allowed transitions. Each step is idempotent, records progress before publishing the next action, and has a compensation where possible, so retries or process crashes can resume instead of corrupting the order.

13. How would you separate order state from payment state?

**Deep explanation:** Order lifecycle and payment lifecycle have different transitions and may diverge: an order can be cancelled while a refund is pending. Store separate state machines and link payment attempts to the order, rather than using one overloaded status. Derive user-facing summaries from both states and update them through explicit events or commands.

**Interview answer:** I model order and payment as separate aggregates or state machines. An order might be `CONFIRMED` while payment is `AUTHORIZED`, or `CANCELLED` while refund is `PENDING`; keeping them separate preserves those real intermediate states and supports multiple payment attempts.

14. How would you process a payment-provider webhook safely?

**Deep explanation:** Read the raw body, authenticate the signature, validate timestamp and schema, then persist the provider event ID under a unique constraint before acknowledging. Return quickly and process asynchronously with idempotent state transitions. Handle duplicates and out-of-order delivery by consulting provider object versions/status, and reconcile periodically through the provider API.

**Interview answer:** I verify the signed raw payload, deduplicate by provider event ID, durably enqueue it, and acknowledge quickly. A worker applies idempotent transitions and tolerates out-of-order events, while a reconciliation job checks provider state for missed or ambiguous updates.

15. How would you validate webhook signatures and reject replayed events?

**Deep explanation:** Compute the provider-specified MAC or public-key signature over the exact raw request bytes and timestamp, then compare safely and use the correct rotating secret/key. Reject timestamps outside a small tolerance and store event IDs or nonces with an expiry so a valid message cannot be reused. Do not parse or reserialize JSON before signature verification.

**Interview answer:** I verify the signature against the untouched raw body using the provider’s algorithm and a constant-time comparison. I also enforce a timestamp window and atomically record the event ID or nonce, rejecting anything already seen.

16. How would you design resumable file uploads?

**Deep explanation:** Create an upload session containing owner, expected size/checksum, chunk policy, and expiry. Let the client send numbered or byte-range chunks directly to object storage with short-lived credentials, recording completed parts idempotently. On completion, verify coverage, total size, and checksum, atomically finalize the object, and clean up expired multipart uploads.

**Interview answer:** I create an expiring upload session, accept idempotent chunks or storage multipart parts, and expose which ranges are complete so the client can resume. Finalization verifies all parts, size, and checksum before making the object visible.

17. How would you validate file type, size, ownership, and storage destination?

**Deep explanation:** Enforce declared and streamed byte limits, inspect magic bytes rather than trusting extensions or MIME headers, and scan risky content before publication. Bind the upload session and object key to the authenticated owner and an allowlisted storage prefix generated by the server. Recheck authorization on completion and downloads; never accept arbitrary bucket paths from clients.

**Interview answer:** I validate size while streaming, identify content from bytes, optionally malware-scan it, and use server-generated object keys in approved storage locations. The upload session is tied to the authenticated owner, and authorization is checked again before finalization or access.

18. How would you create temporary download links without exposing permanent credentials?

**Deep explanation:** After authorizing the caller, generate a narrowly scoped, short-lived presigned URL or signed CDN URL for one object and operation. Keep permanent storage credentials only on the server, use HTTPS, choose a small expiry, and optionally bind content disposition or response headers. Highly sensitive downloads may instead pass through an authenticated service for immediate revocation and auditing.

**Interview answer:** I authorize access server-side and issue a short-lived signed URL limited to that object and a read operation. No permanent credentials reach the client; for especially sensitive data I would proxy the download to gain stronger revocation and audit control.

19. How would you manage database transactions across repository methods?

**Deep explanation:** Define the transaction boundary in the application/service layer around one use case, then pass a transaction-bound context or unit of work into repositories. Repositories should not independently commit, because partial commits break atomicity. Keep transactions short, roll back on errors, define isolation deliberately, and publish external events through an outbox after the data change.

**Interview answer:** The service layer owns the transaction and passes the same transaction handle to every repository involved. Repository methods never commit independently; the use case commits once or rolls back once, and external messages use an outbox rather than occurring inside the database transaction.

20. How would you prevent slow requests from exhausting a connection pool?

**Deep explanation:** Set request, statement, lock, and connection-acquisition timeouts, and hold connections only while executing database work. Size the pool against database capacity, cap concurrency, add backpressure, and cancel queries when clients disconnect. Diagnose slow SQL with metrics and plans, index or reshape it, and use circuit breakers or load shedding before queues grow without bound.

**Interview answer:** I bound acquisition and query time, keep transactions short, propagate cancellation, and limit concurrent database work to what the pool and database can sustain. I monitor pool wait time and slow queries, then optimize the SQL or shed load before every request blocks on a connection.

21. How would you implement authorization for individual records?

**Deep explanation:** Apply object-level authorization using the authenticated principal, action, record ownership, tenant, and policy attributes. Prefer queries that include the authorization predicate so unauthorized rows are never loaded, then apply domain checks for more complex rules. Centralize policies, default deny, and test cross-user access; avoid revealing existence through differing errors where that matters.

**Interview answer:** I enforce object authorization on every read and write, ideally inside the query with owner or tenant predicates, followed by centralized policy checks for richer rules. The default is deny, and unauthorized IDs usually return the same outward result as missing records.

22. How would you enforce tenant isolation across all database queries?

**Deep explanation:** Carry a trusted tenant ID from authentication through request context and make it mandatory in repository APIs, composite keys, unique constraints, and indexes. Add database row-level security as defense in depth and set tenant context per transaction. Never trust a client-supplied tenant ID, and use tests/static checks to catch unscoped queries, including background jobs and admin paths.

**Interview answer:** I derive tenant identity from authentication and require it in every repository operation and relevant database key. I also use row-level security where available, verify transaction context, and test that users cannot read or mutate another tenant’s records.

23. How would you rotate refresh tokens and handle simultaneous refreshes?

**Deep explanation:** Store only a hash of each refresh token with its family, generation, status, and expiry. On use, atomically invalidate it and issue the next token. To handle legitimate simultaneous refreshes, either serialize by family or allow a very short grace result for the same request; reuse outside that rule indicates theft, so revoke the family and require login.

**Interview answer:** Refresh tokens are one-time-use, hashed at rest, and rotated atomically. Concurrent refreshes are serialized or given a tightly bounded grace behavior; if an already-rotated token is reused unexpectedly, I revoke the whole token family because it may have been stolen.

24. How would you implement password reset without revealing account existence?

**Deep explanation:** Always return the same message and similar timing whether the account exists or not. For a real account, generate a cryptographically random, single-use, short-lived token, store its hash, and send it over an authenticated channel. On redemption, atomically consume it, set the new password with a modern hash, revoke active sessions as policy requires, and rate-limit both endpoints.

**Interview answer:** The request endpoint always gives a generic response. Existing accounts receive a random, short-lived, single-use token whose hash is stored; redemption consumes it atomically, updates the password securely, and usually revokes existing sessions, with rate limits and audit logging throughout.

25. How would you design email-verification and invitation flows?

**Deep explanation:** Use random, purpose-bound, expiring, single-use tokens stored as hashes. Verification links bind to a user and pending email; invitations also bind tenant, role, and intended address so privileges cannot be changed by the recipient. Consume tokens transactionally, make repeated completion harmless, support revocation/resend, and avoid exposing account existence.

**Interview answer:** I use hashed, expiring, single-use tokens scoped to a specific purpose and identity. Invitations additionally bind the tenant and allowed role, and acceptance atomically verifies the token and creates or links membership without letting the client alter its privileges.

26. How would you implement retries with backoff and a maximum budget?

**Deep explanation:** Retry only transient, idempotent failures. Use exponential backoff with jitter to prevent synchronized retries, cap individual delays and attempts, and stop when the caller’s deadline or total retry-time budget is exhausted. Honor server hints such as `Retry-After`, propagate cancellation, and record attempts and final causes for observability.

**Interview answer:** I classify retryable errors, require an idempotent operation, and use capped exponential backoff with jitter. Every retry is constrained by a maximum attempt count and the overall request deadline, and I honor `Retry-After` and cancellation signals.

27. How would you handle jobs that repeatedly fail?

**Deep explanation:** Track attempts and retry transient failures with bounded backoff. After the limit, move the job to a dead-letter queue containing error and correlation context, alert by severity, and provide inspected replay after the cause is fixed. Make handlers idempotent and distinguish poison data or permanent validation errors from temporary dependency failures.

**Interview answer:** I retry transient failures with a bounded policy, then dead-letter the job instead of looping forever. The DLQ preserves diagnostic context, triggers appropriate alerts, and supports controlled replay after the issue is fixed; permanent errors skip unnecessary retries.

28. How would you prevent duplicate execution of a scheduled job?

**Deep explanation:** Use a distributed lease or database advisory lock keyed by job and schedule slot, acquired atomically with an expiry and renewed while running. Also make the job idempotent and record a unique execution key, because locks can expire during pauses or network partitions. Fencing tokens can stop a stale worker from committing after losing its lease.

**Interview answer:** I elect one executor with a distributed lease or database lock for each scheduled slot, but I still design the job to be idempotent. A unique run key and, when needed, fencing token protect against lock expiry and stale workers.

29. How would you implement per-user and per-tenant API quotas?

**Deep explanation:** Identify both user and tenant from trusted auth and apply hierarchical token-bucket or sliding-window limits in a shared, atomic store. A request must satisfy endpoint, user, and tenant budgets; charge expensive operations by cost rather than uniformly. Return `429`, retry metadata, and quota headers, while defining fail-open versus fail-closed behavior for limiter outages.

**Interview answer:** I use an atomic distributed limiter with separate keys for user, tenant, and endpoint, and require all applicable budgets to pass. Token bucket handles bursts, weighted costs cover expensive calls, and rejected requests receive `429` plus retry information.

30. How would you distinguish request timeouts from dependency timeouts?

**Deep explanation:** Give the inbound request an overall deadline, then allocate smaller per-dependency timeouts within its remaining budget. Preserve typed causes so logs and metrics distinguish client cancellation, server deadline expiry, connection acquisition, and downstream timeout. Map responses consistently—often a gateway-style error for dependency failure—without retrying after the parent deadline has expired.

**Interview answer:** I propagate one request deadline and derive shorter downstream timeouts from the remaining time. Typed errors and tracing tell me whether the client cancelled, our server budget expired, or a dependency timed out, which drives the response, metrics, and retry decision.

31. How would you propagate request IDs across services?

**Deep explanation:** Accept a valid bounded inbound correlation ID or generate one at the edge, attach it to request context, logs, responses, messages, and outbound calls. Use standard trace context for distributed tracing and keep a separate request ID only when useful. Sanitize untrusted values, preserve IDs across async boundaries, and include trace/span IDs in structured logs.

**Interview answer:** The edge validates or creates a request ID and propagates it through headers, message metadata, context, logs, and the response. I also propagate W3C trace context, so logs can correlate a request while traces represent each service span accurately.

32. How would you investigate a slow API using traces and query plans?

**Deep explanation:** Start with latency percentiles and a representative slow trace to locate time in application code, queues, database calls, or downstream services. For suspect SQL, capture parameters safely and inspect `EXPLAIN` or `EXPLAIN ANALYZE` for scans, join choices, cardinality errors, sorts, locks, and I/O. Compare fast and slow cases, then verify the fix under realistic load rather than optimizing from one trace.

**Interview answer:** I use a slow distributed trace to identify the dominant span, correlate it with logs and resource metrics, and inspect actual query plans for database spans. I look for scans, bad estimates, locks, or excessive rows, apply the smallest fix, and validate p95/p99 behavior under production-like load.

33. How would you design health, readiness, and liveness endpoints?

**Deep explanation:** Liveness answers whether the process is irrecoverably stuck and should restart; it should be cheap and avoid failing because a dependency is down. Readiness answers whether this instance can serve traffic and may check critical initialization, pool capacity, or draining state. A broader health endpoint can expose sanitized diagnostics to authenticated operators, with checks bounded by short timeouts.

**Interview answer:** Liveness only detects a broken process, while readiness controls whether the instance receives traffic and becomes false during startup or draining. Dependency details belong in a protected health view; I keep probes fast and avoid restart loops caused by an external outage.

34. How would you perform graceful shutdown during a deployment?

**Deep explanation:** On the termination signal, mark the instance unready, stop accepting new work, and allow load balancers time to drain. Cancel or finish in-flight requests and consumers within a deadline, stop fetching jobs, flush critical telemetry, then close pools and exit. Long jobs need leases/checkpoints so another worker can resume after the grace period.

**Interview answer:** I first fail readiness and stop new HTTP requests and job intake. I drain in-flight work up to a configured deadline, propagate cancellation, checkpoint or release leased jobs, flush critical state, close dependencies, and then exit cleanly.

35. How would you test failures without relying entirely on mocks?

**Deep explanation:** Use real ephemeral dependencies in integration tests and inject faults at network or infrastructure boundaries: latency, timeouts, connection resets, database deadlocks, process restarts, and malformed messages. Contract tests validate third-party assumptions, while staging or controlled chaos tests cover distributed behavior. Keep a smaller set of mocks for deterministic unit tests, not as the sole evidence of resilience.

**Interview answer:** I combine unit tests with containerized integration tests using real databases and brokers, then inject realistic network, process, and dependency failures. Contract tests and limited chaos tests verify behavior mocks cannot reproduce, such as retries, duplicate delivery, locks, and recovery after restart.

36. How would you use Protobuf field numbers safely when evolving an RPC contract?

**Deep explanation:** Field numbers are the wire identity, so never change a field’s meaning or reuse a deleted number. Add new fields with new numbers, reserve removed names and numbers, and prefer compatible scalar or message evolution. Do not change wire-incompatible types, and test old/new client-server combinations because generated APIs can break even when wire encoding remains readable.

**Interview answer:** I treat field numbers as permanent. New fields get new numbers; removed fields have both their number and name reserved, and I never repurpose them. I make additive changes and run compatibility tests across old and new clients and servers.

37. How would you map domain errors to REST statuses and gRPC status codes consistently?

**Deep explanation:** Define transport-neutral domain error categories such as invalid input, not found, conflict, unauthenticated, forbidden, exhausted, and transient unavailable. Central adapters map each category to a stable REST status/problem body and gRPC status/details, while unexpected errors become generic internal failures. Preserve correlation IDs and retry hints without leaking stack traces or sensitive data.

**Interview answer:** I use a shared domain error taxonomy and map it centrally: for example, not found to HTTP 404 and gRPC `NOT_FOUND`, conflicts to 409 and `ABORTED` or `ALREADY_EXISTS`, and validation to 400/422 and `INVALID_ARGUMENT`. Unknown errors become sanitized 500/`INTERNAL` responses.

38. How would you expose cancellation and deadlines in a streaming RPC?

**Deep explanation:** Require callers to set a deadline and propagate the RPC context into database calls, downstream RPCs, and producer/consumer loops. Streaming handlers must regularly observe cancellation, stop background work, release resources, and handle send/receive backpressure. Return an appropriate cancellation or deadline status while ensuring partially processed messages follow documented idempotency semantics.

**Interview answer:** I propagate the stream context and remaining deadline through every downstream operation. Both read and write loops select on cancellation, respect flow control, clean up resources promptly, and return `CANCELLED` or `DEADLINE_EXCEEDED` without leaving background work running.

39. How would you handle backward-compatible enum growth in generated clients?

**Deep explanation:** New enum values are wire-compatible but can break clients that assume an exhaustive known set. Preserve and surface unknown numeric values where the language/runtime allows, include an `UNSPECIFIED` default, and make client switches use a fallback. Never reuse numeric values; test older generated clients receiving newer server values.

**Interview answer:** I assume old clients may receive enum values they do not know. Numeric values are never reused, zero is an unspecified default, and client code has an unknown/default branch rather than crashing; compatibility tests cover new-server/old-client behavior.

40. How would you distinguish JSON Merge Patch from JSON Patch for partial updates?

**Deep explanation:** JSON Merge Patch (`application/merge-patch+json`) sends an object shaped like the target: omitted fields stay unchanged, values replace, and `null` removes a field, which makes explicitly setting JSON null ambiguous. JSON Patch (`application/json-patch+json`) sends ordered operations such as `add`, `remove`, `replace`, and `test` against JSON Pointer paths; it is more precise for arrays and conditional updates but harder to validate and authorize.

**Interview answer:** I use Merge Patch for simple object updates because it is compact, while documenting that `null` means removal. I use JSON Patch when clients need precise path or array operations, or atomic `test`-then-update behavior, and I validate every operation and authorized path.
