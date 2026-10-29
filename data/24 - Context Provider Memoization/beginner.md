1. Why does passing an inline object literal like `<Context.Provider value={{ a, b, c }}>` degrade performance, and how does React determine when context consumers must re-render?

**Deep explanation:** In JavaScript, object literals evaluate to a new memory reference each time they execute. When writing `<MyContext.Provider value={{ a, b, c }}>`, React allocates a brand-new object reference on every single render of the provider component, even if the primitive values of `a`, `b`, and `c` remain strictly identical.

React determines whether consumers need to update by performing an `Object.is()` shallow equality check between the previous and next `value` passed to the provider (`Object.is(prevValue, nextValue)`):
```typescript
// On every provider render:
const prevValue = { a: 1, b: "hello" }; // Memory Address 0x001
const nextValue = { a: 1, b: "hello" }; // Memory Address 0x002

Object.is(prevValue, nextValue); // returns false!
```
Because `Object.is` evaluates reference identity for non-primitive objects, it returns `false` on every render. Consequently, React invalidates the context and forces every descendant component subscribed to this context via `useContext(MyContext)` or `<MyContext.Consumer>` to re-render. Crucially, context updates bypass any intermediate component-level memoization (`React.memo` or `shouldComponentUpdate`), cascading re-renders down through all consumers regardless of whether the specific slice of data they consume has actually changed.

**Interview answer:** "Inline object literals create a new memory reference on every render, causing React's `Object.is` check on the provider's `value` prop to fail. This forces every subscribed consumer component to re-render unconditionally, bypassing any intermediate `React.memo` barriers."
