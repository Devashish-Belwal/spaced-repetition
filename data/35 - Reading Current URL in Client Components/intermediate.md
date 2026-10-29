1. What is `ReadonlyURLSearchParams`, why is it immutable in Next.js Client Components, and how do you programmatically update query parameters?

**Deep explanation:** `useSearchParams()` returns `ReadonlyURLSearchParams`, an immutable implementation of the Web standard `URLSearchParams` interface. In this object, mutating methods like `.set()`, `.append()`, and `.delete()` are omitted or throw runtime exceptions.

This immutability guarantees unidirectional data flow within React:
- In React's declarative model, component renders must remain pure functions of props, state, and context.
- Directly mutating search parameters in place would bypass React's state tracking and reconciliation engine, leaving UI components desynchronized from the URL bar.

To update query parameters programmatically, you must create a new mutable `URLSearchParams` instance, apply changes, and trigger navigation via `useRouter()` from `next/navigation`:
```tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Filter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    // 1. Create a mutable copy from current searchParams
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    
    // 2. Mutate the copy
    if (value) {
      current.set(key, value);
    } else {
      current.delete(key);
    }

    // 3. Construct the new URL and navigate
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.push(`${pathname}${query}`);
  };

  return <button onClick={() => handleFilterChange("sort", "asc")}>Sort Asc</button>;
}
```
When `router.push()` or `router.replace()` executes, Next.js initiates client-side navigation, pushes a history state, updates its internal router context, and triggers a reactive re-render of all components consuming `useSearchParams()`.

**Interview answer:** "`ReadonlyURLSearchParams` is immutable to preserve React's unidirectional data flow and prevent untracked state mutations; to update parameters, you create a new `URLSearchParams` instance, apply mutations, and push the new URL using `router.push()` from `next/navigation` to trigger a reactive re-render."
