1. Why is `z.coerce.date()` necessary instead of `z.date()` when validating date fields in HTTP requests?

**Deep explanation:** HTTP request bodies typically transmit data formatted as JSON, URL-encoded strings, or multipart form data. The JSON standard (RFC 8259) specifies primitives for strings, numbers, booleans, null, arrays, and objects, but it lacks a native representation for dates or timestamps. Consequently, dates are serialized across the network as ISO 8601 strings (e.g., `"2026-09-15"` or `"2026-09-15T08:30:00.000Z"`).

When defining validation schemas in Zod:
- `z.date()` enforces strict type validation by checking `input instanceof Date`. When an incoming JSON payload is parsed via `JSON.parse()`, any date value remains a primitive `string`. As a result, `z.date().parse("2026-09-15")` fails immediately with a `ZodError` stating `Expected date, received string`.
- `z.coerce.date()` overrides strict type checking by piping the input through JavaScript's native constructor `new Date(input)` before executing the date validation rules. This allows strings, numbers (Unix epoch millisecond timestamps), or existing `Date` objects to be automatically cast into valid JavaScript `Date` instances.

Using coercion at the network boundary eliminates boilerplate manual parsing (such as `new Date(req.body.deadline)`) and guarantees that downstream application layers receive a real `Date` object rather than a raw string.

**Interview answer:** "Because JSON has no native Date type, dates arrive over HTTP as strings; `z.date()` rejects them because it strictly checks `instanceof Date`. `z.coerce.date()` solves this by passing the incoming value to `new Date(val)` before validation, seamlessly converting valid date strings into native JavaScript Date instances."
