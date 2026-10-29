1. Why must Server Actions be treated as public HTTP endpoints, and what security practices are required to protect them?

**Deep explanation:** A common misconception is that because Server Actions are defined alongside frontend code and imported like regular TypeScript functions, they are private or internally protected. In reality, Next.js exposes every exported Server Action as a publicly reachable HTTP `POST` endpoint accessible by anyone using tools like `curl`, Postman, or custom scripts.

Because of this public exposure, developers must apply strict backend security practices to every Server Action:
- **Authentication and Session Verification:** Never assume an action is safe because its UI trigger (e.g., an "Admin Delete" button) is conditionally rendered. Every Server Action must independently extract the user session from cookies or headers and verify that the caller is authenticated.
- **Authorization and Access Control:** Verify that the authenticated user possesses the specific permissions to perform the requested operation (e.g., checking tenant boundaries, verifying that `userId` matches the resource's owner before updating or deleting records).
- **Strict Input Validation and Sanitization:** Treat all incoming arguments and `FormData` entries as completely untrusted. Attackers can forge POST requests with malicious or malformed payloads, bypassing client-side validation. Always parse and validate inputs using schema libraries like Zod:
  ```typescript
  const schema = z.object({ title: z.string().min(1).max(100) });
  const parsed = schema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { error: parsed.error.flatten() };
  ```
- **CSRF Protection:** Next.js provides built-in protection against Cross-Site Request Forgery for Server Actions by comparing the incoming request's `Origin` and `Host` headers, ensuring the request originated from the same domain.
- **Closure and Argument Safety:** When Server Actions reference variables from outer scopes in Server Components, Next.js signs and serializes those arguments. However, sensitive credentials or internal IDs should never be exposed in client-accessible parameters.

**Interview answer:** "Because Next.js exposes every Server Action as a publicly accessible HTTP POST endpoint, you cannot rely on client-side button hiding for security. Every Server Action must independently verify user authentication, validate authorization and resource ownership, and strictly sanitize all inputs using libraries like Zod."

2. How do Server Actions coordinate data mutations with Next.js App Router caching layers using `revalidatePath` and `revalidateTag`?

**Deep explanation:** In Next.js App Router architectures, read operations frequently leverage aggressive multi-layer caching, including the Data Cache (cached `fetch` requests) and the Full Route Cache (prerendered HTML and RSC payloads). When a Server Action mutates data in persistent storage (e.g., PostgreSQL via Prisma or Drizzle), the cached data becomes stale and must be purged.

Next.js provides cache revalidation primitives designed specifically to be called inside Server Actions:
- `revalidatePath(path: string, type?: 'page' | 'layout')`: Purges the Data Cache and Full Route Cache for a specific URL or path hierarchy. For example, `revalidatePath('/todos')` invalidates the cached todos page, forcing the server to re-render the Server Components on that route.
- `revalidateTag(tag: string)`: Enables fine-grained, entity-level cache invalidation across multiple routes. When fetching data, requests can be tagged:
  ```typescript
  fetch('https://api.example.com/todos', { next: { tags: ['todos'] } });
  ```
  Calling `revalidateTag('todos')` inside the Server Action immediately purges all cached entries marked with that tag, regardless of which pages or components consume them.

A critical architectural advantage of Next.js Server Actions is the **Single Roundtrip Mutation and UI Refresh**. In traditional REST/GraphQL workflows, a client issues a POST mutation, waits for completion, and then triggers secondary GET requests or manual client cache updates. In Next.js, when a Server Action calls `revalidatePath` or `revalidateTag`, the server executes the mutation, revalidates the cache, re-renders the affected Server Component tree, and streams the updated RSC payload back to the client in that exact same HTTP POST response. This eliminates network waterfalls and ensures the UI updates instantly with fresh data.

**Interview answer:** "Server Actions invalidate Next.js caches using `revalidatePath` for route-level cache purges or `revalidateTag` for fine-grained, tag-based data cache invalidation. Uniquely, Next.js executes the mutation and returns the fresh Server Component UI payload in the same HTTP POST roundtrip, eliminating secondary fetch waterfalls."