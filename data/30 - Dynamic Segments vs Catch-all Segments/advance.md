1. How must dynamic route parameters be typed and resolved in Next.js 15+ Server and Client Components, and how should optional parameters be handled defensively?

**Deep explanation:** Next.js 15 introduced a foundational architectural breaking change regarding how route parameters (`params`) and search query parameters (`searchParams`) are accessed:
- **Asynchronous `params` in Next.js 15:** In Next.js 14 and earlier, `params` was supplied synchronously as a plain object. In Next.js 15+, `params` is a `Promise`. This allows the server runtime to begin rendering components and layout shells before request-time dynamic segment extraction is fully settled, optimizing streaming and Partial Prerendering (PPR).
- **TypeScript Interface Definitions:**
  - **Single Dynamic Segment (`[slug]`):**
    ```tsx
    interface PageProps {
      params: Promise<{ slug: string }>;
    }
    ```
  - **Catch-All Segment (`[...slug]`):**
    ```tsx
    interface PageProps {
      params: Promise<{ slug: string[] }>;
    }
    ```
  - **Optional Catch-All Segment (`[[...slug]]`):**
    ```tsx
    interface PageProps {
      params: Promise<{ slug?: string[] }>;
    }
    ```
- **Server Component Resolution:** Server Components must explicitly `await` the `params` Promise before consuming keys:
  ```tsx
  // app/docs/[...slug]/page.tsx
  export default async function DocsPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    return <p>Section: {slug.join(" / ")}</p>;
  }
  ```
- **Defensive Handling for Optional Catch-All Routes:** Because visiting the base path in an optional catch-all (`[[...slug]]`) resolves `slug` to `undefined`, developers must guard against calling array methods like `.join()` directly:
  ```tsx
  // app/docs/[[...slug]]/page.tsx
  export default async function DocsPage({ params }: { params: Promise<{ slug?: string[] }> }) {
    const { slug } = await params;
    if (!slug || slug.length === 0) {
      return <h1>Documentation Index</h1>;
    }
    return <h1>Topic: {slug.join(" / ")}</h1>;
  }
  ```
- **Client Component Consumption:** In Client Components marked with `'use client'`, component functions cannot be declared as `async`. Instead, developers use React 19’s `use()` hook to unwrap the `params` Promise (`const { slug } = use(params);`), or pass the awaited values as standard props from a parent Server Component.

**Interview answer:** "In Next.js 15+, `params` is typed as an asynchronous Promise—such as `Promise<{ slug: string[] }>` or `Promise<{ slug?: string[] }>`—requiring `await params` in Server Components or `React.use(params)` in Client Components, along with defensive checks for `undefined` when handling optional catch-all routes at root URLs."