1. Why does passing a component via the `children` prop (e.g., `<Parent><Child /></Parent>`) prevent `Child` from re-rendering when `Parent`'s state changes, and how does JSX compilation explain this behavior?

**Deep explanation:** The belief that a component re-renders simply because it is visually nested inside another component is one of React's most prevalent misconceptions. Nesting in JSX does not equate to being instantiated within that component's declaration scope:
- **JSX Compilation Mechanics:** JSX transforms into `React.createElement` calls (or modern `jsx-runtime` invocations). When writing:
  ```jsx
  function App() {
    return (
      <Parent>
        <Child />
      </Parent>
    );
  }
  ```
  The compiler converts this to:
  ```js
  function App() {
    return React.createElement(Parent, null, React.createElement(Child, null));
  }
  ```
  Notice that `React.createElement(Child, null)` executes inside the execution context of `App`, *not* inside `Parent`.
- **Referential Equality of Element Descriptors:** A React element is a plain, immutable JavaScript object (`{ $$typeof: Symbol(react.element), type: Child, props: {}, key: null, ... }`). Because `React.createElement(Child, null)` is evaluated during `App`'s render pass, the resulting object is passed to `Parent` as `props.children`.
- **Fiber Bailout (`bailoutOnAlreadyFinishedWork`):** When `Parent`'s local state updates (via `useState` or `useReducer`), React schedules a re-render for `Parent`. React invokes `Parent()`, but `App` is *not* re-rendered. As a result, the reference to `props.children` remains strictly referentially identical (`oldProps.children === newProps.children`). During the render phase (`beginWork`), React inspects the child Fiber. Because its props are referentially identical, it has no scheduled state updates of its own, and it consumes no updated Context, React completely bails out of re-rendering `Child` and reuses the existing Fiber subtree without diffing.
- **In-Body Invocation vs. Children Prop:** If `Parent` had directly instantiated `Child` in its own return statement (`return <div><Child /></div>;`), every state update in `Parent` would execute `React.createElement(Child, null)`, generating a brand-new object reference and forcing `Child` through reconciliation and re-rendering.

**Interview answer:** "Passing `<Child />` as `children` means it is instantiated in the outer parent's scope, so when the wrapper's state updates, `props.children` maintains strict referential equality (`oldProps === newProps`), allowing React's reconciler to bail out and skip re-rendering the child subtree entirely without requiring `React.memo`."
