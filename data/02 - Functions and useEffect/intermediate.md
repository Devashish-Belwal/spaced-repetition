1. How should you handle a function that needs to be invoked both inside a `useEffect` hook and by an external event handler?

**Deep explanation:** When a function must be called on mount or reactive changes via `useEffect` and also triggered by user interactions (such as a "Refresh" button click), defining it inside the Effect is impossible because it would be scoped locally and inaccessible to the JSX event handlers. 

If the function is instead declared in the component body, it must be wrapped in `useCallback`:
```typescript
const fetchData = useCallback(async () => {
  const res = await api.get(`/users/${userId}`);
  setData(res.data);
}, [userId]);

useEffect(() => {
  fetchData();
}, [fetchData]);

return <button onClick={fetchData}>Refresh</button>;
```
`useCallback` caches the function reference across renders and only generates a new reference when its own dependencies (such as `userId`) change. When passed into `useEffect`'s dependency array, React uses `Object.is` comparison; because the function reference remains identical between renders where `userId` has not changed, the Effect does not trigger unnecessarily. When `userId` does change, `useCallback` produces a new function instance, prompting `useEffect` to synchronize properly. This pattern allows safe sharing of logic between imperative event handlers and declarative Effect synchronization.

**Interview answer:** "When a function is shared between an Effect and an event handler, wrap it in `useCallback` with its own dependencies and include the memoized function in the Effect's dependency array. This stabilizes the function reference across renders, preventing infinite re-runs while keeping the logic accessible to both the Effect and user interactions."
