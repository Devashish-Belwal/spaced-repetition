1. What problem does React solve in a user interface?

**Deep explanation:** React builds interactive UIs from reusable components and keeps the DOM consistent with application state. Developers describe the desired UI; React updates the necessary DOM nodes when data changes.

**Interview answer:** React makes stateful interfaces easier to build by composing reusable components and declaratively keeping the DOM in sync with state.

2. How do components, elements, and DOM nodes differ?

**Deep explanation:** A component is reusable rendering logic. JSX produces React elements—immutable descriptions of UI. React reconciles those descriptions and creates or updates actual browser DOM nodes.

**Interview answer:** A component is a reusable UI definition, an element is its immutable description, and a DOM node is the actual browser object React creates or updates.

3. What is JSX, and when is it evaluated?

**Deep explanation:** JSX is syntax resembling HTML that represents JavaScript expressions creating React elements. A build tool transforms it into JavaScript, which is evaluated when the surrounding code—usually a component render—runs.

**Interview answer:** JSX is JavaScript syntax for describing React elements. It is compiled to JavaScript and evaluated when that code runs, typically during rendering.

4. How do props and state differ?

**Deep explanation:** Props are inputs supplied and owned by a parent. State is data owned by a component and updated through a setter. Both affect rendering, but a child must not mutate props.

**Interview answer:** Props are read-only inputs from a parent; state is component-owned data that can change through a setter and trigger a render.

5. Why should props be treated as immutable?

**Deep explanation:** Props belong to the parent, so child mutation breaks predictable one-way data flow. A child should request changes through a callback; immutable values also make change detection and debugging easier.

**Interview answer:** Props are owned by the parent. Treating them as immutable preserves predictable one-way data flow; children request changes through callbacks.

6. How does a state update request a new render?

**Deep explanation:** Calling a state setter queues an update. React schedules a render, calculates a new element tree, and commits only the required DOM changes. It may batch several updates for efficiency.

**Interview answer:** A setter queues an update; React re-renders, reconciles the new output, and applies the necessary DOM changes.

7. Why might reading state immediately after setting it show the previous value?

**Deep explanation:** State is a snapshot for one render. A setter schedules a future render; it does not rewrite the variable captured by the currently running handler.

**Interview answer:** The current render has a fixed state snapshot. Setting state queues the next render, so the current handler still sees the previous value.

8. When should you use a functional state update?

**Deep explanation:** Use `setCount(count => count + 1)` when the next value depends on the previous one. React supplies the latest queued value, so batched updates compose correctly and stale closures are less risky.

**Interview answer:** I use a functional update whenever next state depends on previous state, especially with queued updates or potentially stale closures.

9. How would you render a list of components?

**Deep explanation:** Transform data with `map`, returning one component per item and assigning a stable key: `items.map(item => <Row key={item.id} item={item} />)`.

**Interview answer:** I map the data to components and give each returned item a stable key, usually an ID from the data.

10. Why do list items need stable keys?

**Deep explanation:** Keys identify siblings across renders. React uses them to match old and new items, preserve the correct component state, and minimize work during insertions, removals, or reordering.

**Interview answer:** Stable keys let React track each sibling, preserve its state correctly, and update lists efficiently.

11. What happens when array indexes are used as keys for a changing list?

**Deep explanation:** When items move or are inserted, their indexes change. React may associate existing component state with the wrong data, causing incorrect input values or behavior. Indexes are suitable mainly for static lists.

**Interview answer:** Index keys can make React reuse component state for the wrong item after a reorder or insertion, so I prefer stable data IDs.

12. How would you conditionally render content?

**Deep explanation:** Use normal JavaScript: `if` for distinct branches, a ternary for two expressions, or `condition && <Content />` for optional content. Returning `null` renders nothing.

**Interview answer:** I use JavaScript conditions—usually `if`, a ternary, or `&&`—and return `null` when nothing should render.

13. How do controlled and uncontrolled inputs differ?

**Deep explanation:** A controlled input gets `value` or `checked` from React state and updates via `onChange`, making validation and coordination easy. An uncontrolled input stores its value in the DOM and is read through a ref or form data, requiring less wiring but offering less control.

**Interview answer:** Controlled inputs use React state as the source of truth; uncontrolled inputs keep their state in the DOM and are read with a ref or form data.

14. How would you handle a form submission?

**Deep explanation:** Attach `onSubmit` to the form, call `preventDefault()` for client-side handling, validate and collect values, then submit. Track pending and error states, prevent duplicate requests, and retain native form semantics.

**Interview answer:** I handle the form's `onSubmit`, prevent default navigation when appropriate, validate, submit asynchronously, and expose pending and error states.

15. What does lifting state up accomplish?

**Deep explanation:** It moves shared data to the nearest common ancestor. That component becomes the single source of truth and passes values and callbacks down, keeping siblings synchronized.

**Interview answer:** It puts shared state in the nearest common parent so related components stay synchronized from one source of truth.

16. How would you pass data from a child to its parent?

**Deep explanation:** The parent passes a callback prop, and the child calls it with the relevant value, such as `onSelect(item)`. The parent then decides how to update its state.

**Interview answer:** I pass a callback from the parent as a prop, then have the child call it with the value the parent needs.

17. What is prop drilling?

**Deep explanation:** Prop drilling means passing props through intermediate components that do not use them solely to reach deeper descendants. A few levels can be explicit and fine; widely shared data may suit composition or Context.

**Interview answer:** Prop drilling is forwarding data through components that do not need it themselves just to reach a deeper component.

18. When is Context useful?

**Deep explanation:** Context suits values needed by many descendants, such as theme, locale, authentication, or configuration. It avoids repetitive prop passing, but changing its value can re-render consumers, so unrelated or frequently changing data may need separation.

**Interview answer:** I use Context for cross-cutting values needed by many descendants, such as theme or auth, but not for every local value.

19. What are the rules of Hooks?

**Deep explanation:** Call Hooks only at the top level of React function components or custom Hooks—not in loops, conditions, nested functions, or ordinary functions. Stable call order lets React associate Hook state correctly.

**Interview answer:** Hooks must be called at the top level and only from React function components or custom Hooks, keeping their call order consistent.

20. What is useState used for?

**Deep explanation:** `useState` adds local state to a function component. It returns the current render's value and a setter that queues another render. Avoid storing values that can simply be derived during rendering.

**Interview answer:** `useState` stores local component state and provides a setter that queues a re-render with the new value.

21. What is useEffect intended to synchronize?

**Deep explanation:** `useEffect` synchronizes a component with systems outside React, such as subscriptions, browser APIs, timers, network connections, or third-party widgets. Derived display data usually belongs in rendering instead.

**Interview answer:** `useEffect` synchronizes React with external systems such as subscriptions, browser APIs, timers, or network connections.

22. What does an Effect cleanup function do?

**Deep explanation:** Cleanup undoes an Effect's setup—for example, unsubscribing, removing a listener, clearing a timer, or aborting a request. React runs it before the Effect reruns and when the component unmounts.

**Interview answer:** Cleanup reverses an Effect's setup before it reruns and on unmount, preventing leaks and stale behavior.

23. How does an Effect dependency list affect execution?

**Deep explanation:** No list runs after every commit; `[]` performs mount-time setup; `[a, b]` reruns when a listed value changes by `Object.is`. All reactive values read by the Effect should be included unless code is restructured.

**Interview answer:** No array means every render, an empty array means mount-time setup, and listed dependencies rerun the Effect when those values change.

24. How does useRef differ from useState?

**Deep explanation:** `useRef` provides a stable object whose mutable `.current` persists across renders, often for DOM nodes or non-render data. Updating it does not render; updating state does.

**Interview answer:** A ref stores a persistent mutable value without causing renders; state stores render-visible data and its setter triggers a render.

25. When does changing a ref trigger a render?

**Deep explanation:** Changing `ref.current` never directly triggers a render because React does not track it as state. If the value must appear in the UI, store it in state.

**Interview answer:** It does not trigger a render. If the UI depends on the value, I use state instead.

26. What is a custom Hook?

**Deep explanation:** A custom Hook is a `use`-prefixed function that combines Hooks to reuse stateful logic. Each caller gets independent state, so it shares behavior rather than a single state instance.

**Interview answer:** A custom Hook is a `use`-prefixed function that composes Hooks to reuse stateful behavior across components.

27. How would you fetch and display data with loading and error states?

**Deep explanation:** Model data, loading, and error states; fetch through an appropriate data layer or Effect; and cancel or ignore stale requests. Render loading, retryable error, empty, and success views. Query libraries can add caching and deduplication.

**Interview answer:** I model loading, error, empty, and success states explicitly, fetch in an Effect or data library, handle stale requests, and provide retry behavior.

28. How would you handle a missing or failed image?

**Deep explanation:** Provide meaningful `alt` text—or empty alt for decoration—and replace or hide a broken image in `onError`. Prevent a loop if the fallback fails, reserve dimensions, and show a placeholder when the URL is absent.

**Interview answer:** I validate the source, provide appropriate alt text, and use `onError` to show a safe placeholder while preventing fallback loops.

29. What is a fragment useful for?

**Deep explanation:** A Fragment groups sibling elements without adding a DOM wrapper that could affect layout or semantics. Use `<>...</>` normally or `<Fragment key={id}>` when a list key is needed.

**Interview answer:** A Fragment lets a component return multiple siblings without inserting an extra DOM element.

30. What is an error boundary?

**Deep explanation:** An error boundary catches rendering and lifecycle errors in descendants and displays fallback UI. Traditionally it is a class component. It does not catch event-handler errors, asynchronous callback errors, or errors inside itself.

**Interview answer:** An error boundary catches descendant render or lifecycle errors and shows fallback UI, isolating failure to part of the application.

31. How would you split a large component into smaller components?

**Deep explanation:** Extract coherent UI sections into components with focused props, keep state near its consumers, and move repeated stateful behavior into custom Hooks. Do not split only to reduce line count if it obscures data flow.

**Interview answer:** I extract cohesive UI sections and repeated behavior, give each component a clear responsibility, and keep state close to where it is used.

32. How would you implement accessible buttons and inputs in React?

**Deep explanation:** Prefer semantic `<button>`, `<label>`, and `<input>` elements. Connect labels using nesting or `htmlFor`/`id`, preserve keyboard and focus behavior, expose validation clearly, and use ARIA only for semantic gaps.

**Interview answer:** I use semantic elements, connect every input to a label, support keyboard and focus behavior, expose errors clearly, and use ARIA only when needed.

33. What is client-side routing?

**Deep explanation:** Client-side routing maps URLs to browser-rendered views without fetching a completely new document for each navigation. A router works with history and should preserve links, direct loading, and back/forward navigation.

**Interview answer:** Client-side routing changes the rendered view and URL without a full page reload while preserving history and deep links.

34. How would you test a component from a user's perspective?

**Deep explanation:** Render it, find controls by roles, labels, or visible text, perform realistic interactions, and assert the visible outcome. Avoid internal state and implementation details; mock external boundaries only when needed.

**Interview answer:** I query by accessible names, interact like a user, and assert observable results rather than implementation details.

35. Why should component rendering avoid side effects?

**Deep explanation:** Rendering should be pure because React may run, pause, restart, or repeat it. Side effects could execute multiple times and create inconsistency. Put user-driven work in handlers and external synchronization in Effects.

**Interview answer:** React may repeat or abandon renders, so rendering must stay pure. I put side effects in event handlers or Effects.
