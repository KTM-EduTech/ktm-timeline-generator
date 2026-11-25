import sys, time; sys.path.insert(0, '/home/claude/ktm-timeline/tests')
from harness import *
with sync_playwright() as p:
    b, ctx = launch(p, viewport={'width':1280,'height':900})
    pg = ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('http://localhost:8765/index.html'); pg.wait_for_timeout(1200)
    for lay in ['alternating','horizontal','cards','roadmap','compact']:
        ms = pg.evaluate("""(lay)=>{const P=KTM.templates.build('computers');const base=P.events;P.events=[];for(let i=0;i<300;i++){const e=JSON.parse(JSON.stringify(base[i%base.length]));e.id='ev-'+i;e.date={type:'year',start:String(1700+i),end:'',label:'',sortYear:''};P.events.push(e);}P.layout.type=lay;
          const d=document.createElement('div');document.body.appendChild(d);d.style.width='1100px';const t=performance.now();KTMTimeline.mount(d,P,{manageFonts:false});const ms=performance.now()-t;d.remove();return ms}""", lay)
        print(f'300 events {lay}: {ms:.0f} ms')
    # PNG of a very long timeline should give a clear error, not a truncated image
    res = pg.evaluate("""async()=>{const P=KTM.templates.build('computers');const base=P.events;P.events=[];for(let i=0;i<400;i++){const e=JSON.parse(JSON.stringify(base[i%base.length]));e.id='ev-'+i;P.events.push(e);}P.layout.type='alternating';
       try{const r=await KTM.exporter.capturePNG(P,{width:1200,scale:2});return 'OK '+r.width+'x'+r.height+' '+r.warnings.join('|')}catch(e){return 'ERR '+e.message}}""")
    print('long PNG:', res[:300])
    print('errors', errs or 'none'); b.close()
