1. How is computed property syntax used alongside the object spread operator in modern state management (such as React)?

**Deep explanation:** In modern frontend frameworks like React, state must be treated as immutable. When managing forms with multiple fields, computed property syntax paired with the object spread operator (`...`) allows developers to handle all updates through a single generic change handler rather than writing individual handlers for each input. For example:
```javascript
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};
```
In this pattern, `[name]` dynamically evaluates the input element's `name` attribute at runtime (e.g., `"email"`, `"password"`, or `"username"`) and overrides that specific property while `...prev` preserves the rest of the state. This pattern avoids direct state mutation, significantly reduces boilerplate, and scales cleanly as form inputs are added or modified.

**Interview answer:** "In React, computed property syntax is typically combined with the object spread operator inside a generic input handler to update state immutably: `setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))`. This eliminates repetitive field-specific handlers by dynamically matching the state key to the input name."
