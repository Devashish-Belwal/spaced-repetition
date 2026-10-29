1. What happens during DNS resolution?

**Deep explanation:** A client first checks nearby caches, such as the browser, operating system, and configured DNS resolver. On a cache miss, the resolver follows the DNS hierarchy: a root server points to the relevant top-level-domain server, which points to the domain's authoritative server. The authoritative answer, such as an A or AAAA record, is returned and cached for its TTL. DNS usually uses UDP, but it can use TCP when responses are large or for operations such as zone transfers.

**Interview answer:** DNS translates a domain name into an IP address. After checking caches, a recursive resolver queries root, TLD, and authoritative name servers as needed, returns the record, and caches it for its TTL.

2. How do domain names, IP addresses, and ports relate?

**Deep explanation:** A domain name is a human-readable identifier that DNS maps to one or more IP addresses. The IP address identifies a network interface or host, while a port identifies a particular service or process on that host. For example, `example.com:443` might resolve to `203.0.113.10`, with port 443 selecting its HTTPS service. Together, an IP address, transport protocol, and port form a network endpoint.

**Interview answer:** DNS maps a domain name to an IP address; the IP locates the host, and the port selects a service on it. For example, HTTPS commonly connects to the resolved IP on TCP port 443.

3. How do IPv4 and IPv6 differ?

**Deep explanation:** IPv4 uses 32-bit addresses, typically written as four decimal octets, so its address space is limited and NAT is common. IPv6 uses 128-bit hexadecimal addresses, providing a vastly larger address space and features such as simpler headers, stateless address autoconfiguration, and no broadcast. They are separate protocols, so networks often use dual-stack operation or translation mechanisms during migration.

**Interview answer:** IPv4 has 32-bit addresses and often relies on NAT because addresses are scarce. IPv6 has 128-bit addresses, a much larger address space, and modernized addressing and configuration, but both may need to run together during migration.

4. What are public and private IP addresses?

**Deep explanation:** Public IP addresses are globally routable on the internet and must be unique in that routing domain. Private IPv4 ranges—`10.0.0.0/8`, `172.16.0.0/12`, and `192.168.0.0/16`—are intended for internal networks and are not routed across the public internet. A NAT gateway commonly lets many private hosts share a public address. Private addressing reduces public-address demand, but NAT is not itself a security boundary.

**Interview answer:** Public IPs are globally routable, while private IPs are reused inside local networks and cannot be routed directly over the public internet. NAT commonly translates private connections to a public address.

5. What is a subnet?

**Deep explanation:** A subnet is a logical subdivision of an IP network defined by a prefix length, such as `192.168.1.0/24`. The prefix identifies the network portion; the remaining bits identify addresses within it. Hosts determine whether a destination is local by applying the subnet mask, otherwise they send traffic to a router. Subnetting controls address allocation, routing boundaries, broadcast scope in IPv4, and often security segmentation.

**Interview answer:** A subnet is an IP address range sharing a network prefix. The subnet mask or CIDR prefix tells a host whether a destination is local or must be reached through a router.

6. What are routers, switches, and gateways responsible for?

**Deep explanation:** A switch usually forwards Ethernet frames within a local network using MAC-address tables. A router forwards IP packets between networks using routing tables. “Gateway” is a role rather than one fixed device type: a default gateway routes traffic out of a subnet, while an application gateway may translate between protocols. One physical device can perform several of these roles.

**Interview answer:** Switches connect devices within a LAN and forward frames by MAC address. Routers move IP packets between networks. A gateway is an entry or translation point to another network or protocol, such as a subnet's default router.

7. How do TCP and UDP differ?

**Deep explanation:** TCP is connection-oriented and provides an ordered, reliable byte stream using acknowledgments, retransmissions, flow control, and congestion control. UDP sends independent datagrams without guaranteeing delivery, order, or duplicate suppression, which reduces protocol overhead and avoids TCP's head-of-line blocking. TCP suits web pages and file transfer; UDP suits DNS, real-time media, and protocols such as QUIC that implement their own reliability.

**Interview answer:** TCP provides a reliable, ordered byte stream with connection setup and congestion control. UDP sends best-effort datagrams with less overhead, so it is useful when low latency or application-controlled reliability matters.

8. What happens during a TCP handshake?

**Deep explanation:** TCP establishes a connection with a three-way handshake. The client sends `SYN` with an initial sequence number, the server replies `SYN-ACK` with its own sequence number and acknowledgment, and the client returns `ACK`. This confirms that both directions work and synchronizes sequence-number state; options such as maximum segment size and window scaling may also be negotiated.

**Interview answer:** The client sends SYN, the server replies SYN-ACK, and the client sends ACK. This verifies two-way reachability, synchronizes sequence numbers, and establishes connection state before application data is exchanged.

9. How do latency, bandwidth, and throughput differ?

**Deep explanation:** Latency is the time data takes to travel, often measured as round-trip time. Bandwidth is a link's theoretical or configured carrying capacity, while throughput is the useful data rate actually achieved. Throughput can be lower because of protocol overhead, congestion, packet loss, server limits, or TCP behavior. A high-bandwidth link can still feel slow for chatty applications if latency is high.

**Interview answer:** Latency is delay, bandwidth is maximum capacity, and throughput is the rate actually achieved. Real throughput is usually below bandwidth, and high bandwidth does not eliminate the impact of high latency.

10. What are packets, retransmissions, and packet loss?

**Deep explanation:** Networks divide data into packets containing payload plus addressing and control metadata. Packet loss means some packets never reach their destination, often because of congestion, faulty links, or filtering. Reliable transports such as TCP infer loss from missing acknowledgments or duplicate acknowledgments and retransmit data. Retransmissions restore correctness but add latency and consume capacity; real-time UDP applications may instead tolerate or conceal loss.

**Interview answer:** Packets are the units carried across a network. Packet loss occurs when some are dropped, and reliable protocols such as TCP retransmit missing data, trading extra time and bandwidth for correct delivery.

11. What is HTTP's request-response model?

**Deep explanation:** HTTP is an application protocol in which a client sends a request containing a method, target, headers, and sometimes a body, and the server returns a status, headers, and sometimes a body. Each exchange is logically independent, so HTTP is stateless even though cookies or tokens can associate requests with a session. Connections may be reused, and HTTP/2 or HTTP/3 can carry multiple exchanges concurrently.

**Interview answer:** In HTTP, a client sends a request and the server returns a response. The protocol is stateless at the request level, although applications can maintain sessions with cookies or tokens and reuse connections for efficiency.

12. What information appears in an HTTP request and response?

**Deep explanation:** A request includes a method such as GET or POST, a target path, protocol version, headers, and optionally a body. Headers describe details such as the host, accepted formats, authorization, and content type. A response contains a status code, protocol version, headers such as content type or caching rules, and optionally a body containing the resource or error details.

**Interview answer:** A request has a method, URL or path, headers, and possibly a body. A response has a status code, headers, and possibly a body; headers carry metadata such as content type, authentication, and caching instructions.

13. How do HTTP and HTTPS differ?

**Deep explanation:** HTTP sends application messages without transport encryption, so intermediaries may read or modify them. HTTPS is HTTP carried through TLS, which encrypts traffic, detects tampering, and authenticates the server through certificates. HTTPS still exposes some connection metadata, such as IP addresses, and it does not make an application safe from flaws such as injection or broken authorization.

**Interview answer:** HTTPS is HTTP over TLS. It provides encryption, integrity, and server authentication, whereas plain HTTP does not; it protects data in transit but does not fix application-level security bugs.

14. What does TLS protect?

**Deep explanation:** TLS provides confidentiality by encrypting data, integrity by detecting alteration, and authentication—normally of the server—using certificates and digital signatures. During its handshake, peers negotiate algorithms and derive symmetric session keys; symmetric encryption then protects application data efficiently. TLS protects traffic between its endpoints, not data before encryption, after decryption, or on a compromised endpoint.

**Interview answer:** TLS protects data in transit with encryption and integrity checks and normally authenticates the server. It secures the connection between endpoints, but it cannot protect a compromised client or server.

15. What is a certificate authority?

**Deep explanation:** A certificate authority, or CA, is an entity trusted to sign digital certificates that bind a public key to an identity such as a domain name. Browsers and operating systems contain trusted root CA certificates. A site certificate is often signed by an intermediate CA whose chain ends at a trusted root. Domain-control checks reduce impersonation risk, although trust also depends on protecting CA keys and revoking misissued certificates.

**Interview answer:** A certificate authority verifies an identity under its policy and signs a certificate binding that identity to a public key. Browsers trust certificates whose chain leads to a trusted root CA.

16. How does a browser validate a server certificate?

**Deep explanation:** The browser checks that the requested hostname matches the certificate, the current time is within its validity period, and the signature chain leads through valid intermediates to a trusted root. It also checks permitted key usages, relevant constraints, and sometimes revocation information such as OCSP. The server must prove possession of the corresponding private key during TLS. A failure produces a certificate warning or blocks the connection.

**Interview answer:** The browser checks the hostname, dates, usage constraints, signatures, and chain to a trusted root, and may check revocation. The TLS handshake also proves that the server holds the certificate's private key.

17. What are DNS records such as A, AAAA, CNAME, MX, and TXT used for?

**Deep explanation:** An A record maps a name to an IPv4 address, while AAAA maps it to an IPv6 address. CNAME aliases one hostname to another canonical hostname. MX identifies mail servers for a domain and includes preference values. TXT stores text used for purposes such as domain verification and email-security policies like SPF or DKIM; record behavior and placement rules matter, especially for CNAMEs.

**Interview answer:** A and AAAA map names to IPv4 and IPv6 addresses. CNAME creates a hostname alias, MX directs email delivery, and TXT carries text-based metadata such as verification and email-security policies.

18. What is DNS TTL?

**Deep explanation:** DNS time to live is the number of seconds a resolver may cache a record before it should query again. A longer TTL lowers DNS traffic and improves cache hit rates but makes changes propagate more slowly. A shorter TTL speeds planned failovers or migrations at the cost of more queries and does not guarantee instant change because existing caches remain valid until expiry.

**Interview answer:** DNS TTL controls how long a resolver may cache a record. Higher values improve caching but delay changes; lower values allow faster updates but increase DNS lookup load.

19. How do a forward proxy and reverse proxy differ?

**Deep explanation:** A forward proxy represents clients when they access external servers, often providing filtering, privacy, access control, or caching. A reverse proxy represents servers and receives client traffic before forwarding it to backend services. Reverse proxies commonly terminate TLS, route by hostname or path, balance load, cache responses, and hide backend topology. The key distinction is which side the proxy represents.

**Interview answer:** A forward proxy sits in front of clients and makes outbound requests for them. A reverse proxy sits in front of servers, receives inbound requests, and can handle routing, TLS termination, caching, and load balancing.

20. What is a load balancer?

**Deep explanation:** A load balancer distributes requests or connections across multiple healthy backend instances. Algorithms may use round robin, least connections, hashing, weights, or latency, while health checks remove failed targets. This improves capacity and availability, but the balancer itself must be redundant. Some applications also require session affinity, although stateless services are generally easier to scale.

**Interview answer:** A load balancer spreads traffic across healthy backend servers using a routing algorithm and health checks. It improves scalability and availability, and it should itself be deployed without a single point of failure.

21. How do layer-4 and layer-7 load balancing differ?

**Deep explanation:** Layer-4 balancing makes decisions from transport information such as IP addresses and TCP or UDP ports, without needing to understand the application payload. It is fast and works for many protocols. Layer-7 balancing understands application protocols such as HTTP, enabling routing by host, path, method, header, or cookie and features such as TLS termination. That flexibility requires more processing and protocol awareness.

**Interview answer:** Layer 4 balances connections using IP and port information. Layer 7 understands application data, such as HTTP hosts and paths, enabling smarter routing but adding processing and protocol complexity.

22. What is a CDN?

**Deep explanation:** A content delivery network uses geographically distributed edge servers to serve content closer to users. Edges cache static or cacheable responses and fetch misses from the origin, reducing latency, origin load, and long-distance traffic. CDNs can also provide TLS termination and DDoS protection. Cache keys, expiration, invalidation, and personalized content must be configured carefully to prevent stale or incorrect responses.

**Interview answer:** A CDN serves cached content from edge locations near users, reducing latency and origin load. It can also provide traffic absorption and security features, but cache behavior and invalidation need careful configuration.

23. How do cookies differ from arbitrary HTTP headers?

**Deep explanation:** Cookies are standardized name-value data managed by browsers for a domain and path. The server sets them with `Set-Cookie`, and the browser automatically sends matching cookies in the `Cookie` header; attributes such as `Secure`, `HttpOnly`, and `SameSite` control security behavior. Arbitrary headers are general request or response metadata and are usually set explicitly by application code, with browser restrictions such as CORS applying.

**Interview answer:** Cookies are browser-managed state scoped by domain and path and sent automatically when their rules match. Arbitrary headers are general metadata that clients or servers set explicitly; cookies also support security attributes such as Secure, HttpOnly, and SameSite.

24. How do polling, long polling, and WebSockets differ?

**Deep explanation:** Regular polling sends requests at intervals, which is simple but wastes requests and can delay updates. Long polling keeps a request open until data is available, then the client reconnects, reducing empty responses but retaining repeated HTTP overhead. WebSockets begin with an HTTP upgrade and create a persistent full-duplex channel, enabling low-latency bidirectional messaging at the cost of connection management, scaling, and proxy considerations.

**Interview answer:** Polling checks periodically, long polling holds each request until an update or timeout, and WebSockets keep a persistent two-way connection. WebSockets are efficient for frequent real-time messages, while polling is simpler for infrequent updates.

25. What are server-sent events?

**Deep explanation:** Server-sent events, or SSE, let a server stream text events to a browser over a long-lived HTTP response using `text/event-stream`. The browser's `EventSource` API handles reconnection and can resume using event IDs. SSE is one-way from server to client, so normal HTTP requests handle client-to-server actions. It is simpler than WebSockets for notifications or feeds but is unsuitable for binary or fully bidirectional traffic.

**Interview answer:** SSE is a long-lived HTTP stream for server-to-browser text events. It includes browser reconnection support and is simpler than WebSockets when communication mainly flows from server to client.

26. What is a webhook compared with an open client connection?

**Deep explanation:** A webhook is an event-driven HTTP callback: the subscriber gives the provider a URL, and the provider sends a request when an event occurs. It does not require a continuously open connection, but the receiver must be publicly reachable and should verify signatures, handle retries, and process duplicate deliveries idempotently. An open connection provides immediate streaming but consumes persistent connection state and may be harder across unreliable networks.

**Interview answer:** A webhook sends an HTTP callback to a registered endpoint when an event occurs, instead of maintaining a persistent connection. Receivers should authenticate callbacks and tolerate retries, duplicates, and out-of-order delivery.

27. What is gRPC?

**Deep explanation:** gRPC is a remote procedure call framework commonly using Protocol Buffers for strongly typed service contracts and compact binary messages. It usually runs over HTTP/2, supporting multiplexing and unary, client-streaming, server-streaming, and bidirectional-streaming methods. It offers efficient generated clients and clear contracts for service-to-service communication, but direct browser support and human readability are weaker than typical JSON REST APIs.

**Interview answer:** gRPC is a contract-first RPC framework, usually using Protocol Buffers over HTTP/2. It provides generated typed clients and several streaming modes, making it efficient for internal services, though it is less browser-friendly than JSON HTTP APIs.

28. What is GraphQL?

**Deep explanation:** GraphQL is an API query language and runtime built around a typed schema. Clients specify the fields they need, which can reduce over-fetching and combine related data through one graph. Queries read data, mutations change it, and subscriptions can stream updates. Its flexibility introduces server concerns such as query complexity limits, authorization at field boundaries, N+1 data fetching, and more complicated HTTP caching.

**Interview answer:** GraphQL exposes a typed schema and lets clients request exactly the fields they need. It can reduce over-fetching and combine related data, but servers must manage query cost, authorization, N+1 queries, and caching complexity.

29. What is a network timeout?

**Deep explanation:** A timeout limits how long software waits for a network operation before treating it as failed. Different phases may have separate limits, including DNS lookup, connection establishment, TLS handshake, reading, writing, and total request duration. Timeouts prevent resources from hanging indefinitely, but values that are too short cause false failures. Retries should be bounded and use backoff and jitter, especially for non-idempotent operations.

**Interview answer:** A network timeout is a deadline for an operation such as connecting or reading a response. It prevents indefinite waits; values should reflect expected latency, and retries should be bounded, back off, and respect whether the operation is safe to repeat.

30. How would you use ping, traceroute, curl, and DNS tools while debugging?

**Deep explanation:** Start with DNS tools such as `nslookup` or `dig` to verify name resolution and returned records. Use `ping` to test basic IP reachability and approximate round-trip time, while remembering that ICMP may be blocked. Use `traceroute` or `tracert` to identify where a path changes or stops, though routers may suppress replies. Use `curl -v` to inspect connection, TLS, HTTP headers, status, redirects, and response behavior. Compare results from different networks and test both hostname and IP to isolate DNS, routing, transport, TLS, or application failures.

**Interview answer:** I use DNS tools to validate resolution, ping for basic reachability and latency, traceroute for path clues, and `curl -v` to inspect TCP/TLS and HTTP behavior. I compare hostname versus IP and different networks to narrow the fault domain.
