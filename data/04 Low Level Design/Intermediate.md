1. How would you add pricing rules and lost-ticket handling to a parking lot?

**Deep explanation:** Put fee calculation behind a PricingStrategy using entry time, exit time, vehicle type, and rate policy. Represent a lost ticket explicitly and route it through a configurable LostTicketPolicy, preserving an audit record instead of fabricating an entry time.

**Interview answer:** “I separate normal pricing and lost-ticket policy behind interfaces, snapshot the applied rule on payment, and audit both outcomes.”

2. How would you prevent concurrent parking requests from reserving the same spot?

**Deep explanation:** Allocation needs an atomic compare-and-set from AVAILABLE to RESERVED, implemented with a row lock, conditional update, or version field. If the candidate loses the race, retry selection; a process-local lock is insufficient across instances.

**Interview answer:** “I conditionally update the spot’s state or version in one transaction and retry allocation when another request wins.”

3. How would you support different elevator scheduling strategies?

**Deep explanation:** Define a SchedulingStrategy that receives elevator state and pending requests and produces the next assignment. Strategies such as nearest-car or SCAN can be injected into the controller and tested against identical scenarios without changing Elevator.

**Interview answer:** “The controller delegates assignment to an injected scheduling strategy; elevators expose state but remain independent of the scheduling algorithm.”

4. How would you handle simultaneous floor requests and emergency stops?

**Deep explanation:** Serialize controller events or protect shared queues, deduplicate equivalent requests, and give emergency events absolute priority. Emergency transition stops motion safely, opens doors only when appropriate, and preserves or cancels pending work according to policy.

**Interview answer:** “I process requests through a thread-safe event queue, with emergency stop as a highest-priority state transition that overrides scheduling.”

5. How would you model refunds after a vending machine accepts insufficient payment?

**Deep explanation:** Track inserted denominations as a transaction-owned collection, not only a total. Cancellation requests a refund from CashInventory; if exact refund is impossible, expose a clear failure or out-of-service state rather than losing money silently.

**Interview answer:** “The transaction records exact inserted coins, and cancellation returns them or an equivalent exact amount through the cash handler.”

6. How would you add product restocking without duplicating vending logic?

**Deep explanation:** Inventory owns slot quantities and exposes authorized restock operations with capacity and product checks. Customer vending and operator restocking are separate application services sharing the same Inventory invariants, so neither duplicates stock mutation rules.

**Interview answer:** “I centralize quantity rules in Inventory and give restocking its own operator use case that calls those operations.”

7. How would you implement library reservations and late-return fines?

**Deep explanation:** Reservation is a queued request for a title or copy with status and expiry. Return processing closes the Loan, calculates a Fine through a policy based on due date and member type, and offers the copy to the next reservation atomically.

**Interview answer:** “I model reservations as an ordered lifecycle and calculate fines through a policy when a loan closes.”

8. How would you support lending limits that differ by membership type?

**Deep explanation:** A LendingPolicy maps membership type to limits such as active loans, loan duration, and renewals. Checkout asks the policy and current member state; policies are data or interchangeable objects rather than conditionals scattered through Member and Loan.

**Interview answer:** “Checkout delegates eligibility and duration to a membership-specific LendingPolicy, keeping limits configurable and centralized.”

9. How would you support exact, equal, and percentage expense splits?

**Deep explanation:** Use a SplitStrategy for each mode. Exact validates explicit amounts; equal divides in minor units and distributes remainders deterministically; percentage validates 100% and applies a defined rounding rule. All strategies produce exact Shares totaling the Expense.

**Interview answer:** “Each split type is a strategy that produces Money shares; the Expense invariant verifies the final sum exactly.”

10. How would you settle balances without losing monetary precision?

**Deep explanation:** Represent money as integer minor units or decimal with fixed scale, never binary floating point. Settlement records immutable Money transfers in a currency and applies them transactionally; conversion requires an explicit rate and rounding policy.

**Interview answer:** “I use exact minor units or fixed decimals, one currency per balance, and transactional settlement entries.”

11. How would you implement temporary seat holds with expiration?

**Deep explanation:** A hold has owner token, seat, and expiry. Create it with an atomic available-to-held transition, and allow confirm only for the same owner before expiry. Treat expired holds as available during reads and clean them asynchronously for efficiency.

**Interview answer:** “I atomically create owner-bound holds with expiry and use a conditional transition from HELD to BOOKED.”

12. How would you coordinate booking, payment, cancellation, and refund states?

**Deep explanation:** Model an explicit booking state machine and make each command idempotent. Persist state transitions and external payment references; compensating actions refund successful payments when booking fails, rather than pretending all steps share one database transaction.

**Interview answer:** “I use explicit states, idempotent commands, and compensation: reserve, pay, confirm, or refund on failure.”

13. How would you model castling, en passant, and pawn promotion?

**Deep explanation:** Represent them as specialized Move variants carrying required metadata. Their validators inspect board history, king safety, and piece state; applying and undoing a move uses the captured metadata so special behavior does not leak into every piece.

**Interview answer:** “Special moves are typed Move variants with dedicated validation and reversible application metadata.”

14. How would you implement chess move history and undo?

**Deep explanation:** Store an immutable MoveRecord containing enough prior state to reverse captures, castling rights, en-passant targets, promotion, clocks, and turn. Undo pops a record and restores state; recomputing prior state is fragile and slower.

**Interview answer:** “Every applied move creates a complete reversible record; undo restores the snapshot delta and previous turn.”

15. How would you support configurable snake-and-ladder board rules?

**Deep explanation:** Build Board from configuration and validate bounds, overlapping transitions, and cycles according to policy. Inject rules for exact finish, extra turns, or chained jumps into Game so alternate boards do not require subclass explosions.

**Interview answer:** “I load a validated board configuration and inject movement and turn-rule policies into Game.”

16. How would you add deterministic replay to a turn-based game?

**Deep explanation:** Record initial configuration plus every accepted command and random outcome in order. Replaying against the same rules reconstructs state; version the event schema and optionally persist state hashes to detect divergence.

**Interview answer:** “I persist an ordered event log including random results, then replay it from a versioned initial state.”

17. How would you add asynchronous logging with bounded buffering?

**Deep explanation:** Producers enqueue immutable events into a bounded thread-safe queue and a worker drains them to appenders. Define overflow behavior—block, drop, sample, or synchronous fallback—and expose dropped-event metrics; shutdown must flush with a deadline.

**Interview answer:** “I use a bounded queue and worker, with an explicit backpressure policy, drop metrics, and graceful timed flush.”

18. How would you add log rotation without changing callers?

**Deep explanation:** Rotation belongs inside a FileAppender or rolling-file policy based on size or time. The appender atomically closes, renames, and reopens files and applies retention, while callers continue using the Logger interface.

**Interview answer:** “A rolling FileAppender encapsulates rotation and retention, so the logging API and callers remain unchanged.”

19. How would you add notification templates, preferences, and delivery retries?

**Deep explanation:** Resolve user preferences and channel first, render a versioned template with validated data, then create a Delivery job. Retry transient provider failures with backoff and a limit; permanent failures stop immediately, and attempts are recorded.

**Interview answer:** “I separate preference resolution, template rendering, and delivery jobs, retrying only classified transient failures.”

20. How would you prevent duplicate notifications during retries?

**Deep explanation:** Assign a stable idempotency key to the logical notification and persist a unique delivery record before calling the provider. Retries reuse the key and state; provider idempotency keys add protection when available.

**Interview answer:** “Every logical notification has a persisted unique idempotency key reused across all attempts.”

21. How would you implement token-bucket and sliding-window rate-limiter classes?

**Deep explanation:** Both implement one RateLimiter contract. Token bucket refills tokens by elapsed time and permits bursts; sliding window counts timestamps or time buckets inside the window for stricter limits, trading memory and update cost for accuracy.

**Interview answer:** “I hide both algorithms behind one decision API: token bucket supports controlled bursts, while sliding window gives tighter rolling enforcement.”

22. How would you inject time into a rate limiter for deterministic testing?

**Deep explanation:** Depend on a Clock returning monotonic instants rather than reading system time directly. Tests advance a FakeClock explicitly, eliminating sleeps and making boundary, refill, and expiry behavior reproducible.

**Interview answer:** “I inject a monotonic Clock and use a manually advanced fake in tests.”

23. How would you implement LRU eviction and TTL expiration together?

**Deep explanation:** Use a hash map for lookup and a doubly linked list for O(1) recency updates. Store expiry per entry and lazily remove expired entries on access, optionally adding a cleanup heap or worker. Expired entries never count as hits.

**Interview answer:** “Map plus linked list gives O(1) LRU operations; TTL is checked on access and optionally cleaned in the background.”

24. How would you support multiple cache storage implementations?

**Deep explanation:** Define a typed CacheStore contract for read, write, delete, and atomic operations actually required. Implement in-memory and remote adapters, while eviction or serialization capabilities are explicit so the abstraction does not promise semantics every backend lacks.

**Interview answer:** “Callers depend on a small cache contract, with backend adapters and explicit capability differences.”

25. How would you implement file-system permissions and symbolic links?

**Deep explanation:** Store owner, group, and permission bits in node metadata and evaluate access for each traversal and operation. A symbolic link stores a target path; resolution follows it with a maximum depth and preserves whether permissions apply to the link or target.

**Interview answer:** “Nodes carry permission metadata, and path resolution checks access while following symlinks with a depth limit.”

26. How would you prevent cycles while traversing a file-system abstraction?

**Deep explanation:** Track visited stable node IDs, not paths, because symbolic links can give one node many paths. Stop with a cycle error when an ID repeats and also enforce a maximum symlink depth to bound malicious chains.

**Interview answer:** “Traversal maintains a visited-node set and a symlink-depth limit, returning a cycle error on repetition.”

27. How would you implement cart coupons that cannot be combined arbitrarily?

**Deep explanation:** Coupon carries eligibility and stacking metadata; a PromotionEngine validates the whole selected set before pricing. Encode exclusive groups, priorities, and incompatibilities as rules, and return explanations so rejected combinations are understandable.

**Interview answer:** “A promotion engine validates coupon eligibility and stacking constraints as a set, then applies them in deterministic order.”

28. How would you handle cart prices changing before checkout?

**Deep explanation:** Cart prices are estimates; checkout requests a fresh authoritative quote with an expiry and shows differences before confirmation. The resulting order snapshots item prices, discounts, tax, and rule versions so later changes do not rewrite history.

**Interview answer:** “I reprice into a short-lived checkout quote, require acceptance of changes, and snapshot the final breakdown on the order.”

29. How would you design a pluggable payment-provider interface?

**Deep explanation:** Expose domain operations such as authorize, capture, refund, and query, using Money, stable idempotency keys, and normalized results. Provider adapters translate credentials, errors, and webhook payloads without leaking vendor types into checkout.

**Interview answer:** “I define a provider-neutral payment gateway and isolate each vendor in an adapter with normalized errors and idempotency.”

30. How would you design a scheduler with recurring jobs and cancellation?

**Deep explanation:** Job stores a command reference, schedule, next-run time, status, and version. A scheduler claims due jobs, executes them, and computes the next occurrence; cancellation is a state transition checked before claim and execution. Define misfire behavior explicitly.

**Interview answer:** “Persist jobs and schedules, atomically claim due runs, compute recurrence after execution, and make cancellation and misfire policy explicit.”

31. How would you design a configurable validation pipeline?

**Deep explanation:** Validators share a contract and return structured violations. Pipeline configuration controls order, conditions, and fail-fast versus collect-all behavior; validators remain stateless when possible and avoid mutating the object being validated.

**Interview answer:** “I compose ordered validators returning structured errors, with configurable conditional and fail-fast behavior.”

32. How would you design an in-memory pub/sub library?

**Deep explanation:** A Broker maps topics to thread-safe subscription sets and publishes immutable messages. Subscription returns a handle for unsubscribe; dispatch can be synchronous or use bounded per-subscriber queues, whose ordering, backpressure, and exception semantics must be documented.

**Interview answer:** “A broker owns topic subscriptions and dispatch policy, while subscription handles support safe unsubscribe and bounded delivery.”

33. How would you design a text editor with undo and redo?

**Deep explanation:** Represent edits as Commands with apply and undo, or as reversible document operations. Successful edits push onto undo and clear redo; undo moves a command to redo. Coalesce adjacent typing commands to avoid excessive history.

**Interview answer:** “I store reversible edit commands in undo and redo stacks and coalesce compatible typing operations.”

34. How would you design a reusable connection pool?

**Deep explanation:** The pool creates up to a limit, leases with timeout, validates on borrow or return, and replaces broken connections. A lease object ensures one return and supports try-with-resources; shutdown rejects new borrows and closes idle and returned resources.

**Interview answer:** “I expose scoped leases, bounded timed acquisition, health validation, broken-resource replacement, and graceful shutdown.”

35. How would you design a meeting-room booking service with conflict checks?

**Deep explanation:** Booking owns a half-open time interval `[start,end)` and room. Conflict means overlapping intervals for the same room; enforce it transactionally with an exclusion constraint, lock, or serializable check. Half-open ranges allow back-to-back meetings.

**Interview answer:** “I use half-open intervals and atomically enforce no overlap per room, ideally with a database constraint.”

36. How would you design ATM classes for card validation, withdrawal, balance checks, and cash dispensing?

**Deep explanation:** ATMSession authenticates Card through a BankGateway; transaction commands handle balance and withdrawal; CashDispenser plans and confirms denominations from CashInventory. A state machine controls card inserted, authenticated, processing, dispensing, and ejecting states.

**Interview answer:** “I separate session/authentication, bank transactions, and cash dispensing, coordinated by an ATM state machine.”

37. How would you model a restaurant order with menu variants, taxes, and kitchen status?

**Deep explanation:** OrderItem snapshots a menu item, chosen modifiers, quantity, and price. Pricing calculates modifiers and jurisdictional tax; kitchen tickets can track preparation status separately from payment status. The accepted order remains historical even when the menu changes.

**Interview answer:** “Order items snapshot variants and prices; pricing handles tax, and kitchen fulfillment has a separate explicit lifecycle.”

38. How would you design a hotel-booking object model with rooms, date ranges, and cancellations?

**Deep explanation:** RoomType describes sellable characteristics; Room is physical inventory; Reservation covers a half-open stay interval and lifecycle. Availability checks overlapping active reservations, while CancellationPolicy calculates deadlines and fees from the snapshotted booking terms.

**Interview answer:** “Reservations use half-open date ranges, explicit status, transactional availability checks, and a snapshotted cancellation policy.”

39. How would you design a deck of cards supporting several games and deterministic shuffling tests?

**Deep explanation:** Card and Deck are game-neutral; a GameRules component defines deck construction, dealing, ranking, and legal play. Shuffle accepts a Random source or strategy, allowing a seeded generator or fixed permutation in tests.

**Interview answer:** “I keep cards and deck generic, inject game rules, and inject randomness for deterministic shuffle tests.”

40. How would you design a package-delivery locker with size constraints, pickup codes, and expiration?

**Deep explanation:** Locker has size and availability; Package has required size; AllocationStrategy chooses the smallest fitting locker. Delivery creates a hashed, expiring pickup credential, and pickup atomically validates it and opens the locker; expiry triggers return workflow.

**Interview answer:** “I atomically allocate the smallest fitting locker, issue a secure expiring code, and transition pickup or expiry exactly once.”
