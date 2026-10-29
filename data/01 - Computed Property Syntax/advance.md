1. What types are supported in computed property syntax, and what runtime edge cases exist regarding type coercion and Symbols?

**Deep explanation:** In JavaScript, object property keys must be either `String`s or `Symbol`s. Any expression placed inside computed property brackets is evaluated at runtime, and non-Symbol results undergo automatic type conversion:
- **Object keys and coercion:** If an object is passed as a key (e.g., `{ [{ id: 1 }]: "value" }`), JavaScript invokes its `toString()` method, resolving to the string `"[object Object]"`. If multiple object instances are used as keys, they collide and overwrite each other because they evaluate to the exact same string. If object reference identity must serve as keys, a `Map` or `WeakMap` should be used instead.
- **Primitives:** Numbers and booleans are coerced to strings (e.g., `[100]` becomes `"100"`, `[true]` becomes `"true"`).
- **Symbols:** Symbols retain their unique identity and do not coerce to strings. Computed property syntax is the primary way to define Symbol-keyed properties directly inside object literals (e.g., `const id = Symbol('id'); const obj = { [id]: 42 };`), which is critical for unique identifiers, hidden metadata, or implementing well-known protocols like `[Symbol.iterator]`.
- **Evaluation timing:** Expressions inside brackets are evaluated sequentially from left to right as the object literal is created. If an expression throws an error, object construction terminates immediately.

**Interview answer:** "Expressions inside computed properties coerce to strings unless they evaluate to a Symbol. A critical edge case is using objects as keys, which stringify to `\"[object Object]\"` and overwrite each other, meaning a `Map` must be used instead when object references are needed as keys."
