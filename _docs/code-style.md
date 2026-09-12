# Code style and implementation references

These are implementation requirements and review criteria, not optional preferences. They apply to tests as well as production code.

- Follow the formatting, naming, and structure of the concrete reference code supplied by the user. For auth, the supplied Strapi AuthProvider is the reference. Adapt only what this application's contracts require, and identify those adaptations.
- Prefer readable multiline code. Expand function bodies, effects, conditionals, imports with many names, and JSX. Do not compress multiple statements, nested conditions, provider values, or dialog footers onto one line.
- In React auth code, use `import * as React from 'react'` and explicit calls such as `React.useCallback`. Use named interfaces for component props and context values. Group imports, hook declarations, callbacks, effects, and the JSX return clearly.
- Use straightforward names that reveal the role of a value: for example, `loginMutation`, `logoutMutation`, `isLoadingUser`, and `handleConfirmLogout`. Follow names from the reference where the responsibility matches.
- Destructure query and mutation results with meaningful aliases. Let RTK Query own request data, loading, and errors; do not copy those into local state or a second auth slice.
- Do not invent operation controllers, lifecycle slices, epoch/generation systems, generic command wrappers, or extra layers to replace ordinary library behavior. Any additional mechanism must address a demonstrated requirement and remain minimal.
- Keep callbacks focused and JSX legible, with separate props and one provider-value field per line. Short selectors and simple value expressions need not be expanded mechanically.
- Review the actual changed files against the user's reference before declaring the work complete; passing tests alone is insufficient.
- Preserve unrelated user edits. Correct the code involved in the current task without launching an unsolicited project-wide rewrite.
