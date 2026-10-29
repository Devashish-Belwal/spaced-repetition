1. How does `z.coerce.date()` validate malformed or invalid dates, and what are its potential pitfalls?

**Deep explanation:** In JavaScript, executing `new Date("invalid-date-string")` does not throw an exception; instead, it returns a `Date` object whose internal time value is `NaN` (represented as `"Invalid Date"` when converted to a string).

`z.coerce.date()` protects against this behavior through internal validation checks:
1. It passes the raw input through `new Date(input)`.
2. It verifies validity by checking `isNaN(coercedDate.getTime())`.
3. If `getTime()` returns `NaN`, Zod rejects the value and throws a validation error with the issue code `invalid_date`, ensuring that corrupt date instances never bypass the schema barrier.

**Edge Cases and Pitfalls:**
- **Permissive native parsing:** JavaScript's `Date` constructor is notoriously lenient. Strings like `"2026"` or `"2026-02-31"` can produce unexpected results (e.g., rolling forward into March or parsing single numbers as millisecond offsets or years depending on format).
- **Timezone ambiguities:** Date strings without explicit UTC offsets (e.g., `"2026-09-15"`) may be interpreted differently depending on whether the runtime engine parses them as UTC or local time, potentially causing off-by-one-day bugs.
- **Strict alternatives:** When strict ISO-8601 formatted strings are required, developers often prefer `z.string().datetime()` to validate the string structure before transforming it via `.transform((str) => new Date(str))` or chaining constraints such as `.min()` and `.max()` directly on `z.coerce.date()`.

**Interview answer:** "When parsing invalid date strings, `new Date(val)` creates an `Invalid Date` whose time value is `NaN`. `z.coerce.date()` detects this using `isNaN(val.getTime())` and triggers an `invalid_date` validation error, preventing corrupt dates from propagating into the system."
