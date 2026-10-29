1. What is the fundamental difference between path parameters (`params`) and query parameters (`searchParams`) in Next.js, and how are repeated query keys typed?

**Deep explanation:** In Next.js, URL data is bifurcated into two distinct categories based on where it resides in the URL structure:
- **Path Parameters (`params`):** Extracted directly from dynamic URL path segments defined by the file system hierarchy (e.g., `app/blog/[slug]/page.tsx` matching `/blog/hello` maps to `{ slug: "hello" }`). Path parameters are foundational to the routing structure and can be known ahead of time at build time using `generateStaticParams()`.
- **Query Parameters (`searchParams`):** Extracted from the optional query string following the `?` delimiter (e.g., `/search?q=nextjs&page=2` maps to `{ q: "nextjs", page: "2" }`). Query parameters represent ephemeral, optional state—such as search terms, pagination offsets, filters, and sort orders—without altering the underlying routing hierarchy.

**Handling Repeated Keys and Typing:**
Unlike path parameters which map to a single string segment, URL query strings allow keys to be repeated multiple times (e.g., `/products?tag=react&tag=nextjs`). Next.js parses query strings so that:
- A single occurrence resolves to a `string`: `?tag=react` -> `{ tag: "react" }`
- Multiple occurrences resolve to an array of strings (`string[]`): `?tag=react&tag=nextjs` -> `{ tag: ["react", "nextjs"] }`
- Missing keys evaluate to `undefined`.

Consequently, in TypeScript, `searchParams` is typically typed with an index signature or explicit schema accommodating string arrays:
```typescript
type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;
```
When consuming query parameters, defensive checks such as `Array.isArray(tag)` or coercion via validation libraries (like Zod) ensure predictable handling regardless of whether the user supplied single or multiple query instances.

**Interview answer:** "Path parameters (`params`) identify dynamic route segments defined in the file system tree like `/blog/[slug]`, whereas query parameters (`searchParams`) appear after the `?` delimiter to provide optional state like filters or pagination. In Next.js, query parameter values are typed as `string | string[] | undefined` because repeated keys such as `?tag=react&tag=next` parse into arrays, while single instances parse into strings."
