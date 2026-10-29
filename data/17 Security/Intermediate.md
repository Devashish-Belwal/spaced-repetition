1. How would you implement password reset without enabling account takeover?

**Deep explanation:**
Return the same response for every account, then send a cryptographically random, single-use, short-lived token through a verified channel. Store only its hash, rate-limit issuance and guesses, invalidate earlier tokens, notify the owner, and revoke relevant sessions after reset.

**Interview answer:**
I use a hashed, random, short-lived, one-time token delivered to a verified address, plus generic responses and rate limits. After use I invalidate the token, notify the user, and revoke affected sessions.

2. How would you prevent user enumeration during login and recovery?

**Deep explanation:**
Make messages, status codes, response sizes, and timing similar for existing and nonexistent accounts. Rate-limit by several signals, while keeping precise failure reasons only in protected internal logs.

**Interview answer:**
I normalize externally visible responses and timing so callers cannot distinguish unknown users from bad credentials, then rate-limit and monitor attempts.

3. How would you choose password-hashing parameters and upgrade old hashes?

**Deep explanation:**
Benchmark Argon2id on production-class hardware and choose memory, iterations, and parallelism that maximize attacker cost within latency and capacity budgets. Store versioned parameters per hash and transparently rehash after a successful login when policy changes.

**Interview answer:**
I benchmark Argon2id, choose the strongest sustainable cost, use unique salts, and store parameters with each hash. Successful login triggers rehashing of outdated hashes.

4. How would you manage session fixation, rotation, and revocation?

**Deep explanation:**
Rotate unpredictable session IDs at login, privilege elevation, and other trust changes. Use hardened cookies, idle and absolute expiry, and server-side revocation on logout, password reset, suspicious activity, or administrative action.

**Interview answer:**
I rotate the session whenever trust changes, use Secure, HttpOnly, appropriate SameSite cookies, enforce expirations, and maintain immediate revocation.

5. How would you validate JWT issuer, audience, expiry, signature, and allowed algorithms?

**Deep explanation:**
Configure expected values rather than trusting token input. Pin an algorithm allowlist and trusted keys, verify the signature, then require exact issuer, intended audience, expiry, not-before, and application claims with only small clock skew.

**Interview answer:**
I pin trusted keys and algorithms, verify the signature, and strictly validate issuer, audience, time bounds, and required claims. I reject unsigned, confused-algorithm, or wrong-service tokens.

6. How would you handle signing-key rotation and cached key sets?

**Deep explanation:**
Publish old and new public keys with stable key IDs, switch signing to the new key, and retain the old verifier through the maximum token lifetime. Cache only the trusted issuer's JWKS with bounded TTLs, safe unknown-key refresh, and a short last-known-good fallback.

**Interview answer:**
I overlap keys during rotation and retain old verification keys until their tokens expire. Verifiers cache the trusted JWKS, refresh safely on unknown key IDs, and never trust token-controlled key URLs.

7. How would you implement refresh-token rotation and detect reuse?

**Deep explanation:**
Atomically exchange each refresh token once, marking it spent and issuing a successor in the same token family. Reuse of a spent token indicates likely theft, so revoke the family, record the event, and require authentication; store token hashes, not plaintext.

**Interview answer:**
Refresh tokens are one-time credentials rotated atomically. If an already-spent token returns, I revoke its whole family and require reauthentication.

8. How would you use authorization-code flow with PKCE?

**Deep explanation:**
The client creates a high-entropy verifier, sends its S256 challenge during authorization, and presents the verifier when exchanging the short-lived code. An intercepted code is therefore useless without the initiating client's verifier.

**Interview answer:**
I generate a random verifier, send its SHA-256 challenge, and provide the verifier at the token endpoint. I combine PKCE with exact redirects and state.

9. How would you validate OAuth redirect URIs?

**Deep explanation:**
Pre-register full URIs and compare them exactly using standards-compliant parsing. Avoid wildcards, prefix matching, attacker-controlled subdomains, and allowed endpoints that are themselves open redirectors.

**Interview answer:**
I require an exact match against pre-registered redirect URIs and reject wildcard, prefix, parsing, and open-redirect bypasses.

10. How do OAuth state, PKCE, and OIDC nonce address different threats?

**Deep explanation:**
State correlates the browser response and mitigates login CSRF; PKCE binds an authorization code to its initiating client; OIDC nonce binds an ID token to its authentication request and detects replay or substitution.

**Interview answer:**
State protects the browser transaction, PKCE makes a stolen code unusable, and nonce prevents ID-token replay or substitution. They are complementary.

11. How would you handle token theft on a browser or mobile client?

**Deep explanation:**
Use short-lived, narrow access tokens, rotated refresh tokens, revocation, and sender constraints where practical. Prefer a browser BFF with HttpOnly cookies over JavaScript-readable long-lived tokens; on mobile, use OS secure storage and claimed HTTPS redirects.

**Interview answer:**
I minimize token lifetime and scope, keep browser tokens behind HttpOnly cookies where possible, store mobile secrets securely, rotate refresh tokens, and revoke on theft signals.

12. How would you compare role-based, attribute-based, and relationship-based access control?

**Deep explanation:**
RBAC is simple and auditable but may cause role explosion. ABAC expresses contextual rules but increases policy complexity. ReBAC naturally models ownership and sharing graphs but needs reliable relationship evaluation; systems often combine them.

**Interview answer:**
I use RBAC for stable job functions, ABAC for contextual rules, and ReBAC for ownership or sharing. I choose the simplest model that accurately represents the domain.

13. How would you enforce authorization for nested and bulk resources?

**Deep explanation:**
Query children through their authorized parent so supplied IDs cannot cross boundaries. For bulk requests, authorize every item efficiently, cap batch size, and define atomic versus per-item failure semantics before side effects occur.

**Interview answer:**
I scope nested lookups through the authorized parent and authorize every bulk item, preferably set-wise, with clear atomicity and bounded batch size.

14. How would you prevent cross-tenant data access?

**Deep explanation:**
Derive tenant identity from trusted authentication and include it in every read and write. Centralize scoping, reinforce it with row-level security, tenant-aware cache and storage keys, and cross-tenant negative tests.

**Interview answer:**
Every query, write, cache key, object path, and job is scoped by the authenticated tenant, ideally backed by database row-level security.

15. How would you protect file uploads against malicious content and path traversal?

**Deep explanation:**
Cap size, inspect actual content, generate storage names, and store outside executable web roots. Reject traversal, dangerous archives, and decompression bombs; quarantine and scan or transform risky files, then serve with safe headers.

**Interview answer:**
I treat uploads as hostile: validate content and size, generate paths, isolate storage, scan risky types, block archive traversal, and serve downloads safely.

16. How would you protect URL-fetching features against SSRF?

**Deep explanation:**
Allowlist needed schemes and destinations, resolve DNS, and block loopback, private, link-local, metadata, and other special IPv4/IPv6 ranges. Revalidate redirects, resist rebinding, restrict egress, and bound time and response size.

**Interview answer:**
I validate scheme, host, resolved IP, and every redirect; block internal and metadata ranges; and fetch through restricted egress with tight limits.

17. How would you prevent command injection in operating-system calls?

**Deep explanation:**
Avoid a shell and invoke a fixed executable with a structured argument array. Map user choices to server-controlled allowlisted values, run least-privileged and isolated, and do not rely on fragile escaping.

**Interview answer:**
I avoid shell interpolation, pass structured arguments to a fixed executable, allowlist inputs, and run the process with minimal privileges.

18. How would you prevent insecure deserialization?

**Deep explanation:**
Deserialize simple formats into explicit schemas with size and depth limits. Avoid native object graphs, polymorphic class selection, constructors, and hooks; signatures detect tampering but do not make a dangerous deserializer safe.

**Interview answer:**
I accept schema-validated data only and never let untrusted input select classes or instantiate arbitrary objects. I also limit nesting and size.

19. How would you prevent mass assignment in an API?

**Deep explanation:**
Use operation-specific DTOs and explicitly map permitted fields instead of binding bodies to persistence entities. Derive role, tenant, owner, price, and approval fields from trusted server context and test they cannot be overwritten.

**Interview answer:**
I allowlist fields per operation and map them explicitly. Security-sensitive attributes are never generic client-settable.

20. How would you deploy a Content Security Policy?

**Deep explanation:**
Inventory sources in report-only mode, then enforce narrow directives using per-response nonces or hashes. Remove unsafe-inline/eval where possible, monitor violations, and remember CSP is defense in depth rather than a substitute for output encoding.

**Interview answer:**
I start report-only, move to a nonce- or hash-based restrictive policy, roll out gradually, and monitor breakage while retaining primary XSS controls.

21. How would you choose CSRF protections for cookie-authenticated requests?

**Deep explanation:**
Use SameSite cookies plus a validated CSRF token for state-changing requests. Synchronizer tokens suit server sessions; signed double-submit tokens can suit stateless designs. Add Origin checks and never change state via GET.

**Interview answer:**
I combine SameSite with a CSRF token and Origin validation on state changes, choosing synchronizer or signed double-submit based on architecture.

22. How would you avoid assuming that CORS is an authentication mechanism?

**Deep explanation:**
CORS controls whether browser JavaScript can read a response; it does not stop direct clients or authenticate requests. Every endpoint still needs authentication, authorization, and—when cookies are used—CSRF protection.

**Interview answer:**
CORS is a browser sharing policy, not access control. I independently authenticate and authorize every request and configure only required origins.

23. How would you protect webhooks against forgery and replay?

**Deep explanation:**
Verify a signature over the exact raw body and timestamp using a trusted secret or public key. Reject stale requests, deduplicate event IDs, rotate secrets with overlap, compare safely, and make processing idempotent.

**Interview answer:**
I verify the raw-body signature and timestamp before parsing, reject stale events, deduplicate IDs, and process idempotently.

24. How would you generate, store, rotate, and revoke API keys?

**Deep explanation:**
Generate high-entropy keys, display the secret once, and store only a verifier plus owner, scopes, expiry, and usage metadata. Support overlapping rotation, immediate revocation, monitoring, and keep keys out of URLs and logs.

**Interview answer:**
I issue random scoped keys, store only their verifier, show them once, and support expiration, monitored use, overlap during rotation, and immediate revocation.

25. How would you manage secrets in CI, containers, and local development?

**Deep explanation:**
Use a managed secret store and prefer short-lived workload identity. Restrict CI secrets from untrusted builds, mask logs, inject container secrets at runtime rather than into images, and give developers separate low-privilege nonproduction credentials.

**Interview answer:**
I centralize secrets, inject least-privilege credentials at runtime, isolate untrusted CI, avoid image-baked secrets, and separate local from production access.

26. How would you use a KMS for envelope encryption?

**Deep explanation:**
Encrypt data locally with a unique data key and authenticated cipher, then wrap that key with a KMS-managed key. Store ciphertext, nonce, tag, and wrapped key; restrict and audit unwrap operations and erase plaintext keys promptly.

**Interview answer:**
I encrypt with a per-object data key, wrap that key in KMS, store only ciphertext and the wrapped key, and tightly control and audit decryption.

27. How would you design audit logs that capture privileged actions?

**Deep explanation:**
Capture actor and delegated identity, action, target, tenant, time, request ID, source, outcome, and safe before/after summaries. Send records to a restricted tamper-evident store, without secrets or unnecessary personal data.

**Interview answer:**
I record who did what to which resource, when, from where, and with what result, in centralized tamper-evident storage with strict access.

28. How would you test authorization failures systematically?

**Deep explanation:**
Generate negative tests from a role-resource-action matrix across tenants, ownership, state, method, nested IDs, bulk operations, and sensitive fields. Default-deny at policy and API layers and turn every bypass into a regression test.

**Interview answer:**
I derive denial tests from a permission matrix and cover wrong role, owner, tenant, method, resource state, nested IDs, and bulk cases.

29. How would you review dependencies for vulnerabilities and malicious updates?

**Deep explanation:**
Keep lockfiles and an SBOM, scan continuously, and prioritize by reachability and exploitability. Review provenance, maintainer changes, install scripts, typosquatting, and new transitives; test pinned updates through a controlled registry and pipeline.

**Interview answer:**
I inventory and lock dependencies, continuously scan them, assess actual exposure, and review provenance and behavioral changes before controlled updates.

30. How would you protect signup from bots without blocking legitimate users?

**Deep explanation:**
Layer adaptive rate limits, behavioral signals, verification, and challenges only as risk rises. Combine signals rather than relying on IP, cap downstream abuse, measure false positives, and provide accessible recovery paths.

**Interview answer:**
I start with quiet risk-based controls and add verification or accessible challenges only for suspicious traffic, while monitoring false positives.

31. How would you design privacy-aware retention and deletion policies?

**Deep explanation:**
Map each data class to purpose, legal basis, and the shortest defensible retention. Automate expiry across primary stores, indexes, analytics, caches, logs, and backup lifecycles, while supporting legal holds and auditable deletion verification.

**Interview answer:**
I assign explicit retention by purpose, automate deletion across derived systems, document backup aging and legal holds, and verify completion.

32. How would you protect an administrative interface more strongly than a public endpoint?

**Deep explanation:**
Isolate it, require phishing-resistant MFA and recent reauthentication, use least-privilege or just-in-time roles, shorten sessions, and add approvals for catastrophic actions. Audit and alert comprehensively, with a monitored break-glass path.

**Interview answer:**
I isolate admin access and require stronger identity, short sessions, least privilege, reauthentication, extra approval for dangerous actions, and complete monitoring.

33. How would you investigate a suspected leaked credential?

**Deep explanation:**
Revoke and rotate while preserving evidence. Establish scope, privileges, and exposure window; correlate authentication, API, network, and audit logs; contain impact, follow incident notification procedures, and remediate the leak source.

**Interview answer:**
I revoke first, preserve evidence, determine scope and exposure, search logs for misuse, contain affected systems, rotate dependencies, and fix the source.

34. How would you separate security monitoring from ordinary application error logging?

**Deep explanation:**
Emit structured security events for identities, access decisions, privilege changes, and control failures into a separately protected pipeline. Link application logs using correlation IDs, but apply stronger integrity, access, retention, and alerting to security telemetry.

**Interview answer:**
I route explicit structured security events to a protected monitoring pipeline and correlate them with ordinary logs without mixing their controls or purposes.

35. How would you verify current security guidance before choosing an authentication flow?

**Deep explanation:**
Check current IETF RFCs and BCPs, OpenID specifications, provider documentation, and maintained OWASP guidance. Verify dates, errata, deprecations, threat-model fit, and provider conformance; document assumptions and schedule review.

**Interview answer:**
I validate the flow against current primary standards and provider guidance, map it to our client and threats, test interoperability, and document the decision date.

36. How would you compare SAML and OpenID Connect for enterprise single sign-on?

**Deep explanation:**
SAML uses signed XML assertions and has broad legacy enterprise support but complex XML and certificate handling. OIDC uses OAuth-based JSON/JWT flows and generally fits modern web and mobile clients; both require strict issuer, audience, signature, destination, time, and replay validation.

**Interview answer:**
SAML is mature in legacy enterprise SSO; OIDC is usually simpler for modern applications. I choose based on customer IdP and client needs, with strict validation either way.

37. How would you implement secure tenant onboarding through enterprise identity federation?

**Deep explanation:**
Require an authenticated tenant administrator and independently verify domain or IdP control. Enforce unique issuer mappings, trusted metadata and rollover, explicit least-privilege group mapping, test before enforcement, audit changes, and retain a controlled recovery path.

**Interview answer:**
I verify tenant and IdP control out of band, bind a unique issuer, test metadata and rollover, map groups explicitly without automatic privilege, and audit configuration.

38. How would you validate XML input without enabling external-entity attacks?

**Deep explanation:**
Disable DTDs, external entities, XInclude, and network resolution. Limit size, depth, expansion, and time, then validate only against local trusted schemas using a hardened, patched parser tested with XXE payloads.

**Interview answer:**
I disable all external resolution and DTD features, enforce resource limits, and validate only against trusted local schemas.

39. How would you prevent open redirects in login and logout flows?

**Deep explanation:**
Prefer server-side destination identifiers or normalized local paths. Exact-allowlist any external URI and reject scheme-relative URLs, encoded bypasses, userinfo, backslashes, and unsafe suffix matching; bind federated logout redirects to client and state.

**Interview answer:**
I use server-controlled destination keys or exact registered URIs after canonical parsing, never arbitrary return URLs or prefix matches.

40. How would you set HSTS and evaluate the consequences of enabling it?

**Deep explanation:**
Verify complete HTTPS and certificate coverage, deploy a short `max-age`, monitor, then increase gradually. Enable `includeSubDomains` and preload only after inventorying all subdomains; certificate failures then become hard failures and preload reversal is slow.

**Interview answer:**
I roll out HSTS gradually after proving HTTPS coverage, and add subdomains or preload only when their long-lived, hard-failure consequences are understood.
