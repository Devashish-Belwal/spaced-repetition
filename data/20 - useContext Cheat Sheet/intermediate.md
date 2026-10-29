1. Why is initializing `createContext` with `undefined` and throwing an error in a custom consumer hook considered a best practice in TypeScript?

**Deep explanation:** When initializing a React Context that depends on runtime state, providing a meaningful static default value in `createContext()` is rarely practical. Initializing with `createContext<SomeContextType | undefined>(undefined)` accurately reflects that the context starts uninitialized outside of a Provider.

Pairing this with a custom consumer hook provides two major advantages:
- **TypeScript Type Narrowing:** Without a guard, `useContext(SomeContext)` returns `SomeContextType | undefined`, forcing every consumer component to write null checks, optional chaining, or non-null assertions (`!`). In the custom hook:
```typescript
export function useSomeContext(): SomeContextType {
  const context = useContext(SomeContext);
  if (context === undefined) {
    throw new Error('useSomeContext must be used within a SomeContextProvider');
  }
  return context;
}
```
Because the hook throws when `context === undefined`, TypeScript narrows the return type to `SomeContextType`, guaranteeing that consumers receive a fully defined context object.
- **Fail-Fast Boundary Enforcement:** If a consumer component is accidentally rendered outside the Provider's tree, the hook immediately fails fast at runtime with a clear, actionable error message rather than failing later with an obscure `TypeError: Cannot read properties of undefined`.

**Interview answer:** "Initializing context with `undefined` and throwing a descriptive error inside a custom hook enforces runtime Provider boundaries and narrows the TypeScript return type, eliminating repetitive null checks and optional chaining across consumer components."
