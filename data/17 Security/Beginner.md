1. How do authentication and authorization differ?

**Deep explanation:** Authentication verifies an identity: "Who are you?" Authorization decides what that verified identity may do: "What are you allowed to access?" A user might authenticate with a password and MFA, then be authorized to read their own profile but not another user's or an administrator page. Authentication normally precedes authorization, but every protected operation still needs an authorization check.

**Interview answer:** Authentication proves who a user or service is; authorization determines what that identity can do. Logging in authenticates me, while permissions or roles authorize my access to specific resources.

2. What is the principle of least privilege?

**Deep explanation:** Give each user, service, and process only the permissions required for its current job, for only as long as needed. For example, a reporting service should receive read access to selected tables, not database-admin rights. This limits accidental damage and reduces the blast radius if an account is compromised, though permissions must be reviewed as responsibilities change.

**Interview answer:** Least privilege means granting only the minimum permissions needed to perform a task, ideally for the minimum time. It reduces the impact of mistakes and compromised accounts.

3. How do confidentiality, integrity, and availability differ?

**Deep explanation:** The CIA triad describes three security goals. Confidentiality prevents unauthorized disclosure, such as by access control or encryption. Integrity prevents or detects unauthorized alteration, using controls such as hashes, signatures, validation, and audit logs. Availability keeps systems and data usable when needed through redundancy, backups, capacity planning, and denial-of-service defenses. A system must balance all three rather than treating security as secrecy alone.

**Interview answer:** Confidentiality keeps data secret from unauthorized parties, integrity keeps it accurate and unaltered, and availability keeps it accessible to authorized users when needed.

4. What is a threat model?

**Deep explanation:** A threat model is a structured analysis of what needs protection, who might attack it, how they could do so, and which mitigations matter most. Teams identify assets, trust boundaries, entry points, threats, and likely impact, then prioritize controls by risk. For an upload feature, threats might include malware, path traversal, oversized files, and unauthorized reads. The model should evolve with the design.

**Interview answer:** A threat model identifies assets, attackers, trust boundaries, attack paths, and mitigations so a team can prioritize security work by likelihood and impact.

5. How do hashing, encryption, and encoding differ?

**Deep explanation:** Hashing maps data to a fixed-size digest and is designed to be one-way; it supports integrity checks and, with a password-specific algorithm and salt, password storage. Encryption transforms data using a key and is reversible by an authorized holder, so it provides confidentiality. Encoding changes representation for compatibility or transport, such as Base64, and offers no secrecy because anyone can decode it.

**Interview answer:** Hashing is one-way, encryption is reversible with the correct key, and encoding only changes representation. Hashing supports verification, encryption protects confidentiality, and encoding makes data compatible with a format or channel.

6. Why are salts used when hashing passwords?

**Deep explanation:** A salt is a unique random value combined with each password before a slow password-hashing function such as Argon2id, scrypt, bcrypt, or PBKDF2 runs. Unique salts make identical passwords produce different hashes and prevent attackers from efficiently reusing precomputed rainbow tables across accounts. Salts are not secret and can be stored beside the hash; they do not replace a deliberately slow, configurable password hash.

**Interview answer:** A unique random salt makes identical passwords hash differently and defeats reusable precomputed lookup tables. It can be stored with the hash and should be combined with a slow password-hashing algorithm.

7. How do symmetric and asymmetric encryption differ?

**Deep explanation:** Symmetric encryption uses the same secret key to encrypt and decrypt and is fast enough for large data volumes, but securely sharing that key is difficult. Asymmetric encryption uses a public/private key pair: one key can encrypt or verify while the other decrypts or signs, depending on the scheme. It is slower, so protocols such as TLS commonly use asymmetric cryptography to authenticate and establish a shared secret, then symmetric encryption for the session.

**Interview answer:** Symmetric encryption uses one shared secret key and is fast; asymmetric encryption uses a public/private key pair and simplifies key exchange and signatures but is slower. Real systems often combine them.

8. What does encryption in transit protect?

**Deep explanation:** Encryption in transit protects data while it moves across networks, such as between a browser and server, using protocols such as TLS. It prevents passive eavesdropping and, when certificates and integrity checks are validated correctly, detects tampering and helps authenticate the endpoint. It does not protect data after either endpoint decrypts it, and weak certificate handling can still permit man-in-the-middle attacks.

**Interview answer:** Encryption in transit, usually TLS, protects network traffic from eavesdropping and tampering while it travels between endpoints. It does not protect the data once an endpoint decrypts it.

9. What does encryption at rest protect?

**Deep explanation:** Encryption at rest protects stored data on disks, databases, backups, or object storage if the storage media or files are accessed without authorization. Full-disk encryption helps with a stolen device; field- or application-level encryption can also protect selected data from some infrastructure access. Its value depends on keeping keys separate and controlled, and it does not stop an authorized or compromised running application that can decrypt the data.

**Interview answer:** Encryption at rest protects stored data if disks, files, snapshots, or backups are stolen or accessed directly. Its effectiveness depends on strong, separately managed keys, and it cannot stop an application already authorized to decrypt the data.

10. What is a session cookie?

**Deep explanation:** A session cookie is a browser cookie used to associate requests with server-side session state, usually through an opaque, unpredictable session identifier. After login, the browser sends it automatically to matching requests, so the server can recognize the user without credentials on every request. It should be rotated after authentication, protected with appropriate cookie attributes, expire reasonably, and be invalidated on logout. "Session cookie" can also mean a cookie without a persistent expiry, which browsers normally discard when the session ends.

**Interview answer:** A session cookie usually carries an opaque identifier that lets the server map requests to logged-in session state. It must be unpredictable, short-lived, rotated when appropriate, and protected with Secure, HttpOnly, and SameSite settings.

11. What do HttpOnly, Secure, and SameSite cookie attributes control?

**Deep explanation:** `HttpOnly` prevents normal JavaScript access to a cookie, reducing token theft through XSS but not preventing malicious requests. `Secure` tells browsers to send it only over HTTPS. `SameSite` controls whether it is sent with cross-site requests: `Strict` is most restrictive, `Lax` permits limited top-level navigation use, and `None` permits cross-site use but requires `Secure`. These attributes complement rather than replace XSS and CSRF defenses.

**Interview answer:** HttpOnly blocks JavaScript from reading the cookie, Secure limits transmission to HTTPS, and SameSite controls when the browser sends it in cross-site requests. Together they reduce session theft and CSRF risk.

12. What is a JWT, and what does its signature establish?

**Deep explanation:** A JSON Web Token is a compact format containing a header, claims payload, and usually a digital signature or MAC. A valid signature establishes that the signed header and payload have not changed and were signed by a holder of the expected key. It does not prove that every claim is currently acceptable: the verifier must also enforce the algorithm, issuer, audience, expiry, and other policy, and revocation remains a design concern.

**Interview answer:** A JWT is a compact token containing claims. Its valid signature proves the signed content was not altered and came from a party holding the expected signing key, but the application must still validate issuer, audience, expiry, and other claims.

13. Does a signed JWT hide its payload?

**Deep explanation:** No. The standard signed JWT form, a JWS, Base64URL-encodes the header and payload, so anyone who obtains it can decode and read the claims. The signature provides integrity and authenticity, not confidentiality. Sensitive content should be omitted or protected with an encryption format such as JWE when encryption is genuinely required, while still minimizing token contents.

**Interview answer:** No. A signed JWT's payload is encoded, not encrypted, so it is readable by anyone holding the token. The signature prevents undetected modification; encryption is a separate feature.

14. What are access tokens and refresh tokens?

**Deep explanation:** An access token is presented to an API to authorize requests and is typically short-lived to limit exposure. A refresh token is presented only to an authorization server to obtain new access tokens and is usually longer-lived, so it needs stronger storage, rotation, reuse detection, and revocation controls. Separating them avoids sending a durable credential to every resource server while allowing sessions to continue without repeated login.

**Interview answer:** An access token is a short-lived credential used with APIs. A refresh token is a longer-lived, more sensitive credential used only to obtain new access tokens, so it needs tighter storage and rotation controls.

15. What is OAuth intended to authorize?

**Deep explanation:** OAuth 2.0 is a delegated authorization framework: it lets a client obtain limited access to a resource on behalf of a user, or sometimes on its own behalf, without receiving the user's password. Scopes and grants constrain that access. OAuth alone does not define user authentication or guarantee identity information; OpenID Connect adds that layer. Correct flow choice, redirect URI validation, PKCE, and token handling are essential.

**Interview answer:** OAuth lets a client receive limited, delegated access to protected resources without learning the user's password. It is an authorization framework, not by itself a user-authentication protocol.

16. How does OpenID Connect relate to OAuth?

**Deep explanation:** OpenID Connect is an identity layer built on OAuth 2.0. It standardizes user authentication by adding an ID token containing identity claims, a UserInfo endpoint, discovery, and related validation rules. The client validates the ID token to learn who authenticated, while access tokens remain for authorizing API access. An access token should not be treated as an ID token.

**Interview answer:** OpenID Connect adds authentication and standardized identity claims on top of OAuth 2.0. The ID token tells the client who authenticated; OAuth access tokens authorize calls to APIs.

17. What is multifactor authentication?

**Deep explanation:** Multifactor authentication requires evidence from at least two independent factor categories: something known, such as a password; something possessed, such as a security key or authenticator device; and something inherent, such as a biometric. Two passwords are not two factors. MFA reduces account takeover after password theft, though phishing-resistant FIDO2/WebAuthn security keys are stronger than SMS or one-time codes that attackers may intercept or relay.

**Interview answer:** MFA requires two or more independent factor types, such as a password plus a security key. It greatly reduces password-only account takeover, especially when using phishing-resistant factors like WebAuthn.

18. What is an API key suitable for?

**Deep explanation:** An API key is a shared secret identifier suitable for authenticating an application or project to a service, commonly for metering, quotas, or relatively simple server-to-server access. It usually does not identify an individual user or carry rich delegated permissions. Keys should be scoped, stored as secrets, rotated, and never embedded in public client code where they can be extracted; higher-risk use may require signed requests, OAuth, or workload identities.

**Interview answer:** An API key is suitable for identifying and authenticating an application or project for simple API access, quotas, or billing. It should be scoped, protected, and rotated, and it is usually not a substitute for user identity or fine-grained authorization.

19. What is SQL injection?

**Deep explanation:** SQL injection occurs when untrusted input changes the structure of a database query, allowing an attacker to read, alter, or delete data or bypass authentication. Concatenating input into `SELECT ... WHERE name = 'input'` is dangerous. Parameterized queries keep SQL code separate from values and are the primary defense; allowlisting is needed for identifiers or sort directions that cannot be parameters. Least-privileged database accounts reduce impact.

**Interview answer:** SQL injection is untrusted input being interpreted as part of a SQL command. Prevent it with parameterized queries or safe ORM APIs, allowlist dynamic identifiers, and use least-privileged database credentials.

20. What is cross-site scripting?

**Deep explanation:** Cross-site scripting, or XSS, happens when attacker-controlled content executes as script in another user's browser under a trusted site's origin. It can steal accessible data, modify pages, or perform actions as the victim. Context-aware output encoding, safe DOM APIs such as `textContent`, sanitization for intentionally allowed HTML, and Content Security Policy provide layered defenses; input validation alone is insufficient.

**Interview answer:** XSS is attacker-controlled content executing as script in another user's browser under the application's origin. The main defenses are context-aware output encoding, safe DOM APIs, HTML sanitization when needed, and CSP as defense in depth.

21. How do reflected, stored, and DOM-based XSS differ?

**Deep explanation:** Reflected XSS returns malicious input from the current request in the response, often through a crafted link. Stored XSS persists the payload in a database or other storage and serves it to later visitors, increasing reach. DOM-based XSS occurs when client-side JavaScript moves attacker-controlled data from a source such as the URL into a dangerous sink such as `innerHTML`; the server response may never contain the payload. All require defenses appropriate to the output context and sink.

**Interview answer:** Reflected XSS comes from the current request, stored XSS is persisted and later shown to users, and DOM-based XSS is created by unsafe client-side handling of attacker-controlled data. The distinction is where the payload enters and executes.

22. What is cross-site request forgery?

**Deep explanation:** CSRF tricks a logged-in browser into sending an unwanted state-changing request to a site because browsers automatically attach credentials such as cookies. An attack page might submit a hidden transfer form. Defenses include unpredictable CSRF tokens, appropriate `SameSite` cookies, and checking `Origin` or `Referer`; state changes should not use GET. XSS can often bypass CSRF defenses, and bearer tokens not automatically attached by the browser have a different threat model.

**Interview answer:** CSRF tricks a victim's browser into making an unwanted authenticated request using automatically attached credentials. Prevent it with CSRF tokens, SameSite cookies, origin checks, and non-GET methods for state changes.

23. What is server-side request forgery?

**Deep explanation:** SSRF occurs when an attacker influences a server to make requests to unintended destinations. A URL-fetching feature might be abused to reach cloud metadata services, internal admin endpoints, or localhost resources unavailable from the internet. Defenses include strict destination allowlists, URL parsing and canonicalization, DNS and redirect controls, blocking private and link-local ranges, network egress restrictions, and narrowly scoped credentials.

**Interview answer:** SSRF is abuse of a server-side network request to reach unintended internal or external resources. Mitigate it with strict destination validation, redirect and DNS controls, blocked internal ranges, egress filtering, and least-privileged credentials.

24. What is broken object-level authorization?

**Deep explanation:** Broken object-level authorization, often called IDOR, occurs when an endpoint accepts an object identifier but fails to verify that the requester may act on that specific object. Changing `/orders/123` to `/orders/124` must not reveal another customer's order. Unpredictable IDs help reduce guessing but are not authorization; every object read or mutation needs a server-side ownership or permission check, preferably built into the data-access pattern.

**Interview answer:** BOLA or IDOR occurs when a server uses an object ID without checking that the requester is authorized for that object. Every read and write needs a server-side object-level permission check; opaque IDs alone are not enough.

25. What is a secret, and where should it be stored?

**Deep explanation:** A secret is sensitive credential material such as an API key, password, private key, or signing key whose disclosure grants capability. It should be stored in a managed secret store or platform credential facility with encryption, access control, auditing, rotation, and controlled delivery at runtime. It should not be committed to source control, embedded in images or client applications, or placed in ordinary configuration files; environment variables can deliver secrets but are not themselves a full secret-management solution.

**Interview answer:** A secret is credential material that grants access, such as a password, API key, or private key. Store it in a managed secret system with least-privileged access, auditing, and rotation, never in source control or public client code.

26. Why should logs avoid passwords, tokens, and unnecessary personal data?

**Deep explanation:** Logs are widely copied, searched, retained, and accessed, so sensitive values in them create another high-value data store and can turn a logging incident into account compromise or a privacy breach. Applications should omit or redact credentials and minimize personal data, while using correlation IDs and safe metadata for diagnosis. Access controls, retention limits, encryption, and log-injection defenses are still needed because redaction can fail.

**Interview answer:** Logs have broad access and long retention, so recording credentials or unnecessary personal data expands the attack surface and privacy impact. Log only what is needed, redact sensitive values, and protect and expire logs appropriately.

27. What is input validation compared with output encoding?

**Deep explanation:** Input validation checks whether data conforms to expected type, length, range, format, and business rules, rejecting invalid input early. Output encoding escapes data for the context where it will be interpreted, such as HTML text, an attribute, JavaScript, or a URL, so it remains data rather than executable syntax. They solve different problems: allowlisting an email format does not safely encode it for every output context, and encoding does not enforce business validity.

**Interview answer:** Input validation enforces what data is acceptable; output encoding makes accepted data safe for a specific interpreter or context. Applications generally need both, with context-aware encoding performed at the output boundary.

28. What is rate limiting intended to prevent?

**Deep explanation:** Rate limiting restricts how frequently a client, account, token, IP, or operation may act within a period. It helps control brute-force login attempts, scraping, spam, accidental request storms, resource exhaustion, and cost abuse. Algorithms such as token bucket allow controlled bursts, while fixed windows are simpler but can spike at boundaries. Limits need fair keys, endpoint-specific thresholds, useful retry responses, and monitoring; distributed denial-of-service defense requires additional layers.

**Interview answer:** Rate limiting controls request frequency to reduce brute force, abuse, overload, and unexpected cost. Limits should be operation-specific, keyed sensibly, and combined with monitoring and broader DDoS protections.

29. Why should security checks run on the server?

**Deep explanation:** Code and state on a client device are controlled by the user and can be inspected, modified, or bypassed with direct HTTP requests. Client-side checks improve usability—for example, immediate form feedback—but cannot enforce trust boundaries. The server must independently validate input, authentication, authorization, prices, workflow state, and other security invariants for every relevant request.

**Interview answer:** Clients are untrusted and their checks can be changed or bypassed. Client validation is useful for UX, but the server must enforce every security rule independently.

30. How would you report a security issue discovered during development?

**Deep explanation:** Preserve evidence without exposing or exploiting more data, then report the issue promptly through the organization's approved private channel, such as its security team or vulnerability process. Include reproducible steps, affected components and versions, observed and potential impact, relevant logs with secrets removed, and suggested mitigation if known. Avoid public discussion, uncontrolled testing, or accessing unnecessary records; follow incident-severity and disclosure policies and help verify the fix.

**Interview answer:** I would stop unsafe testing, preserve minimal sanitized evidence, and report privately through the approved security channel with clear reproduction steps, scope, and impact. I would avoid public disclosure or unnecessary data access and help validate remediation.
