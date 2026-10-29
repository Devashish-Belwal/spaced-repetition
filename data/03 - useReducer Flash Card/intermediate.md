1. When should an engineering team choose `useReducer` over `useState`, and how does it prevent "impossible states" in complex workflows?

**Deep explanation:** While `useState` is ideal for independent primitives or simple values, `useReducer` becomes the superior architectural choice in several key scenarios:
- **Interdependent state slices:** In workflows like asynchronous data fetching, state often spans multiple variables: `{ data, isLoading, error }`. Managing these with multiple `useState` calls can lead to "impossible states"—such as `{ isLoading: true, error: ErrorObject, data: ResponseData }` all being active simultaneously due to uncoordinated setters. With `useReducer`, actions model atomic state machine transitions:
  ```jsx
  case "FETCH_START":
    return { data: null, isLoading: true, error: null };
  case "FETCH_SUCCESS":
    return { data: action.payload, isLoading: false, error: null };
  case "FETCH_FAILURE":
    return { data: null, isLoading: false, error: action.payload };
  ```
- **Next state depends on multiple previous states:** When computing the next state requires reading several distinct pieces of the current state or evaluating complex validation rules, collocating that logic in a reducer prevents race conditions and stale closure issues.
- **Separation of concerns and maintainability:** When a component accumulates more than 3-4 related state variables, `useState` scatters state-updating logic across numerous event handlers. `useReducer` extracts transition logic into a dedicated file or module, keeping the UI declarative and thin.
- **Isolated unit testing:** Reducers can be tested independently of React rendering lifecycles, ensuring complex business logic is verified with straightforward functional test suites.

**Interview answer:** "Choose `useReducer` over `useState` when managing complex, interdependent state or multi-step workflows where updates depend on previous state. It centralizes transition logic, prevents impossible states by enforcing atomic state machine transitions, and allows business logic to be tested in isolation without mounting React components."
