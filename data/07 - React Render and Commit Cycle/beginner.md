1. What is the complete end-to-end lifecycle of a state update in React, from calling `setState` to screen paint and effect execution?

**Deep explanation:** When a state update is triggered in React, it moves through a structured, multi-stage pipeline:
- **1. Trigger & Scheduling:** Calling `setState` (or a `useState` dispatcher) does not immediately execute a re-render. Instead, React creates an update object with an assigned priority lane and schedules work with the React Scheduler.
- **2. Handler Run-to-Completion:** The current event handler finishes executing synchronously on the JavaScript call stack.
- **3. Render Phase:** React processes the update by invoking the component function (and any affected descendants) with updated state and props to produce a new React element tree (Virtual DOM). In Concurrent React, this phase is pure, side-effect free, and interruptible if higher-priority work arrives.
- **4. Reconciliation (Diffing):** React compares the newly produced React element tree against the existing fiber tree (`current` vs. `workInProgress`) to determine the exact minimal changes required on the host DOM.
- **5. Commit Phase:** React applies those mutations directly to the real DOM (creating, updating, or removing nodes) and updates DOM refs. The commit phase is strictly synchronous and uninterruptible to prevent visual inconsistency.
- **6. Hook Execution & Paint Order:**
  - `useInsertionEffect`: Fires synchronously *before* DOM mutations are visible or layout effects run, intended strictly for CSS-in-JS libraries to inject `<style>` tags and avoid layout recalculation.
  - `useLayoutEffect`: Fires synchronously *after* DOM mutations have been applied to the real DOM, but *before* the browser paints pixels to the screen. It blocks the paint, making it suitable for DOM measurements and synchronous layout adjustments to prevent visual flicker.
  - **Browser Paint:** The browser calculates styles, computes layout, and paints pixels to update the physical screen.
  - `useEffect`: Fires asynchronously *after* the browser paint is complete. React flushes passive effects via a scheduled message queue task so that non-blocking side effects (e.g., API calls, event subscriptions, timers) never delay visual responsiveness.

**Interview answer:** "A React state update schedules work, lets the active JavaScript handler finish, executes an interruptible render and diffing phase to produce a new virtual DOM, synchronously commits mutations to the real DOM, executes insertion and layout effects, and finally flushes passive `useEffect` hooks asynchronously after the browser paints."

2. What are the key distinctions between React's Render phase and Commit phase, and why must the Render phase remain strictly pure?

**Deep explanation:** React separates UI updates into two distinct phases to optimize responsiveness, preserve UI consistency, and enable concurrent rendering capabilities:
- **Render Phase (Calculation & Diffing):**
  - **Responsibilities:** Executes component functions, evaluates JSX expressions into React elements, processes hook logic, and runs the reconciliation algorithm to diff the new tree against the current fiber tree.
  - **Execution Characteristics:** It is non-blocking and interruptible in Concurrent React (e.g., `useTransition`, `Suspense`). If higher-priority user interaction occurs (like typing into an input), React can pause, discard, or restart the render phase from scratch. In Strict Mode, React intentionally double-invokes component bodies during the render phase to expose hidden side effects.
  - **Why Purity is Required:** Because the render phase can execute multiple times, pause, or be abandoned entirely without ever committing, any side effects placed directly in the component body (such as mutating external variables, mutating the DOM, initiating unmanaged network requests, or calling `setState`) will execute unpredictably, causing memory leaks, duplicate requests, or subtle bugs.
- **Commit Phase (Application & Mutation):**
  - **Responsibilities:** Applies the computed list of changes directly to the host DOM (inserting, removing, updating nodes), swaps the root fiber pointer to the new tree, updates DOM refs, and fires synchronous lifecycle hooks (`useInsertionEffect` and `useLayoutEffect`).
  - **Execution Characteristics:** It is strictly synchronous and uninterruptible. Once React begins mutating the host DOM, it must run to completion so the browser and user never encounter a broken, mismatched, or partially updated DOM.

**Interview answer:** "The render phase is an interruptible, pure calculation where React runs component functions and reconciles virtual DOM trees without touching the real DOM, whereas the commit phase is synchronous and uninterruptible, directly applying mutations to the real DOM and attaching refs."
