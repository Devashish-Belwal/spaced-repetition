1. What should you clarify before drawing classes in an LLD interview?

**Deep explanation:** Clarify actors, core use cases, scope, business rules, scale, persistence, and failure cases. Separate required features from possible extensions so the design solves the intended problem rather than assumptions.

**Interview answer:** “I first confirm the actors, workflows, rules, constraints, and out-of-scope features, then validate them with one representative use case.”

2. How would you distinguish functional requirements from design constraints?

**Deep explanation:** Functional requirements describe observable behavior, such as borrowing a book. Constraints restrict delivery, such as thread safety, latency, storage, or extensibility. Keeping them separate prevents technical preferences from becoming invented user needs.

**Interview answer:** “Functional requirements say what the system does; constraints define the boundaries within which it must do it. I list both before designing.”

3. How would you identify entities from a short problem statement?

**Deep explanation:** Start from nouns, but retain concepts with identity, state, behavior, or lifecycle; use verbs to discover responsibilities and relationships. Not every noun is a class—some are value objects, attributes, services, or transient inputs.

**Interview answer:** “I extract nouns and verbs, then classify concepts as entities, value objects, services, or inputs based on identity, state, and behavior.”

4. How would you represent inheritance, composition, and associations in a class diagram?

**Deep explanation:** Inheritance is an “is-a” generalization, composition means the part’s lifecycle is owned by the whole, and an association is a looser reference. Add multiplicities and direction only where they communicate meaningful constraints.

**Interview answer:** “I use inheritance for true substitutability, composition for owned lifecycle, and associations for references, labeling cardinality and ownership.”

5. How would you choose method names, inputs, return values, and errors?

**Deep explanation:** Use domain verbs, accept the smallest complete typed input, and return an explicit outcome. Expected business failures should carry meaningful reasons through result types or domain exceptions; invariant violations should fail fast. Avoid booleans when callers need diagnostic detail.

**Interview answer:** “I choose domain-oriented names, narrow inputs, and explicit results. Expected errors are modeled; programmer errors fail fast.”

6. How would you keep business rules separate from input and output code?

**Deep explanation:** Put invariants in domain objects or services, orchestration in application services, and parsing/rendering in adapters such as controllers. This keeps rules reusable across HTTP, UI, and tests without framework coupling.

**Interview answer:** “Adapters translate I/O, application services coordinate use cases, and the domain enforces rules. Dependencies point inward.”

7. How would you identify invalid states in a proposed class design?

**Deep explanation:** List object invariants and legal lifecycle transitions, then find field combinations that should never coexist. Use constructors, factories, enums, and guarded methods to make those combinations difficult or impossible to create.

**Interview answer:** “I enumerate invariants and transitions, find contradictory states, and redesign construction and methods so invalid states cannot be represented.”

8. How would you demonstrate a design using one successful operation?

**Deep explanation:** Trace a core happy path end to end: caller, collaborating objects, validations, state changes, and result. A sequence diagram or pseudocode walk-through often exposes missing responsibilities and excessive coupling.

**Interview answer:** “I walk through one core use case message by message, showing validation, state mutation, and output to prove the model collaborates.”

9. How would you design parking spots, vehicles, tickets, and parking floors?

**Deep explanation:** Vehicle has a type and registration; ParkingSpot has an ID, supported type, and occupancy; ParkingFloor owns spots; ParkingTicket records vehicle, spot, entry time, and status. ParkingLot coordinates entry and exit while each object protects its state.

**Interview answer:** “I model Vehicle, typed ParkingSpot, ParkingFloor, and ParkingTicket, with ParkingLot coordinating allocation and release.”

10. How would a parking-lot design choose an available spot for a vehicle?

**Deep explanation:** A SpotAssignmentStrategy filters compatible, available spots and returns a candidate; implementations might choose first available or nearest. Selection stays replaceable, but reservation must atomically recheck and claim the spot under concurrency.

**Interview answer:** “I inject a spot-assignment strategy, choose a compatible candidate, then atomically reserve it before issuing the ticket.”

11. How would you represent elevator floors, requests, doors, and movement states?

**Deep explanation:** Elevator tracks current floor, direction, door state, and operating state. Requests distinguish hall calls from internal destinations, while a controller queues them. Explicit states prevent contradictions such as MOVING with OPEN doors.

**Interview answer:** “I separate Elevator, Door, Request, and Controller, using explicit direction, door, and motion states to describe the lifecycle.”

12. How would you prevent an elevator from moving with open doors?

**Deep explanation:** Enforce the invariant inside Elevator: moving requires CLOSED doors, and opening requires the car to be stopped at a floor. A hardware interlock can add safety, but the object must reject illegal transitions itself.

**Interview answer:** “`move` is guarded by CLOSED doors and `openDoor` by a stopped state. The invariant lives in Elevator, not only its controller.”

13. How would you model products, inventory, payments, and change in a vending machine?

**Deep explanation:** Product contains identity and price; Inventory maps slots to products and quantities; a payment component accepts denominations and calculates change. VendingMachine coordinates selection, payment, dispense, and cancellation through explicit states.

**Interview answer:** “I separate product metadata, slot inventory, and cash handling, then coordinate them with a vending-machine state machine.”

14. How would a vending machine recover when the selected product is unavailable?

**Deep explanation:** Recheck inventory immediately before dispensing. If unavailable, keep stock unchanged, clear the selection, and either refund all money or allow reselection according to requirements. Never decrement inventory before dispense can proceed.

**Interview answer:** “I validate stock again before dispense; on failure I safely reset and refund or allow reselection without changing inventory.”

15. How would you model library books, physical copies, members, and loans?

**Deep explanation:** Book represents shared bibliographic data; BookCopy is a uniquely barcoded physical item with status. Loan links one Member to one copy and owns checkout, due, and return dates, supporting many copies of one title.

**Interview answer:** “Book is title metadata, BookCopy is the lendable item, and Loan connects one copy to one member with due-date state.”

16. How would you prevent one library copy from being borrowed twice?

**Deep explanation:** Checkout atomically transitions BookCopy from AVAILABLE to LOANED while creating the loan. With persistence, use a transaction, conditional update, or unique active-loan constraint so concurrent requests cannot both succeed.

**Interview answer:** “I atomically change AVAILABLE to LOANED and enforce at most one active loan per copy, backed by a database constraint.”

17. How would you model users, expenses, groups, and shares in Splitwise?

**Deep explanation:** User has identity; Group contains members; Expense records payer, total, and Shares; each Share assigns an owed amount to one user. A ledger derives balances rather than storing several independently mutable totals.

**Interview answer:** “Expense is the source of truth—payer, amount, group, and participant shares—and a ledger derives balances.”

18. How would you validate that an expense's shares sum to its total?

**Deep explanation:** Sum exact Money values during Expense construction and reject negative shares, unknown participants, mixed currencies, or a mismatch after the defined rounding policy. Reapply the invariant whenever shares change.

**Interview answer:** “The Expense factory requires exact share totals to equal the expense total under one explicit rounding policy.”

19. How would you model cinemas, shows, seats, and bookings?

**Deep explanation:** Cinema owns auditoriums; an auditorium defines physical seats; Show schedules a movie in an auditorium; Booking references selected show-specific seats and has pending, confirmed, or cancelled status. Capture price at booking time when history matters.

**Interview answer:** “I separate physical Seat from per-show seat inventory, and Booking groups selected seats for one Show with explicit status.”

20. How would you distinguish a seat definition from its availability for a show?

**Deep explanation:** Seat holds stable layout data such as row, number, and category. ShowSeat associates that seat with one show and stores price and reservation state, so booking one performance does not block every performance.

**Interview answer:** “Seat describes physical layout; ShowSeat holds per-show availability and price.”

21. How would you represent a chess board, pieces, players, and moves?

**Deep explanation:** Board maps positions to Pieces; Piece owns color and movement behavior; Player owns a color; Move records source, destination, moved piece, capture, and special metadata. Game manages turns and outcome.

**Interview answer:** “Board owns placement, pieces generate movement, Move captures a transition, and Game manages players, turns, and status.”

22. How would you separate chess move generation from move validation?

**Deep explanation:** Piece code generates pseudo-legal moves from geometry and occupancy. A game-level validator applies global rules, especially whether the move leaves the king in check. This avoids teaching every piece every game rule.

**Interview answer:** “Pieces generate candidates; a validator filters them using board-wide legality and king-safety rules.”

23. How would you represent snakes, ladders, dice, players, and turns?

**Deep explanation:** Board maps jump starts to snake or ladder destinations; Die provides rolls; Player stores position; Game owns turn order, applies movement and jumps, and detects the winner. Turn progression should not live in Player.

**Interview answer:** “Board models jumps, Die produces movement, Player stores position, and Game controls turns and winning.”

24. How would you make dice behavior testable?

**Deep explanation:** Depend on a Die or random-source interface rather than creating randomness inside Game. Production uses randomness; tests inject a fake returning a known sequence, making boundary and winning scenarios deterministic.

**Interview answer:** “I inject a Die interface and use predetermined rolls in tests.”

25. How would you model log levels, messages, formatters, and destinations?

**Deep explanation:** LogEvent holds timestamp, level, message, and structured context. Logger filters by level, Formatter serializes the event, and Appender writes to console, file, or another destination. Multiple appenders may format the same immutable event differently.

**Interview answer:** “I separate immutable LogEvent data, Logger filtering, interchangeable Formatters, and destination-specific Appenders.”

26. How would you support email and SMS through one notification interface?

**Deep explanation:** Define a NotificationSender contract returning a delivery result, with EmailSender and SmsSender adapters translating to providers. Keep strongly different channel fields in channel-specific payloads instead of one object full of nullable properties.

**Interview answer:** “I expose a sender contract and implement email and SMS adapters, each owning its validation and provider mapping.”

27. How would you define a rate limiter's public methods and decision result?

**Deep explanation:** Use `check(key, cost)` returning allowed, remaining quota, and retry-after or reset time. Key scopes the subject and cost supports weighted operations. Metadata lets callers respond correctly without exposing counters or algorithms.

**Interview answer:** “I return a RateLimitDecision containing allowed, remaining, and retry timing while hiding the algorithm.”

28. How would you define a cache API for get, put, delete, and expiration?

**Deep explanation:** Provide typed `get(key)` with an explicit miss, `put(key, value, ttl)`, and `delete(key)`. Specify when TTL begins, what zero means, and how cached null differs from a miss; otherwise callers depend on ambiguous behavior.

**Interview answer:** “The cache has typed get, put with optional TTL, and delete, with explicit miss and expiration semantics.”

29. How would you model files, directories, and path lookup?

**Deep explanation:** Node contains name, parent, and metadata; File stores content; Directory owns named child nodes. PathResolver normalizes and walks segments while handling root, `.`, `..`, missing nodes, and attempts to traverse through a file.

**Interview answer:** “File and Directory share Node, Directory owns children, and a separate resolver normalizes and traverses paths.”

30. How would you model cart items, quantities, prices, and totals?

**Deep explanation:** Cart contains CartItems keyed by SKU; each has positive quantity and an exact Money unit-price snapshot. Item subtotal is quantity times price and Cart sums subtotals in one currency. Price refresh should be explicit, not silently mutate history.

**Interview answer:** “CartItem combines SKU, positive quantity, and Money price; Cart aggregates items and computes totals with a clear price-snapshot policy.”
