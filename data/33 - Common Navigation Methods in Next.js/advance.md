1. Why must `useRouter` be imported from `next/navigation` instead of `next/router` in the App Router, and what are the key differences between them?

**Deep explanation:** In Next.js, the App Router (`app/`) and the Pages Router (`pages/`) operate on entirely different runtime architectures, and importing navigation primitives from the wrong module causes runtime crashes:
- **`next/navigation` (App Router):**
  - Designed specifically for React Server Components (RSC) and React Suspense architecture.
  - The `useRouter()` hook from `next/navigation` provides a clean, minimal API dedicated exclusively to navigation actions: `push()`, `replace()`, `refresh()`, `back()`, `forward()`, and `prefetch()`.
  - It intentionally decouples route actions from route data: properties like `pathname`, `query`, or `asPath` do not exist on the App Router `router` instance. Instead, developers must import dedicated reactive hooks: `usePathname()`, `useSearchParams()`, and `useParams()`. This separation allows Next.js to isolate re-renders and wrap search param consumers in Suspense boundaries without re-rendering parent layouts.
  - Event listeners (e.g., `router.events.on('routeChangeStart')`) are removed; transition states are managed using React's native `useTransition` and `loading.tsx` conventions.
- **`next/router` (Pages Router):**
  - Tailored for the legacy Pages Router and returns a single monolithic `NextRouter` object containing both navigation methods and path/query properties.
  - Attempting to import `useRouter` from `next/router` inside an App Router component results in an invariant error: `"NextRouter was not mounted. https://nextjs.org/docs/messages/next-router-not-mounted"`.
- **`router.back()` and `router.forward()`:** Both routers expose `back()` and `forward()`, which programmatically wrap `window.history.back()` and `window.history.forward()` into the Next.js client transition lifecycle, maintaining client-side single-page app transitions.

**Interview answer:** "In the App Router, `useRouter` must be imported from `next/navigation` because `next/router` is tied to the legacy Pages Router and throws a runtime 'NextRouter was not mounted' error in the `app` directory. Furthermore, `next/navigation` decouples router methods like `push` and `back` from URL inspection, requiring dedicated hooks like `usePathname` and `useSearchParams`."