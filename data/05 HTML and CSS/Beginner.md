1. What is the purpose of the HTML doctype?

**Deep explanation:** `<!doctype html>` tells the browser to parse the document in standards mode. Without it, browsers may enter quirks mode and reproduce old, inconsistent layout behavior. It belongs on the first line and is not an HTML element.

**Interview answer:** The HTML5 doctype selects standards mode, giving predictable modern HTML and CSS behavior across browsers.

2. How do semantic elements differ from generic div and span elements?

**Deep explanation:** Semantic elements such as `nav`, `main`, and `button` describe meaning and often provide built-in accessibility behavior. `div` and `span` are neutral containers useful when no meaningful element fits. Semantics improve structure, maintenance, search indexing, and assistive-technology navigation.

**Interview answer:** Semantic elements communicate purpose; `div` and `span` do not. I choose the native semantic element first and use generic containers only when necessary.

3. When should you use a button instead of a link?

**Deep explanation:** A link navigates to a URL or document location; a button performs an action such as submitting, opening, or toggling. Native elements supply correct keyboard behavior and semantics. Styling one to resemble the other does not change its purpose.

**Interview answer:** Use a link for navigation and a button for an action. That preserves expected keyboard and assistive-technology behavior.

4. How should headings describe a page's structure?

**Deep explanation:** Headings label sections and form a meaningful hierarchy: the page topic followed by nested subsections. Choose levels by structure, not visual size, and style them with CSS. Avoid skipping levels when it would make the outline confusing.

**Interview answer:** Headings should create a logical outline, with levels reflecting section nesting rather than appearance.

5. How do block, inline, and inline-block layout differ?

**Deep explanation:** Block boxes normally start a new line and fill available inline space. Inline boxes flow within text and ignore normal width and height settings. `inline-block` flows inline but accepts box dimensions and vertical margins like a block.

**Interview answer:** Block elements form rows, inline elements flow with text, and inline-block combines inline placement with block sizing.

6. What belongs in the head element?

**Deep explanation:** `head` contains document metadata and referenced resources, including `title`, character encoding, viewport metadata, stylesheets, icons, and selected scripts. User-visible page content belongs in `body`. A unique, descriptive title is especially important for navigation and search results.

**Interview answer:** The head holds metadata and resources, not primary page content: title, meta tags, CSS links, icons, and appropriate scripts.

7. What do character encoding and viewport metadata control?

**Deep explanation:** `<meta charset="utf-8">` tells the browser how bytes map to characters and should appear early. The viewport meta tag makes the layout viewport match the device width on mobile; without it, responsive CSS may render as a scaled-down desktop page.

**Interview answer:** Charset prevents text-decoding errors; viewport metadata enables mobile layouts to use the actual device width.

8. How do id, class, and data attributes differ?

**Deep explanation:** An `id` uniquely identifies one element and supports fragments, labels, and scripting. A `class` groups reusable styling or behavior across elements. `data-*` stores application-specific metadata accessible through `dataset`; it should not replace meaningful native attributes.

**Interview answer:** IDs are unique identifiers, classes are reusable groupings, and `data-*` attributes carry custom application data.

9. How would you associate a label with an input?

**Deep explanation:** Give the input an `id` and set the label's `for` to that value, or wrap the input inside `label`. The explicit form is often easier to lay out. A placeholder is not a label because it disappears and may have poor contrast.

**Interview answer:** I connect `<label for="email">` to `<input id="email">`, ensuring the name is announced and clicking it focuses the control.

10. How do input type, name, value, and autocomplete attributes differ?

**Deep explanation:** `type` selects control behavior and validation; `name` is the submitted field key; `value` is its current submitted value. `autocomplete` tells the browser what real-world data the field represents, improving autofill and accessibility. Missing `name` usually means no form submission value.

**Interview answer:** Type defines behavior, name defines the submission key, value is the submitted data, and autocomplete supplies an autofill purpose token.

11. How do disabled and readonly form controls differ?

**Deep explanation:** A disabled control cannot be focused or edited and is excluded from form submission. A readonly control cannot be edited but remains focusable and is submitted; it applies only to certain controls. Disabled content may also be harder for users to discover.

**Interview answer:** Disabled fields are inactive and not submitted; readonly fields remain focusable and submitted but cannot be changed.

12. What is native form validation capable of checking?

**Deep explanation:** Browsers can enforce `required`, input-type syntax, length, numeric ranges, steps, and `pattern`. Constraint-validation APIs expose validity states and custom messages. Server validation is still mandatory because browser checks can be bypassed, and custom errors must be accessible.

**Interview answer:** Native validation covers required values, formats, patterns, lengths, and ranges, but it complements rather than replaces server-side validation.

13. How do GET and POST forms submit data?

**Deep explanation:** GET encodes successful controls in the URL query string, making requests bookmarkable and suitable for safe retrieval such as search. POST sends data in the request body and suits state changes or larger/sensitive payloads. HTTPS is required for confidentiality in either case.

**Interview answer:** GET places data in the URL for safe, repeatable retrieval; POST sends it in the body, commonly for state-changing submissions.

14. When should an image have empty alternative text?

**Deep explanation:** Use `alt=""` when an image is purely decorative or repeats information already adjacent, so screen readers skip it. Informative images need concise equivalent text; linked images need the link's purpose. Omitting `alt` can cause a filename to be announced.

**Interview answer:** I use empty alt text only when the image adds no information or function; meaningful images receive an equivalent description.

15. How would you represent tabular data accessibly?

**Deep explanation:** Use a real `table` with a concise `caption`, header cells using `th`, and correct `scope` for simple row or column relationships. Complex tables may need `headers`/`id`. Do not use tables for layout, and preserve associations in responsive designs.

**Interview answer:** I use semantic table markup, a caption, and properly scoped headers so every data cell has an understandable relationship.

16. How do ordered, unordered, and description lists differ?

**Deep explanation:** `ol` represents items whose sequence or rank matters; `ul` represents a collection where order is irrelevant. `dl` pairs terms or names with descriptions using `dt` and `dd`. Choosing correctly conveys relationships beyond visual bullets.

**Interview answer:** Ordered lists express meaningful sequence, unordered lists express a set, and description lists express term-description pairs.

17. What is the CSS box model?

**Deep explanation:** Every element is laid out as content surrounded by padding, border, and margin. With default `content-box`, declared width and height cover only content, so padding and border increase the rendered size. Margins create external separation.

**Interview answer:** The box model is content, padding, border, then margin; these layers determine an element's occupied space.

18. How does box-sizing change element dimensions?

**Deep explanation:** `content-box` applies width and height to content alone. `border-box` includes padding and border within the declared dimensions, making layouts easier to predict. Projects commonly apply `box-sizing: border-box` globally, including pseudo-elements.

**Interview answer:** `border-box` keeps padding and border inside the declared size; `content-box` adds them outside it.

19. How do margin, padding, border, and gap differ?

**Deep explanation:** Margin separates an element from neighbors; padding creates space inside its border; border draws around padding and content. `gap` creates consistent spacing only between flex/grid children without adding outer-edge space. Their backgrounds and collapsing behavior also differ.

**Interview answer:** Margin is external spacing, padding internal spacing, border the boundary, and gap spacing between layout items.

20. How does the CSS cascade select a declaration?

**Deep explanation:** The cascade compares relevance, origin and importance, cascade layer, specificity, scoping proximity, then source order. Inheritance supplies a value only when no cascaded value applies. Understanding this avoids overusing `!important` or escalating selector specificity.

**Interview answer:** CSS resolves competing declarations by origin/importance, layer, specificity, proximity, and finally source order.

21. What is selector specificity?

**Deep explanation:** Specificity is the weight used among otherwise competing selectors: IDs outweigh classes/attributes/pseudo-classes, which outweigh type selectors/pseudo-elements. Inline styles have special precedence. `:where()` contributes zero specificity, helping create easy-to-override rules.

**Interview answer:** Specificity ranks selectors when cascade context is equal; IDs beat classes, and classes beat element selectors.

22. Which CSS properties inherit by default?

**Deep explanation:** Text-related properties such as `color`, `font-family`, `font-size`, and `line-height` usually inherit. Box and layout properties such as margin, border, width, and display usually do not. `inherit`, `initial`, `unset`, and `revert` explicitly control value resolution.

**Interview answer:** Typography and color commonly inherit; layout and box-model properties generally do not. I verify individual property definitions when unsure.

23. How do relative and absolute CSS units differ?

**Deep explanation:** Absolute CSS units such as `px` map to a fixed CSS reference size, while relative units depend on another value: `%`, `em`, `rem`, viewport, or container units. Relative units support scalable typography and fluid layouts, though each has a different reference.

**Interview answer:** Absolute units have a stable CSS size; relative units derive from fonts, containers, or viewports and adapt with context.

24. How do display:none, visibility:hidden, and opacity:0 differ?

**Deep explanation:** `display:none` removes the box and normally its accessibility-tree presence. `visibility:hidden` preserves layout space but hides the subtree and usually removes it from accessibility. `opacity:0` remains laid out, focusable, clickable, and generally exposed, so invisible interactions are a pitfall.

**Interview answer:** Display none removes layout; visibility hidden keeps space; opacity zero only makes pixels transparent and leaves interaction intact.

25. How do static, relative, absolute, fixed, and sticky positioning differ?

**Deep explanation:** Static is normal flow. Relative stays in flow but can be offset and establish an absolute-positioning container. Absolute leaves flow and uses a containing block; fixed is usually viewport-relative. Sticky behaves normally until a threshold, then sticks within its scroll container.

**Interview answer:** Static and relative remain in flow; absolute and fixed leave it; sticky switches between flow and constrained fixed-like behavior.

26. What are the main and cross axes in Flexbox?

**Deep explanation:** The main axis follows `flex-direction`; the cross axis is perpendicular. `justify-content` distributes space on the main axis, while `align-items` and `align-content` work across it. Axes can change with direction and writing mode, so they are not always horizontal/vertical.

**Interview answer:** Flex direction defines the main axis; the perpendicular axis is cross. Justify handles main-axis alignment and align handles cross-axis alignment.

27. How does CSS Grid differ from Flexbox?

**Deep explanation:** Grid is designed for two-dimensional row-and-column placement; Flexbox primarily distributes items along one dimension at a time. Grid often suits page/component structure, while Flexbox suits linear groups. They complement each other and are frequently nested.

**Interview answer:** Grid controls rows and columns together; Flexbox excels at one-dimensional alignment and distribution.

28. What are media queries used for?

**Deep explanation:** Media queries conditionally apply CSS based on environment features such as viewport width, orientation, hover capability, color scheme, contrast, or reduced-motion preference. Breakpoints should respond to content needs rather than named device models.

**Interview answer:** Media queries adapt styles to viewport and user/device capabilities, enabling responsive and preference-aware design.

29. How would you make an image fit its container without distortion?

**Deep explanation:** For responsive intrinsic sizing, use `max-width:100%; height:auto`. For a fixed box, set its dimensions and use `object-fit: cover` to crop or `contain` to letterbox while preserving aspect ratio. Reserve space with dimensions or `aspect-ratio` to avoid layout shift.

**Interview answer:** I preserve aspect ratio with auto height, or use `object-fit: cover/contain` when the container has fixed dimensions.

30. How would you provide visible keyboard focus?

**Deep explanation:** Keep a high-contrast focus indicator using `:focus-visible`, usually an outline with sufficient thickness and separation. Do not remove the browser outline without an equivalent replacement. Ensure focus is not clipped, obscured, or communicated by color alone.

**Interview answer:** I style `:focus-visible` with a clear, high-contrast outline and never suppress focus without an equally visible replacement.
