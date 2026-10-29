1. How do prefetching and side-effect handling differ between `<Link>` and `useRouter`, and how can you optimize programmatic navigation performance?

**Deep explanation:** Navigation performance in Next.js relies heavily on prefetching RSC payloads and layout code before the user initiates a page switch. Understanding how `<Link>` and `useRouter` handle prefetching and side effects is critical to avoiding latency bottlenecks.
- **Viewport Prefetching vs. No Default Prefetching:**
  - `<Link>`: In production, `<Link>` automatically prefetches target routes into the client-side Router Cache whenever they enter the browser viewport. For static routes, the full RSC payload is cached; for dynamic routes, Next.js prefetches down to the nearest `loading.js` boundary.
  - `useRouter`: Programmatic routes called via `router.push()` are **not** automatically prefetched when the component mounts. If a user triggers a button wired to an unprefetched `router.push()`, the browser must execute a full round-trip network request to download the RSC stream before the destination page can render, causing a perceptible delay.
- **Optimizing Programmatic Navigation with `router.prefetch()`:**
  - Next.js exposes `router.prefetch(href)` to manually warm the client Router Cache.
  - Developers can trigger `router.prefetch()` on anticipatory user interactions, such as `onMouseEnter` or `onFocus` on an interactive button, or inside a `useEffect` hook when entering a multi-step checkout workflow:
    ```tsx
    "use client";

    import { useRouter } from "next/navigation";

    export default function ProductCard({ id }: { id: string }) {
      const router = useRouter();

      return (
        <button
          onMouseEnter={() => router.prefetch(`/products/${id}`)}
          onFocus={() => router.prefetch(`/products/${id}`)}
          onClick={() => router.push(`/products/${id}`)}
        >
          View Product
        </button>
      );
    }
    ```
- **Executing Side Effects Before Navigation:**
  - Programmatic navigation allows chaining async operations—such as telemetry tracking, token refresh, or form submission—before the route change begins:
    ```ts
    async function handlePayment() {
      await trackEvent("payment_initiated");
      const res = await processOrder();
      if (res.ok) {
        router.push(`/orders/${res.orderId}`);
      }
    }
    ```
  - Developers must ensure critical asynchronous calls are awaited or handled with proper error boundaries before invoking `router.push()` or `router.replace()` to prevent aborted network requests when the current component unmounts.

**Interview answer:** "Unlike `<Link>`, which automatically prefetches routes entering the viewport, `useRouter` does not prefetch routes by default. To prevent network latency on programmatic transitions, you can warm the client Router Cache by calling `router.prefetch(href)` on hover or focus, while using `useRouter` to cleanly coordinate side effects like analytics or mutations before navigating."