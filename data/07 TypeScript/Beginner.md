1. What does TypeScript add to JavaScript?

**Deep explanation:** TypeScript adds a static type system and developer tooling on top of JavaScript. It can catch type mismatches before execution, document intended data shapes, and improve autocomplete and refactoring. TypeScript compiles to ordinary JavaScript, so its types are normally erased and do not change runtime behavior.

**Interview answer:** TypeScript adds compile-time type checking and stronger tooling to JavaScript. It helps catch mistakes earlier, then emits JavaScript that runs in the usual JavaScript environments.

2. Which TypeScript checks happen at compile time rather than runtime?

**Deep explanation:** Assignability, argument and return types, property existence, access modifiers, exhaustiveness, and nullability are checked by the TypeScript compiler. These checks generally disappear from emitted JavaScript. Runtime validation—such as confirming that an API response really has a required field—still needs JavaScript code or a validation library.

**Interview answer:** Type compatibility, property access, function signatures, nullability, and similar rules are compile-time checks. TypeScript erases those types, so external or dynamic values still require runtime validation.

3. How do inferred types and explicit annotations differ?

**Deep explanation:** Inference lets TypeScript derive a type from context, as in `const count = 1`, while an annotation states it directly, as in `let count: number`. Inference reduces noise and usually preserves useful precision; annotations are valuable at public boundaries, when inference is too broad, or when documenting an intended contract.

**Interview answer:** Inferred types are calculated by the compiler from values and context; explicit annotations are written by the developer. I prefer inference for obvious local values and annotations for APIs or places where the intended contract is not obvious.

4. How do any, unknown, and never differ?

**Deep explanation:** `any` largely disables type checking for a value and allows almost every operation. `unknown` can hold any value but must be narrowed before it is used, so it is safer for untrusted input. `never` represents a value that cannot occur, such as the result of a function that always throws or an impossible branch in an exhaustive check.

**Interview answer:** `any` opts out of safety, `unknown` accepts any value but forces me to check it before use, and `never` means no value is possible. I use `unknown` rather than `any` at uncertain boundaries.

5. How do string, number, boolean, and literal types differ?

**Deep explanation:** `string`, `number`, and `boolean` describe broad sets of primitive values. Literal types describe one exact value, such as `'open'`, `42`, or `true`. Literal unions such as `'open' | 'closed'` model a finite set of allowed states more precisely than their broad primitive types.

**Interview answer:** Primitive types allow any value of that primitive, while a literal type allows one specific value. Literal unions are useful for constrained options such as status values.

6. How do arrays and tuples differ?

**Deep explanation:** An array contains a variable number of elements that normally share a type, such as `string[]`. A tuple describes a fixed sequence whose positions can have different types, such as `[number, string]`. Tuples are useful when position has meaning, but named object properties are often clearer for larger structures.

**Interview answer:** Arrays model variable-length collections of a common element type. Tuples model a fixed positional structure, potentially with a different type at each position.

7. How would you type a function's parameters and return value?

**Deep explanation:** Add annotations after each parameter and after the parameter list: `function add(a: number, b: number): number { return a + b; }`. TypeScript can often infer the return type, but an explicit return annotation makes exported contracts clear and catches accidental return-type changes.

**Interview answer:** I annotate parameters and place the return type after the closing parenthesis, for example `function add(a: number, b: number): number`.

8. How do optional and default parameters differ?

**Deep explanation:** An optional parameter, `value?: string`, may be omitted and is treated as `string | undefined` inside the function. A default parameter, `value = 'x'`, also may be omitted, but the fallback makes it a `string` after initialization. Parameters with defaults provide runtime behavior; `?` only describes optionality.

**Interview answer:** An optional parameter may be absent, so I must handle `undefined`. A default parameter supplies a runtime fallback when the argument is omitted or `undefined`.

9. What does a union type represent?

**Deep explanation:** A union `A | B` represents a value that may be any one of its member types. Only operations safe for every current member are allowed until control-flow checks narrow the value. Unions model alternatives without giving up type safety.

**Interview answer:** A union means a value can be one of several types, such as `string | number`. I narrow it before using members that are specific to one alternative.

10. What does an intersection type represent?

**Deep explanation:** An intersection `A & B` requires a value to satisfy both types simultaneously. It is commonly used to combine object capabilities, such as `User & Timestamped`. Conflicting properties can make an intersection impossible—for example, intersecting the same property as both `string` and `number` can produce `never` for that property.

**Interview answer:** An intersection combines requirements: the value must conform to every intersected type. It is useful for composing compatible object shapes.

11. How do type aliases and interfaces differ?

**Deep explanation:** Both can name object shapes and are often interchangeable there. Interfaces support declaration merging and are naturally extended with `extends`; type aliases can also name primitives, unions, tuples, intersections, and mapped or conditional types. A team can choose either for objects, while aliases are necessary for non-object compositions.

**Interview answer:** Both can describe object contracts. Interfaces support declaration merging and extension, while type aliases can represent a wider range of types such as unions and tuples.

12. How would you describe an object's optional properties?

**Deep explanation:** Put `?` after the property name: `type User = { middleName?: string }`. The property may be absent, and reading it generally gives `string | undefined`. This differs from a required property typed `string | undefined`, which must exist even though its value may be `undefined`.

**Interview answer:** I mark the property with `?`, for example `middleName?: string`. That means the property may be missing, so reads must account for `undefined`.

13. What does readonly protect, and what does it not protect?

**Deep explanation:** `readonly` prevents reassignment through the typed reference during type checking, such as replacing a readonly property. It is shallow: nested mutable objects may still change unless they are also readonly. It also provides no runtime freezing and may be bypassed through another mutable alias.

**Interview answer:** `readonly` blocks compile-time reassignment through that reference. It is shallow and erased at runtime, so it does not deeply freeze the object.

14. How does strictNullChecks change type checking?

**Deep explanation:** With `strictNullChecks`, `null` and `undefined` are distinct types rather than values assignable almost everywhere. Code must explicitly include them in a type and narrow them before use. This catches common missing-value errors but may require more checks when typing older code.

**Interview answer:** It makes `null` and `undefined` explicit instead of broadly assignable. Values that may be missing must be typed and checked before use.

15. How do null and undefined appear in types?

**Deep explanation:** They can be written directly in unions, such as `User | null` or `string | undefined`. Optional properties and parameters typically introduce `undefined`, while APIs often use `null` as an intentional empty result. Their exact meaning should be consistent within an API.

**Interview answer:** They are explicit types, usually included in unions such as `User | null`. Optional members generally add `undefined`, and callers must narrow either value before use.

16. What is type narrowing?

**Deep explanation:** Narrowing is TypeScript refining a broad type to a more specific one based on control flow. Checks such as `typeof`, equality, truthiness, discriminants, and custom type predicates provide evidence about the value. Inside the proven branch, TypeScript allows operations belonging to the narrower type.

**Interview answer:** Type narrowing is using runtime checks and control flow to let TypeScript determine a more specific type within a branch.

17. How does typeof narrow a union?

**Deep explanation:** A check such as `typeof value === 'string'` narrows `string | number` to `string` in that branch and to the remaining possibilities elsewhere. `typeof` works well for primitives and functions, but `typeof null` is `'object'`, so null requires a separate check.

**Interview answer:** Comparing `typeof` to values such as `'string'` or `'number'` narrows a union to the matching primitive in that branch. I remember that `null` is the historical `'object'` exception.

18. How do instanceof and in support narrowing?

**Deep explanation:** `value instanceof Class` checks a constructor's prototype chain and narrows to that class type, so it applies to runtime classes rather than erased interfaces. `'prop' in value` checks whether a property exists on an object or its prototype chain and can narrow unions whose members differ by known properties.

**Interview answer:** `instanceof` narrows using a runtime class/prototype check. The `in` operator narrows based on property presence, which is useful for object unions.

19. What is a discriminated union?

**Deep explanation:** It is a union whose members share a property with different literal values, such as `{ kind: 'ok'; data: T } | { kind: 'error'; message: string }`. Checking `kind` safely selects one member. A `switch` plus a `never` check can also enforce exhaustive handling when new variants are added.

**Interview answer:** A discriminated union gives each variant a shared literal tag. Checking that tag narrows to the correct shape and enables exhaustive handling.

20. What is a generic function?

**Deep explanation:** A generic function introduces one or more type parameters so its inputs and outputs can preserve relationships across many concrete types. For example, `function first<T>(items: T[]): T | undefined` returns the same element type the caller supplies. Generics are preferable to `any` because they retain type information and constraints.

**Interview answer:** A generic function is parameterized by types, allowing reusable logic while preserving relationships between inputs and outputs—for example, `first<T>(items: T[]): T | undefined`.

21. How would you type a Promise-returning function?

**Deep explanation:** Use `Promise<T>` as the return type, where `T` is the resolved value: `async function load(): Promise<User>`. An `async` function always returns a promise, even when its body returns a plain `User`; thrown errors reject the promise but are not represented in TypeScript's standard return type.

**Interview answer:** I type it as `Promise<T>`, such as `async function loadUser(): Promise<User>`.

22. How would you type a callback?

**Deep explanation:** Use a function type describing its parameters and result, such as `(value: string) => boolean`. A parameter can then be declared `predicate: (value: string) => boolean`, or the signature can be named with a type alias when reused. Use `void` when the caller ignores the callback's return value.

**Interview answer:** I use a function signature, for example `callback: (value: string) => boolean`, and extract it to a named type if it is reused.

23. How do public, private, and protected members differ in TypeScript?

**Deep explanation:** `public` members are accessible everywhere and are the default. `protected` members are accessible inside the declaring class and subclasses. TypeScript's `private` members are accessible only inside the declaring class; these modifiers primarily enforce access during type checking and do not necessarily provide runtime secrecy.

**Interview answer:** `public` is accessible anywhere, `protected` only in the class and subclasses, and TypeScript `private` only inside the declaring class.

24. How do TypeScript private members differ from JavaScript private fields?

**Deep explanation:** TypeScript's `private name` is normally a compile-time access restriction, while JavaScript's `#name` uses language-level runtime privacy. A `#` field cannot be accessed outside its class even from plain JavaScript or bracket notation. TypeScript understands both, so `#` is the choice when runtime encapsulation matters.

**Interview answer:** TypeScript `private` is mainly enforced by the type checker. JavaScript `#private` fields are enforced by the runtime and are truly inaccessible outside the class.

25. What is an enum, and what alternatives exist?

**Deep explanation:** An `enum` defines a named collection of constants and usually emits a runtime object. Alternatives include literal unions, `as const` objects, and plain constants; these often produce simpler JavaScript and compose well with structural typing. Enums remain useful when runtime enumeration or compatibility with enum-oriented APIs is wanted.

**Interview answer:** An enum is a named set of constants with a runtime representation. Common alternatives are literal unions and `as const` objects, which are often lighter and more composable.

26. What is a type assertion?

**Deep explanation:** A type assertion such as `value as User` tells the compiler to treat a value as a type when the developer has information the compiler cannot prove. It does not convert the value or add runtime checks. Assertions should therefore be narrow, justified, and avoided when proper narrowing or better types can prove the same fact.

**Interview answer:** A type assertion tells TypeScript how to treat a value; it does not transform or validate it. I use it only when I have evidence the compiler cannot infer.

27. Why does a type assertion not validate external data?

**Deep explanation:** Type annotations and assertions are erased during compilation, so `response as User` emits no field checks. External input can still be malformed and cause runtime failures. Validate it with explicit guards, parsing logic, or a runtime schema library, then expose the validated result as the desired type.

**Interview answer:** Assertions exist only for the compiler and emit no runtime code. External data needs runtime parsing or schema validation before it can be trusted.

28. What is the non-null assertion operator?

**Deep explanation:** The postfix `!`, as in `element!`, tells TypeScript to remove `null` and `undefined` from the expression's type. It adds no runtime check, so an incorrect assertion can still fail. It is best reserved for cases where an invariant is guaranteed elsewhere but cannot be expressed to the compiler.

**Interview answer:** Postfix `!` tells the compiler a value is not `null` or `undefined`. It performs no runtime check, so I use it sparingly and only with a real invariant.

29. What does tsconfig.json control?

**Deep explanation:** `tsconfig.json` defines the TypeScript project: which files are included, type-checking strictness, module and target settings, library definitions, module resolution, interoperability, and emit behavior. It can also extend a shared base configuration, allowing consistent settings across packages.

**Interview answer:** It configures the TypeScript project, including included files, strictness, JavaScript target, module system and resolution, libraries, and output behavior.

30. How would you enable stricter checks in a new project?

**Deep explanation:** Enable `"strict": true` in `tsconfig.json`; this activates a coordinated set of safety checks including strict null handling and stricter function and property analysis. Depending on the project, also consider flags such as `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitReturns`, and `noFallthroughCasesInSwitch`, introducing them early to avoid migration cost.

**Interview answer:** I start with `"strict": true`, then consider additional checks such as `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `noImplicitReturns` based on the codebase.
