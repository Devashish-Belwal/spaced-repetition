1. What strict rules and architectural constraints govern `useEffectEvent`, and how does it differ from standard event handlers?

**Deep explanation:** React establishes clear operational boundaries between three distinct concepts:
1. **Event Handlers:** Run in response to direct user interactions (such as button clicks or form submissions). They are non-reactive and always see the latest state at the moment the user interacts.
2. **Effects (`useEffect`):** Run to synchronize the component with external systems based on state and prop transitions. They are reactive and re-execute whenever their dependencies change.
3. **Effect Events (`useEffectEvent`):** A hybrid mechanism. They are triggered not by direct user interactions, but by an Effect's synchronization cycle. However, like event handlers, their internal logic is non-reactive and reads fresh props and state without triggering dependency re-evaluations.

Because Effect Events blur the lines between reactive synchronization and event execution, React enforces strict compile-time and runtime restrictions to preserve component predictability and prevent tearing in Concurrent React:
- **Call only from inside Effects:** Effect Events can only be invoked within `useEffect`, `useLayoutEffect`, or custom hooks wrapping them. They must never be called from standard event handlers (like `onClick`), regular helper functions, or asynchronous callbacks detached from the Effect lifecycle.
- **Never call during render:** Because Effect Events always capture the latest mutable values, executing them during rendering would violate pure component rendering rules, create non-deterministic outputs, and break Concurrent Mode features such as time-slicing and speculative rendering.
- **Never pass to other components or hooks:** Effect Events are strictly scoped as private implementation details of the component and its Effects. You cannot pass an Effect Event as a prop to a child component or return it from a custom hook as a general-purpose callback.
- **Omit from dependency arrays:** React guarantees that Effect Events maintain stable references across renders while retaining access to the latest values. The React compiler and ESLint rules explicitly forbid adding Effect Events to the dependency array of an Effect.

**Interview answer:** "Unlike event handlers triggered by user interactions or Effects triggered by dependency changes, `useEffectEvent` handles non-reactive logic initiated by an Effect. React strictly requires that Effect Events only be called inside Effects, never be executed during render, never be passed as props to other components, and never be included in Effect dependency arrays."
