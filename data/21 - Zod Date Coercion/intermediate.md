1. How does `z.coerce.date()` bridge the gap between HTTP network payloads and ORM layers like Prisma?

**Deep explanation:** Modern backend applications operate with strict data contracts across architectural boundaries:
- **Wire format (HTTP / DTO):** Incoming client payloads are untyped text/JSON where dates exist exclusively as serialized strings (e.g., `{ "deadline": "2026-09-15" }`).
- **Data Persistence (ORM / Prisma):** Prisma models declare date columns using the `DateTime` type (e.g., `deadline DateTime`). In the generated Prisma Client TypeScript types, `DateTime` maps strictly to TypeScript's native `Date` object (e.g., `deadline: Date`).

If an application skips coercion and passes the raw request payload directly into a database call (e.g., `prisma.task.create({ data: req.body })`), two major failures occur:
1. **TypeScript compilation errors:** The incoming request type `{ deadline: string }` does not satisfy Prisma's expected `{ deadline: Date }` type signature.
2. **Runtime ORM rejection:** Prisma runtime engines perform strict parameter validation; passing a string into a `DateTime` field throws a runtime `PrismaClientValidationError` (`Invalid value for argument deadline: Expected Date, provided String`).

By applying `z.coerce.date()` in the input validation pipeline (e.g., Next.js Server Actions, Route Handlers, or Express middleware), the DTO parsing step transforms the serialized string into a validated `Date` object. The inferred TypeScript type (`z.infer<typeof Schema>`) aligns 1:1 with Prisma's input types, guaranteeing type safety at compile time and runtime stability during database operations.

**Interview answer:** "Prisma's `DateTime` field requires a JavaScript `Date` instance, but HTTP APIs receive dates as serialized JSON strings. `z.coerce.date()` bridges this boundary by parsing and transforming the string into a `Date` object during request validation, satisfying both TypeScript's type checker and Prisma's runtime schema."
