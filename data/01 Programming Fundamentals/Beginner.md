1. What is the difference between source code, machine code, a compiler, and an interpreter?

**Deep explanation:** Source code is the human-readable program a developer writes. A CPU executes machine code: low-level binary instructions for a particular processor. A compiler translates a program before execution, often producing an executable or intermediate bytecode. An interpreter processes code through another program at runtime. Modern runtimes may combine both approaches, such as interpreting first and just-in-time compiling frequently used code.

**Interview answer:** Source code is what developers read and write; machine code is what the CPU executes. A compiler translates code before it runs, while an interpreter processes it at runtime. Some platforms use both—for example, compiling to bytecode and then interpreting or JIT-compiling it.

2. How do static typing and dynamic typing differ?

**Deep explanation:** Static typing checks type compatibility before normal execution, usually during compilation. Dynamic typing checks types when the relevant operation runs, and a variable may refer to different types over time. Static typing catches many mistakes earlier and often improves tooling; dynamic typing can require less annotation and support rapid experimentation. Neither approach alone guarantees good software.

**Interview answer:** Static typing checks types before execution, so many errors are caught during compilation. Dynamic typing checks them at runtime. Static typing usually gives earlier feedback and stronger tooling, while dynamic typing offers flexibility and can be convenient for prototyping.

3. What distinguishes primitive values from reference values?

**Deep explanation:** A primitive is a basic value such as a Boolean, character, or number. A reference identifies an object stored elsewhere, such as a list or class instance. Copying a primitive generally creates an independent value; copying a reference generally makes two variables reach the same object, so a mutation through one may be visible through the other. Exact categories vary by language.

**Interview answer:** A primitive directly represents a simple value, while a reference identifies an object elsewhere in memory. Copying a primitive normally gives an independent value; copying a reference normally lets both variables access the same object.

4. How do signed and unsigned integers represent values?

**Deep explanation:** An unsigned integer uses all its bits for non-negative values. A signed integer can also represent negatives, usually using two's complement. Thus 8-bit unsigned covers 0–255, while 8-bit signed commonly covers -128–127. Unsigned offers a larger positive maximum, but mixing signed and unsigned values can cause surprising conversions.

**Interview answer:** Signed integers represent negative and non-negative values; unsigned integers represent only zero and positive values. With 8 bits, signed is typically -128 to 127 and unsigned is 0 to 255.

5. What happens when an integer exceeds its supported range?

**Deep explanation:** Going above the maximum is overflow; going below the minimum is underflow. Depending on the language and configuration, a fixed-width value may wrap around, raise an error, or be promoted to a larger representation. For example, an 8-bit unsigned 255 may wrap to 0 after adding 1. Boundary-sensitive code should use suitable types, validation, or checked arithmetic.

**Interview answer:** It causes overflow or underflow. The value may wrap, raise an error, or expand, depending on the language. I check the language rules and use validation or checked arithmetic when the range matters.

6. Why can floating-point arithmetic produce unexpected results?

**Deep explanation:** Floating-point numbers have limited precision and use binary. Many decimal fractions, including 0.1, have no exact finite binary representation, so the computer stores a nearby approximation. That is why `0.1 + 0.2` may not equal exactly `0.3`. Calculated floats are usually compared with a tolerance.

**Interview answer:** Floating point uses limited binary precision, so many decimal values cannot be represented exactly. Operations can therefore have small rounding errors. I compare calculated floats using a suitable tolerance and use decimal arithmetic when exact base-10 behavior matters.

7. When would you use a decimal type instead of a floating-point type?

**Deep explanation:** Decimal types suit values governed by base-10 precision and rounding rules, especially money and accounting. Floating point is efficient for graphics, science, and measurements where tiny approximation errors are acceptable. Decimal still has finite precision, but values such as 0.1 can usually be represented exactly within it.

**Interview answer:** I use decimal for money or business calculations requiring predictable base-10 rounding. I use floating point for scientific or graphical calculations where small approximation errors are acceptable.

8. What is the difference between a variable, a constant, and a literal?

**Deep explanation:** A variable is a named binding whose value can usually change. A constant is a named binding intended or enforced not to be reassigned. A literal is a value written directly in code, such as `42`, `true`, or `"hello"`. In `const limit = 42`, `limit` is the constant and `42` is the literal.

**Interview answer:** A variable is a named value that can change, a constant is a named value that should not be reassigned, and a literal is the value written directly in source code.

9. How do declaration, initialization, and assignment differ?

**Deep explanation:** Declaration introduces a variable name and possibly its type. Initialization supplies its first value. Assignment stores a value in an already declared variable. In `int count = 0`, declaration and initialization happen together; `count = 5` is a later assignment.

**Interview answer:** Declaration introduces the variable, initialization gives it its first value, and assignment supplies or replaces its value after declaration.

10. What is implicit type conversion, and when can it surprise you?

**Deep explanation:** Implicit conversion is an automatic change from one type to another, such as promoting an integer during floating-point arithmetic. It can truncate decimals, lose precision, overflow, or change an operation: in some languages, `"5" + 2` produces `"52"`. Explicit conversion is clearer when the intended meaning is not obvious.

**Interview answer:** It is a type conversion the language performs automatically. It can surprise me through truncation, precision loss, overflow, or string coercion, so I prefer explicit conversion when the result could be ambiguous.

11. How do equality and identity differ?

**Deep explanation:** Equality asks whether values have equivalent content. Identity asks whether two references point to the exact same object. Two separate lists containing the same items may be equal but not identical. Equality is appropriate for most data comparisons; identity matters for singletons, sentinels, and aliasing.

**Interview answer:** Equality compares contents or values, while identity checks whether two references indicate the same object instance.

12. What is the difference between a null value and an empty value?

**Deep explanation:** Null normally means no value or object is present. Empty means a value exists but contains nothing, such as `""` or `[]`. An empty list can be iterated and has length zero; using a null reference may fail. They can also have different business meanings and should be modeled deliberately.

**Interview answer:** Null means absence of a value. Empty means a value exists but has no contents. They require different handling because an empty collection is usable, whereas accessing null may cause an error.

13. How do Boolean short-circuit operators affect evaluation?

**Deep explanation:** In `A && B`, `B` is skipped if `A` is false; in `A || B`, `B` is skipped if `A` is true. The result is already known. This enables safe guards such as checking an object is not null before reading a property, but it also means side effects in a skipped operand do not occur.

**Interview answer:** Short-circuiting stops evaluation once the result is known. AND skips the right side when the left is false; OR skips it when the left is true. This is useful for safe guard conditions.

14. What distinguishes an expression from a statement?

**Deep explanation:** An expression evaluates to a value, such as `price * quantity`. A statement is a complete instruction, such as a declaration, assignment, or loop. Expressions often appear inside statements. The boundary varies because some languages allow constructs such as `if` to produce values.

**Interview answer:** An expression produces a value; a statement performs a complete action. For example, multiplication is an expression that can appear inside an assignment statement.

15. When would you use a loop instead of recursion?

**Deep explanation:** A loop suits straightforward repetition, such as processing an array, and normally uses constant call-stack space. Recursion can express naturally recursive structures such as trees more clearly, but each call may add a stack frame and deep input can overflow the stack. Choose based on clarity, expected depth, and performance.

**Interview answer:** I use a loop for ordinary sequential repetition, especially over large collections. I consider recursion when the problem is naturally recursive, such as tree traversal, while checking that the depth cannot exhaust the call stack.

16. What are a function's parameters, arguments, return value, and side effects?

**Deep explanation:** Parameters are input names in the definition; arguments are actual values at the call site. A return value is sent back to the caller. A side effect is another observable action, such as mutating shared state, writing a file, or printing. Separating calculations from side effects often improves testing.

**Interview answer:** Parameters are named inputs in a definition, arguments are the values passed in, and the return value is the result sent back. Side effects are other observable changes, such as writing to a database or changing shared state.

17. How do local, global, and block scope differ?

**Deep explanation:** Scope determines where a name is accessible. A local variable is available within its function, a global across a broad program or module region, and a block-scoped variable only inside a block such as a loop. Narrow scope reduces accidental dependencies and name conflicts.

**Interview answer:** Local scope belongs to a function, global scope covers a wider program or module, and block scope is limited to a construct such as an `if` or loop. I prefer the narrowest practical scope.

18. What is variable shadowing?

**Deep explanation:** Shadowing occurs when an inner scope declares the same name as an outer scope. Inside, the new variable hides the outer one without replacing it. A parameter named `count`, for example, can hide a global `count`. It is often legal but can confuse readers.

**Interview answer:** Variable shadowing is when an inner variable has the same name as an outer variable and temporarily hides it. I avoid it when it makes the code ambiguous.

19. What is the difference between passing a value and sharing an object reference?

**Deep explanation:** Passing an independent value lets a function change its local parameter without changing the caller's variable. When a copied reference points to a shared mutable object, both caller and function can reach that object, so mutations may be visible outside. Reassigning the function's local reference usually does not redirect the caller's variable.

**Interview answer:** A copied value is independent. With a shared object reference, the reference is often copied but both sides reach the same object, so mutations can be visible to the caller; reassigning the local reference normally is not.

20. What is a recursion base case, and what happens without one?

**Deep explanation:** A base case returns without making another recursive call and is the stopping point. Each recursive step must move toward it. For factorial, zero is the simplest input. Without a reachable base case, calls accumulate until the runtime reaches its stack or recursion limit.

**Interview answer:** A base case is the stopping condition for recursion, and every recursive path must move toward it. Without one, calls continue until a stack overflow or recursion-limit error occurs.

21. What does the call stack contain during function execution?

**Deep explanation:** The call stack tracks active calls in last-in, first-out order. Each stack frame commonly holds local variables, arguments or related data, temporary state, and a return location. A called function finishes before its caller resumes. Excessive call depth can exhaust the stack.

**Interview answer:** It contains one stack frame per active function call, typically including locals, arguments, and the return location. Frames are pushed on calls and popped on returns.

22. How do stack memory and heap memory differ?

**Deep explanation:** Stack memory is closely tied to calls and is allocated and released predictably. Heap memory supports objects whose lifetimes are not limited to one call and is managed by garbage collection, ownership, or manual deallocation. A local stack variable can refer to a heap object. Runtimes may optimize actual placement.

**Interview answer:** The stack usually holds call frames and short-lived local data in LIFO order. The heap holds dynamically allocated objects with flexible lifetimes and needs garbage collection, ownership, or manual management.

23. What is the difference between mutable and immutable data?

**Deep explanation:** Mutable data can change in place while remaining the same object, such as appending to a list. Immutable data cannot change; an apparent update creates a new value, as commonly happens with strings. Immutability makes sharing safer, while controlled mutability can be convenient and efficient.

**Interview answer:** Mutable data can change in place after creation. Immutable data cannot, so an update creates a new value. Immutability reduces unexpected shared-state changes.

24. What is an exception, and how does it propagate?

**Deep explanation:** An exception signals an abnormal condition and interrupts normal control flow. The runtime searches for a matching handler in the current function, then its callers, unwinding stack frames along the way. Cleanup code may run during unwinding. If no handler exists, the operation or program normally terminates with an error.

**Interview answer:** An exception represents an error or unusual condition. If the current function does not catch it, it propagates up the call chain while the stack unwinds; if unhandled, it normally terminates the operation.

25. How do syntax errors, runtime errors, and logical errors differ?

**Deep explanation:** A syntax error violates language grammar and is caught during parsing or compilation. A runtime error happens while valid code executes, such as dereferencing null. A logical error lets the program run but gives the wrong result, such as using the wrong divisor. Tests are especially important for finding logical errors.

**Interview answer:** Syntax errors break the grammar, runtime errors occur during execution, and logical errors produce incorrect behavior even though the program runs.

26. How would you validate input before processing it?

**Deep explanation:** Validate at the boundary: check presence, parse safely, then check format, length, range, allowed values, and cross-field business rules. Reject invalid data with a clear error rather than guessing. Validation improves correctness, but security also needs safe APIs such as parameterized queries.

**Interview answer:** I validate required fields, type and format, length or range, allowed values, and business rules before processing. I handle parsing failures safely, return useful errors, and use security controls such as parameterized queries.

27. What makes a function pure?

**Deep explanation:** A pure function returns the same output for the same inputs and has no observable side effects. It does not mutate outside state or depend on changing data such as the current time. Pure functions are easier to test, cache, and reason about, though programs still need controlled impure code for I/O.

**Interview answer:** A pure function always gives the same result for the same inputs and has no side effects. That makes it predictable and easy to test.

28. What do time complexity and space complexity measure?

**Deep explanation:** Time complexity describes how operation count grows with input size; space complexity describes how extra memory grows. They express growth rather than exact seconds or bytes. They help compare scalability, though constants, hardware, and expected input sizes still matter.

**Interview answer:** Time complexity measures growth in work, and space complexity measures growth in extra memory as input grows. They describe scaling, not exact runtime or byte counts.

29. What do O(1), O(log n), O(n), and O(n squared) mean?

**Deep explanation:** O(1) stays roughly constant, such as array indexing. O(log n) grows slowly because each step removes a fixed fraction, as in binary search. O(n) scans proportionally to input size. O(n²) commonly processes every pair using nested loops. Doubling input roughly leaves O(1) unchanged, doubles O(n), and quadruples O(n²).

**Interview answer:** O(1) is constant growth, O(log n) repeatedly reduces the problem, O(n) grows linearly, and O(n²) grows quadratically, often from nested iteration over the data.

30. How would you explain your code to someone unfamiliar with it?

**Deep explanation:** Start with the problem, users, inputs, and outputs. Give a high-level flow in plain language, then walk through a small example. Explain important choices, dependencies, assumptions, edge cases, failure behavior, and side effects. Adjust detail to the listener instead of narrating every line.

**Interview answer:** I start with the problem and expected inputs and outputs, then explain the main flow in plain language. I use a small example and cover key design choices, dependencies, and edge cases, adjusting the detail to the listener.
