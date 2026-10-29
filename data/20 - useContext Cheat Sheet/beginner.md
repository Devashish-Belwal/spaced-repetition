1. What is the standard 3-step pattern for implementing React Context, and how does it prevent prop drilling?

**Deep explanation:** React Context provides a declarative mechanism to share data and state across the component tree without manually passing props through intermediate components (prop drilling). The idiomatic production implementation follows a 3-step pattern:
1. **Create Context and Custom Hook:** The context is instantiated using `createContext<SomeContextType | undefined>(undefined)`. A companion custom hook (e.g., `useSomeContext`) is defined to consume this context and encapsulate validation.
2. **Create a Dedicated Provider Component:** A wrapper component (e.g., `SomeContextProvider`) encapsulates the underlying state management (typically via `useState` or `useReducer`), packages the state and updater handlers into a value prop, and renders `<SomeContext.Provider value={contextValue}>{children}</SomeContext.Provider>`.
3. **Provide and Consume:** The relevant component tree is wrapped with the Provider component, and any descendant consumer component accesses the shared state simply by invoking `useSomeContext()`.

By decoupling state delivery from the intermediary component hierarchy, intermediate components remain pure and unaware of dependencies they do not consume, reducing boilerplate and preventing unnecessary component coupling.

**Interview answer:** "The standard 3-step pattern involves creating the context alongside a custom consumer hook, wrapping children in a dedicated Provider component that exposes state and updater handlers, and wrapping the target component tree so descendants can consume the context without prop drilling."
