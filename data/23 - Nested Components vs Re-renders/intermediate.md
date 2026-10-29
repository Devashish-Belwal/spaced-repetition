1. What is the "lifting content up" composition pattern, and how does it optimize performance without the overhead or pitfalls of `React.memo`?

**Deep explanation:** "Lifting content up" (or component slot composition) is an architectural optimization pattern where an expensive UI subtree is lifted out of a stateful component and passed back in as `children` or explicit JSX props (e.g., `left={<ExpensiveSidebar />}`):
- **How the Pattern Works:** Consider a component with high-frequency state updates (e.g., mouse tracking, scroll offsets, accordion toggles, or timer state). If expensive components reside inside its return JSX, they will re-render on every state tick. By isolating the stateful logic inside a wrapper component and passing the expensive tree as `{children}`, the expensive tree's elements are created outside the wrapper:
  ```jsx
  function ScrollTrackerWrapper({ children }) {
    const [scrollY, setScrollY] = useState(0);
    // updates frequently...
    return <div onScroll={...}>{children}</div>;
  }
  ```
  Here, when `scrollY` updates, `ScrollTrackerWrapper` re-renders, but `children` remains the exact same element reference instantiated by the ancestor.
- **Why It Is Superior to `React.memo`:**
  - **No Comparison Overhead:** `React.memo` wraps a component in a higher-order component that runs a shallow equality check (`shallowEqual(prevProps, nextProps)`) across every prop on every parent render. Composition leverages natural JavaScript object identity (`===`), making the bailout check virtually zero-cost inside React's Fiber engine.
  - **Immunity to Reference Invalidation:** `React.memo` easily breaks whenever consumers pass inline callback functions, object literals, or array literals without wrapping them in `useCallback` or `useMemo`. In contrast, composition shields child subtrees naturally because the entire element object was created before the stateful wrapper ever executed.
  - **Cleaner Architectural Boundaries:** It separates stateful container logic (layout wrappers, animation frames, modal backdrops) from pure presentational content, avoiding artificial hook memorization throughout the codebase.
- **When Bailout Occurs:** React bails out inside the reconciler (`beginWork`) whenever a Fiber's `didReceiveUpdate` flag is false. If props haven't changed by reference, state hasn't changed, and context hasn't changed, React clones the existing `workInProgress` fiber from the `current` fiber and stops walking deeper down that branch.

**Interview answer:** "The 'lifting content up' pattern moves state down into an isolated wrapper and passes static or expensive subtrees in via `children`, taking advantage of natural React element referential equality to bail out of child re-renders without the runtime overhead or fragile dependency maintenance of `React.memo`."
