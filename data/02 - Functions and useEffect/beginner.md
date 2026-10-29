1. Why does defining a helper function in a component body cause issues when called inside `useEffect`, and why is declaring it inside the Effect the recommended pattern?

**Deep explanation:** In JavaScript, functions are reference types. When a function is declared directly inside a component body, a brand new function instance with a new memory reference is created on every single render. If that function is called inside `useEffect` and included in the Effect's dependency array (as enforced by `react-hooks/exhaustive-deps`), the Effect detects a changed reference after every render and executes again. If the Effect also performs a state update (such as `setData`), it triggers another render, which recreates the function, which triggers the Effect again—resulting in an infinite re-render loop. Conversely, omitting the function from the dependency array violates the rules of hooks, causing stale closures where the function captures outdated state or props.

The recommended solution for a function used solely by an Effect is to declare it directly inside the `useEffect` callback:
```typescript
useEffect(() => {
  const fetchData = async () => {
    const res = await api.get(`/users/${userId}`);
    setData(res.data);
  };

  fetchData();
}, [userId]);
```
Moving the declaration inside encapsulates its scope. The Effect no longer depends on an unstable outer function reference; instead, the dependencies become the actual reactive values used inside the helper (e.g., `userId`). This eliminates the need for memoization boilerplate, prevents stale closures, and makes reactive dependencies self-evident.

**Interview answer:** "Declaring helper functions in the component body recreates their memory reference on every render, causing infinite loops when placed in an Effect's dependency array or stale closures if omitted. Defining the function inside `useEffect` encapsulates the logic so the Effect only depends on the actual primitive or state values consumed, avoiding unnecessary re-runs without extra boilerplate."
