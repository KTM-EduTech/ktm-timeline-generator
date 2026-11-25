# Testing report — KTM EduTech Timeline Generator 1.0.0

**Result: 98/98 automated checks passed.** No JavaScript errors were thrown in the editor or in exported files.

**Environment:** headless Google Chrome (Playwright), served from a local HTTP server. The sandbox could not reach CDNs, so tests served local copies of Font Awesome 6.5.2 and html2canvas 1.4.1 at the CDN addresses and stubbed Google Fonts (fallback fonts appear in screenshots). Accessibility was scanned with axe-core 4.10.2 using the WCAG 2.0/2.1 A and AA rule sets.

Re-run: `node tools/build.mjs`, serve `dist/` on port 8765, then `python3 tests/functional.py`, `tests/export_test.py`, `tests/misc.py`, `tests/layouts.py`, `tests/perf.py`.

## Editor — functional (51/51)
| | Check |
|---|---|
| ✅ | create event |
| ✅ | edit title reflected in preview (escaped) |
| ✅ | date shown in preview |
| ✅ | description paragraphs |
| ✅ | highlight badge |
| ✅ | invalid date hint shown |
| ✅ | custom date label |
| ✅ | javascript: link rejected |
| ✅ | external link rendered safely |
| ✅ | duplicate event |
| ✅ | duplicate has new id + copy title |
| ✅ | move up |
| ✅ | Alt+Down moves |
| ✅ | drag and drop reorder |
| ✅ | preview order matches data |
| ✅ | chronological sort |
| ✅ | undo restores order |
| ✅ | redo |
| ✅ | delete cancel keeps event |
| ✅ | delete confirmed |
| ✅ | list search filters |
| ✅ | layout single renders all events |
| ✅ | layout horizontal renders all events |
| ✅ | layout cards renders all events |
| ✅ | layout roadmap renders all events |
| ✅ | layout compact renders all events |
| ✅ | layout alternating renders all events |
| ✅ | layout switching preserves events |
| ✅ | preset applied |
| ✅ | colour HEX input updates preview |
| ✅ | font change updates preview + loads font link |
| ✅ | reset section |
| ✅ | mobile preview narrow class |
| ✅ | click preview selects event in editor |
| ✅ | add category |
| ✅ | LocalStorage persistence after reload |
| ✅ | JSON export has schema+version |
| ✅ | HTML export downloaded |
| ✅ | source zip valid |
| ✅ | gsites rejects http |
| ✅ | gsites iframe code |
| ✅ | sandboxed iframe test renders + JS works |
| ✅ | PNG export |
| ✅ | import as copy |
| ✅ | newer version rejected |
| ✅ | invalid JSON rejected |
| ✅ | malicious import sanitised |
| ✅ | no script elements injected in preview |
| ✅ | export escapes </script> in data |
| ✅ | template creates new project |
| ✅ | projects dialog lists projects |

## Exported HTML, iframe embedding, accessibility (36/36)
These ran on the **exported file opened on its own**, separate from the editor.

| | Check |
|---|---|
| ✅ | standalone: renders 10 events |
| ✅ | standalone: no editor dependency |
| ✅ | standalone: search |
| ✅ | standalone: empty search message |
| ✅ | standalone: category filter |
| ✅ | standalone: failed image shows placeholder |
| ✅ | standalone: lightbox opens + focus moves |
| ✅ | standalone: Esc closes, focus returns |
| ✅ | standalone: YouTube lite embed loads iframe |
| ✅ | standalone: audio element |
| ✅ | standalone: time datetime attr |
| ✅ | axe exported timeline (always): no WCAG A/AA violations |
| ✅ | expand: collapsed by default |
| ✅ | expand: toggle opens |
| ✅ | expand: expand all |
| ✅ | axe exported timeline (expand): no WCAG A/AA violations |
| ✅ | modal: opens dialog with aria |
| ✅ | modal: focus trapped |
| ✅ | modal: backdrop closes |
| ✅ | modal: YouTube iframe in modal |
| ✅ | axe modal dialog: no WCAG A/AA violations |
| ✅ | hover: description reveals on hover |
| ✅ | hover: reveals on keyboard focus |
| ✅ | no-JS: content still readable (pre-rendered) |
| ✅ | reduced motion: no animation classes, all visible |
| ✅ | scroll reveal animation |
| ✅ | iframe 360px: renders, no horizontal overflow |
| ✅ | iframe 360px: scrolls internally |
| ✅ | iframe 768px: renders, no horizontal overflow |
| ✅ | iframe 768px: scrolls internally |
| ✅ | iframe 1280px: renders, no horizontal overflow |
| ✅ | iframe 1280px: scrolls internally |
| ✅ | source export runs from separate files |
| ✅ | snippet: renders inside existing page |
| ✅ | snippet: does not restyle host page |
| ✅ | axe editor: no WCAG A/AA violations |

## Storage, shortcuts, themes, templates (11/11)
| | Check |
|---|---|
| ✅ | storage full: status + message |
| ✅ | storage recovers |
| ✅ | Ctrl+Z undo shortcut |
| ✅ | Ctrl+Shift+Z redo shortcut |
| ✅ | save custom theme |
| ✅ | apply custom theme |
| ✅ | template replace keeps project id |
| ✅ | undo template replace |
| ✅ | progress slider max = events |
| ✅ | zoom control |
| ✅ | phone opens with mobile preview |

## Layout and responsive rendering
Every layout was exported and opened at 1100 px and 390 px. The page never scrolled sideways, and horizontal timelines scroll only inside their own track. Screenshots were reviewed by eye (`tests/shots/`). All 8 templates and the roadmap path styles (straight, curved, stepped) were also rendered and reviewed. Problems found in review and fixed: the toggle-switch label overlapped its track; Compact layout showed stray pointer arrows; new events copied the "custom label" date type from the last event (which hid the date field); phone screens opened the editor with the desktop-width preview.

## Performance and limits
| Test | Result |
|---|---|
| Render 300 events (alternating / horizontal / cards / roadmap / compact) | 15 / 42 / 32 / 42 / 8 ms |
| PNG of a full 10-event timeline at 2× | 2400 × 4802 px, about 0.9 MB |
| PNG of 400 events (80,000 px tall) | Refused with a clear message, no cropped image |
| Storage full (simulated QuotaExceededError) | "Not saved" status + explanation; recovers on the next save |

## Security checks
Imported a hostile project file containing `<img onerror>`, `<script>`, `javascript:` links and image URLs, an icon break-out string, and CSS injection inside colour and font values. All were neutralised: text is escaped, URLs and icons stripped, and colours/fonts reset to defaults. No script elements reached the preview, and the export contains no executable injected code.

## Not covered by these tests
- **Safari, Firefox and real mobile devices** (only Chromium was available). Recommended: a quick pass on iPad Safari and a Chromebook.
- **A live Google Sites page.** Embedding was checked with standard iframes at 360, 768 and 1280 px and with a sandboxed iframe (scripts allowed, separate origin), which is how Google Sites isolates embeds. Hosting-specific headers need a check once a real host is chosen.
- **Real Google Fonts and remote images** (the CDNs were blocked here, so they were stubbed).
- **Screen-reader walkthrough** (NVDA/VoiceOver). Automated axe scans and keyboard/focus tests passed, but manual listening is still worth doing.
