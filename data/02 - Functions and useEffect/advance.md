1. How does `useEffectEvent` allow an Effect to read the latest state or props without making them reactive dependencies?

**Deep explanation:** `useEffect` is designed to synchronize a component with external systems based on reactive values (props, state, or derived variables). However, a common problem occurs when an Effect needs to read certain data (like the current UI theme, routing state, or analytics tokens) without re-running the synchronization logic whenever that specific data updates. For example, in a chat connection:
```typescript
const onConnected = useEffectEvent(() => {
  showNotification(`Connected! Theme: ${theme}`);
});

useEffect(() => {
  const connection = createConnection(serverUrl);

  connection.on("connected", () => {
    onConnected();
  });

  connection.connect();

  return () => connection.disconnect();
}, [serverUrl]); // theme changes don't reconnect
```
If `theme` were read directly inside the Effect, `theme` would have to be in the dependency array. Consequently, every time the user toggles light/dark mode, the socket connection would disconnect and reconnect—an undesirable side effect. 

`useEffectEvent` extracts this non-reactive logic into an "Effect Event". Effect Events always have access to the latest props and state values at the moment they are called, but they are non-reactive: React guarantees they do not have a dependency array and must not be listed in `useEffect`'s dependency array. This cleanly decouples the trigger that starts the Effect (`serverUrl`) from the values read when a sub-event occurs (`theme`).

**Interview answer:** "`useEffectEvent` extracts non-reactive logic out of an Effect, allowing it to read the latest props and state at call-time without listing them as dependencies. This prevents unwanted re-synchronization—such as reconnecting a socket or re-running expensive setup—when unrelated values like UI themes or analytics state change."

2. What are the key differences between `useCallback` and `useEffectEvent`, and what rules govern their usage?

**Deep explanation:** While both hooks stabilize function references, they serve opposite architectural purposes and follow different operational contracts:

1. **Reactivity vs. Non-Reactivity:**
   - `useCallback` is **reactive**. It accepts a dependency array and intentionally changes its identity whenever any dependency changes. Its primary purpose is to stabilize references passed to memoized children (`React.memo`) or downstream hooks so they only re-evaluate when necessary.
   - `useEffectEvent` is **non-reactive**. It has no dependency array and does not change identity or trigger re-runs. It always sees the latest props and state via an internal mutable reference while omitting itself from Effect dependencies.

2. **Call Constraints and Boundaries:**
   - Functions returned by `useCallback` can be called anywhere: in JSX event handlers (`onClick`), during rendering (if pure), inside Effects, or passed down as props.
   - Functions created with `useEffectEvent` have strict call constraints: they can **only** be invoked from inside `useEffect` or from other Effect Events. They must never be passed to other components or invoked directly from event handlers or during render.

3. **Summary Rule:**
   - Use `useCallback` to cache a function for reuse across renders, pass to memoized components, or share with event handlers.
   - Use `useEffectEvent` exclusively within an Effect to separate reactive synchronization triggers from non-reactive logic that only needs the freshest values.

**Interview answer:** "`useCallback` is reactive and memoizes a function to preserve reference equality across renders for event handlers or memoized children, updating when its dependencies change. `useEffectEvent` is non-reactive and exists strictly to let Effects read the latest state without triggering re-runs, and it can only be invoked from within an Effect."
