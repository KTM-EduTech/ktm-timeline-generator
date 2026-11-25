import sys; sys.path.insert(0, '/home/claude/ktm-timeline/tests')
from harness import *
with sync_playwright() as p:
    b, ctx = launch(p, viewport={'width':1440,'height':900})
    pg = ctx.new_page(); errs=[]
    pg.on('console', lambda m: errs.append(m.type+': '+m.text) if m.type in ('error','warning') else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERR: '+str(e)))
    pg.goto('http://localhost:8765/index.html'); pg.wait_for_timeout(2500)
    pg.screenshot(path=ROOT+'/tests/shots/editor.png')
    print('\n'.join(errs) or 'no errors')
    fr = pg.frame_locator('#previewFrame')
    print('items', fr.locator('.ktm-tl__item').count())
    b.close()
