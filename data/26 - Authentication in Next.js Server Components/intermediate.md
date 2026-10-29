1. How do Next.js Server Components securely access cookies, headers, and server-only secrets without risking credential leakage to the client?

**Deep explanation:** Next.js provides dedicated server-only functions within the App Router (`next/headers`), such as `cookies()` and `headers()`, which allow Server Components to read incoming request metadata directly within component code:
```tsx
import { cookies, headers } from 'next/headers';
import { db } from '@/lib/db';
import { decryptSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const cookieStore = await cookies(); // In Next.js 15, cookies() is asynchronous
  const sessionToken = cookieStore.get('session_token')?.value;

  if (!sessionToken) {
    redirect('/login');
  }

  const session = await decryptSession(sessionToken);
  if (!session?.userId) {
    redirect('/login');
  }

  // Safe direct database query using server-only credentials
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, role: true }, // Never select password hashes
  });

  return <DashboardView user={user} />;
}
```

This architecture provides robust security guarantees:
1. **Server-Only Execution Isolation:** Server Components run strictly within the server environment (Node.js or Edge runtime). Their code is compiled away from the browser JavaScript bundle. The client receives only the rendered output (the RSC payload containing serialized JSX props and DOM elements), meaning database connection strings, private API keys, and JWT verification secrets (`process.env.AUTH_SECRET`) remain completely inaccessible to the browser.
2. **Accessing `HttpOnly` Cookies Directly:** Because `HttpOnly` cookies cannot be accessed via browser JavaScript (`document.cookie`), traditional client components cannot read them directly. Server Components, however, read the raw incoming HTTP `Cookie` header via `cookies()`, enabling instant token validation without exposing the cookie value to client scripts.
3. **Prevention of Accidental Leaks with `server-only`:** Next.js supports the `server-only` package (`import 'server-only'`). If a developer accidentally imports a module containing server secrets or direct database access into a Client Component (marked with `'use client'`), the build fails immediately, preventing accidental bundle leakage during the build pipeline.

**Interview answer:** "Server Components access request cookies and headers directly using server-only APIs like `cookies()` and `headers()` from `next/headers` without shipping any code to the browser. Because Server Components run strictly on the server, private keys, database queries, and `HttpOnly` session tokens stay completely isolated, transmitting only safe, serialized props to the client."
