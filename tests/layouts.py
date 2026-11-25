import sys; sys.path.insert(0, '/home/claude/ktm-timeline/tests')
from harness import *
which = sys.argv[1:] or ['alternating','single','horizontal','cards','roadmap','compact']
with sync_playwright() as p:
    b, ctx = launch(p, viewport={'width':1300,'height':1000})
    pg = ctx.new_page(); errs=[]
    pg.on('pageerror', lambda e: errs.append('PAGEERR: '+str(e)))
    pg.on('console', lambda m: errs.append(m.type+': '+m.text) if m.type=='error' else None)
    pg.goto('http://localhost:8765/index.html'); pg.wait_for_timeout(1500)
    for lay in which:
        for dev,w in (('desktop',1100),('mobile',390)):
            html = pg.evaluate("""([lay,w])=>{const P=KTM.app.P(); P.layout.type=lay; P.design.animation.enabled=false; return KTM.exporter.buildDocument(P,{mode:'export'});}""", [lay,w])
            q = ctx.new_page(); q.set_viewport_size({'width':w,'height':900})
            q.on('pageerror', lambda e: errs.append(lay+' EXPORT PAGEERR: '+str(e)))
            q.set_content(html); q.wait_for_timeout(700)
            sw = q.evaluate('document.documentElement.scrollWidth')
            if sw > w: errs.append(f'{lay}/{dev}: page overflow {sw}>{w}')
            q.screenshot(path=f'{ROOT}/tests/shots/{lay}-{dev}.png', full_page=False)
            q.close()
    print('\n'.join(errs) or 'no errors')
    b.close()
