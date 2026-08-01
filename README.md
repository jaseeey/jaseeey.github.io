# jasey.io

Personal splash page for [jasey.io](https://www.jasey.io) — a single-screen link hub built as a
split-pane terminal, implemented from the *jasey.io — Design & implementation specification*
(rev 0.1, option 1b).

## Development

Install dependencies:

```sh
npm install
```

Build the site:

```sh
npm run build
```

The source files are in `public/`. The build output is written to `build/`, which GitLab Pages
publishes from `master`.

## Structure

| Path | Purpose |
| --- | --- |
| `public/index.html` | The whole page: identity rail, endpoint table, log region and prompt |
| `public/404.html` | Terminal-styled not-found page, so a bad URL keeps the illusion |
| `public/assets/css/main.css` | Design tokens, layout, identity rail, CRT overlays, breakpoints |
| `public/assets/css/session.css` | Endpoint rows, log lines, prompt and the mobile shell |
| `public/assets/js/endpoints.js` | Endpoint registry, address assembly and staggered resolution |
| `public/assets/js/terminal.js` | Log buffer, boot sequence, command set and key handling |

## Endpoint addresses

No address is served in the HTML. Each row ships with a `data-endpoint` token only; the displayed
value is assembled at runtime from character codes, and the `href` is written to the anchor on the
first pointer, touch or focus interaction — never on load. A headless fetch of the document
therefore sees no `mailto:` and no profile URLs.

The trade-off is deliberate: with JavaScript disabled the endpoint list is hidden and a `noscript`
block gives a human-readable, non-linked contact instruction instead.

To change an address, edit the character-code arrays in `public/assets/js/endpoints.js`. The
displayed value and the target are encoded separately, so they can differ.

## Layout

Three breakpoints, two media queries. The two-pane relationship rotates rather than collapses:

| Width | Split | Prompt |
| --- | --- | --- |
| >= 900px | Vertical — 380px identity rail, session fills the rest | Always live |
| 600–899px | Horizontal — identity becomes a top band | Always live |
| < 600px | None — the endpoint list is the page | Collapsed behind `open a shell` |

Nothing on the page scrolls at any width. Heights use `100dvh`, never `100vh`, so iOS Safari's
toolbar cannot push the prompt out of view.

## Licence

UNLICENSED.
