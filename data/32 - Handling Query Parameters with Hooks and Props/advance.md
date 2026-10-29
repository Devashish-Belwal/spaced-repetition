1. How do you read and update query parameters dynamically in Next.js App Router Client Components without losing existing parameters or causing full page reloads?

**Deep explanation:** In the Next.js App Router, managing query parameters inside interactive Client Components requires coordinating three dedicated navigation hooks from `next/navigation`:
- **The Core Navigation Hooks:**
  1. `useSearchParams()`: Returns a read-only WHATWG `URLSearchParams` instance containing the current URL's query parameters.
  2. `usePathname()`: Returns the current URL pathname (e.g., `"/dashboard"`), omitting the search string.
  3. `useRouter()`: Provides imperative client navigation methods (`router.push()`, `router.replace()`).
- **The Immutable Parameter Update Pattern:** Because the `URLSearchParams` returned by `useSearchParams()` is strictly read-only, attempting to call `.set()` or `.delete()` directly on it will throw an error or fail. To modify a parameter while immutably preserving other active query parameters (such as filter selections, analytics tags, or search terms), developers instantiate a new `URLSearchParams` using `searchParams.toString()`:
  ```tsx
  'use client';

  import { usePathname, useRouter, useSearchParams } from 'next/navigation';
  import { useCallback, useTransition } from 'react';

  export function SearchFilter() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const updateQueryString = useCallback(
      (name: string, value: string) => {
        // Clone existing search params to avoid losing other query parameters
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
          params.set(name, value);
        } else {
          params.delete(name); // Clean up parameter if value is emptied
        }

        return params.toString();
      },
      [searchParams]
    );

    const handleFilterChange = (filterValue: string) => {
      const queryString = updateQueryString('filter', filterValue);
      startTransition(() => {
        router.push(`${pathname}?${queryString}`, { scroll: false });
      });
    };

    return (
      <input
        type="text"
        placeholder="Filter results..."
        onChange={(e) => handleFilterChange(e.target.value)}
      />
    );
  }
  ```
- **Preserving Existing Parameters:** Calling `new URLSearchParams(searchParams.toString())` ensures all unrelated parameters remain intact. Using `.set()` overrides or creates only the targeted parameter, while `.delete()` cleanly prunes it when null or empty, preventing lingering keys with empty values like `?filter=`.
- **Preventing Full Reloads & Controlling Scroll:** Using `router.push()` or `router.replace()` performs an in-memory client-side transition that requests the new RSC data without reloading the browser window or resetting React state in parent layouts. Passing `{ scroll: false }` prevents Next.js from resetting the window scroll position to the top of the page upon query parameter updates.
- **The `<Suspense>` Boundary Requirement:** When a Client Component invokes `useSearchParams()`, Next.js requires the component (or its parent) to be wrapped in a `<Suspense>` boundary if the page is statically pre-rendered. Failing to provide a Suspense boundary will de-opt the entire route from Static Site Generation (SSG) down to purely client-side rendering during production builds.

**Interview answer:** "To update query parameters without losing existing state, clone the current params via `new URLSearchParams(searchParams.toString())`, apply `.set()` or `.delete()`, and navigate using `router.push()` or `router.replace()` with `usePathname()` and `{ scroll: false }`. Any Client Component using `useSearchParams()` should be wrapped in a `<Suspense>` boundary to preserve static generation on the server."
