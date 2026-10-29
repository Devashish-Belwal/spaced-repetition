1. How would you identify a violation of the Liskov substitution principle?

**Deep explanation:** Replace the base type with each subtype and check whether callers' valid assumptions still hold: preconditions cannot strengthen, postconditions cannot weaken, and promised behavior cannot disappear. A `ReadOnlyFile` throwing from inherited `write()` exposes a false subtype.

**Interview answer:** I look for a subtype that surprises valid base-type clients by rejecting accepted input, weakening results, or breaking invariants.

2. When does interface segregation improve a design?

**Deep explanation:** It helps when consumers depend on different subsets of a broad interface or implementations need empty/throwing methods. Small role-focused interfaces reduce coupling, but excessive fragmentation makes navigation and wiring harder.

**Interview answer:** I split an interface when clients have distinct needs, so each depends only on capabilities it actually uses.

3. How would you refactor a deep inheritance hierarchy into composition?

**Deep explanation:** Identify independently varying behaviors, extract them behind focused interfaces, inject concrete collaborators, and make the former subclasses configure or delegate to them. Migrate incrementally with characterization tests to preserve behavior.

**Interview answer:** I extract variable behavior into collaborators and replace overrides with delegation, guided by tests.

4. How do abstract factories, factory methods, and builders differ?

**Deep explanation:** An abstract factory creates related families of products; a factory method lets a class or subtype choose one product; a builder assembles a complex object step by step. The choice follows whether variation is family, subtype construction, or construction sequence.

**Interview answer:** Abstract factory creates product families, factory method delegates one creation decision, and builder manages staged complex construction.

5. When would you use an adapter instead of a facade?

**Deep explanation:** Use an adapter when an existing API must conform to a required interface; use a facade when clients need a simpler entry point to a complex subsystem. An adapter changes shape, while a facade changes the level of abstraction.

**Interview answer:** I use an adapter for interface compatibility and a facade to simplify access to a subsystem.

6. How do decorators differ from proxies?

**Deep explanation:** Both wrap the same interface, but a decorator adds composable behavior such as caching or compression, while a proxy controls access such as remote calls, authorization, or lazy loading. Intent is the key distinction.

**Interview answer:** A decorator enriches behavior; a proxy stands in for the real object and controls access to it.

7. How would you choose between the state and strategy patterns?

**Deep explanation:** Strategy represents a selected algorithm, usually chosen externally and independently. State represents internal lifecycle modes whose transitions change behavior; state objects often know allowed transitions.

**Interview answer:** I use strategy for interchangeable algorithms and state for behavior driven by an object's evolving lifecycle.

8. How does the command pattern support undo operations?

**Deep explanation:** A command packages an action and enough information to reverse it, either as an inverse operation or a prior-state snapshot. A history stack invokes `undo`; irreversible side effects require compensation rather than literal reversal.

**Interview answer:** Each command records what its inverse needs, and completed commands are stored so undo can execute that inverse in reverse order.

9. When is the template-method pattern too restrictive?

**Deep explanation:** It becomes restrictive when subclasses need different step order, multiple independent variations, or behavior changes at runtime. Replace inheritance with injected strategies or a pipeline when the algorithm skeleton is not genuinely stable.

**Interview answer:** It is too restrictive when variation exceeds a few hooks or requires runtime composition instead of a fixed inherited sequence.

10. How would you implement an observer without leaking subscribers?

**Deep explanation:** Return a disposable subscription, unsubscribe deterministically, and let the publisher store weak references only when ownership warrants it. Define lifecycle and concurrency semantics; otherwise long-lived publishers retain short-lived listeners.

**Interview answer:** I make subscriptions explicitly disposable and ensure owner teardown unregisters callbacks, with thread-safe delivery where needed.

11. How would you prevent a singleton from hiding mutable global state?

**Deep explanation:** Make the service stateless or immutable, expose it through dependency injection, and scope its lifetime in the composition root. If shared state is required, model it explicitly behind a narrow interface with synchronization and reset-free tests.

**Interview answer:** I avoid global access, inject the dependency, and keep any application-scoped instance stateless or explicitly synchronized.

12. What distinguishes an anemic model from a domain model with behavior?

**Deep explanation:** An anemic model mostly stores data while services contain its rules. A behavioral domain model places operations and invariants with the objects that own them, improving locality, though simple CRUD domains may not justify richer modeling.

**Interview answer:** An anemic model is data plus external procedures; a rich model protects its own invariants through domain behavior.

13. How would you decide which object owns a business rule?

**Deep explanation:** Place the rule with the object or aggregate that has the necessary information and authority to preserve the invariant. If it spans unrelated aggregates without natural ownership, use a domain service and coordinate consistency explicitly.

**Interview answer:** The owner should have the data and authority to enforce the rule; cross-aggregate rules may belong in a domain service.

14. How would you design a class whose valid states depend on multiple fields?

**Deep explanation:** Avoid independent setters; use validated constructors, named factories, and atomic transition methods that update related fields together. For complex cases, represent modes as distinct state types so impossible combinations cannot be expressed.

**Interview answer:** I update related fields atomically through domain operations and, where practical, encode valid combinations in types.

15. How would you stop a partially initialized object from escaping its constructor?

**Deep explanation:** Do not register callbacks, start threads, publish events, or pass `this` to external code during construction. Complete initialization privately, then use a factory to perform registration or startup after construction succeeds.

**Interview answer:** I keep construction side-effect free and publish or register the object only after a factory has fully initialized it.

16. How would you define equality for an entity before it receives a database ID?

**Deep explanation:** Prefer assigning a stable application-generated identity at creation. If that is impossible, unsaved entities should generally compare only by reference; switching from business fields to database ID later can corrupt hash collections.

**Interview answer:** I prefer a stable ID created up front; otherwise transient entities use reference equality until persistence assigns identity.

17. How would you make an object safe to use as a hash-map key?

**Deep explanation:** Implement equality and hashing from the same immutable fields and never mutate those fields while the key is stored. Value objects are natural keys; mutable entities should usually contribute a stable identity only.

**Interview answer:** I base equality and hash code on identical, stable data that cannot change during map membership.

18. When should a method return a new object instead of mutating the receiver?

**Deep explanation:** Return a new object for values, shared data, concurrency, or when callers need the old version. Mutation is reasonable for identity-bearing aggregates whose controlled operations enforce invariants; copying large graphs also has cost.

**Interview answer:** I favor new objects for value semantics and safe sharing, and controlled mutation for entities with meaningful identity and lifecycle.

19. How would you avoid exposing internal collections through an API?

**Deep explanation:** Return an immutable view, snapshot, iterator, or domain-specific query, and accept changes through methods such as `addLine`. A read-only wrapper prevents direct mutation but may still reveal later internal changes, unlike a copy.

**Interview answer:** I expose immutable views or snapshots and route modifications through invariant-preserving domain methods.

20. How do dependency injection and the service-locator pattern affect discoverability?

**Deep explanation:** Constructor injection makes dependencies visible in the type signature and easy to validate or test. A service locator hides requirements behind runtime lookup, producing global coupling and failures that appear later.

**Interview answer:** Injection documents dependencies explicitly; a service locator hides them and shifts errors from construction to runtime.

21. How would you test code that uses a clock, random generator, and network client?

**Deep explanation:** Inject narrow abstractions for time, randomness, and transport. Tests provide a fixed clock, seeded or scripted random source, and fake client, while separate integration tests verify the real adapters.

**Interview answer:** I inject controllable ports, use deterministic fakes in unit tests, and test real infrastructure adapters separately.

22. How would you design interfaces around behavior instead of implementation details?

**Deep explanation:** Name interfaces for consumer goals and domain outcomes rather than storage or framework mechanics. For example, `ReserveInventory` is more stable than an interface exposing SQL-shaped CRUD and table-specific fields.

**Interview answer:** I derive interfaces from what callers need to accomplish, keeping database, framework, and representation choices behind adapters.

23. How would you avoid a circular dependency between services?

**Deep explanation:** Re-examine responsibility and dependency direction, extract a shared policy or mediator, or publish an event when immediate return values are unnecessary. Introducing interfaces on both sides without changing ownership merely hides the cycle.

**Interview answer:** I break the cycle by moving shared responsibility, reversing one dependency, or using events for genuinely asynchronous collaboration.

24. When is a large switch statement clearer than a polymorphic hierarchy?

**Deep explanation:** A switch can be clearer when cases are closed, few, local, and change together, especially for simple data transformations. Polymorphism pays off when behaviors vary independently, new cases are frequent, or branches are duplicated.

**Interview answer:** I keep a switch when variation is small and centralized; I introduce polymorphism when cases grow or behavior spreads.

25. How would you model optional capabilities without empty interface methods?

**Deep explanation:** Split capabilities into focused interfaces and let only supporting types implement them; callers can receive the precise capability or use explicit composition. Empty methods or `NotSupported` exceptions violate substitutability.

**Interview answer:** I represent each optional capability as its own interface and require that interface only where the capability is needed.

26. How would you distinguish a domain service from an application service?

**Deep explanation:** A domain service expresses business logic that does not naturally belong to one entity or value. An application service orchestrates use cases, transactions, authorization, repositories, and external ports while delegating business decisions.

**Interview answer:** Domain services contain stateless domain rules; application services coordinate the workflow and infrastructure around those rules.

27. How would you organize exceptions across a class hierarchy?

**Deep explanation:** Define exceptions by recoverable meaning at abstraction boundaries, not one class per implementation detail. Preserve causes, avoid overly broad catches, and use result types for expected business outcomes when exceptions would obscure control flow.

**Interview answer:** I expose a small semantic exception taxonomy at boundaries and translate low-level failures while preserving their causes.

28. How would you migrate a public constructor without breaking callers?

**Deep explanation:** Add the new constructor or named factory, retain the old signature as a deprecated delegating overload, and migrate callers gradually. Remove it only in a documented major version after telemetry or search confirms adoption.

**Interview answer:** I introduce the replacement additively, delegate from and deprecate the old constructor, then remove it in a breaking release.

29. How would you represent money as a value object?

**Deep explanation:** Store a decimal or integer minor-unit amount plus currency, make the object immutable, and define rounded arithmetic and comparison explicitly. Reject cross-currency addition unless an exchange-rate service performs a conversion.

**Interview answer:** Money is an immutable amount-and-currency value with explicit precision, rounding, arithmetic, and equality rules.

30. How would you separate domain objects from database and transport models?

**Deep explanation:** Map persistence records and DTOs at adapters around the domain. This prevents ORM annotations, nullable wire fields, and versioned schemas from weakening domain invariants, at the cost of explicit mapping code.

**Interview answer:** I keep domain types independent and translate to persistence and transport models at architectural boundaries.

31. How does the bridge pattern separate two independently changing dimensions?

**Deep explanation:** Bridge replaces a Cartesian-product inheritance tree with one abstraction hierarchy delegating to an implementation hierarchy. A `RemoteControl` family can vary independently from `Device` implementations without subclasses for every combination.

**Interview answer:** Bridge composes two variation axes behind separate interfaces so either can evolve without multiplying subclasses.

32. How would you use flyweight objects without accidentally sharing mutable state?

**Deep explanation:** Share only immutable intrinsic state in cached flyweights and pass contextual extrinsic state into each operation. Keys and cached instances must be immutable; per-use mutable data belongs outside the shared object.

**Interview answer:** I cache immutable intrinsic data and supply all per-use state externally, so sharing cannot leak mutations.

33. How would you design a chain of responsibility with explicit stop and failure behavior?

**Deep explanation:** Give each handler a result such as handled, continue, or failed, including error context. The chain owns ordering, terminal behavior, and exception translation, avoiding ambiguous `null` returns or accidental fall-through.

**Interview answer:** Each handler returns an explicit outcome, and the chain defines exactly when to continue, stop successfully, or propagate failure.

34. How does a memento differ from exposing an object's internal state for undo?

**Deep explanation:** A memento captures restoration state while keeping its representation opaque to the caretaker. The originating object creates and consumes it, so undo does not grant external code permission to violate encapsulation.

**Interview answer:** A memento stores an opaque snapshot that only the originator interprets; exposing fields would let undo code manipulate internals directly.

35. How would you use an iterator to hide a collection's internal representation?

**Deep explanation:** Return an iterator over the logical sequence rather than the backing array, tree, or remote pages. Define ordering, concurrent-modification, and snapshot semantics so callers rely only on traversal behavior.

**Interview answer:** I expose traversal through an iterator contract, allowing the underlying collection and traversal mechanism to change independently.
