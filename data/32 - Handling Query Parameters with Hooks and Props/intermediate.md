1. How does the Next.js `<Link>` component handle query parameters via string paths versus `UrlObject` configurations, and what are the architectural trade-offs?

**Deep explanation:** Next.js `<Link href="...">` provides two primary paradigms for specifying query parameters: raw string paths and structured `UrlObject` instances:
- **String Path Construction:**
  ```tsx
  import Link from 'next/link';

  const params = new URLSearchParams({
    q: 'nextjs',
    page: '2',
  });

  <Link href={`/search?${params.toString()}`}>
    Search
  </Link>
  ```
  In this format, the developer explicitly serializes the query string beforehand using `URLSearchParams.prototype.toString()`. This approach is simple, transparent, and pairs naturally with native Web API utilities.
- **`UrlObject` Format:**
  Next.js natively supports Node.js-style `UrlObject` definitions directly in the `href` prop:
  ```tsx
  <Link
    href={{
      pathname: '/search',
      query: {
        q: 'nextjs',
        page: '2',
        categories: ['react', 'ssr'],
      },
    }}
  >
    Search
  </Link>
  ```
- **Serialization and Array Handling:** When using `UrlObject`, Next.js internally serializes the `query` object into a query string. When a property value is an array (such as `categories: ['react', 'ssr']`), Next.js serializes it as repeated keys (`categories=react&categories=ssr`). This adheres to standard HTTP URL conventions and is parsed by the App Router's `searchParams` prop or server-side endpoints as an array or multi-value parameter.
- **Dynamic Route Segments and Parameter Interpolation:** When navigating to dynamic routes (e.g., `/shop/[category]/[item]`), passing a `UrlObject` allows Next.js to automatically interpolate matching keys from `query` into the route's dynamic path segments, leaving any remaining non-matching keys in the query string. With string paths, the developer must manually perform this slug interpolation.
- **Client-Side Navigation and RSC Prefetching:** Regardless of whether a string or `UrlObject` is used, Next.js treats query parameter navigations as soft client-side transitions. In the App Router, changing query parameters does not trigger a full HTML document reload; instead, Next.js prefetches and streams the updated React Server Component (RSC) payload corresponding to the new `searchParams`, re-rendering the affected component subtrees while preserving layout state.

**Interview answer:** "Next.js `<Link>` supports both serialized string paths and structured `UrlObject` props containing `pathname` and a `query` object. Using `UrlObject` allows Next.js to handle query string serialization, array formatting (`param=a&param=b`), and dynamic route segment interpolation automatically, while both approaches support client-side soft navigations and background RSC prefetching."
