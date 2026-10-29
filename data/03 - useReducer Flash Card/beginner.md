1. What is the core mental model of `useReducer`, and how do `state`, `dispatch`, `action`, and `reducer` collaborate to manage state transitions?

**Deep explanation:** The core mental model of `useReducer` shifts state management from imperative, decentralized updates (`setState(newValue)`) to a declarative, centralized transition system driven by user intent. The hook follows a unidirectional data flow established by the Redux/Elm architecture and consists of four primary building blocks:
- **`state`**: The current, immutable snapshot of the component state provided by React during rendering.
- **`dispatch`**: A stable function returned by `useReducer` that components invoke to trigger state transitions. Instead of instructing the state *how* to change, components dispatch an action object describing *what happened*.
- **`action`**: A plain JavaScript object representing an event or intent. By convention, it contains a `type` string (e.g., `{ type: "increment" }`) and an optional `payload` containing data necessary for the transition.
- **`reducer`**: A pure JavaScript function with the signature `(state, action) => newState`. It centralizes all state transition logic, evaluating the action type and computing the next state snapshot based on the current state.

```jsx
const [state, dispatch] = useReducer(reducer, initialState);

// Component dispatches intent:
dispatch({ type: "increment", payload: 1 });

// Reducer centralizes update logic:
function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { ...state, count: state.count + action.payload };
    default:
      return state;
  }
}
```
This architecture decouples the user interface from business logic: UI components focus strictly on capturing events and dispatching actions, while the reducer encapsulates how the state evolves.

**Interview answer:** "The core mental model of `useReducer` decouples user intent from state transformation: components dispatch action objects describing what occurred, and a centralized pure reducer function determines how the state transitions. This establishes a predictable, unidirectional data flow that separates UI event handling from state business logic."
