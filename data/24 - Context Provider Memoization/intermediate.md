1. How do you properly stabilize a Context provider value containing both state and callbacks using `useMemo` and `useCallback`?

**Deep explanation:** To prevent unwanted consumer re-renders, the provider's `value` object must maintain referential equality across renders unless its underlying dependencies change. If the context value exposes functions declared within the provider, a common pitfall is memoizing the value object with `useMemo` while leaving the functions unmemoized; this creates new function references on every render, invalidating `useMemo` and defeating the optimization entirely.

To stabilize the context value properly:
1. **Stabilize function handlers** using `useCallback` (or `useReducer` dispatch, which React guarantees to be reference-stable).
2. **Memoize the value object** using `useMemo`, listing both the state values and the memoized callbacks in its dependency array.

```typescript
const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Step 1: Stabilize callback references
  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  // Step 2: Memoize the compound context value object
  const value = useMemo(
    () => ({ user, theme, logout, toggleTheme }),
    [user, theme, logout, toggleTheme]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
```
By combining `useCallback` and `useMemo`, `value` retains the exact same reference between renders unless `user` or `theme` changes. When unrelated state in `UserProvider` updates, `value` remains referentially identical, allowing React to skip re-rendering all context consumers.

**Interview answer:** "Functions declared inside the provider must first be stabilized with `useCallback` before being bundled into a context value object wrapped in `useMemo`. This ensures the object reference remains strictly stable across renders unless actual state or dependencies change, preventing consumer churn."

2. What criteria determine when memoizing Context provider values is necessary versus when it is premature optimization?

**Deep explanation:** Memoization introduces cognitive overhead and memory cost, as React must store dependency arrays and previous values in internal fibers. Therefore, wrapping every context value in `useMemo` indiscriminately is an anti-pattern. Context memoization should be applied strategically based on specific criteria:

**When memoization is necessary:**
1. **The Provider re-renders frequently:** If the provider hosts rapidly changing state (e.g., input keystrokes, scroll positions, web socket ticks, or timer intervals) or re-renders often due to its parent tree.
2. **Widespread or expensive consumers:** The context is consumed by many components across the application tree, or individual consumers contain complex subtrees, heavy computations, or deep SVG/canvas render trees.
3. **Compound/multi-value payloads:** The context value exposes an aggregate object containing several independent slices of state and callbacks.
4. **Consumers rely on reference equality:** Consumers pass context values directly into their own `useEffect`, `useMemo`, or `useCallback` dependency arrays, where an unstable context reference triggers unwanted side effects or invalidations.

**When it is premature optimization:**
- **Static or rarely updating providers:** Providers configured near the root of an app that seldom or never re-render (e.g., authenticated user session, fixed i18n localization, or UI theme toggle that changes once per session).
- **Localized leaf providers:** Providers scoped to a tiny subtree with few, computationally cheap leaf consumers.
- **Provider with no internal re-render triggers:** When the provider component has no state of its own and its parent rarely re-renders, the provider won't re-render anyway, rendering `useMemo` redundant.

**Interview answer:** "Memoizing context values is critical when the provider re-renders frequently, feeds multiple or computationally expensive consumers, or passes values into consumers' hook dependency arrays. Conversely, it is premature for near-root providers holding static or rarely changing data with cheap consumers."
