1. How does React separate reconciliation from DOM mutation via the Render and Commit phases, and what performance benefits does this architecture provide?

**Deep explanation:** Under the React Fiber architecture, React decomposes component updates into two distinct phases: the **Render (Reconciliation) Phase** and the **Commit Phase**.

1. **The Render / Reconciliation Phase:**
   - **Execution characteristics:** Pure, computational, and interruptible (in Concurrent Mode).
   - **Process:** React walks the fiber tree, evaluates component functions, executes the heuristic diffing algorithm, and builds a work-in-progress fiber tree. Each modified node is marked with effect flags (such as `Placement`, `Update`, or `ChildDeletion`). 
   - **Performance advantage:** No real DOM operations take place during this phase. Because it has no user-visible side effects, React can pause, resume, prioritize, or discard the in-progress tree if higher-priority browser events (like user typing or animation frames) require immediate attention.

2. **The Commit Phase:**
   - **Execution characteristics:** Synchronous and uninterruptible.
   - **Process:** React iterates through the prepared list of effects and applies all calculated changes to the host DOM in a single pass. It executes atomic DOM mutations (e.g., `appendChild`, `removeChild`, attribute updates), updates DOM refs, runs synchronous layout effects (`useLayoutEffect`), and schedules passive effects (`useEffect`).
   - **Performance advantage:** By batching all DOM mutations into one uninterrupted pass, React prevents layout thrashing (repeatedly interleaving DOM reads and writes that force continuous browser reflows) and guarantees that the user never sees partially applied or inconsistent UI states.

**Interview answer:** "React splits updates into an asynchronous Render phase that calculates tree diffs in memory without touching the DOM, and a synchronous Commit phase that applies all calculated atomic mutations in a single batch. This separation allows React to pause or abandon diffing work for high-priority user inputs while preventing layout thrashing during DOM updates."