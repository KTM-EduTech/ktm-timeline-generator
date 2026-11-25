import sys, json; sys.path.insert(0, '/home/claude/ktm-timeline/tests')
from harness import *
R=[]
def check(n, ok, info=''):
    R.append((n,bool(ok),info)); print(('PASS ' if ok else 'FAIL ')+n+(' — '+str(info) if info else ''))
with sync_playwright() as p:
    b, ctx = launch(p, viewport={'width':1440,'height':900})
    pg = ctx.new_page(); pg.goto('http://localhost:8765/index.html'); pg.wait_for_timeout(1200)
    pg.evaluate("""()=>{const o=Storage.prototype.setItem;window.__o=o;Storage.prototype.setItem=function(k,v){if(k.startsWith('ktm-tlg:p:')){const e=new DOMException('full','QuotaExceededError');throw e;}return o.call(this,k,v)}}""")
    pg.fill('#metaTitle', 'Quota test'); pg.wait_for_timeout(1500)
    check('storage full: status + message', 'Not saved' in pg.locator('#saveStatus').inner_text() and 'storage is full' in pg.locator('.toast').last.inner_text().lower())
    pg.evaluate("()=>{Storage.prototype.setItem=window.__o}"); pg.fill('#metaTitle', 'Quota test 2'); pg.wait_for_timeout(1500)
    check('storage recovers', 'Saved' in pg.locator('#saveStatus').inner_text())
    pg.click('#metaSubtitle'); pg.locator('body').press('Escape')
    pg.locator('.pv-bar').click(position={'x':600,'y':20})
    before = pg.evaluate('KTM.app.P().meta.title'); pg.keyboard.press('Control+z'); pg.wait_for_timeout(200)
    check('Ctrl+Z undo shortcut', pg.evaluate('KTM.app.P().meta.title') != before)
    pg.keyboard.press('Control+Shift+z'); pg.wait_for_timeout(200)
    check('Ctrl+Shift+Z redo shortcut', pg.evaluate('KTM.app.P().meta.title') == before)
    # custom theme save/apply
    pg.click('summary:has-text("Saved themes")'); pg.click('#btnSaveTheme'); pg.wait_for_timeout(200); pg.click('.dlg-foot .btn.primary'); pg.wait_for_timeout(200)
    check('save custom theme', pg.evaluate('KTM.app.P().customThemes.length')==1)
    pg.click('[data-preset=dark]'); pg.click('[data-ctheme]'); pg.wait_for_timeout(200)
    check('apply custom theme', pg.evaluate('KTM.app.P().design.colors.background')=='#F8F9FB')
    # template replace with confirm then undo
    n = pg.evaluate('KTM.app.P().events.length'); pid = pg.evaluate('KTM.app.P().id')
    pg.click('#btnTemplates'); pg.check('#tplReplace'); pg.click('[data-tpl=lifecycle]'); pg.wait_for_timeout(200); pg.click('.dlg-foot .btn.danger'); pg.wait_for_timeout(600)
    check('template replace keeps project id', pg.evaluate('KTM.app.P().id')==pid and pg.evaluate('KTM.app.P().events.length')==4)
    pg.keyboard.press('Escape'); pg.locator('.pv-bar').click(position={'x':600,'y':20}); pg.keyboard.press('Control+z'); pg.wait_for_timeout(400)
    check('undo template replace', pg.evaluate('KTM.app.P().events.length')==n)
    # roadmap progress slider max follows event count
    pg.click('[data-layout=roadmap]'); pg.wait_for_timeout(300)
    check('progress slider max = events', pg.locator('#c-layout-roadmap-progress').get_attribute('max')==str(n))
    # fullscreen + zoom controls exist and work
    pg.click('#zoomIn'); z1 = pg.locator('#zoomLabel').inner_text(); pg.click('#zoomFit')
    check('zoom control', z1 != pg.locator('#zoomLabel').inner_text(), z1)
    # mobile device default
    m = ctx.new_page(); m.set_viewport_size({'width':390,'height':844}); m.goto('http://localhost:8765/index.html'); m.wait_for_timeout(1200)
    check('phone opens with mobile preview', m.locator('[data-device=mobile][aria-pressed=true]').count()==1)
    b.close()
print(f"{sum(1 for r in R if r[1])}/{len(R)} passed"); json.dump(R, open(ROOT+'/tests/misc-results.json','w'), indent=1)
