1. How do you implement an auto-expanding `<textarea>` in React, and why is the "reset height" step (`height = "auto"` or `"inherit"`) mandatory before measuring `scrollHeight`?

**Deep explanation:** When implementing dynamic, auto-resizing textareas that grow with multi-line input, developers listen to input events and dynamically sync the element's CSS `height` to its `scrollHeight`:
```typescript
const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
  const textarea = event.target;
  // Step 1: Reset height to break monotonic expansion
  textarea.style.height = "auto"; // or "inherit"
  // Step 2: Set height to actual content scroll height
  textarea.style.height = `${textarea.scrollHeight}px`;
};
```
The reset step is critical due to **monotonic expansion (the one-way ratchet problem)**:
- When text is typed and the element expands (e.g., to 180px), the element's explicit inline CSS `height` is set to `180px`.
- If the user subsequently deletes lines of text, the textarea's rendered box remains 180px tall. Because the element's height is already 180px, `scrollHeight` will report at least 180px (since `scrollHeight` cannot be smaller than the element's content box).
- Without resetting the height, the textarea can grow larger when lines are added, but it will never shrink when text is deleted.
- Temporarily setting `textarea.style.height = "auto"` or `"inherit"` collapses the element down to its natural minimal height for the current text value, allowing `textarea.scrollHeight` to accurately reflect the true, reduced content height before the inline style is reassigned.

**Interview answer:** "Resetting the textarea's inline height to `auto` or `inherit` before reading `scrollHeight` prevents monotonic expansion, allowing the element to shrink when text is deleted. Without collapsing the height first, `scrollHeight` remains pegged to the container's current expanded height, preventing it from ever contracting."
