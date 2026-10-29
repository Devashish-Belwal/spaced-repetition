1. How would you design an extensible plugin system without exposing internal state?

**Deep explanation:** Define a small versioned plugin API of immutable DTOs and capability interfaces, load plugins through an isolated registry, and keep host objects private. Enforce lifecycle, permissions, timeouts, and failure isolation at the boundary.

**Interview answer:** I expose stable capabilities and immutable messages, not host internals, with explicit versioning, lifecycle, and isolation.

2. How would you enforce aggregate invariants across concurrent modifications?

**Deep explanation:** Make the aggregate the transaction boundary and use optimistic version checks or narrowly scoped locks. Rehydrate, execute one invariant-preserving command, and atomically persist events/state; on conflict, retry only when semantics permit.

**Interview answer:** I serialize changes per aggregate using versions or locks and commit only if the state read is still current.

3. How would you identify aggregate boundaries in an order-management domain?

**Deep explanation:** Group entities that require immediate transactional consistency and choose one root controlling mutations. Keep other relationships by identity and handle cross-boundary coordination with processes/events; oversized aggregates increase contention.

**Interview answer:** An aggregate contains the smallest set of objects whose invariants must be atomically consistent, accessed through one root.

4. How would you model state transitions that have both business and technical failures?

**Deep explanation:** Represent business rejection as typed domain outcomes without changing state; represent infrastructure failure separately for retry or compensation. Persist the state transition and outbox message atomically so technical delivery cannot create ambiguous business state.

**Interview answer:** I separate expected domain rejections from technical errors and use atomic persistence plus retry/compensation for side effects.

5. How would you evolve a domain model when two clients require conflicting behaviors?

**Deep explanation:** Determine whether clients represent different policies or bounded contexts. Inject an explicit policy when the core concept is shared; otherwise split models and translate at the boundary rather than adding client flags throughout entities.

**Interview answer:** I model the variation as a policy if the domain is shared, or separate bounded-context models when meanings truly diverge.

6. How would you preserve substitutability when a subclass strengthens validation?

**Deep explanation:** A subtype cannot reject input the base contract accepts. Move the stricter rule to construction, expose a narrower separate type, or weaken the base contract explicitly; do not surprise callers inside an override.

**Interview answer:** I avoid strengthening overridden preconditions and represent stricter validity with construction or a distinct abstraction.

7. How do covariance and contravariance affect typed interfaces?

**Deep explanation:** Covariance permits a more specific output type; contravariance permits a more general input type. Producers are naturally covariant and consumers contravariant, while mutable read-write containers are usually invariant for type safety.

**Interview answer:** Covariance is safe for produced values, contravariance for consumed values, and mutable containers generally require invariance.

8. How would you avoid fragile-base-class problems in a public library?

**Deep explanation:** Prefer composition and sealed internals, publish narrow interfaces, and expose deliberate extension points with documented invariants. If inheritance is supported, minimize virtual calls—especially in constructors—and test third-party subtype compatibility.

**Interview answer:** I keep inheritance surfaces small and intentional, favor composition, and version behavioral contracts as carefully as signatures.

9. How would you evaluate whether a pattern adds useful flexibility or accidental complexity?

**Deep explanation:** Identify a demonstrated axis of change and compare the pattern's indirection against duplicated branching, coupling, and test cost. Prototype the simplest design; retain the pattern only if it localizes likely changes measurably.

**Interview answer:** I require a concrete variation or pain point and choose the design with the lowest total change and comprehension cost.

10. How would you handle resource ownership in a polymorphic object hierarchy?

**Deep explanation:** Put cleanup in a common explicit lifecycle contract and ensure base-level disposal is safely polymorphic. Define single ownership, idempotent cleanup, exception behavior, and language-specific finalization rules; prefer scoped resource wrappers over inheritance.

**Interview answer:** I make ownership explicit and cleanup deterministic, polymorphic, and idempotent, usually through scoped disposal.

11. How would you design thread-safe objects without locking every method?

**Deep explanation:** Prefer immutability, confinement, actors, snapshots, or atomic state transitions. Where locks remain, protect invariants with a documented lock scope and avoid calling external code while locked; validate with stress tests.

**Interview answer:** I minimize shared mutable state, use confinement or immutable snapshots, and lock only atomic invariant boundaries.

12. How would you model asynchronous operations without leaking transport concerns into entities?

**Deep explanation:** Entities make synchronous domain decisions and emit domain events or intents. Application services persist those decisions and use ports/outbox workers for messaging, retries, and correlation, keeping brokers and HTTP out of domain code.

**Interview answer:** The domain emits transport-neutral intent; application and infrastructure layers handle asynchronous delivery and retries.

13. How would you prevent persistence frameworks from weakening domain invariants?

**Deep explanation:** Keep invariant-preserving construction and behavior authoritative, map through repositories, and restrict ORM-only constructors/setters. Validate rehydrated data and avoid lazy proxies that allow mutation or I/O behind domain operations.

**Interview answer:** I isolate ORM mapping behind repositories and ensure every newly created or rehydrated entity satisfies the same invariants.

14. How would you serialize and restore polymorphic objects safely?

**Deep explanation:** Use an allowlisted stable type discriminator mapped to explicit serializers, never arbitrary runtime type names. Version schemas, validate input, ignore or reject unknown fields deliberately, and migrate old representations before construction.

**Interview answer:** I deserialize only allowlisted versioned types through validated mappings, avoiding reflective arbitrary-type construction.

15. How would you maintain backward compatibility for a plugin interface?

**Deep explanation:** Use semantic versions, capability negotiation, additive defaults, and adapters for older contracts. Test plugins against a compatibility suite and deprecate before removal; signatures and behavioral expectations both require stability.

**Interview answer:** I evolve additively, negotiate capabilities, adapt older versions, and verify both binary and behavioral compatibility.

16. How would you support audit history without turning entities into logging utilities?

**Deep explanation:** Have entities emit domain events describing accepted changes, then persist audit records through an application-layer subscriber or event store. Capture actor and correlation context outside the entity and make audit writes transactionally reliable.

**Interview answer:** Entities emit meaningful events; infrastructure enriches and stores an immutable audit trail without logging dependencies in the model.

17. How would you combine functional transformations with an object-oriented domain model?

**Deep explanation:** Model values immutably and express calculations as pure transformations, while entities and aggregates own identity, lifecycle, and command validation. Keep side effects at ports so the functional core remains deterministic.

**Interview answer:** I use pure functions for value transformations and objects for identity and invariant ownership, with effects at boundaries.

18. How would you design a visitor when new operations and new element types both change frequently?

**Deep explanation:** Classic visitor favors adding operations but makes new element types expensive, so frequent change on both axes is a warning. Consider pattern matching, external multimethods, registries, or a stable intermediate representation instead.

**Interview answer:** I would not default to classic visitor; I would choose a registry or stable representation that avoids coordinated edits on both axes.

19. How would you implement undo when an operation has irreversible external effects?

**Deep explanation:** Model undo as a compensating command, not time reversal. Record external identifiers and outcomes, make compensation idempotent, surface partial failure, and use sagas/manual remediation when no true inverse exists.

**Interview answer:** I execute an explicit, retry-safe compensation and report cases that cannot be fully reversed.

20. How would you prevent event subscribers from breaking the publisher's consistency?

**Deep explanation:** Complete and commit publisher invariants before dispatching through an outbox. Do not let synchronous subscribers mutate the aggregate; isolate failures, make handlers idempotent, and define delivery and ordering guarantees.

**Interview answer:** I commit first, publish afterward through an outbox, and isolate idempotent subscribers from the aggregate transaction.

21. How would you design a fluent builder that prevents invalid construction sequences?

**Deep explanation:** Use staged interfaces or typestate generics so each method returns only the next legal operations and `build()` appears only after required fields. Runtime validation remains necessary for value-dependent rules.

**Interview answer:** I encode the construction protocol in staged builder types and validate remaining cross-field constraints at build time.

22. How would you compare inheritance, delegation, and type classes for extensibility?

**Deep explanation:** Inheritance offers subtype dispatch but couples behavior to a hierarchy; delegation composes runtime collaborators; type classes attach compile-time behavior to types without modifying them. Choose based on substitutability, runtime variation, and language support.

**Interview answer:** I use inheritance for true subtyping, delegation for runtime composition, and type classes for externally defined compile-time capabilities.

23. How would you detect and correct a dependency inversion that merely relocates coupling?

**Deep explanation:** Look for abstractions mirroring one concrete provider, leaking its data shapes, or changing whenever it changes. Redesign the port around consumer policy, translate in an adapter, and verify alternate implementations are plausible.

**Interview answer:** A useful abstraction is owned by the consumer's needs; if it mirrors a vendor, I move translation to an adapter and reshape the port.

24. How would you model units of measure to prevent mixing incompatible values?

**Deep explanation:** Wrap magnitudes in unit-aware value types or dimensional generic types, permit only dimensionally valid operations, and make conversions explicit. Normalize internally when helpful while preserving rounding and display-unit semantics.

**Interview answer:** I encode dimensions in types so invalid combinations fail early and require explicit, tested conversions.

25. How would you design a capability-based API instead of checking role strings everywhere?

**Deep explanation:** Authorization resolves identity and policy into narrow unforgeable capability objects representing allowed actions. Domain/application methods require the capability directly, centralizing issuance and eliminating scattered string comparisons.

**Interview answer:** I pass verified action-specific capabilities to operations, with one policy layer responsible for issuing them.

26. How would you review object boundaries in a codebase with thousands of classes?

**Deep explanation:** Start from runtime change flows, ownership, dependency graphs, transaction boundaries, and commit history—not class count. Find cycles, feature scattering, unstable interfaces, and shared mutable data, then refactor one measured seam at a time.

**Interview answer:** I map dependencies and change coupling around business flows, then target cycles and scattered responsibilities with incremental tests.

27. How would you decide whether two bounded contexts should share a model?

**Deep explanation:** Share only when terminology, rules, lifecycle, ownership, and release cadence truly align. Similar field names are insufficient; divergent meanings favor separate models connected by an anti-corruption translation layer.

**Interview answer:** I share a model only for genuinely shared semantics and governance; otherwise each context owns its model and translates.

28. How would you replace a shared domain library without coordinating every consumer release?

**Deep explanation:** Introduce a versioned contract boundary, publish compatible adapters or a service façade, and migrate consumers independently using expand-and-contract. Observe usage, dual-run where risk warrants, then retire the old contract after adoption.

**Interview answer:** I create a compatible boundary and adapters, migrate consumers independently, and remove the old library only after measured adoption.

29. How would you test whether a refactoring preserves behavioral contracts?

**Deep explanation:** Capture observable contracts with characterization, property, and consumer-driven tests, including errors and side effects. Run old and new implementations against identical generated inputs or production replays and compare outcomes.

**Interview answer:** I test externally observable behavior—not implementation—and differentially compare old and new versions across edge cases.

30. How would you defend a simple design when asked to add speculative extensibility?

**Deep explanation:** Explain the concrete current requirements, likely change cost, and added maintenance surface, then show where clean seams permit later refactoring. Propose a trigger for extension rather than claiming future change is impossible.

**Interview answer:** I optimize for known needs, retain clear seams, and add abstraction when evidence identifies a real variation axis.

31. How would you model double dispatch when an operation depends on two runtime types?

**Deep explanation:** Use a visitor or explicit multimethod/handler table so dispatch considers both operands without nested type tests. Keep the pair matrix complete and define symmetric ordering where relevant; avoid it if combinations grow uncontrollably.

**Interview answer:** I centralize the two-type dispatch in a visitor or multimethod table with explicit handling for every supported pair.

32. How would you decide whether a mediator reduces coupling or merely centralizes complexity?

**Deep explanation:** A good mediator coordinates a cohesive workflow while participants remain independently understandable. If it accumulates unrelated rules, knows every internal detail, or changes for every feature, it is a god object requiring decomposition.

**Interview answer:** It reduces coupling when it owns one clear interaction protocol; it merely centralizes complexity when all domain decisions collect there.

33. How would you prevent a builder from returning a mutable object that later invalidates its guarantees?

**Deep explanation:** Build an immutable product with private final state, copy mutable builder inputs, and expose immutable collections or copies. The builder may remain mutable and reusable, but no mutable storage should be shared with built instances.

**Interview answer:** I defensively copy at build time and make the produced object's entire reachable state immutable or encapsulated.

34. How would you manage identity and equality for objects loaded in separate persistence sessions?

**Deep explanation:** Define entity equality from stable domain identity rather than object reference or session-specific proxies, while handling transient instances explicitly. Normalize proxy classes and keep identity/hash immutable so detached instances compare consistently.

**Interview answer:** Persisted entities compare by stable domain ID across sessions; transient identity and proxy behavior are handled without changing hash semantics.

35. How would you design domain events without allowing subscribers to mutate an aggregate mid-operation?

**Deep explanation:** Record immutable event facts inside the aggregate, complete the command, and publish only after successful commit through an outbox. Subscribers receive event data or IDs, not the live aggregate, and issue separate commands if needed.

**Interview answer:** I capture immutable events during the operation and dispatch them post-commit, never exposing the mutable aggregate to handlers.
