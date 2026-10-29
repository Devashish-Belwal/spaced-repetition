1. What are JavaScript's primitive types?

**Deep explanation:** JavaScript has seven primitives: `string`, `number`, `bigint`, `boolean`, `undefined`, `symbol`, and `null`. They are immutable values and compare by value; arrays, functions, and other objects generally compare by reference.

**Interview answer:** The seven primitives are string, number, bigint, boolean, undefined, symbol, and null. They are immutable values; everything else is an object.

2. How do var, let, and const differ?

**Deep explanation:** `var` is function-scoped, can be redeclared, and is hoisted as `undefined`. `let` and `const` are block-scoped and remain in the temporal dead zone until declared. `let` permits reassignment; `const` prevents rebinding, but does not make an object immutable.

**Interview answer:** `var` is function-scoped and hoisted to undefined. `let` and `const` are block-scoped with a TDZ; let can be reassigned, while const cannot be rebound.

3. What is the temporal dead zone?

**Deep explanation:** The TDZ lasts from entering a scope until its `let`, `const`, or `class` declaration is evaluated. The binding exists but accessing it throws a `ReferenceError`, preventing use before initialization.

**Interview answer:** The TDZ is the period before a let, const, or class binding is initialized. Accessing it then throws a ReferenceError.

4. What is hoisting, and which declarations behave differently?

**Deep explanation:** Hoisting describes declarations being registered before execution. Function declarations are initialized with their functions; `var` is initialized to `undefined`; `let`, `const`, and classes exist but are inaccessible in the TDZ. Function expressions follow their variable's rules.

**Interview answer:** Function declarations are fully available before their line, var starts as undefined, and let, const, and classes cannot be accessed until declaration.

5. How do undefined and null differ?

**Deep explanation:** `undefined` usually means a value was not supplied or initialized; `null` normally means “no value” was assigned intentionally. They are different primitives: `null == undefined` is true, but strict equality is false.

**Interview answer:** Undefined usually means absent or uninitialized, while null is an explicit empty value. They are not strictly equal.

6. Why is typeof null surprising?

**Deep explanation:** `typeof null` returns `"object"` even though null is primitive. This historical bug remains for compatibility, so null should be tested with `value === null`.

**Interview answer:** It returns `"object"` because of a legacy JavaScript bug. I detect null with strict equality.

7. How do strict equality and loose equality differ?

**Deep explanation:** Strict equality (`===`) does not coerce types. Loose equality (`==`) applies conversion rules, producing results such as `0 == false`. Prefer strict equality unless coercion is deliberate, such as `value == null` to match both nullish values.

**Interview answer:** Strict equality compares without coercion; loose equality may convert operands first. I normally use strict equality for predictability.

8. What values are falsy?

**Deep explanation:** Falsy values are `false`, `0`, `-0`, `0n`, `NaN`, `""`, `null`, and `undefined`. Empty arrays and objects are truthy.

**Interview answer:** False, numeric and bigint zero, negative zero, NaN, the empty string, null, and undefined are falsy. Empty arrays and objects are truthy.

9. How do nullish coalescing and logical OR differ?

**Deep explanation:** `a ?? b` falls back only when `a` is null or undefined. `a || b` falls back for every falsy value, including valid values such as `0`, `false`, and `""`.

**Interview answer:** Nullish coalescing defaults only null or undefined; logical OR defaults any falsy value.

10. What does optional chaining stop evaluating?

**Deep explanation:** Optional chaining stops one continuous property, element, or call chain when the value before `?.` is nullish, returning undefined. It also skips computed keys or call arguments in that short-circuited part. Grouping can break the chain: `(obj?.a).b` may throw.

**Interview answer:** It short-circuits a continuous chain when the left side is nullish. Parentheses can end that protection.

11. How do strings, numbers, and booleans convert implicitly?

**Deep explanation:** Context selects coercion: conditions use truthiness, most arithmetic uses numeric conversion, and concatenation uses string conversion. Thus `"5" - 1` is `4`, while `"5" + 1` is `"51"`. Explicit conversion usually communicates intent better.

**Interview answer:** Conditions use Boolean coercion, most arithmetic uses numeric coercion, and concatenation uses string coercion. I prefer explicit conversion at boundaries.

12. Why can adding two values concatenate instead of adding numerically?

**Deep explanation:** Binary `+` handles both addition and concatenation. After objects become primitives, if either operand is a string, both are converted to strings; otherwise numeric addition occurs. Therefore `1 + "2"` is `"12"`.

**Interview answer:** Plus is overloaded: if either primitive operand is a string it concatenates; otherwise it adds numerically.

13. How do NaN, Infinity, and negative zero behave?

**Deep explanation:** `NaN` represents an invalid numeric result and is unequal to itself; use `Number.isNaN`. Infinities are numeric values. `-0 === 0`, but `Object.is(-0, 0)` is false and `1 / -0` is `-Infinity`.

**Interview answer:** NaN is an invalid number detected with Number.isNaN. Infinities are numbers, and negative zero mostly equals zero but Object.is can distinguish it.

14. How would you check whether a value is a valid finite number?

**Deep explanation:** Use `Number.isFinite(value)`; it returns true only for actual finite numbers and does not coerce strings. The global `isFinite` coerces, so `"42"` can pass unexpectedly.

**Interview answer:** I use `Number.isFinite(value)`, optionally alongside a typeof check for clarity. It rejects NaN, infinities, and non-numbers without coercion.

15. How do function declarations and function expressions differ?

**Deep explanation:** A function declaration is fully initialized during hoisting and may be called before its source line. A function expression is created when execution reaches it, and availability follows the variable holding it. Expressions fit callbacks and composition well.

**Interview answer:** Function declarations are fully hoisted; function expressions are created when their expression executes and follow their variable's access rules.

16. How do arrow functions differ from regular functions?

**Deep explanation:** Arrows capture lexical `this` and lack their own `arguments`, `super`, and `new.target`. They cannot be constructors. Regular functions suit methods needing call-site `this` and constructor use; arrows suit callbacks.

**Interview answer:** Arrow functions inherit this, lack their own arguments, and cannot be called with new. Regular functions get this from how they are invoked.

17. What determines the value of this?

**Deep explanation:** For regular functions, the call site determines `this`: a method call uses its receiver, `call`/`apply`/`bind` can set it, and `new` creates a receiver. A plain strict-mode call uses undefined. Arrows inherit surrounding `this`.

**Interview answer:** Regular-function this depends on how the function is called; arrow-function this comes from the surrounding lexical scope.

18. How do call, apply, and bind differ?

**Deep explanation:** `call` invokes immediately with separate arguments. `apply` invokes immediately with an array-like argument list. `bind` returns a new function with `this` and optional leading arguments fixed for later.

**Interview answer:** Call invokes now with individual arguments, apply invokes now with an array-like list, and bind returns a configured function for later.

19. What is lexical scope?

**Deep explanation:** Lexical scope means variable visibility depends on where code is written, not where a function is called. Identifier lookup walks from the current scope outward, allowing inner code to use outer bindings.

**Interview answer:** Lexical scope means a function's accessible variables are determined by its position in the source code.

20. What is a closure?

**Deep explanation:** A closure is a function retaining access to its creation scope after outer execution ends. It enables private state, factories, and callbacks—for example, a counter retaining `count`. Retained references can also keep memory alive.

**Interview answer:** A closure is a function plus continued access to variables from its creation scope. It is useful for state and callbacks.

21. How do rest parameters and spread syntax differ?

**Deep explanation:** Rest collects remaining values into an array, as in `function f(x, ...rest)`. Spread expands an iterable into arguments or elements, or an object's enumerable own properties into another object. They use the same `...` syntax for opposite operations.

**Interview answer:** Rest collects many values into one variable; spread expands one iterable or object into multiple values or properties.

22. How does destructuring handle missing values?

**Deep explanation:** Missing elements or properties produce undefined. A default applies only when the extracted value is undefined, not null or another falsy value. Destructuring a nullish source itself throws unless a fallback source is supplied.

**Interview answer:** Missing destructured values become undefined, and defaults apply only to undefined. A nullish source cannot itself be destructured.

23. How do map, filter, reduce, and forEach differ?

**Deep explanation:** `map` returns transformed values, `filter` returns selected elements, `reduce` accumulates one result, and `forEach` performs side effects and returns undefined. Each normally traverses the array in O(n) time.

**Interview answer:** Map transforms, filter selects, reduce accumulates, and forEach performs side effects without producing a useful result array.

24. How do find, some, and every differ?

**Deep explanation:** `find` returns the first matching element or undefined. `some` tests whether any element matches; `every` tests whether all match. Each short-circuits when its result is known and is O(n) in the worst case.

**Interview answer:** Find returns the first match, some checks whether any match exists, and every checks whether all match. All short-circuit.

25. How do slice and splice differ?

**Deep explanation:** `slice` returns a shallow copy of a range without mutation. `splice` mutates an array by removing or inserting elements and returns removed elements. `toSpliced` offers a non-mutating splice-style alternative.

**Interview answer:** Slice copies a range without mutation; splice mutates to remove or insert items and returns removed items.

26. How does Array.sort behave without a comparator?

**Deep explanation:** Default `sort` converts elements to strings and compares UTF-16 code units, so `[2, 10]` becomes `[10, 2]`. It mutates the array. Numeric sorting needs `(a, b) => a - b`; `toSorted` avoids mutation.

**Interview answer:** Default sort mutates and orders string representations. For numbers I pass `(a, b) => a - b` and copy first if needed.

27. How do objects, Maps, and Sets differ?

**Deep explanation:** Objects use string or symbol property keys and suit records. `Map` accepts keys of any type, preserves insertion order, and exposes `size`. `Set` stores unique values and suits membership tests and deduplication.

**Interview answer:** Objects suit named record fields, Maps suit arbitrary key-value associations, and Sets suit unique values and membership checks.

28. What is a prototype chain?

**Deep explanation:** Ordinary objects reference a prototype. If a property is absent, JavaScript searches successive prototypes until finding it or reaching null. Shared prototype methods avoid duplicating a function per instance.

**Interview answer:** The prototype chain is JavaScript's inheritance lookup path: missing properties are searched on successive prototypes until the chain ends.

29. How do class syntax and constructor functions relate?

**Deep explanation:** Classes use JavaScript's prototype-based construction model; class methods live on the constructor's prototype. They add clearer syntax and semantics such as `extends`, `super`, private fields, strict-mode bodies, and mandatory `new`.

**Interview answer:** Classes are syntax around the same prototype model used by constructor functions, with features like extends, super, and private fields.

30. How do try, catch, finally, and throw interact?

**Deep explanation:** `throw` stops normal execution and searches for a `catch`; `catch` handles the thrown value. `finally` runs after try or catch even on return or another throw, making it suitable for cleanup. Returning from finally can mask an earlier result.

**Interview answer:** Throw raises an exception, catch handles it, and finally runs regardless for cleanup. I avoid returning from finally because it can override outcomes.

31. What is the difference between synchronous code and a Promise callback?

**Deep explanation:** Synchronous code runs immediately on the current call stack and blocks subsequent statements. Promise reactions run asynchronously as microtasks after the stack finishes, even for an already-settled promise, and before the next timer task.

**Interview answer:** Synchronous code runs on the current stack. Promise callbacks run later in the microtask queue after that stack completes.

32. How does async/await change the way asynchronous code is written?

**Deep explanation:** An `async` function always returns a promise. `await` pauses only that function until settlement, making promise code read sequentially and work with `try/catch`. Start independent work together and use `Promise.all` to avoid unnecessary serialization.

**Interview answer:** Async/await is promise syntax that reads sequentially. Await pauses the async function, not the thread, and independent tasks can still run concurrently.

33. How would you copy a simple object without changing the original?

**Deep explanation:** Use `{...original}` or `Object.assign({}, original)`. Both are shallow copies, so nested objects remain shared. Use `structuredClone` or domain-specific copying when nested values must be independent.

**Interview answer:** I use object spread for a simple shallow copy. If nested references must also be copied, I use structuredClone or tailored logic.

34. What does JSON serialization omit or change?

**Deep explanation:** In objects, JSON omits undefined, functions, and symbols; in arrays they become null. It changes NaN and infinities to null, dates to strings, and loses prototypes and identity. It throws on BigInt by default and on circular references.

**Interview answer:** JSON loses unsupported values and types: it omits some object properties, changes non-finite numbers and dates, loses prototypes, and cannot directly handle BigInt or cycles.

35. How would you distinguish a missing property from a property containing undefined?

**Deep explanation:** Both read as undefined, so test existence. `Object.hasOwn(obj, key)` checks an own property regardless of value; `key in obj` also counts inherited properties.

**Interview answer:** I use `Object.hasOwn(obj, key)` for own-property existence. The `in` operator includes inherited properties.
