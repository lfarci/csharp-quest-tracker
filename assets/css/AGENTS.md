# CSS conventions

- `base.css` owns design tokens, typography, navigation, About-page presentation, generic controls and native dialogs.
- `tracker.css` owns the progress dashboard, challenges, search and filters; `settings.css` owns appearance and backup/recovery layouts.
- Use two-space indentation, one declaration per line, whitespace between rules and short section comments about purpose. Avoid comments that paraphrase property names.
- Preserve CSS custom properties, keyboard focus and light/dark appearance. Keep system dark-mode media queries distinct from explicit theme overrides.
- Retain responsive rules in the stylesheet of the affected page. Avoid Sass, Tailwind, CSS Modules and `@import`.
- Verify styles across all three pages and narrow screen widths after changes; do not add unrelated styling as part of formatting.
