1. How do keyof, typeof, and indexed-access types work together?

**Deep explanation:** `typeof` captures the static type of a value, `keyof` turns that type's property names into a union, and `T[K]` retrieves the value type for key `K`. For `const config = { port: 3000, secure: true }`, `keyof typeof config` is `"port" | "secure"`, and `(typeof config)[keyof typeof config]` is `number | boolean`.

**Interview answer:** “`typeof` derives a type from a value, `keyof` derives its key union, and indexed access retrieves the type at those keys. Together they keep derived types synchronized with the source object.”

2. How would you restrict a generic parameter using extends?

**Deep explanation:** A constraint such as `T extends { length: number }` establishes the minimum shape a type argument must have. The implementation can safely use `length`, while the caller retains the more specific input type and any extra fields.

**Interview answer:** “I constrain it with `extends`, for example `function size<T extends { length: number }>(value: T)`. That rejects incompatible inputs without losing the caller's concrete type.”

3. How would you preserve the relationship between an input key and its returned value?

**Deep explanation:** Give the key its own generic parameter: `function get<T, K extends keyof T>(obj: T, key: K): T[K]`. This makes the selected key determine the return type; using only `keyof T` would usually produce a union of all property types.

**Interview answer:** “I use `K extends keyof T` for the key and return `T[K]`. Passing `"name"` then returns the name property's type rather than a broad union.”

4. How do mapped types transform object properties?

**Deep explanation:** A mapped type iterates over keys, commonly `{ [K in keyof T]: ... }`, to transform every property's value or modifiers. It can add or remove `readonly` and `?`, while an `as` clause can rename or filter keys.

**Interview answer:** “Mapped types are type-level loops over property keys. I use them to apply one consistent transformation to values, modifiers, or key names.”

5. How do conditional types select a type based on another type?

**Deep explanation:** `T extends U ? X : Y` selects a branch using assignability. A conditional with a bare type parameter distributes over union members; wrapping both sides in tuples, `[T] extends [U]`, suppresses that behavior.

**Interview answer:** “A conditional type is an assignability test written `T extends U ? X : Y`. I also account for its default distributive behavior over unions.”

6. What does infer extract inside a conditional type?

**Deep explanation:** `infer` introduces a type variable for part of the structure matched in a conditional type. For example, `T extends (...args: never[]) => infer R ? R : never` extracts a function's return type; similar patterns unwrap arrays, tuples, and promises.

**Interview answer:** “`infer` captures a component of a matched type in the true branch, such as a function return type or a promise's resolved value.”

7. How do Partial, Required, Pick, Omit, and Record differ?

**Deep explanation:** `Partial<T>` makes properties optional and `Required<T>` makes them required. `Pick<T, K>` retains chosen keys, `Omit<T, K>` removes them, and `Record<K, V>` constructs an object from key and value types. These transformations are shallow.

**Interview answer:** “`Partial` and `Required` change optionality, `Pick` and `Omit` select or remove fields, and `Record` builds a key-to-value object type.”

8. How do Extract, Exclude, NonNullable, and Awaited work?

**Deep explanation:** `Extract<U, M>` keeps union members assignable to `M`; `Exclude<U, M>` removes them. `NonNullable<T>` removes `null` and `undefined`, while `Awaited<T>` recursively computes the value produced by awaiting a promise-like type.

**Interview answer:** “`Extract` filters a union in, `Exclude` filters members out, `NonNullable` removes nullish members, and `Awaited` unwraps async result types.”

9. How would you make a discriminated-union switch exhaustive?

**Deep explanation:** Switch on the common literal discriminator and pass the default-case value to `assertNever(value: never): never`. If a new union member is not handled, the value in that branch is not `never`, causing a compile-time error.

**Interview answer:** “I handle every discriminator and use an `assertNever` default. Adding a variant without adding a case then fails compilation.”

10. How would you write a trustworthy user-defined type guard?

**Deep explanation:** Accept `unknown` and perform real runtime checks for the entire shape claimed by the `value is T` predicate, including null checks and property types. TypeScript trusts the predicate without proving its body, so complex external data is safer with a schema validator.

**Interview answer:** “I start with `unknown` and verify every property required by the claimed type. Since the compiler trusts predicates, I avoid guards that only check one convenient field.”

11. How do assertion functions differ from type predicates?

**Deep explanation:** A type predicate returns a boolean and narrows only when it is true: `value is T`. An assertion function, `asserts value is T`, either throws or returns normally, and successful return narrows all following code.

**Interview answer:** “Predicates support conditional branching; assertion functions throw on failure and narrow for the remainder of the scope after they return.”

12. How does satisfies differ from a type annotation and a type assertion?

**Deep explanation:** `satisfies` checks compatibility with a target while preserving the expression's useful inferred type. An annotation makes the variable have the annotated type and may widen details; an assertion overrides the compiler and can bypass meaningful safety checks.

**Interview answer:** “I use `satisfies` to validate a value without replacing its inferred type. An annotation sets the type, whereas an assertion is an escape hatch based on evidence outside the compiler.”

13. How does as const affect literal inference and mutability?

**Deep explanation:** `as const` prevents literal widening, makes object-literal properties `readonly`, and converts array literals to readonly tuples. It is compile-time only and does not freeze the object at runtime or deeply freeze referenced objects.

**Interview answer:** “`as const` preserves narrow literal types and gives literals readonly properties or tuples. It does not provide runtime immutability.”

14. How do function overloads differ from union-typed parameters?

**Deep explanation:** A union parameter models one implementation accepting several values, usually with one broad return type. Overloads expose multiple call signatures and preserve different input-output relationships or arities; the implementation signature itself is not callable externally.

**Interview answer:** “I use a union for one behavior with a common return type, and overloads when different inputs imply different return types or call shapes.”

15. How would you type a function with a variable-length argument list?

**Deep explanation:** Use a rest parameter with an array for homogeneous arguments or a tuple for positional relationships. A reusable forwarding helper can infer a variadic tuple: `function call<A extends unknown[], R>(fn: (...args: A) => R, ...args: A): R`.

**Interview answer:** “I use rest parameters, and variadic tuple types when each position matters. Inferring `A extends unknown[]` preserves the complete argument list.”

16. How do template-literal types describe string patterns?

**Deep explanation:** Template-literal types interpolate literal unions into patterned strings, such as `type Handler = \u0060on\${Capitalize<"click" | "focus">}\u0060`. They constrain compile-time strings but do not validate arbitrary runtime input, and large cross-products can create unwieldy unions.

**Interview answer:** “They compose literal unions into structured string types, which is useful for event names, routes, and property conventions. Runtime strings still need runtime validation.”

17. How would you type event names and event payloads together?

**Deep explanation:** Define an event map, then index it with a generic key: `emit<K extends keyof Events>(name: K, payload: Events[K])`. This preserves the relationship, so each event name permits only its corresponding payload.

**Interview answer:** “I model events as a name-to-payload map and make the name generic. The payload type is `Events[K]`, so mismatched pairs fail compilation.”

18. How would you type a reusable React component with generic props?

**Deep explanation:** Put the relationship in generic props, such as `items: T[]` and `render: (item: T) => ReactNode`, then declare `function List<T>(props: ListProps<T>)`. JSX normally infers `T`; generic arrow functions in `.tsx` may require `<T,>` to avoid JSX ambiguity.

**Interview answer:** “I make the props generic around the relationship the component preserves—for example, an item array and a renderer for that same item type—and let JSX infer the type.”

19. How would you validate an API response and obtain a matching static type?

**Deep explanation:** Treat the decoded response as `unknown`, parse it with a runtime schema, and infer the static type from that schema when supported. This creates one source of truth; `as User` alone performs no runtime validation.

**Interview answer:** “I validate `unknown` at the network boundary with a schema and infer the TypeScript type from that schema. The resulting value is both runtime-checked and statically typed.”

20. How would you represent success and failure without throwing exceptions?

**Deep explanation:** Use a discriminated union such as `{ ok: true; value: T } | { ok: false; error: E }`. Callers must branch on `ok`, after which TypeScript narrows safely; this is especially appropriate for expected failures, though it adds explicit branching.

**Interview answer:** “I return a `Result<T, E>` discriminated union. It makes expected failure part of the contract and forces callers to handle either the value or the error.”

21. How would you prevent confusion between a user ID and an order ID?

**Deep explanation:** Plain string aliases remain structurally compatible, so use distinct branded types such as `string & { readonly __brand: "UserId" }`. Create them only at trusted validation or persistence boundaries; brands add compile-time separation but no runtime data.

**Interview answer:** “I use separate branded string types and controlled constructors. They behave as strings at runtime but cannot be accidentally interchanged at compile time.”

22. How does structural typing affect assignment compatibility?

**Deep explanation:** Compatibility depends on a value's members rather than its declared name. A value with at least the required compatible properties is assignable, enabling flexible composition and testing, but semantically different values with identical shapes need brands or wrappers for separation.

**Interview answer:** “TypeScript uses structural typing: matching shape matters, not interface or class names. That is flexible, but domain values with identical shapes may need nominal branding.”

23. When does excess-property checking apply?

**Deep explanation:** It primarily applies to fresh object literals assigned or passed directly to a known target type, catching likely typos. Once the object is stored in a variable, normal structural compatibility permits extra fields; it is therefore not an exact-object guarantee.

**Interview answer:** “Fresh object literals receive excess-property checks. Variables generally may contain extra properties because ordinary assignment only requires the target's shape.”

24. How does narrowing behave across callbacks and mutations?

**Deep explanation:** TypeScript retains narrowing only while it can prove the value has not changed. A deferred callback or an assignment may invalidate narrowing of mutable captured values or properties; capture the narrowed value in a `const`, pass it as an argument, or narrow again inside the callback.

**Interview answer:** “Narrowing can be lost when mutation may occur before use, especially across callbacks. I capture a stable local value or recheck at the point of use.”

25. What does noUncheckedIndexedAccess change?

**Deep explanation:** It adds `undefined` to potentially missing array and index-signature reads. This exposes out-of-bounds and absent-key risks, requiring a check, a safer accessor, or a narrowly justified assertion when an external invariant guarantees presence.

**Interview answer:** “It makes unchecked indexed reads return `T | undefined`, forcing me to handle missing array elements and dictionary keys.”

26. What does exactOptionalPropertyTypes change?

**Deep explanation:** With this option, `x?: T` means the property may be absent, but if present its value must be `T`. Explicit `undefined` is accepted only when included in the type, preserving the runtime distinction between absence and presence with an undefined value.

**Interview answer:** “It stops optional properties from implicitly accepting explicit `undefined`. If that state is valid, I write `x?: T | undefined`.”

27. How would you type a dictionary whose keys may be missing?

**Deep explanation:** For a finite key set, use `Partial<Record<K, V>>`; for arbitrary strings, use `{ [key: string]: V | undefined }`. Both make absence explicit at reads; `noUncheckedIndexedAccess` offers similar protection for ordinary index signatures.

**Interview answer:** “I use `Partial<Record<K, V>>` for known keys or an index signature returning `V | undefined` for open dictionaries, then check lookup results.”

28. How would you model JSON values without using any?

**Deep explanation:** Define a recursive union: `type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }`. This excludes values JSON cannot represent, including functions, symbols, `bigint`, and `undefined`.

**Interview answer:** “I model JSON recursively from primitives, arrays of JSON values, and string-keyed objects of JSON values, rather than weakening the boundary with `any`.”

29. How do module resolution and module output settings differ?

**Deep explanation:** `moduleResolution` controls how imports map to files and package metadata; `module` controls emitted module syntax and related semantics. Both should match the actual Node runtime or bundler, because a mismatched resolver may type-check behavior the runtime cannot load.

**Interview answer:** “Resolution answers which file and types an import refers to; output answers how modules are represented in emitted JavaScript. I align both with the runtime or bundler.”

30. How do type-only imports affect emitted JavaScript?

**Deep explanation:** `import type` is erased from emitted JavaScript, documenting that no runtime dependency or side effect is intended. A value used at runtime—such as a class used with `instanceof`—must use a normal import.

**Interview answer:** “Type-only imports exist only for checking and disappear from output. They make runtime dependencies explicit and prevent accidental module loading.”

31. What are declaration files used for?

**Deep explanation:** `.d.ts` files describe the public types of JavaScript or emitted libraries without containing runtime implementation. They can declare modules, globals, and package APIs, and library builds commonly publish them alongside JavaScript.

**Interview answer:** “Declaration files give the compiler and editor a typed view of code implemented elsewhere. They describe APIs but emit no runtime JavaScript.”

32. How would you add types for an untyped dependency?

**Deep explanation:** First check for bundled declarations or a suitable community types package. Otherwise create a local `.d.ts` with `declare module "package-name"` and accurately type the exports actually used; a bare declaration that makes everything `any` should be only a temporary migration bridge.

**Interview answer:** “I look for bundled types or `@types`, then write a local ambient module declaration for the used API if necessary. I avoid leaving the whole package as `any`.”

33. How would you share types across frontend and backend without sharing secrets or implementation?

**Deep explanation:** Create a dedicated contract package containing only public DTOs, validation schemas, or generated declarations. Keep database entities, environment configuration, and server implementation outside its dependency graph; runtime schemas or API-spec generation can keep validation and types aligned.

**Interview answer:** “I share a small contracts package with public request, response, and schema definitions only. Both sides depend on it, while server internals and configuration remain private.”

34. How would you migrate a JavaScript project to TypeScript incrementally?

**Deep explanation:** Enable mixed JS/TS with `allowJs`, use `checkJs` or `@ts-check` selectively, and preserve the working build. Convert well-defined or high-value boundaries first, tighten strict options in stages, and track temporary suppressions so broad assertions do not become permanent.

**Interview answer:** “I enable mixed JavaScript and TypeScript, keep runtime behavior stable, convert files incrementally, and increase strictness in measured stages backed by tests.”

35. How would you investigate a compiler error instead of silencing it with any?

**Deep explanation:** Read the full diagnostic, compare expected and actual types, and inspect inference at the nearest boundary. Reduce the failing expression, trace declarations and generics, verify compiler settings and dependency versions, and validate `unknown`; use a localized assertion only when runtime evidence proves what the compiler cannot.

**Interview answer:** “I identify the expected-versus-actual mismatch, inspect inference and declarations, and reduce the case until the model error is clear. I fix that boundary rather than hiding it with `any`.”
