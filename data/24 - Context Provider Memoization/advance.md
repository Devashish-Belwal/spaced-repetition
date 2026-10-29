1. Why is splitting contexts (e.g., State vs. Dispatch) often a superior architectural solution compared to relying solely on value memoization?

**Deep explanation:** Even with `useMemo`, any update to a single property in the context value creates a new object reference, causing **all** consumers of that context to re-render—even consumers that only care about parts of the value that did not change.

A classic example is bundling mutable state and its updater functions together:
```typescript
// Problematic: Any change to `state` forces components that only need `dispatch` to re-render!
<AppContext.Provider value={useMemo(() => ({ state, dispatch }), [state])}>
```
A component that only renders a button to trigger an action (needing only `dispatch`) will re-render whenever any piece of `state` changes, defeating the purpose of component isolation.

The idiomatic React solution is **Context Splitting**:
1. **StateContext:** Carries mutable data that changes over time.
2. **DispatchContext:** Carries updater callbacks or the `dispatch` function from `useReducer`.

```typescript
const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<React.Dispatch<AppAction> | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>
        {children}
      </StateContext.Provider>
    </DispatchContext.Provider>
  );
};
```
Because React guarantees that `dispatch` from `useReducer` retains a stable identity throughout the component lifecycle:
- `DispatchContext.Provider` never changes reference and does not even need `useMemo`.
- Action-only components subscribing via `useContext(DispatchContext)` will **never** re-render when `state` changes.
- Only components consuming `StateContext` will re-render when state updates occur, achieving fine-grained rendering performance without complex selector libraries.

**Interview answer:** "Even with `useMemo`, updating any state property invalidates the entire context object, forcing all consumers to re-render. Splitting into separate State and Dispatch contexts isolates high-frequency state updates from stable dispatch functions, allowing action-triggering components to never re-render when state changes."
