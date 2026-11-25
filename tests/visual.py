import sys; sys.path.insert(0, '/home/claude/ktm-timeline/tests')
from harness import *
errs=[]
with sync_playwright() as p:
    b, ctx = launch(p, viewport={'width':1024,'height':768})
    pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8765/index.html'); pg.wait_for_timeout(1500)
    pg.screenshot(path=ROOT+'/tests/shots/ed-tablet.png')
    pg.click('#btnDesignToggle'); pg.wait_for_timeout(400); pg.screenshot(path=ROOT+'/tests/shots/ed-tablet-design.png')
    pg.set_viewport_size({'width':390,'height':844}); pg.wait_for_timeout(500)
    pg.screenshot(path=ROOT+'/tests/shots/ed-mobile-preview.png')
    pg.click('.mtab[data-panel=events]'); pg.wait_for_timeout(300)
    pg.click('#eventList li.ev >> nth=1 >> .ev-toggle'); pg.wait_for_timeout(300)
    pg.screenshot(path=ROOT+'/tests/shots/ed-mobile-events.png')
    sw = pg.evaluate('document.documentElement.scrollWidth'); print('mobile editor scrollWidth', sw)
    pg.click('.mtab[data-panel=design]'); pg.wait_for_timeout(300); pg.screenshot(path=ROOT+'/tests/shots/ed-mobile-design.png')
    pg.set_viewport_size({'width':1440,'height':900}); pg.click('#btnAppTheme'); pg.wait_for_timeout(500)
    pg.screenshot(path=ROOT+'/tests/shots/ed-dark.png')
    pg.click('#btnExport'); pg.click('[data-tab=gsites]'); pg.wait_for_timeout(300); pg.screenshot(path=ROOT+'/tests/shots/ed-export-gsites.png')
    pg.keyboard.press('Escape'); pg.click('#btnAppTheme')
    # templates
    for t in ['world','lifecycle','roadmap','learning','biography','science','tech']:
        html = pg.evaluate("(t)=>{const P=KTM.templates.build(t);P.design.animation.enabled=false;return KTM.exporter.buildDocument(P,{mode:'export'})}", t)
        q = ctx.new_page(); q.set_viewport_size({'width':1100,'height':760}); q.on('pageerror', lambda e: errs.append(t+': '+str(e)))
        q.set_content(html); q.wait_for_timeout(600); q.screenshot(path=f'{ROOT}/tests/shots/tpl-{t}.png'); q.close()
    # roadmap path variants
    for path in ['straight','stepped']:
        html = pg.evaluate("(s)=>{const P=KTM.templates.build('roadmap');P.layout.roadmap.path=s;P.design.animation.enabled=false;return KTM.exporter.buildDocument(P,{mode:'export'})}", path)
        q = ctx.new_page(); q.set_viewport_size({'width':1100,'height':760}); q.set_content(html); q.wait_for_timeout(600); q.screenshot(path=f'{ROOT}/tests/shots/road-{path}.png'); q.close()
    print('errors', errs or 'none'); b.close()
