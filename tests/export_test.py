import sys, json; sys.path.insert(0, '/home/claude/ktm-timeline/tests')
from harness import *
import shutil, os
R=[]
def check(n, ok, info=''):
    R.append((n,bool(ok),info)); print(('PASS ' if ok else 'FAIL ')+n+(' — '+str(info) if info else ''))
AXE = open(NM+'/axe-core/axe.min.js').read()
os.makedirs(ROOT+'/dist/t', exist_ok=True)
def axe(page, label, include=None):
    page.add_script_tag(content=AXE)
    res = page.evaluate("""async (inc)=>{const r=await axe.run(inc||document,{runOnly:['wcag2a','wcag2aa','wcag21aa']}); return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,t:v.nodes.slice(0,3).map(x=>x.target.join(' '))}))}""", include)
    check(f'axe {label}: no WCAG A/AA violations', not res, json.dumps(res)[:900])
with sync_playwright() as p:
    b, ctx = launch(p, viewport={'width':1280,'height':900})
    ed = ctx.new_page(); ed.goto('http://localhost:8765/index.html'); ed.wait_for_timeout(1200)
    # make a fresh computers template project with richer media
    setup = """(mode)=>{const P=KTM.templates.build('computers'); P.design.interaction.mode=mode;
      P.events[0].image={url:'https://example-cors.test/a.png',alt:'Babbage engine drawing',caption:'Difference Engine'};
      P.events[1].image={url:'https://broken.test/missing.png',alt:'Portrait',caption:''};
      P.events[3].media={type:'youtube',url:'https://www.youtube.com/watch?v=dQw4w9WgXcQ',caption:'Demo video'};
      P.events[4].media={type:'audio',url:'https://example.org/a.mp3',caption:'Audio clip'};
      P.events[2].link={url:'https://example.org',label:'Read more'};
      return KTM.exporter.buildDocument(P,{mode:'export'});}"""
    for mode in ['always','expand','modal','hover']:
        html = ed.evaluate(setup, mode); open(f'{ROOT}/dist/t/{mode}.html','w').write(html)
    ed.close()
    pg = ctx.new_page(); errs=[]
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8765/t/always.html'); pg.wait_for_timeout(1000)
    check('standalone: renders 10 events', pg.locator('.ktm-tl__item').count()==10)
    check('standalone: no editor dependency', pg.evaluate('typeof KTM==="undefined" && !document.querySelector("#previewFrame")'))
    pg.fill('.ktm-tl__search', 'transistor'); pg.wait_for_timeout(200)
    check('standalone: search', pg.locator('.ktm-tl__item:not([hidden])').count()==1 and 'Showing 1 of 10' in pg.locator('.ktm-tl__status').inner_text())
    pg.fill('.ktm-tl__search', 'zzzz'); pg.wait_for_timeout(100)
    check('standalone: empty search message', pg.locator('p.ktm-tl__empty').is_visible())
    pg.fill('.ktm-tl__search', '')
    pg.click('.ktm-tl__chip:has-text("Mechanical era")'); pg.wait_for_timeout(200)
    check('standalone: category filter', pg.locator('.ktm-tl__item:not([hidden])').count()==2)
    pg.click('.ktm-tl__chip:has-text("All")')
    check('standalone: failed image shows placeholder', pg.locator('.ktm-tl__imgfail').count()==1)
    pg.click('.ktm-tl__imgbtn'); pg.wait_for_timeout(200)
    check('standalone: lightbox opens + focus moves', pg.locator('.ktm-tl__modal.is-lightbox').is_visible() and pg.evaluate('document.activeElement.classList.contains("ktm-tl__close")'))
    pg.keyboard.press('Escape'); pg.wait_for_timeout(100)
    check('standalone: Esc closes, focus returns', pg.locator('.ktm-tl__modal').is_hidden() and pg.evaluate('document.activeElement.classList.contains("ktm-tl__imgbtn")'))
    pg.click('.ktm-tl__video'); pg.wait_for_timeout(200)
    check('standalone: YouTube lite embed loads iframe', pg.locator('.ktm-tl__frame iframe[src*="youtube-nocookie.com/embed/dQw4w9WgXcQ"]').count()==1)
    check('standalone: audio element', pg.locator('audio.ktm-tl__audio[controls]').count()==1)
    check('standalone: time datetime attr', pg.locator('time[datetime="1822"]').count()>=1)
    pg.wait_for_timeout(300); axe(pg, 'exported timeline (always)', '#ktm-timeline')
    # expand mode
    pg.goto('http://localhost:8765/t/expand.html'); pg.wait_for_timeout(800)
    t = pg.locator('.ktm-tl__toggle').first
    check('expand: collapsed by default', t.get_attribute('aria-expanded')=='false' and pg.locator('.ktm-tl__more').first.is_hidden())
    t.click(); check('expand: toggle opens', t.get_attribute('aria-expanded')=='true' and pg.locator('.ktm-tl__more').first.is_visible())
    pg.click('[data-expand-all]'); check('expand: expand all', pg.locator('.ktm-tl__toggle[aria-expanded=false]').count()==0)
    axe(pg, 'exported timeline (expand)', '#ktm-timeline')
    # modal mode
    pg.goto('http://localhost:8765/t/modal.html'); pg.wait_for_timeout(800)
    btn = pg.locator('[data-open]').nth(2); btn.click(); pg.wait_for_timeout(200)
    check('modal: opens dialog with aria', pg.locator('.ktm-tl__dialog[role=dialog][aria-modal=true]').is_visible() and pg.locator('.ktm-tl__mbody .ktm-tl__title').inner_text().startswith('Turing'))
    for _ in range(6): pg.keyboard.press('Tab')
    check('modal: focus trapped', pg.evaluate('!!document.activeElement.closest(".ktm-tl__dialog")'))
    pg.click('.ktm-tl__backdrop', position={'x':5,'y':5}); pg.wait_for_timeout(100)
    check('modal: backdrop closes', pg.locator('.ktm-tl__modal').is_hidden())
    pg.locator('[data-open]').nth(3).click(); pg.wait_for_timeout(200)
    check('modal: YouTube iframe in modal', pg.locator('.ktm-tl__mbody iframe[src*="youtube-nocookie"]').count()==1)
    axe(pg, 'modal dialog', '.ktm-tl__modal')
    pg.keyboard.press('Escape')
    # hover mode
    pg.goto('http://localhost:8765/t/hover.html'); pg.wait_for_timeout(800)
    card = pg.locator('.ktm-tl__card').nth(2)
    op0 = card.locator('.ktm-tl__hoverdesc').evaluate('e=>getComputedStyle(e).opacity')
    card.hover(); pg.wait_for_timeout(500)
    op1 = card.locator('.ktm-tl__hoverdesc').evaluate('e=>getComputedStyle(e).opacity')
    check('hover: description reveals on hover', op0=='0' and op1=='1', (op0,op1))
    pg.mouse.move(0,0); pg.wait_for_timeout(400); card.focus(); pg.wait_for_timeout(500)
    check('hover: reveals on keyboard focus', card.locator('.ktm-tl__hoverdesc').evaluate('e=>getComputedStyle(e).opacity')=='1')
    # no-JS static render
    ctx2 = b.new_context(java_script_enabled=False, viewport={'width':1280,'height':900}); ctx2.route('**/*', route)
    q = ctx2.new_page(); q.goto('http://localhost:8765/t/always.html'); q.wait_for_timeout(300)
    check('no-JS: content still readable (pre-rendered)', q.locator('.ktm-tl__item').count()==10 and q.locator('.ktm-tl__item').first.is_visible())
    ctx2.close()
    # reduced motion
    ctx3 = b.new_context(reduced_motion='reduce', viewport={'width':1280,'height':900}); ctx3.route('**/*', route)
    q = ctx3.new_page(); q.goto('http://localhost:8765/t/always.html'); q.wait_for_timeout(300)
    check('reduced motion: no animation classes, all visible', q.locator('#ktm-timeline.has-anim').count()==0 and q.locator('.ktm-tl__item').nth(9).evaluate('e=>getComputedStyle(e).opacity')=='1')
    ctx3.close()
    # animation: below-fold hidden until scrolled
    pg.goto('http://localhost:8765/t/always.html'); pg.wait_for_timeout(900)
    lastop = pg.locator('.ktm-tl__item').nth(9).evaluate('e=>getComputedStyle(e).opacity')
    pg.locator('.ktm-tl__item').nth(9).scroll_into_view_if_needed(); pg.wait_for_timeout(1200)
    lastop2 = pg.locator('.ktm-tl__item').nth(9).evaluate('e=>getComputedStyle(e).opacity')
    check('scroll reveal animation', lastop=='0' and lastop2=='1', (lastop,lastop2))
    # iframe embed host page (Google Sites style) at phone + desktop widths
    host = '<!doctype html><html><body style="margin:0"><iframe id="f" src="http://localhost:8765/t/always.html" width="100%" height="800" style="border:0;max-width:100%" loading="lazy" title="Timeline"></iframe></body></html>'
    open(ROOT+'/dist/t/host.html','w').write(host)
    for w in (360, 768, 1280):
        h = ctx.new_page(); h.set_viewport_size({'width':w,'height':900}); h.goto('http://localhost:8765/t/host.html'); h.wait_for_timeout(1200)
        f = h.frame_locator('#f')
        inner = h.frames[1]
        sw = inner.evaluate('document.documentElement.scrollWidth'); cw = inner.evaluate('document.documentElement.clientWidth')
        check(f'iframe {w}px: renders, no horizontal overflow', f.locator('.ktm-tl__item').count()==10 and sw<=cw, (sw,cw))
        check(f'iframe {w}px: scrolls internally', inner.evaluate('document.documentElement.scrollHeight') > 800)
        if w==360: h.screenshot(path=ROOT+'/tests/shots/iframe-360.png')
        h.close()
    # source export works when hosted
    shutil.rmtree(ROOT+'/dist/t/src', ignore_errors=True); shutil.copytree(ROOT+'/tests/source', ROOT+'/dist/t/src')
    s = ctx.new_page(); s.goto('http://localhost:8765/t/src/index.html'); s.wait_for_timeout(800)
    check('source export runs from separate files', s.locator('.ktm-tl__item').count()>=10 and s.evaluate('typeof KTMTimeline')=='object')
    # snippet into a host page with its own styles
    snip = ed2 = None
    e2 = ctx.new_page(); e2.goto('http://localhost:8765/index.html'); e2.wait_for_timeout(1000)
    snip = e2.evaluate("KTM.exporter.snippet(KTM.templates.build('science'))")
    page = '<!doctype html><html><head><style>body{font-family:serif;color:red} h3{color:green} p{margin:40px}</style></head><body><h1>School page</h1><p>Intro</p>'+snip+'<p id="after">After</p></body></html>'
    open(ROOT+'/dist/t/snip.html','w').write(page)
    sp = ctx.new_page(); sp.goto('http://localhost:8765/t/snip.html'); sp.wait_for_timeout(800)
    check('snippet: renders inside existing page', sp.locator('.ktm-tl__item').count()==8)
    check('snippet: does not restyle host page', sp.locator('#after').evaluate('e=>getComputedStyle(e).color')=='rgb(255, 0, 0)' and sp.locator('h1').evaluate('e=>getComputedStyle(e).fontFamily').startswith('serif'))
    # editor a11y
    e2.wait_for_timeout(300); axe(e2, 'editor', None)
    print('pageerrors:', errs or 'none')
    b.close()
fails=[r for r in R if not r[1]]; print(f'\n{len(R)-len(fails)}/{len(R)} passed')
json.dump(R, open(ROOT+'/tests/export-results.json','w'), indent=1)
