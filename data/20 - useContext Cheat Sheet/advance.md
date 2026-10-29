1. Why are Context values treated as read-only for consumers, and how must state mutations be handled to trigger re-renders?

**Deep explanation:** Context values in React are strictly read-only for consumers. In React's reactivity model, component re-renders are triggered by state setters (`useState` or `useReducer`), which notify React's reconciliation engine of updates based on shallow reference equality (`Object.is`).

If a consumer component mutates a context property directly (for instance, `context.user.name = "Alice"`):
- The reference to the context value object remains unchanged.
- React's scheduling engine receives no notification that state has updated.
- Neither the Provider nor downstream consumer components will re-render, leaving the UI stale or inconsistent.

To handle updates correctly, the Provider must manage the state internally using React state hooks and expose updater functions or dispatch handlers through the Provider's `value` prop:
```typescript
const [state, setState] = useState<State>(initialState);
const updateName = (name: string) => setState(prev => ({ ...prev, name }));

<SomeContext.Provider value={{ ...state, updateName }}>
  {children}
</SomeContext.Provider>
```
When a consumer invokes `updateName`, the state setter inside the Provider produces a new state reference immutably, causing the Provider to re-render, pass a new context value reference, and notify all subscribing consumer components to re-render.

**Interview answer:** "Context values are read-only because direct in-place mutations bypass React's reconciliation cycle and do not trigger re-renders. To update context state, Providers must pass down immutable updater functions or dispatchers created from state hooks."

2. How does React resolve Context values across unprovided components, single providers, and nested or shadowed provider trees?

**Deep explanation:** When a component calls `useContext(SomeContext)`, React resolves the value by traversing upwards along the fiber component tree from the call site:
- **No Provider (Unprovided Component):** If there is no matching `<SomeContext.Provider>` ancestor anywhere in the tree above the consumer, React resolves to the fallback default value specified at creation time in `createContext(defaultValue)`. Note that this default value is static and cannot be changed via props.
- **Single Provider:** When a single `<SomeContext.Provider>` exists above the consumer, React resolves directly to that Provider's current `value` prop.
- **Multiple / Nested Providers (Shadowing):** If multiple instances of the same `<SomeContext.Provider>` are nested within the component tree, React resolves to the **nearest** ancestor Provider relative to the consumer. The inner Provider shadows outer Providers for all components rendered inside its subtree.

This nested provider behavior is widely utilized in architectural patterns such as localized theming (e.g., a dark mode header inside a light mode app), nested form steps, or isolated feature modules that require localized state overrides without interfering with global state.

**Interview answer:** "React resolves context by traversing up the component tree to the nearest matching Provider's `value` prop, meaning nested providers shadow outer ones. If no matching Provider exists above the consumer, React falls back to the default value defined in `createContext`."
