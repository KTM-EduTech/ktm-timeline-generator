# KTM EduTech Timeline Generator

A browser-based studio for building interactive, responsive timelines without writing code. You get six layouts, full visual control, and exports to standalone HTML, Google Sites embed code, HTML/CSS source, PNG and JSON.

**Product owner:** Kyd Tantano Masong · **Brand:** KTM EduTech · **Version:** 1.0.0

---

## 1. Running the app

The whole app is **one file: `dist/index.html`**. It has no build step at runtime and needs no server code.

- **Try it locally:** double-click `dist/index.html`, or for the most reliable behaviour serve the folder:
  `python3 -m http.server 8080 --directory dist` and open http://localhost:8080
- **Deploy:** upload `dist/index.html` to any static host: GitHub Pages, Netlify, Cloudflare Pages, or your own site (for example a `/timeline/` folder on kydmasong.net). HTTPS is recommended.
- **Internet needed for:** Poppins and other Google Fonts, Font Awesome icons (cdnjs) and the PNG renderer (html2canvas, cdnjs). If they are missing, the app still works: text falls back to system fonts, icons disappear, and PNG export reports that the renderer could not load.

## 2. Using it

| Area | What it does |
|---|---|
| **Left: Timeline manager** | Title and subtitle; add, edit, duplicate and delete events; drag ⋮⋮ to reorder (or use Up/Down, or Alt+↑/↓); search; sort (oldest/newest first, group by category, A–Z); expand/collapse; event count; categories with colours |
| **Centre: Live preview** | Desktop (1280), tablet (820) and mobile (390) widths; layout switcher; zoom/fit; replay animation; reload; full screen. Click an event in the preview to open it in the editor |
| **Right: Design studio** | 8 theme presets plus themes you save in the project. 11 collapsible sections: Layout, Typography, Colours (with a live WCAG contrast check), Timeline structure, Event cards and interaction, Images and media, Icons, Animation, Spacing and dimensions, Responsive, Advanced. Each section has *Reset this section*; *Reset all* is under Advanced |
| **Top bar** | Project name, save status, Undo/Redo, Templates, Projects, Import, Export, light/dark editor theme, Help |

**Shortcuts:** Ctrl/⌘+Z undo · Ctrl/⌘+Shift+Z or Ctrl+Y redo · Ctrl/⌘+S save now · Ctrl/⌘+E export · Alt+↑/↓ move the focused event.

**Dates:** year (`1969`), full date (`1969-07-20` or `1969-07`), range (empty end = "present"), or a custom label ("Early 1900s", "Week 3", "Stage 2") with an optional sort year. BCE uses a minus sign (`-500` → "500 BCE").

### Layouts
1. **Alternating:** centre line with cards alternating left and right (or all left/all right). It stacks to one side on mobile.
2. **Single-sided:** line on the left, or a centre line with dates on the left.
3. **Horizontal:** scrolls sideways with snap, Previous/Next buttons, arrow keys and a "1–4 of 10" counter. On mobile it can keep scrolling or switch to vertical.
4. **Cards:** grid of 1–5 columns with optional connector lines. Columns drop automatically on narrow screens.
5. **Roadmap:** serpentine milestone path (straight, curved or stepped) with progress ("3 of 6 complete", Done/Planned labels).
6. **Compact:** dense list with a date column, small markers and thumbnail images.

All six read the same event data. Switching layout never changes events.

### Interaction modes (work in the exported file too)
Always visible · Expand on click (with "Expand all") · Pop-up details (accessible modal) · Show on hover/focus/tap. Also available: image lightbox, search box, category filter chips, YouTube (privacy-enhanced, loads only when clicked) and audio links.

## 3. Saving, projects and JSON

- **Autosave** writes to **LocalStorage in this browser** about 1 second after you stop editing. The status shows *Saving…*, *Saved in this browser* or *Not saved*.
- **This is not cloud sync.** Other browsers, devices and private windows cannot see these projects, and clearing site data deletes them. Use **Export → Project file (JSON)** for backups and for sharing editable copies.
- **Projects** dialog: open, rename, duplicate, delete (with confirmation), and see storage use. Browsers allow about 5 MB, and uploaded images use it fastest, so prefer image URLs for large timelines.
- **Import** checks the file (`"schema": "ktm-timeline"`), refuses newer schema versions with a clear message, and cleans every field: unknown keys are dropped, colours, numbers and enums are checked, and `javascript:`/`data:` links are stripped. Imported content is never executed. If the project already exists you choose *Open as a copy* or *Replace*.
- **Templates** create a new project by default. *Replace current* asks for confirmation and can be undone.

### Project schema (v1, abridged)
```json
{
  "schema": "ktm-timeline", "version": 1, "id": "tl-…", "name": "…", "createdAt": "ISO", "updatedAt": "ISO",
  "meta": { "title": "", "subtitle": "", "showHeader": true, "lang": "en" },
  "layout": { "type": "alternating|single|horizontal|cards|roadmap|compact", "alternating": {…}, "single": {…}, "horizontal": {…}, "cards": {…}, "roadmap": {…}, "compact": {…} },
  "design": { "typography": {…}, "colors": {…}, "structure": {…}, "cards": {…}, "dims": {…}, "responsive": {…}, "animation": {…}, "interaction": {…}, "advanced": {…} },
  "categories": [{ "id": "", "name": "", "color": "#RRGGBB" }],
  "events": [{ "id": "", "date": { "type": "date|year|range|label", "start": "", "end": "", "label": "", "sortYear": "" },
    "title": "", "description": "", "image": { "url": "", "alt": "", "caption": "" }, "icon": "fa-solid fa-star",
    "categoryId": "", "link": { "url": "", "label": "" }, "highlight": false,
    "media": { "type": "none|youtube|audio", "url": "", "caption": "" }, "order": 0 }],
  "customThemes": [{ "id": "", "name": "", "design": {…} }]
}
```
Future schema changes go in `migrate()` in `src/app/js/model.js`.

## 4. Export system

| Export | Output |
|---|---|
| **Standalone HTML** | One `.html` file containing pre-rendered markup (readable without JavaScript), the data as a JSON block (never executed), inlined CSS and the runtime JS. No editor code. Optional: embed external images as data URLs where the image host allows CORS (failures are listed). Uploaded images are always embedded |
| **Google Sites** | Hosted-URL input with validation (requires https, rejects Drive and GitHub blob links), height (with a suggested value), width or full-width, border, lazy loading, accessible title, copy button and a sandboxed test iframe. There is also a fallback that copies the full HTML for Google Sites' *Embed code* box |
| **HTML/CSS source** | `.zip` with `index.html`, `timeline.css` (every rule scoped to `.ktm-tl`), `timeline.js` and README, plus an *embeddable snippet* for pasting into an existing page or CMS |
| **PNG** | 1×, 2× or 3× scale at phone, tablet, desktop or wide widths. Full-length capture, including the full width of horizontal timelines. Animations are off and descriptions expanded. Images from hosts that block capture trigger a confirmation first and are replaced with labelled placeholders. Timelines larger than browser canvas limits get a clear error; the app never produces a cropped image |
| **JSON** | Complete project including saved themes |

## 5. Publishing to Google Sites

1. **Export → Standalone HTML → Download**, then rename the file, for example `timeline.html`.
2. **Host it publicly over HTTPS.** Pick one:
   - **GitHub Pages:** create a repository, upload the file, then *Settings → Pages → Deploy from branch*. Your address is `https://<user>.github.io/<repo>/timeline.html`.
   - **Netlify Drop:** drag the file (or a folder) onto app.netlify.com/drop.
   - **Cloudflare Pages:** direct upload.
   - Do **not** send `X-Frame-Options: DENY/SAMEORIGIN` or a restrictive `Content-Security-Policy: frame-ancestors`, because they stop Google Sites from displaying the page. GitHub Pages, Netlify and Cloudflare Pages allow framing by default. **Google Drive cannot host web pages.**
3. **Export → Google Sites:** paste the address, set the height, then *Copy embed code*.
4. In Google Sites, go to **Insert → Embed → Embed code**, paste, then **Next → Insert**, and resize the box. You can also use **Embed → By URL** with just the address.

**Height:** Google Sites gives embeds a fixed height and does not let pages resize their own frame. That is a cross-origin restriction, so set the height in the generator or by dragging in Google Sites; taller content scrolls inside the frame. *Advanced → Send height to parent page* posts `{type:"ktm-timeline:height", height}` for your **own** sites. A listener there can resize the iframe:
```html
<script>addEventListener('message', e => { if (e.data && e.data.type === 'ktm-timeline:height') document.getElementById('tl').style.height = e.data.height + 'px'; });</script>
```

**Without hosting:** Google Sites' *Embed code* box also accepts a full HTML document (Export → Google Sites → "Paste the whole timeline instead"). It works for small timelines. Very large files may be rejected, and you have to re-paste after every change.

## 6. Architecture

```
src/
  runtime/timeline.css     Timeline styles (all scoped to .ktm-tl) — shared by preview and exports
  runtime/timeline.js      Renderer + interactions (6 layouts, search/filter, modal, lightbox, animation, roadmap SVG path)
  app/index.html           Editor shell
  app/app.css              Editor UI styles (independent of timeline styles)
  app/js/model.js          Data model: defaults, factories, validation/sanitising, migration, path helpers
  app/js/themes.js         8 presets (partial designs merged over the current design)
  app/js/templates.js      8 educational templates + blank
  app/js/store.js          LocalStorage projects (index + per-project keys, quota handling) and undo/redo History
  app/js/ui.js             DOM helpers, accessible dialogs (focus trap), toasts, clipboard
  app/js/exporter.js       Document builder, source/snippet, image embedding, Google Sites code + URL checks, ZIP writer, PNG capture
  app/js/events-panel.js   Event manager, categories, drag-and-drop, image upload (downscaled), icon picker
  app/js/design-panel.js   Spec-driven design studio (one table of controls → UI, binding, visibility, reset)
  app/js/dialogs.js        Export centre, projects, templates, help
  app/js/app.js            State, history, debounced autosave, preview frame, device sizing, shortcuts
tools/build.mjs            Inlines everything into dist/index.html (node tools/build.mjs)
tests/                     Playwright test scripts + screenshots
```

**Key design decisions**
- **The preview is the export.** The preview iframe loads the same document the HTML export produces. Updates go through the same runtime `KTMTimeline.mount()`, so the preview cannot drift from the exported result.
- **Data is never code.** Event text is HTML-escaped at render time. URLs pass an allowlist (http/https, mailto/tel and relative links; `data:image` only for images). Export data sits in `<script type="application/json">` with `<` escaped.
- **Style isolation.** Editor styles never reach the timeline, and the timeline's styles are scoped to `.ktm-tl`. That keeps the snippet export from restyling a host page (tested).
- **Responsive by container width.** A ResizeObserver sets `is-narrow` from the timeline's own width, not the window, so behaviour is the same in an iframe, a preview or a CMS column.

**Dependencies:** none bundled. These load from CDNs at runtime: Font Awesome 6.5.2 (icons), Google Fonts (typography), html2canvas 1.4.1 (PNG only, loaded on demand inside the capture frame). Development only: Playwright, axe-core 4.10.2.

**Rebuild after editing `src/`:** `node tools/build.mjs`.

## 7. Known limitations

- **CDN assets:** icons, custom fonts and PNG export need internet access to cdnjs and Google Fonts. Offline, timelines still work with system fonts and no icons.
- **LocalStorage** is per browser and limited to about 5 MB. It is not cloud sync (the UI says so in several places).
- **PNG fidelity (html2canvas):** hexagon markers render as squares (no `clip-path` support), and a few subtle effects are approximated. Images on hosts without CORS can't be captured; you are warned and they get placeholders.
- **Google Sites** cannot auto-resize embeds, so use a fixed height. No automatic publishing is built in; hosting is manual (Netlify/GitHub Pages steps are provided).
- **Drag-and-drop** uses HTML5 drag events, which touch screens don't fire. On tablets and phones use the Up/Down buttons in each event.
- **Audio** supports direct links to audio files (MP3/OGG/WAV), not streaming-service pages. **Video** supports YouTube only.
- **Two tabs editing the same project:** the newest save wins, and a warning appears.
- **Testing scope:** automated tests ran in headless Chromium. Safari and Firefox, and a real Google Sites page, have not been tested yet; see TESTING.md.
