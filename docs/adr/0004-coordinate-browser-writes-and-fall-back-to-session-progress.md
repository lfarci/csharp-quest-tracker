# Coordinate browser writes and fall back to session progress

A stale-tab warning alone cannot prevent simultaneous localStorage overwrites because checking a value and replacing it are separate operations. Participating tabs therefore coordinate writes with native browser locks, check the saved state again inside the lock, and require a stale tab to reload; when safe coordination is unavailable, the app falls back to visibly unsaved session progress with export rather than weakening the accepted protection.

Sources: [Web Storage standard](https://html.spec.whatwg.org/multipage/webstorage.html), [Web Locks standard](https://w3c.github.io/web-locks/).
