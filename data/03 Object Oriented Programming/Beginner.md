1. What is the difference between a class and an object?

**Deep explanation:** A class defines a type's data and behavior; an object is one concrete runtime instance of that class. For example, `BankAccount` is a blueprint, while Alice's account is an object with its own balance.

**Interview answer:** A class is a blueprint or type definition; an object is an instantiated value with its own identity and state.

2. What are an object's state, behavior, and identity?

**Deep explanation:** State is the data an object currently holds, behavior is what its methods can do, and identity distinguishes it from otherwise similar objects. Two accounts may have equal balances yet remain different accounts.

**Interview answer:** State is what an object knows, behavior is what it does, and identity is what makes that particular instance distinct.

3. How do instance members and static members differ?

**Deep explanation:** Instance members belong to individual objects and can vary per instance. Static members belong to the class itself and are shared, so they suit constants or stateless utilities but can create hidden global state when mutable.

**Interview answer:** Instance members require an object and hold per-object data; static members belong to the type and are shared across all instances.

4. What is a constructor responsible for?

**Deep explanation:** A constructor establishes a usable object by accepting required dependencies, validating inputs, and initializing fields so invariants hold immediately. It should avoid heavy I/O or publishing `this`, which can expose a partially built object.

**Interview answer:** A constructor should create a fully initialized, valid object and establish its invariants.

5. What is encapsulation, and how does it differ from simply adding getters and setters?

**Deep explanation:** Encapsulation hides representation and exposes meaningful operations that protect rules. Getters and setters may merely expose fields indirectly; `account.withdraw(amount)` can enforce limits, whereas `setBalance` lets callers bypass them.

**Interview answer:** Encapsulation protects state behind behavior and invariants; getters and setters alone often just relocate direct field access.

6. What is abstraction in object-oriented programming?

**Deep explanation:** Abstraction presents the essential capability while hiding irrelevant implementation detail. A `PaymentGateway.charge()` contract lets callers request payment without knowing HTTP endpoints, authentication, or provider-specific formats.

**Interview answer:** Abstraction exposes what an object does through a stable contract while hiding how it does it.

7. How do public, protected, and private access differ?

**Deep explanation:** Public members form the external API, private members are usable only inside the declaring class, and protected members are also available to subclasses. Prefer the narrowest access because wider access increases coupling and compatibility obligations.

**Interview answer:** Public is externally accessible, protected is for the class and its subclasses, and private is confined to the declaring class.

8. What is inheritance intended to represent?

**Deep explanation:** Inheritance represents a genuine “is-a” relationship in which the subtype honors the base type's behavioral contract. It enables reuse and polymorphism, but using it only to reuse code often creates tight coupling and fragile hierarchies.

**Interview answer:** Inheritance models substitutable specialization: every subtype must be safely usable wherever the base type is expected.

9. What is polymorphism, and where have you used it?

**Deep explanation:** Polymorphism lets one contract have multiple implementations selected without caller-specific branching. For example, checkout can call `pay()` on card, wallet, or bank-transfer strategies while depending only on `PaymentMethod`.

**Interview answer:** Polymorphism means calling the same interface on different concrete types; I use it for replaceable strategies, adapters, and test doubles.

10. How do method overriding and method overloading differ?

**Deep explanation:** Overriding replaces inherited behavior with the same signature and is resolved at runtime through dynamic dispatch. Overloading uses the same name with different parameter lists and is normally selected at compile time.

**Interview answer:** Overriding is runtime subtype specialization; overloading is compile-time selection among methods with different parameter signatures.

11. What is an interface, and what contract does it express?

**Deep explanation:** An interface names a capability and specifies callable operations, expected inputs, outputs, and behavioral promises. Its true contract also includes semantics such as errors and side effects, not merely method signatures.

**Interview answer:** An interface is a contract for behavior that implementations agree to provide, allowing callers to depend on capability rather than concrete type.

12. How does an abstract class differ from an interface?

**Deep explanation:** An abstract class can share state, constructors, and partial implementation within one hierarchy. An interface primarily describes capability and a class can usually implement several; choose it when implementations need not share ancestry.

**Interview answer:** An abstract class provides shared base state or behavior, while an interface defines a capability that unrelated types can implement.

13. How do composition and inheritance differ?

**Deep explanation:** Inheritance acquires behavior through an “is-a” hierarchy; composition builds behavior by containing and delegating to collaborators. Composition is often easier to change or test because components can be replaced independently.

**Interview answer:** Inheritance specializes a base type; composition assembles objects and delegates work, usually with less coupling.

14. What do association, aggregation, and composition mean?

**Deep explanation:** Association is any relationship between objects. Aggregation is a weak whole-part relationship where parts can exist independently; composition is strong ownership where a part's lifecycle belongs to the whole, such as order lines inside an order.

**Interview answer:** Association is general linkage, aggregation is non-owning whole-part, and composition is owning whole-part with coupled lifecycles.

15. What is dynamic dispatch?

**Deep explanation:** Dynamic dispatch chooses an overridden method using the object's runtime type rather than the reference's declared type. It is the mechanism that lets a `Shape` reference invoke the correct `Circle` or `Rectangle` implementation.

**Interview answer:** Dynamic dispatch resolves an overridden call at runtime based on the actual object type.

16. How does an object reference differ from the object itself?

**Deep explanation:** A reference is a value that points to or identifies an object; the object contains the actual state and behavior. Multiple references may alias one object, so mutation through one can be observed through the others.

**Interview answer:** A reference locates an object; it is not the object, and several references can point to the same instance.

17. What makes a class immutable?

**Deep explanation:** An immutable object's observable state never changes after construction. Make fields private and final, validate in the constructor, expose no mutators, and defensively copy mutable inputs and outputs; nested mutable objects otherwise break the guarantee.

**Interview answer:** An immutable class establishes all state at construction and exposes no path—direct or indirect—to change it afterward.

18. How do value objects differ from entities?

**Deep explanation:** A value object is defined by its attributes and is usually immutable, such as money with amount and currency. An entity has continuous identity over time, such as an order, even when its attributes change.

**Interview answer:** Value objects compare by their values; entities compare by stable identity and have a lifecycle.

19. Why should equality and hashing agree?

**Deep explanation:** Hash collections first choose a bucket from the hash and then test equality. If equal objects produce different hashes, lookup, removal, or duplicate detection can fail; fields used by either operation should also remain stable while keyed.

**Interview answer:** Equal objects must have equal hash codes so hash-based collections can locate and deduplicate them correctly.

20. What are coupling and cohesion?

**Deep explanation:** Coupling measures how strongly components depend on one another; cohesion measures how closely a component's responsibilities belong together. Designs generally seek low coupling and high cohesion to localize changes and simplify testing.

**Interview answer:** Coupling is dependency between modules, while cohesion is how well a module's responsibilities fit together.

21. What does the single-responsibility principle ask you to consider?

**Deep explanation:** SRP asks whether a component has one coherent reason to change, usually tied to one actor or policy. It does not mean one method per class; splitting too aggressively can scatter a single concept.

**Interview answer:** A class should own one cohesive responsibility and have one primary reason or stakeholder driving its changes.

22. What is the open-closed principle?

**Deep explanation:** Software should be open to adding behavior but closed to risky modification of stable code. Extension points such as strategies can help where variation is proven, but adding abstractions for hypothetical change creates needless complexity.

**Interview answer:** New behavior should often be addable through extension without repeatedly modifying well-tested core logic.

23. What does dependency inversion mean?

**Deep explanation:** High-level policy should not depend directly on low-level details; both depend on abstractions owned around the policy's needs. A checkout service can depend on `PaymentGateway`, while a provider adapter implements it.

**Interview answer:** Dependency inversion makes policy and implementation depend on stable abstractions instead of policy importing concrete infrastructure.

24. How does dependency injection differ from creating dependencies internally?

**Deep explanation:** Dependency injection supplies collaborators from outside, typically through a constructor, making requirements visible and replacements easy. Internal construction hard-codes lifecycle and implementation choices and makes isolated testing harder.

**Interview answer:** Injection receives dependencies from a composition root; internal creation hides and fixes those dependencies inside the class.

25. What problem does a factory solve?

**Deep explanation:** A factory centralizes creation when selecting a concrete type, validating inputs, or assembling dependencies is nontrivial. It keeps callers focused on use, though a factory adds little value for a simple constructor call.

**Interview answer:** A factory encapsulates complex or variable object creation and returns an appropriate, valid object to the caller.

26. What is the purpose of a strategy object?

**Deep explanation:** A strategy packages one interchangeable algorithm behind a common interface. A shipping calculator can select standard, express, or pickup pricing at runtime without conditionals spreading through the order service.

**Interview answer:** A strategy makes an algorithm replaceable independently of the object that uses it.

27. How does an observer receive changes from another object?

**Deep explanation:** The observer subscribes a callback or listener to a publisher, which notifies subscribers when an event occurs. Implementations must define ordering, error handling, unsubscribe behavior, and whether delivery is synchronous or asynchronous.

**Interview answer:** An observer registers with a publisher and receives notifications through a callback when relevant state or events change.

28. What is a singleton, and why can it complicate tests?

**Deep explanation:** A singleton restricts a type to one globally accessible instance. If mutable or dependency-bearing, it hides inputs, shares state between tests, and prevents substitution; application-scoped lifetime through dependency injection is usually clearer.

**Interview answer:** A singleton provides one global instance, but its hidden shared state and fixed implementation can make tests coupled and order-dependent.

29. How would you model a bank account without exposing its balance for arbitrary mutation?

**Deep explanation:** Keep balance private and expose domain operations such as `deposit` and `withdraw`. Validate positive amounts, sufficient funds, currency, and limits inside those methods, then expose balance only as a read-only money value.

**Interview answer:** I would encapsulate balance and allow changes only through validated deposit and withdrawal operations that preserve account rules.

30. How would you explain an object's invariant using a shopping cart?

**Deep explanation:** An invariant is a rule that must hold after every public operation. A cart might require positive quantities, unique product lines, and a total equal to its lines; its methods must prevent or atomically correct violations.

**Interview answer:** A cart invariant is an always-true rule—such as every line having positive quantity—that every constructor and mutation must preserve.
