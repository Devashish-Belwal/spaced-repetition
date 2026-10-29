1. How do you implement non-blocking transitions and pending loading states with `useRouter` using React's `useTransition`?

**Deep explanation:** In Next.js App Router, routes stream data dynamically using React Server Components. When navigating programmatically with `router.push()`, an async route change can take time to resolve, potentially leaving the interface looking frozen if not handled correctly.
- **The Removal of Global Router Events:** In the Pages Router, developers relied on `Router.events.on('routeChangeStart')` and `'routeChangeComplete'` to mount global progress bars (like NProgress). The App Router does not support router event listeners on `useRouter()`. Instead, Next.js leverages React concurrent features (`useTransition`, Suspense, and `loading.tsx`) to manage navigation lifecycles.
- **Concurrent Navigation with `useTransition`:**
  - Wrapping `router.push()` or `router.replace()` inside `startTransition` from React's `useTransition` hook marks the route change as a concurrent transition.
  - It exposes an `isPending` boolean flag that transitions to `true` while the target Server Component payload is being fetched and streamed:
    ```tsx
    "use client";

    import { useRouter } from "next/navigation";
    import { useTransition } from "react";

    export default function CheckoutButton() {
      const router = useRouter();
      const [isPending, startTransition] = useTransition();

      function handleNavigation() {
        startTransition(() => {
          router.push("/checkout/confirmation");
        });
      }

      return (
        <button onClick={handleNavigation} disabled={isPending}>
          {isPending ? "Preparing Order..." : "Confirm & Proceed"}
        </button>
      );
    }
    ```
- **Key UX and Architectural Benefits:**
  1. **Contextual Pending States:** Developers can display inline spinners, skeleton loaders, or disabled button states directly at the interaction source without polluting global application state.
  2. **Non-Blocking UI Responsiveness:** Because the navigation is executed as a low-priority transition, the current page remains fully interactive. Heavy user inputs (such as typing in an open input or toggling menus) are prioritized over the background navigation rendering.
  3. **Automatic Interruption Handling:** If the user clicks another navigation target or cancels an action while `isPending` is active, React automatically discards the stale transition in favor of the latest user action, preventing race conditions.

**Interview answer:** "To provide pending UI feedback during programmatic navigation, wrap `router.push()` in React's `startTransition` from `useTransition`. This exposes an `isPending` flag to render inline loading states while keeping the current page non-blocking and interactive until the incoming Server Component finishes streaming."