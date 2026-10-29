1. What are the definitive rules governing when a React component re-renders, and why is defining a component function inside another component body considered a severe anti-pattern?

**Deep explanation:** React rendering is strictly deterministic and governed by foundational triggers, as well as a critical distinction between component *declaration* and component *instantiation*:
- **The Rule of Thumb for Re-renders:** A component function executes (re-renders) if and only if:
  1. **Its own state or hooks update:** Calling `setState`, `dispatch` from `useReducer`, or receiving a store update via `useSyncExternalStore`.
  2. **Its declaration parent re-renders:** The component enclosing its JSX instantiation executes, generating a new React element object with a new reference (unless intercepted by `React.memo`, `useMemo`, or `{children}` pass-through).
  3. **A consumed Context changes:** Any Context subscribed to via `useContext` provides an updated value.
  *(Note: Props changing does not inherently cause a child to re-render; rather, the parent re-rendering creates new element props that trigger the child render, unless memoized).*
- **The Anti-Pattern: Component Declared Inside Another Component:**
  A common anti-pattern is declaring a component function inside another component's body:
  ```jsx
  function Parent() {
    // ANTI-PATTERN: Re-created on every render of Parent
    function ChildComponent() {
      return <div>Persistent State?</div>;
    }

    return <ChildComponent />;
  }
  ```
- **Consequences of Nested Declaration:**
  - **Function Reference Invalidation:** On every render of `Parent`, a new function instance of `ChildComponent` is allocated in memory with a brand-new reference.
  - **Breakage of Reconciliation Type Checking:** React's diffing algorithm compares `element.type === fiber.type`. Because `ChildComponent` has a new function identity on every render, React determines that the component type has fundamentally changed.
  - **Complete Subtree Unmount and Remount:** Instead of re-rendering and reconciling the existing DOM nodes, React completely unmounts the old `ChildComponent` fiber tree and mounts an entirely new one from scratch. This causes:
    - Complete loss of all internal component state (`useState`, `useRef`).
    - Immediate unmounting and re-running of all `useEffect` and `useLayoutEffect` hooks.
    - Destruction and recreation of real DOM nodes, causing input focus loss, cursor jumping, CSS transition breakage, and severe rendering lag.

**Interview answer:** "A component only re-renders when its own state updates, its declaration parent re-renders, or a consumed context changes; declaring a component function inside another component re-creates its type reference on every render, causing React's reconciliation to treat it as a brand-new component and completely unmount and remount its entire DOM and state tree."
