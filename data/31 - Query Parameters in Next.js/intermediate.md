1. How do you access `searchParams` in Next.js Server Components, and why did Next.js 15 turn `searchParams` into an asynchronous `Promise`?

**Deep explanation:** In the Next.js App Router, query parameters are passed directly to `page.tsx` via component props. 

**Next.js 15 Asynchronous Transition:**
Prior to Next.js 15, `searchParams` was passed as a synchronous plain object. Starting in Next.js 15, both `params` and `searchParams` are asynchronous `Promise` objects and must be awaited:

```typescript
type Props = {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, page } = await searchParams;

  return (
    <div>
      <p>Search Query: {q ?? "All"}</p>
      <p>Current Page: {page ?? "1"}</p>
    </div>
  );
}
```

**Architectural Rationale:**
The shift from synchronous access to asynchronous Promises was implemented to unlock advanced server-side optimizations:
1. **Streaming and Asynchronous Rendering:** When `searchParams` was synchronous, accessing properties immediately blocked component execution and forced the server to evaluate request headers and URL parameters synchronously before rendering could begin.
2. **Partial Prerendering (PPR):** Under PPR, Next.js prerenders a static shell of the page at build time. By making `searchParams` a Promise, the component tree can begin rendering static HTML immediately. Only the specific async boundaries or components that explicitly `await searchParams` suspend and stream dynamically once the incoming request URL is parsed at runtime.
3. **Future-Proofing React Server Components (RSC):** It aligns with React's concurrency model, where asynchronous resources can be unwrapped with `await` in Server Components or passed to `use(searchParams)` in Client Components.

**Interview answer:** "In Next.js 15 Server Components, `searchParams` is provided as a prop typed as a `Promise` and must be resolved using `await`. Next.js transitioned `searchParams` to a Promise to support Partial Prerendering and server streaming, allowing the static shell to render immediately while deferring the dynamic resolution of query parameters until explicitly awaited."
