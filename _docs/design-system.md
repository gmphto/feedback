# Minimal shell conventions

The current React shell uses a semantic `main` with one `h1` identifying Project Scope Tool. Tailwind CSS 4 is imported in `client/src/index.css` through the Vite plugin.

Preserve readable semantic markup and a simple fluid layout that fits narrow and wide viewports without horizontal overflow. Use meaningful headings and accessible native elements when content is added. Keep text legible and keyboard interaction available for any future controls.

Material UI uses its default Emotion styling engine and the existing LightTheme at the root. Existing components have not been migrated. Later UI issues define navigation and visual conventions; additional UI dependencies require user approval.

Feedback uses top-right notifications (up to three) with theme severity colors, readable message/description text, and named dismissal or Undo controls. Progress expiry only closes the notification; Undo calls the caller's cancellation callback once. Shared MUI confirmations default focus to Cancel, restore focus on dismissal, and use error styling for destructive confirmation. Validation dialogs show existing model messages with an OK action. Confirmation callers control dialog visibility and handle confirm/cancel callbacks; the dialog does not own project mutations.

