1. What are "chains of effects" (cascading state updates), why are they dangerous, and how can they be refactored?

**Deep explanation:** A chain of effects occurs when one effect updates a state variable, which causes a re-render that triggers a second effect, which in turn updates another state variable and triggers a third effect:
```javascript
// Anti-pattern: Chain of effects
useEffect(() => {
  if (user) setPermissions(computePermissions(user));
}, [user]);

useEffect(() => {
  if (permissions) setVisibleFeatures(filterFeatures(permissions));
}, [permissions]);
```
This pattern introduces several serious issues:
- **Cascading renders:** The component undergoes multiple sequential render-and-commit cycles before reaching its final state, causing visible UI flicker and frame drops.
- **Race conditions & loops:** A minor oversight in a dependency array can easily trigger infinite re-render loops or stale closure bugs where effects execute out of order.
- **Brittleness:** Refactoring or altering one state variable causes ripple effects across disparate `useEffect` blocks that are difficult to trace.

**Refactoring Strategy:**
- **Derive inline:** Eliminate intermediate state entirely by computing values inline during render:
  ```javascript
  const permissions = user ? computePermissions(user) : null;
  const visibleFeatures = permissions ? filterFeatures(permissions) : [];
  ```
- **Consolidate with a Reducer:** If complex, interdependent state transitions must occur upon an event, manage them using `useReducer` or a centralized event handler where all state updates occur atomically in response to a single action.

**Interview answer:** "A chain of effects is an anti-pattern where effects trigger state updates that fire subsequent effects, causing multiple sequential render passes, layout flickering, and fragile code. They should be refactored by deriving state inline during render or orchestrating the updates together inside a single event handler or reducer."

2. What criteria justify the legitimate use of `useEffect`, and how should synchronization and cleanup be properly handled?

**Deep explanation:** `useEffect` is justified only when code must synchronize the component with an external system and cannot be resolved by pure render logic or event handlers. Legitimate scenarios include:
- **Global Event Listeners:** Subscribing to browser events on `window` or `document` (e.g., tracking mouse position, keyboard shortcuts, or window resize).
- **Imperative External APIs:** Initializing or synchronizing third-party non-React libraries (e.g., Chart.js, Mapbox, video players) with React props.
- **Persistent Subscriptions:** Establishing and maintaining persistent network connections such as WebSockets, server-sent events (SSE), or Firebase listeners.
- **Page-level Analytics:** Logging screen view / impression events that represent the component becoming visible to the user rather than an isolated button click.

**Cleanup Requirements:**
Whenever an effect synchronizes with an external system, it must return a cleanup function to mirror the setup:
```javascript
useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```
The cleanup function runs before the effect re-runs on dependency changes and when the component unmounts. Without cleanup, stale closures, duplicate event listeners, and memory leaks will accumulate. React Strict Mode deliberately mounts, unmounts, and re-mounts components in development to verify that setup and cleanup logic are symmetrical and resilient.

**Interview answer:** "Legitimate use cases for `useEffect` involve synchronizing with external systems—such as subscribing to browser events, managing WebSockets, or controlling imperative third-party libraries. Any external subscription or connection created in an effect must return a symmetrical cleanup function to prevent memory leaks and duplicate handlers upon unmount or re-render."