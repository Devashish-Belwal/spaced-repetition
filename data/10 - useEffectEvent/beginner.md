1. What is `useEffectEvent` in React, what core problem does it solve, and when should you use it?

**Deep explanation:** In React, code inside components is fundamentally split between **reactive** and **non-reactive** logic:
- **Reactive values** include props, state, and any variables calculated directly from them during render. When reactive values change, React re-renders the component.
- **Effects (`useEffect`)** are reactive synchronization blocks. Their purpose is to synchronize the component with an external system (such as establishing a WebSocket connection, setting up a timer, or registering DOM listeners). React requires all reactive values read inside an Effect to be declared in its dependency array so the Effect can re-run and re-synchronize when they change.

However, a frequent architectural dilemma arises: an Effect often needs to read the latest state or prop to perform an action, but changing that value *should not* re-trigger synchronization. For example, consider a chat room connection Effect that logs an analytics event with the user's current `theme` or calls a dynamic `onConnected(roomId)` notification callback:
```javascript
useEffect(() => {
  const connection = connect(roomId);
  connection.on('connected', () => {
    logAnalytics('connected', { theme }); // 'theme' is reactive
    onConnected(roomId);                 // 'onConnected' prop changes every render
  });
  return () => connection.disconnect();
}, [roomId, theme, onConnected]); // Unwanted re-connections!
```
Under React's exhaustive dependency rules, including `theme` or `onConnected` forces the chat connection to disconnect and reconnect every time the user toggles dark mode or the parent re-renders. Conversely, suppressing the linter creates stale closures.

The React core team designed `useEffectEvent` to solve this exact problem by cleanly separating **synchronization triggers** from **event responses**. An Effect Event behaves like an event handler triggered from within an Effect: it is **non-reactive**, so it does not belong in the dependency array and will never cause the Effect to re-run. Yet, when invoked, it is guaranteed to read the latest props and state at that exact moment. You should use `useEffectEvent` whenever an Effect must access dynamic reactive values purely as a side-effect response rather than a reason to re-synchronize.

**Interview answer:** "`useEffectEvent` is an experimental React hook that extracts non-reactive, event-like logic out of an Effect. You use it when an Effect needs to read the latest props or state—such as logging analytics or firing notification callbacks—without making those values dependencies that re-trigger synchronization."
