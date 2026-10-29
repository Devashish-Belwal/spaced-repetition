1. How does distributivity affect conditional types over unions?

**Deep explanation:** A conditional type whose checked side is a naked type parameter distributes over a union. `T extends U ? X<T> : Y<T>` applied to `A | B` evaluates separately for `A` and `B`, then unions the results. This enables utilities such as `Exclude`, but surprises callers who intended to test the union as a whole; `never` also vanishes because it is the empty union.

**Interview answer:** A conditional type distributes when its checked type is a bare generic parameter. `F<A | B>` becomes `F<A> | F<B>`, which is useful for transforming union members but not for whole-union tests.

2. How would you disable conditional-type distribution when necessary?

**Deep explanation:** Wrap both sides of the check in one-element tuples: `[T] extends [U] ? X : Y`. The checked side is no longer a naked type parameter, so TypeScript evaluates the union as one value. This also makes `never` testable rather than treating it as an empty distributed input.

**Interview answer:** I use tuple wrapping: `[T] extends [U] ? X : Y`. That suppresses distribution and tests `T` as a whole.

3. How would you infer nested function arguments and return types?

**Deep explanation:** Conditional types can pattern-match nested signatures with `infer`, for example `T extends (...args: infer A) => (...inner: infer B) => infer R ? [A, B, R] : never`. Recursive helpers can unwrap more layers, though overload inference generally observes the last signature rather than resolving every overload. Prefer `Parameters<T>` and `ReturnType<T>` for single levels.

**Interview answer:** I pattern-match nested call signatures with conditional types and `infer`, extracting each argument tuple and the final return. I use built-in utilities for one level and account for overload inference limitations.

4. How do covariance, contravariance, and bivariance affect function compatibility?

**Deep explanation:** Return types are covariant: a function returning a subtype can replace one returning a supertype. Under strict checking, parameters are contravariant: a replacement must accept at least everything the caller might pass. Bivariance accepts either direction and is less sound; TypeScript retains it in some method patterns for compatibility.

**Interview answer:** Returns are covariant, parameters are contravariant under strict checking, and bivariance permits either direction at a soundness cost. I reason from what callers may pass and what they are promised back.

5. How does strictFunctionTypes interact with methods and callback parameters?

**Deep explanation:** With `strictFunctionTypes`, function-property parameters are checked contravariantly, preventing a callback accepting only a narrow subtype where broader inputs may arrive. Method declarations are deliberately exempt and remain bivariant for compatibility. Thus `handle: (x: Animal) => void` is safer than `handle(x: Animal): void` when strict callback variance matters.

**Interview answer:** `strictFunctionTypes` makes ordinary function and callback parameters contravariant, but method syntax remains bivariant. For safety-sensitive callbacks, I prefer function properties so strict variance applies.

6. How would you type a curried function while preserving argument inference?

**Deep explanation:** Infer the original parameter tuple and recursively consume it: `[H, ...T]` becomes `(arg: H) => Curry<T, R>`, ending at `R`. The runtime implementation may need one contained assertion because the compiler cannot prove recursive accumulation. Optional, rest, placeholder, or multi-argument partial application needs an explicit policy and more complex tuple splitting.

**Interview answer:** I infer the parameter tuple and recursively remove its head, producing one function per argument and finally the return type. I define optional and rest semantics explicitly and isolate implementation assertions behind the public signature.

7. How would you build a type-safe middleware pipeline?

**Deep explanation:** Model each middleware as a transformation from input context to output context. A variadic tuple can recursively verify that each output matches the next input and compute the pipeline endpoints. Runtime composition must preserve those execution and error semantics; for mutation-based middleware, a staged builder may be more honest than pretending each stage creates a new value.

**Interview answer:** I give middleware explicit input and output types, then recursively validate adjacent stages in a variadic tuple. The composed pipeline exposes only the first input and final output, and mismatched stages fail at construction.

8. How would you model a state machine so invalid transitions fail type checking?

**Deep explanation:** Represent states and events as discriminated unions, plus a mapping from each state tag to its allowed events and next states. A generic transition function accepts only `EventsFor<S>` and returns `Next<S, E>`. Literal discriminants enable narrowing, while exhaustive `never` checks protect the runtime reducer when variants are added.

**Interview answer:** I use discriminated state and event unions with a transition map indexed by current state. The transition function accepts only valid events for that state and returns the mapped next state, with an exhaustive implementation.

9. How would you represent recursive schemas without exhausting the compiler?

**Deep explanation:** Separate finite schema node definitions from recursion and use lazy runtime references such as `lazy(() => NodeSchema)`. Prefer named recursive interfaces over repeatedly expanded mapped conditionals. When derived operations recurse, pass a small depth counter and return a conservative fallback at the limit.

**Interview answer:** I use lazy runtime references and named recursive types so the compiler reuses a symbol instead of expanding forever. Recursive helpers receive a depth budget and a conservative fallback.

10. How would you diagnose excessive type instantiation and slow editor performance?

**Deep explanation:** Isolate the slow generic with a minimal reproduction, then inspect `tsc --extendedDiagnostics` and, if needed, `--generateTrace`. Common causes are recursive conditionals, distributive types, and union cross-products. Bound recursion, prevent accidental distribution, reduce union width, alias intermediate results, and measure again after each change.

**Interview answer:** I isolate the type, inspect extended diagnostics or a compiler trace, and look for recursive expansion or union multiplication. Then I cap recursion, suppress unintended distribution, simplify unions, and re-measure.

11. How would you limit the complexity of recursive template-literal types?

**Deep explanation:** Thread a depth counter through recursion and return `string`, `unknown`, or another safe approximation after a small limit. Short-circuit broad inputs with `string extends T`, and avoid interpolating multiple unions because that creates a Cartesian product. Large path or token unions may be better generated at build time.

**Interview answer:** I impose a depth budget, short-circuit broad `string` inputs, and avoid union cross-products. Beyond the limit I return a documented conservative type or generate the union outside the type system.

12. How would you design a public generic API that produces understandable errors?

**Deep explanation:** Infer from value arguments and use constraints only for true domain rules; complex conditionals in parameter positions often harm inference and diagnostics. Prefer discriminated options, named helper types, overloads for distinct modes, and staged builders when order matters. Test invalid calls at real call sites to ensure errors point at the user's mistake.

**Interview answer:** I keep the public surface inference-friendly with simple constraints, discriminated options, named types, and staged builders. I hide type machinery and test representative invalid calls for readable, local errors.

13. How would you test a library's types in CI?

**Deep explanation:** Compile positive fixtures with `tsc --noEmit` and negative fixtures with `@ts-expect-error`, so CI fails if an expected error disappears. Add type equality assertions, build declarations, and compile consumer fixtures against the packed package under supported TypeScript versions and module modes. Runtime tests remain separate.

**Interview answer:** CI compiles positive examples, expected failures using `@ts-expect-error`, and type-equality assertions. I also test the packed package from supported ESM/CommonJS and TypeScript configurations, alongside runtime tests.

14. How would you distinguish intentional type errors from stale suppression comments?

**Deep explanation:** Prefer `@ts-expect-error` because the compiler reports it when the next line no longer errors. Require a reason through linting and place it directly above the smallest relevant expression. For critical tests, assert the expected diagnostic because an unrelated error on the same line can satisfy a plain directive.

**Interview answer:** I use narrowly placed `@ts-expect-error` with a required explanation, not broad `@ts-ignore`. Unused directives reveal stale suppressions, and diagnostic-aware tests cover cases where the exact error matters.

15. How would you publish declarations for both ESM and CommonJS consumers?

**Deep explanation:** Build runtime artifacts and declarations whose module interpretation matches each entry point, described by `package.json` conditional exports and matching `types` conditions. Use `.d.mts` and `.d.cts` when separate ESM and CommonJS declaration graphs are needed. Test the packed tarball in real ESM and CJS fixtures with modern Node resolution.

**Interview answer:** I publish matched ESM and CJS entry points with conditional exports and corresponding declarations, often `.d.mts` and `.d.cts`. Consumer fixture tests verify that runtime and type resolution agree.

16. How would you handle multiple versions of a dependency's types in a monorepo?

**Deep explanation:** Prefer one compatible version through workspace constraints and deduplication. If versions must coexist, do not leak dependency-owned nominal types across package boundaries; expose structural DTOs or adapter interfaces. Isolate package resolution and test packed public declarations. `skipLibCheck` can hide noise but cannot make incompatible APIs safe.

**Interview answer:** I align versions where possible. Otherwise I isolate them and avoid exporting their nominal types, using stable local interfaces or adapters; `skipLibCheck` is only a build escape hatch, not a compatibility solution.

17. How would project references and incremental builds affect a large repository?

**Deep explanation:** Project references split the repository into composite projects with explicit dependency edges and declaration outputs. `tsc -b` builds topologically and reuses `.tsbuildinfo`, reducing repeated checking and memory use. The tradeoffs are configuration and output management, plus avoiding cycles and ensuring complete public declarations.

**Interview answer:** References create a dependency graph of composite projects, and build mode rechecks only affected projects and dependents. This improves scale but requires acyclic boundaries, declaration outputs, disciplined configs, and clean-build verification.

18. How would you prevent runtime imports from appearing through barrel exports?

**Deep explanation:** Use `import type` and `export type`, enable `verbatimModuleSyntax`, and lint consistent type imports. Avoid broad `export *` barrels because they hide value edges and can create cycles or side effects. Separate type and runtime entry points where helpful, and inspect emitted JavaScript or bundle graphs in CI.

**Interview answer:** I make type-only edges explicit, enable `verbatimModuleSyntax`, and avoid broad star barrels. Separate type/runtime entry points and emitted-output tests catch accidental runtime dependencies.

19. How would you model opaque identifiers across serialization boundaries?

**Deep explanation:** Brand a primitive, for example `type UserId = string & { readonly __brand: unique symbol }`, so different identifiers cannot be mixed in checked code. Brands are erased, so after parsing external data, validate its format and construct the branded value through a trusted factory or schema transform. Never cast arbitrary input directly.

**Interview answer:** I use branded strings for compile-time separation, but restore the brand only through validation at each external boundary. The brand is not runtime proof; the parser or factory is the trust boundary.

20. How would you keep database schemas, runtime validators, and static types synchronized?

**Deep explanation:** Choose one authoritative schema and generate other representations where possible. Make generation reproducible and have CI fail when generated output is stale. Still validate untrusted input and database results at boundaries, because static types cannot prove deployed migrations, manual queries, or older services match the build.

**Interview answer:** I establish one source of truth, generate types and validators where possible, and check drift in CI. I still validate boundary data because TypeScript does not prove the deployed database matches the source schema.

21. How would you model optional versus absent fields in a PATCH request?

**Deep explanation:** A field often has three meanings: omitted means unchanged, a value means replace, and `null` may mean clear. Model that explicitly, such as `{ name?: string | null }`, and enable `exactOptionalPropertyTypes` so explicit `undefined` is not silently equivalent to absence unless allowed. Runtime logic should use property ownership, not truthiness.

**Interview answer:** I define omission, `null`, and `undefined` separately. With `exactOptionalPropertyTypes`, absence is distinct from explicit `undefined`, and patch logic checks `hasOwn` rather than truthiness.

22. How would you type an extensible plugin registry with third-party additions?

**Deep explanation:** Define a stable plugin contract and a registry mapping keys to configuration or capability types. Closed applications can infer the map from a builder; open ecosystems can expose a documented module-augmentation interface. Because augmentations can collide, use namespaced keys and runtime duplicate and version checks.

**Interview answer:** I expose a stable generic plugin contract and registry map. I infer local plugins through a builder, or support documented module augmentation for third parties, backed by namespaced identifiers and runtime compatibility checks.

23. What risks come with declaration merging and module augmentation?

**Deep explanation:** Augmentations are ambient: any included package can change a shared interface for the whole program. Names may conflict, missing imports can prevent loading, dependency versions can disagree, and declarations may claim runtime behavior that is absent. They also reduce discoverability, so explicit composition is usually safer.

**Interview answer:** Declaration merging changes types globally, can collide, depends on module inclusion, and may not match runtime installation. I reserve it for deliberate extension points and otherwise prefer explicit generic composition.

24. How would you evaluate an unsound TypeScript assignment in security-sensitive code?

**Deep explanation:** Trace the value's origin, the unsound rule involved—such as `any`, assertions, bivariance, or unchecked indexing—and every privileged sink it can reach. TypeScript is not a security boundary: validate and normalize at runtime, narrow capabilities, and fail closed. Add a regression test for malformed or malicious input and contain the escape hatch.

**Interview answer:** I identify where trust entered, what type-system escape hatch admitted the value, and whether it reaches authorization or execution code. I add runtime validation and capability checks, contain the unsoundness, and test the exploit path.

25. How would you preserve literal inference across a generic builder API?

**Deep explanation:** Infer directly from arguments and return a new builder parameterized by accumulated state. Use `const` type parameters, `as const` for appropriate caller literals, and `satisfies` to validate shape without replacing inference. Avoid intermediate annotations or mutable storage that widen literal keys to `string`.

**Interview answer:** I infer each step directly, use `const` type parameters, and carry accumulated generic state in the returned builder. `satisfies` validates inputs without widening, and I avoid annotations that turn literal keys into `string`.

26. How would you type deeply immutable data without confusing compile-time and runtime guarantees?

**Deep explanation:** A recursive `DeepReadonly<T>` must handle functions, tuples, arrays, maps, sets, and built-ins deliberately. It only blocks mutation through that typed reference; mutable aliases still work, and no freezing is emitted. Runtime immutability requires cloning and deep freezing or persistent data structures.

**Interview answer:** I use a scoped deep-readonly type for compile-time access control, but make clear it neither freezes data nor stops mutable aliases. For runtime guarantees I pair it with deep freezing, defensive copies, or persistent structures.

27. How would you design branded units for currency, distance, and time?

**Deep explanation:** Brand values by dimension and unit, such as `Money<'USD'>` or `Distance<'m'>`. Validated factories create them, explicit conversions change brands, and arithmetic functions encode legal combinations. Serialized values include their unit and are parsed again; money should generally use integer minor units or decimal arithmetic rather than binary floats.

**Interview answer:** I brand values with dimension and unit, expose validated constructors and conversions, and allow arithmetic only through typed functions. Serialized data carries its unit, and money avoids binary floating-point representation.

28. How would you type a GraphQL or REST client generated from a schema?

**Deep explanation:** Generate operation-specific request and response types from the authoritative schema, rather than one oversized domain model. Preserve GraphQL selection and nullability or REST path, query, body, status, and error variants. Make generation deterministic, detect schema drift in CI, and validate responses at trust boundaries.

**Interview answer:** I generate operation-specific inputs and outputs from the schema, preserving nullability and status or error variants. CI catches drift, and runtime validation protects against nonconforming server responses.

29. How would you maintain compatibility when tightening a published library's types?

**Deep explanation:** A stricter declaration can be breaking even when runtime behavior is unchanged. Test representative downstream code, distinguish fixing an impossible promise from removing valid use, and add safe overloads or deprecated aliases where appropriate. Stage broad changes, document migrations, and choose the semantic-version release accordingly.

**Interview answer:** I treat tightening as potentially breaking, test real consumers, and separate unsound promises from supported usage. I provide safe compatibility paths, migration guidance, and the appropriate semver release—often a major for broad changes.

30. How would you decide when a simpler runtime abstraction is better than more type-level code?

**Deep explanation:** Compare type machinery's benefit against editor latency, error readability, maintenance cost, inference fragility, and actual bugs prevented. Prefer runtime validation or a simpler explicit API for dynamic inputs, trust boundaries, or deeply recursive models. Keep advanced types when they prevent common invalid states with clear errors and low caller burden.

**Interview answer:** I use type-level code when it prevents meaningful mistakes with fast inference and readable errors. If the invariant is dynamic or the types become slow, fragile, or opaque, I choose a simpler API plus runtime validation.
