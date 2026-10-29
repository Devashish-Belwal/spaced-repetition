1. How did developers handle non-reactive logic in Effects before `useEffectEvent`, and what advantages does it offer over `useRef`-based workarounds?

**Deep explanation:** Prior to `useEffectEvent`, developers encountered the same dilemma—wanting to read the latest value inside an Effect without re-triggering it—and relied on the mutable `useRef` pattern (often wrapped in custom hooks like `useLatest` or `useEvent`):
```javascript
// The legacy useRef workaround
const onConnectedRef = useRef(onConnected);

// Keep the ref synchronized with latest prop/state
useEffect(() => {
  onConnectedRef.current = onConnected;
});

useEffect(() => {
  const connection = connect(roomId);
  connection.on('connected', () => {
    onConnectedRef.current(roomId); // Reads latest value without depending on it
  });
  return () => connection.disconnect();
}, [roomId]); // onConnected is not in dependencies
```
While this workaround achieved non-reactive reads, it carried severe drawbacks:
- **Boilerplate and Ceremony:** Developers had to create manual refs, manage synchronization effects, and write verbose wrappers for every callback or state variable that needed non-reactive access.
- **Concurrent Mode Fragility:** Updating `ref.current` during render (e.g., `ref.current = value` in the component body) violates React's render purity and leads to tearing or race conditions under Concurrent React. Conversely, synchronizing refs in `useEffect` or `useLayoutEffect` can introduce subtle timing bugs if an external event fires before the ref synchronization effect completes.
- **Linter and Compiler Disconnect:** ESLint's `react-hooks/exhaustive-deps` rule cannot inspect the contents of refs to verify whether a closure is safe or stale. Developers frequently used `// eslint-disable-next-line` to silence warnings, often masking genuine dependency bugs.
- **Semantic Clarity:** Using `useRef` repurposes a low-level mutable container to bypass React's reactive dataflow.

`useEffectEvent` replaces these brittle workarounds with a native, first-class primitive:
```javascript
const onConnectedEvent = useEffectEvent((roomId) => {
  onConnected(roomId);
});

useEffect(() => {
  const connection = connect(roomId);
  connection.on('connected', () => onConnectedEvent(roomId));
  return () => connection.disconnect();
}, [roomId]);
```
This syntax provides compiler-verified guarantees, works safely with Concurrent React, eliminates ref synchronization timing bugs, and clearly documents developer intent.

**Interview answer:** "Before `useEffectEvent`, developers used `useRef` to store latest props or callbacks and read `ref.current` inside Effects to bypass dependency arrays. `useEffectEvent` replaces this boilerplate-heavy and concurrency-fragile workaround with a first-class, compiler-checked primitive that safely separates synchronization triggers from non-reactive logic."
