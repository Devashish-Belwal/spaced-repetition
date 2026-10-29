1. How do TCP flow control and congestion control differ?

**Deep explanation:** Flow control protects the receiver: the advertised receive window limits how much unacknowledged data the sender may have in flight based on available buffer space. Congestion control protects the network: the congestion window changes in response to loss, delay, or acknowledgments. The sender is effectively limited by the smaller of the receive window and congestion window.

**Interview answer:** Flow control prevents a fast sender from overrunning a slow receiver, while congestion control prevents senders from overloading the network. TCP enforces both, and the usable send window is roughly `min(rwnd, cwnd)`.

2. What is head-of-line blocking?

**Deep explanation:** Head-of-line blocking occurs when one delayed item at the front prevents later, ready items from progressing. HTTP/1.1 pipelining suffers at the request level; HTTP/2 removes that ordering problem between streams but all streams still stall if a TCP packet is lost. HTTP/3 uses independent QUIC streams so loss on one stream need not block the others.

**Interview answer:** It is when an early delayed message blocks later messages even though they could otherwise proceed. HTTP/2 fixes HTTP/1.1 request-level blocking, but TCP loss can still stall every stream; HTTP/3 largely avoids that with independent QUIC streams.

3. How do HTTP/1.1, HTTP/2, and HTTP/3 differ in connection use?

**Deep explanation:** HTTP/1.1 usually needs several TCP connections per origin to achieve concurrency because each connection processes requests serially or with limited pipelining. HTTP/2 multiplexes many streams over one TCP connection and compresses headers. HTTP/3 similarly multiplexes streams, but over QUIC/UDP, avoiding TCP-level stream coupling and enabling faster connection establishment and migration.

**Interview answer:** HTTP/1.1 commonly uses multiple TCP connections for parallelism. HTTP/2 multiplexes requests over one TCP connection, while HTTP/3 multiplexes over QUIC, reducing loss-related blocking and improving handshake and connection-migration behavior.

4. How does QUIC change transport behavior compared with TCP?

**Deep explanation:** QUIC implements reliable, congestion-controlled transport in user space over UDP and integrates TLS 1.3 into its handshake. It provides independent streams, connection IDs that survive IP changes, and faster protocol evolution without kernel upgrades. Its tradeoffs include higher implementation complexity, possible UDP filtering, and sometimes greater CPU cost.

**Interview answer:** QUIC offers TCP-like reliability over UDP but adds independent streams, built-in TLS 1.3, faster handshakes, and connection migration. Because it runs in user space it evolves faster, though it may cost more CPU and encounter networks that restrict UDP.

5. How would you decide between TCP, UDP, and QUIC for a realtime product?

**Deep explanation:** Use TCP when every byte must arrive in order and broad compatibility matters. Use UDP when timeliness beats completeness and the application can implement loss handling, ordering, and security, as with live voice or games. Use QUIC when reliable streams, encryption, low setup latency, and mobility are valuable; benchmark under realistic loss and verify deployment support.

**Interview answer:** I choose based on delivery semantics and network conditions: TCP for simple reliable ordered delivery, UDP for latency-sensitive data that can tolerate loss, and QUIC for secure reliable multiplexed streams with fast setup and mobility. I would validate the choice with loss, latency, CPU, and compatibility tests.

6. How do keep-alive connections affect latency and resource use?

**Deep explanation:** Reusing a connection avoids repeated TCP and TLS handshakes, reducing latency and CPU. However, idle connections consume sockets, memory, file descriptors, NAT entries, and load-balancer state. Sensible idle timeouts, pool limits, and connection lifetimes balance reuse against resource pressure and stale connections.

**Interview answer:** Keep-alive lowers latency and handshake cost by reusing connections, but idle sockets consume resources across clients, servers, NATs, and proxies. I bound pool size and lifetime and align idle timeouts across the path.

7. How would you configure connection, read, and total request timeouts?

**Deep explanation:** The connection timeout should cover expected DNS, routing, TCP, and TLS setup but fail quickly when an endpoint is unreachable. A read timeout should allow legitimate gaps in response progress without permitting a peer to hold resources indefinitely; a total deadline bounds the entire operation, including retries. Values should come from latency distributions and business budgets, with downstream deadlines shorter than the caller's remaining budget.

**Interview answer:** I derive timeouts from observed percentiles and the user-facing latency budget: a short connect timeout, a progress-aware read timeout, and a hard end-to-end deadline. Retries must fit inside that deadline, and downstream calls receive only the remaining budget.

8. What can cause a connection reset versus a connection timeout?

**Deep explanation:** A reset means an endpoint or intermediary actively sent a TCP RST, often because no process is listening, a peer crashed or closed unexpectedly, or a firewall rejected the flow. A timeout means no decisive response arrived before the deadline, which can result from dropped packets, routing failure, an overloaded peer, or an overly restrictive firewall. Packet captures and logs help distinguish active rejection from silence.

**Interview answer:** A reset is an explicit abort, usually a TCP RST from the peer or middlebox. A timeout is silence until the deadline, commonly caused by drops, routing problems, or overload; I correlate packet captures with endpoint and proxy logs.

9. How do TLS termination and end-to-end encryption differ?

**Deep explanation:** With TLS termination, a proxy or load balancer decrypts traffic, enabling routing, inspection, and policy enforcement; traffic behind it may be plaintext or re-encrypted. End-to-end encryption keeps data encrypted between the true application endpoints, so intermediaries cannot read it. Re-encryption offers protection on each hop but still exposes plaintext at the terminator.

**Interview answer:** TLS termination decrypts at an intermediary for inspection or routing. End-to-end encryption prevents intermediaries from reading application data; terminating and then re-encrypting protects each hop but trusts the termination point.

10. What are SNI and ALPN used for?

**Deep explanation:** Server Name Indication carries the requested hostname in the TLS handshake so one IP address can serve different certificates and virtual hosts. Application-Layer Protocol Negotiation lets client and server select a protocol such as HTTP/2 or HTTP/1.1 during that handshake. SNI has historically exposed the hostname unless encrypted-client-hello support is used.

**Interview answer:** SNI tells the TLS endpoint which hostname the client wants, enabling certificate and virtual-host selection. ALPN negotiates the application protocol, such as `h2` versus `http/1.1`, without an extra round trip.

11. What does mutual TLS add?

**Deep explanation:** Normal TLS usually authenticates only the server; mutual TLS also requires the client to present a certificate trusted by the server. This provides strong machine or workload identity and encrypted transport, but requires certificate issuance, rotation, revocation, and authorization mapping. Authentication alone does not decide what the identified client may do.

**Interview answer:** mTLS authenticates both sides with certificates, giving the server cryptographic client identity in addition to server authentication and encryption. It still needs lifecycle management and a separate authorization policy.

12. How would you rotate certificates without interrupting traffic?

**Deep explanation:** Deploy the new certificate and complete chain before the old one expires, then reload or hot-swap it without restarting listeners. During trust-root or client-certificate rotation, use an overlap period in which both old and new trust anchors are accepted, update clients, then remove the old one. Monitor handshake errors and test SNI hosts and chains before and after rollout.

**Interview answer:** I use overlapping validity: install and validate the new certificate or trust root, hot-reload servers, update clients, and only then retire the old material. I monitor TLS handshake failures throughout and retain a rollback path.

13. How do recursive and authoritative DNS servers differ?

**Deep explanation:** A recursive resolver answers clients by following referrals through the DNS hierarchy and caching the result. An authoritative server holds the source-of-truth records for a zone and answers for that zone without recursively resolving other names. Clients commonly query a recursive resolver, which eventually queries authoritative servers.

**Interview answer:** A recursive resolver finds an answer on the client's behalf and caches it. An authoritative server publishes the definitive records for its zones; resolvers query it as part of resolution.

14. How can DNS caching complicate failover?

**Deep explanation:** Resolvers and clients may retain an old address until its TTL expires, and some implementations cache longer or reuse established connections. Lowering TTL shortly before a planned migration can shorten the transition, but it cannot instantly invalidate existing caches and increases query load. Emergency failover should therefore keep the old endpoint healthy or redirecting when possible.

**Interview answer:** DNS changes are not immediate because cached records remain until TTL expiry and existing connections may last longer. For planned failover I lower TTL in advance, maintain overlap between old and new endpoints, and monitor traffic decay before decommissioning.

15. How do NAT and port forwarding affect connectivity?

**Deep explanation:** NAT rewrites addresses and often source ports, allowing many private hosts to share public addresses while creating state tied to outbound flows. Port forwarding installs an inbound mapping from a public address and port to an internal service. This complicates unsolicited inbound connections, peer-to-peer communication, idle flows, and diagnostics because observed endpoint identities differ across the boundary.

**Interview answer:** NAT translates private endpoints to public ones and tracks connection state; port forwarding creates an explicit inbound mapping to an internal host. NAT conserves addresses but complicates inbound reachability, identity, and long-lived or peer-to-peer connections.

16. How can ephemeral-port exhaustion appear in a busy service?

**Deep explanation:** Every outbound TCP connection consumes a local address-port tuple, often retained in `TIME_WAIT` after closure. High connection churn or a small NAT address pool can exhaust available tuples, causing intermittent connect failures even though the destination is healthy. Connection pooling, keep-alive, more source addresses, wider port ranges, and reduced churn are safer remedies than aggressive TCP tuning.

**Interview answer:** It appears as failed or delayed outbound connects when all usable source-port tuples are active or in `TIME_WAIT`. I confirm with socket and NAT metrics, then reduce churn through pooling and add port or source-address capacity.

17. How do firewalls and security groups differ from application authorization?

**Deep explanation:** Firewalls and cloud security groups filter network traffic using properties such as IP, port, protocol, direction, and connection state. Application authorization evaluates an authenticated principal and requested resource or action, enabling business rules such as ownership or roles. Network controls reduce exposure but cannot replace resource-level authorization.

**Interview answer:** Firewalls and security groups decide which network flows may reach a service. Application authorization decides what an identified user or workload may do inside it; both are defense layers, but network reachability is not permission.

18. How would you configure health checks on a load balancer?

**Deep explanation:** A readiness endpoint should cheaply verify that an instance can serve traffic, including only critical dependencies, while liveness is usually handled separately to avoid restart cascades. Choose an interval, timeout, and healthy/unhealthy thresholds that detect real failures quickly without flapping during brief pauses. Use a representative protocol and host header, drain failed instances, and expose the reason in metrics.

**Interview answer:** I check readiness with a lightweight representative request, set thresholds to avoid flapping, and require several successes or failures before changing state. I keep liveness separate, drain unhealthy targets, and avoid making every optional dependency part of the check.

19. When are sticky sessions needed, and what problems do they create?

**Deep explanation:** Sticky sessions are useful when session state exists only on one server or a protocol requires continuity, but shared or client-carried state is usually more resilient. Affinity can create uneven load, complicate scaling and failover, and break when the selected instance disappears. Cookies are generally a safer affinity key than mutable client IPs.

**Interview answer:** I use stickiness only when requests truly depend on instance-local state or connection affinity. It reduces balancing flexibility and weakens failover, so I prefer externalized session state and use a cookie-based key when affinity is unavoidable.

20. How would you compare round-robin, least-connections, and consistent-hash routing?

**Deep explanation:** Round-robin is simple and works when requests and servers are similar, but ignores current load. Least-connections adapts better to variable request duration, though connection count may not equal actual work. Consistent hashing keeps a key mapped to roughly the same backend and minimizes remapping during membership changes, making it useful for caches or affinity at the cost of possible hotspots.

**Interview answer:** Round-robin is simple for uniform work; least-connections better handles variable-lived connections; consistent hashing provides stable key affinity with limited remapping. I choose based on workload variance, state locality, and hotspot risk.

21. How would you configure a reverse proxy for large uploads?

**Deep explanation:** Set explicit body-size, header, request, and upstream timeouts large enough for the supported upload, and decide whether to buffer to disk or stream with backpressure. Streaming reduces proxy storage but holds upstream resources longer; buffering shields the application but needs disk capacity and cleanup. For very large objects, direct authenticated uploads to object storage often scale best.

**Interview answer:** I set intentional size and timeout limits, stream with backpressure or provision safe disk buffering, and enforce authentication and quotas. At large scale I prefer presigned direct-to-object-storage uploads so application and proxy resources are not held for the full transfer.

22. How would you trust forwarded client IP addresses safely?

**Deep explanation:** Headers such as `X-Forwarded-For` are user-controlled unless a trusted proxy removes or overwrites inbound values. Configure the application with an exact allowlist of trusted proxy hops and extract the client address according to the known chain, often from right to left. At an internet-facing edge, sanitize the header and append a value derived from the actual source connection.

**Interview answer:** I never trust forwarded-IP headers from arbitrary clients. The edge proxy overwrites or sanitizes them, and the application trusts only known proxy addresses and parses the expected hop count.

23. How would you reconnect a WebSocket client without losing messages?

**Deep explanation:** A WebSocket connection alone provides no durable replay after disconnection. Give messages ordered IDs, persist them until acknowledged, and have the reconnecting client send its last processed ID so the server can replay the gap or supply a snapshot. Use exponential backoff with jitter and make handlers idempotent because retries can create duplicates.

**Interview answer:** I add application-level sequence IDs, acknowledgments, and a replay buffer or durable log. On reconnect with jittered backoff, the client supplies its last processed ID, and duplicate delivery is handled idempotently.

24. How would you handle heartbeats and idle timeouts for long-lived connections?

**Deep explanation:** Send protocol-level ping/pong or lightweight application heartbeats often enough to detect dead peers and keep NAT and proxy state alive, but not so often that they create meaningful load. Set the heartbeat interval below the shortest idle timeout in the path and close only after a reasonable number of missed responses. Add jitter to avoid synchronized heartbeat bursts.

**Interview answer:** I inventory idle timeouts across clients, proxies, NATs, and servers, then send jittered heartbeats below the shortest limit. I declare a connection dead only after missed responses and reconnect with backoff.

25. How would you choose between WebSockets and server-sent events?

**Deep explanation:** WebSockets provide full-duplex binary or text messaging and fit interactive applications, but need custom reconnection, scaling, and sometimes proxy handling. SSE is one-way server-to-browser text over ordinary HTTP, includes event IDs and automatic reconnection, and is simpler for feeds or notifications. SSE is unsuitable when the server needs frequent client messages or binary frames on the same channel.

**Interview answer:** I use SSE for simple server-to-browser text streams such as notifications, especially when built-in reconnection helps. I use WebSockets for low-latency bidirectional or binary communication, accepting the extra lifecycle and scaling complexity.

26. How do unary, client-streaming, server-streaming, and bidirectional gRPC calls differ?

**Deep explanation:** Unary RPC has one request and one response. Client-streaming sends many client messages followed by one server response; server-streaming reverses that shape. Bidirectional streaming lets both sides independently send ordered message streams, enabling interactive flows but requiring more careful backpressure, cancellation, and state handling.

**Interview answer:** Unary is one request and one response; client-streaming is many requests to one response; server-streaming is one request to many responses; bidirectional streaming allows both sides to send independently. Streaming adds lifecycle, flow-control, and cancellation concerns.

27. How would you propagate deadlines across RPC calls?

**Deep explanation:** Carry the caller's absolute deadline or remaining time through every downstream call, subtracting time already spent and reserving cleanup or response budget. Each service should cancel downstream work when its context ends rather than letting orphaned operations continue. Retries and hedges must share the original deadline, not reset it.

**Interview answer:** I propagate a request context containing the remaining deadline, shorten downstream timeouts to fit it, and cancel child work when the parent is canceled. Retries consume the same end-to-end budget rather than starting a new clock.

28. How would you debug a CORS preflight failure?

**Deep explanation:** Inspect the browser's `OPTIONS` request and response: origin, requested method, requested headers, status, redirects, and `Access-Control-Allow-*` headers. Ensure the server or gateway handles `OPTIONS` without application authentication blocking it and returns an exact allowed origin when credentials are used. CORS is browser enforcement, so reproducing the request with `curl` does not by itself prove the browser will accept it.

**Interview answer:** I inspect the preflight in browser dev tools and compare its requested origin, method, and headers with the server's allow response. I also check that proxies route `OPTIONS`, credentials are compatible with the allowed origin, and no redirect or auth middleware breaks the preflight.

29. How do origin, site, and registrable domain differ for browser security?

**Deep explanation:** An origin is the tuple of scheme, host, and port, so `https://a.example.com` and `https://b.example.com` are different origins. A site is based on scheme plus the registrable domain, so those HTTPS subdomains are usually same-site. The registrable domain is the public-suffix-aware domain a user can register, such as `example.co.uk`, and is not reliably found by taking the last two labels.

**Interview answer:** Origin is scheme, host, and port and drives same-origin policy. Site groups scheme with the registrable domain for features such as SameSite cookies; the registrable domain is determined using the public suffix list, not simple string splitting.

30. How would you use HTTP conditional requests to reduce transferred data?

**Deep explanation:** Return validators such as a strong or weak `ETag` or `Last-Modified`, then let clients send `If-None-Match` or `If-Modified-Since`. If the selected representation is unchanged, respond `304 Not Modified` without the body. Preconditions such as `If-Match` can also prevent lost updates by rejecting a write when the resource changed.

**Interview answer:** I return an `ETag` and cache metadata, then honor `If-None-Match` with a bodyless `304` when content is unchanged. For safe concurrent writes I can require `If-Match` and reject stale updates.

31. How would you support range requests for media or downloads?

**Deep explanation:** Advertise byte-range support and parse `Range`, returning `206 Partial Content` with a correct `Content-Range` and length, or `416` for an unsatisfiable range. Validators and `If-Range` prevent combining chunks from different resource versions. Limit the number and complexity of ranges to avoid abusive multipart responses, and ensure storage can seek efficiently.

**Interview answer:** I implement byte ranges with `206`, accurate `Content-Range`, and `416` for invalid bounds, while supporting `If-Range` against a stable validator. I cap multipart ranges and stream from seekable storage.

32. How do DNS routing, anycast, and CDN routing affect regional traffic?

**Deep explanation:** DNS routing returns different endpoints based on resolver location, health, or policy, but caching and resolver location make it approximate. Anycast advertises the same IP from many sites and BGP routes users to a topologically nearby site, though paths can change. CDNs combine techniques such as anycast, DNS, and application steering, then serve cached content or proxy to an origin.

**Interview answer:** DNS steers clients by returning region-specific addresses but is cache-dependent; anycast lets BGP route one IP to a nearby advertised site; CDNs combine these with edge caching and origin selection. None guarantees geographic proximity, so I measure actual latency and failover behavior.

33. How would you investigate an MTU or packet-fragmentation issue?

**Deep explanation:** Suspect path-MTU trouble when small requests work but larger transfers stall, especially through tunnels or VPNs. Test progressively sized packets with the don't-fragment flag, inspect packet captures and ICMP "packet too big" messages, and compare interface and tunnel MTUs. Fix blocked path-MTU discovery, reduce tunnel MTU, or clamp TCP MSS rather than relying on fragmentation.

**Interview answer:** I compare small and large traffic, probe packet sizes with DF set, and capture ICMP and retransmissions along the path. I then correct the MTU or PMTUD path, or clamp MSS at the tunnel boundary when necessary.

34. How would you distinguish server processing time from network delay?

**Deep explanation:** Measure timestamps at multiple boundaries: client DNS/connect/TLS/time-to-first-byte, proxy arrival and upstream timing, and server queue and handler duration. Distributed tracing with synchronized clocks exposes where time is spent, while packet captures can confirm handshake and transit delays. A high time-to-first-byte with low application duration often indicates queuing, proxying, or network delay outside the handler.

**Interview answer:** I break latency into DNS, connect, TLS, request upload, server queue/processing, first byte, and download using client timings, proxy metrics, and distributed traces. Correlated request IDs and synchronized clocks let me locate the missing time.

35. How would you debug a request that succeeds directly but fails through a proxy?

**Deep explanation:** Compare the exact direct and proxied requests, including method, scheme, host, path rewriting, headers, body size, protocol version, and timeout. Inspect proxy access/error logs and upstream logs with a shared request ID, then check TLS validation, SNI, forwarded headers, buffering, and response limits. A minimal reproducible request helps isolate proxy transformation from backend behavior.

**Interview answer:** I diff the wire-visible request and response on both paths and correlate proxy and upstream logs. Common causes are host or path rewriting, TLS/SNI mismatch, size or timeout limits, buffering, and incorrectly trusted forwarded headers.

36. How do ARP and IPv6 neighbor discovery support local delivery?

**Deep explanation:** IPv4 ARP maps a local next-hop IP address to a link-layer address using broadcast requests and cached replies. IPv6 Neighbor Discovery uses ICMPv6 multicast for address resolution and also supports router discovery, reachability checks, and address autoconfiguration. Both allow a host to deliver a frame to a same-link destination or its next-hop router.

**Interview answer:** ARP resolves IPv4 next-hop addresses to MAC addresses on a local link. IPv6 Neighbor Discovery provides the equivalent resolution via ICMPv6 multicast and additionally handles routers, reachability, and autoconfiguration.

37. How do CIDR prefixes determine address ranges and routing decisions?

**Deep explanation:** A CIDR prefix such as `192.0.2.0/24` fixes the first 24 bits as the network portion, leaving 8 bits for addresses in that block. Routers compare destination bits against prefixes in their tables. Longer prefixes describe smaller, more specific ranges and therefore take precedence over broader matches.

**Interview answer:** The slash length says how many leading address bits identify the network; the remaining bits span the block. Routers match destinations against those prefixes and select the most specific matching route.

38. How would you explain longest-prefix matching in an IP routing table?

**Deep explanation:** A destination may match several routes, such as a default route `/0`, a corporate `/8`, and a subnet `/24`. The router chooses the matching route with the greatest prefix length because it describes the narrowest address range. Administrative distance or route metrics normally break ties among routes with the same prefix length, not between differently sized matches.

**Interview answer:** The router selects the route whose matching prefix has the most leading bits, so a `/24` beats a matching `/8`, which beats `/0`. Metrics matter only after prefix specificity has been considered.

39. How do DHCP and static address configuration differ?

**Deep explanation:** DHCP leases addresses and related settings such as gateway, DNS, and lease time from a central service, simplifying changes and avoiding manual conflicts. Static configuration fixes those values on the host, offering predictability but increasing operational overhead and drift risk. Infrastructure often uses DHCP reservations to combine centralized management with stable addresses.

**Interview answer:** DHCP centrally and dynamically leases network configuration, while static configuration is manually fixed per host. For stable infrastructure addresses I often prefer DHCP reservations because they keep consistency and centralized control.

40. How do TCP connection teardown and TIME_WAIT affect busy servers?

**Deep explanation:** Graceful teardown exchanges FIN and ACK segments so both directions close independently; an RST aborts immediately. The active closer enters `TIME_WAIT` long enough to absorb delayed packets and allow retransmission of the final ACK, temporarily retaining the connection tuple. High churn can therefore consume ports or connection-table capacity, so pooling, keep-alive, and thoughtful ownership of active close matter.

**Interview answer:** TCP normally closes each direction with FIN/ACK, and the active closer enters `TIME_WAIT` to prevent old packets contaminating a new connection and to handle a lost final ACK. On busy systems I reduce churn with connection reuse and monitor port and state-table pressure.
