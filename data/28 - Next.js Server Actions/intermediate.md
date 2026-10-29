1. How do Server Actions integrate with React forms, and how do they enable progressive enhancement alongside hooks like `useActionState` and `useTransition`?

**Deep explanation:** Server Actions integrate directly with the native HTML `<form>` element via React's extended `action` attribute (`<form action={createTodo}>`). This architecture provides two distinct operating modes:
- **Progressive Enhancement:** When implemented within React Server Components, forms submit using standard HTML `POST` behavior if JavaScript has not finished downloading, fails to load, or is disabled entirely. The browser submits native form encoded data to the server, Next.js executes the Server Action, and the server returns the updated page.
- **Client Component Integration:** In Client Components (`"use client"`), Server Actions can still be passed directly to `<form action={...}>` or invoked programmatically inside event handlers (such as `onClick` or `onChange`). When client JavaScript is active, Next.js intercepts form submission, prevents a full-page reload, and submits the data asynchronously via `fetch`.

To manage interactive UI states in Client Components, React provides specialized hooks:
- `useActionState` (formerly `useFormState`): Wraps a Server Action to track its returned state (e.g., validation error messages, success flags) and provides a wrapped action dispatcher along with an `isPending` boolean:
  ```tsx
  const [state, formAction, isPending] = useActionState(createTodo, initialState);
  ```
- `useFormStatus`: A hook invoked inside child components of a `<form>` (such as submit buttons) to read the parent form's submission status (`pending`, `data`, `method`, `action`) without prop drilling.
- `useTransition`: When invoking Server Actions imperatively outside a `<form action>`, wrapping the invocation in `startTransition(() => { ... })` keeps the UI responsive and exposes an `isPending` state during the asynchronous server roundtrip.

**Interview answer:** "Server Actions enable progressive enhancement by allowing HTML forms to submit via native HTTP POST requests even before client JavaScript hydrates. In Client Components, they integrate with React hooks like `useActionState`, `useFormStatus`, and `useTransition` to handle pending indicators, optimistic updates, and validation state without manual event management."