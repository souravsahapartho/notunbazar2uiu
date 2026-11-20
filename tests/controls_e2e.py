from playwright.sync_api import sync_playwright
def go(pg,mode):
    pg.goto("http://localhost:8123/index.html"); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(300)
    pg.click(f'#ctrlBtns [data-c="{mode}"] small'); pg.click("#startBtn"); pg.wait_for_timeout(300)
    if pg.locator("#tutSkip").is_visible(): pg.click("#tutSkip")
    pg.wait_for_timeout(400)
    if pg.locator("#rotSkip").is_visible(): pg.click("#rotSkip")
    pg.evaluate("__tm.finishDeal(50,true)")
    for _ in range(80):
        if pg.evaluate("__tm.S.mode")=="play": break
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(300)
vis=lambda pg,i: pg.evaluate(f"(()=>{{const e=document.getElementById('{i}');return !!e&&e.offsetParent!==null&&e.getBoundingClientRect().width>0}})()")
bad=0
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    for (w,h) in [(915,412),(844,390)]:
        ctx=b.new_context(viewport={"width":w,"height":h},has_touch=True,is_mobile=True); pg=ctx.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
        for mode,exp in [("manual",dict(bL=1,bR=1,bS=1,bG=1)),("auto",dict(bL=0,bR=0,bS=1,bG=1)),("tilt",dict(bL=0,bR=0,bS=0,bG=0))]:
            go(pg,mode); got={k:int(vis(pg,k)) for k in exp}
            ok=got==exp; bad+= (not ok); print(w,mode,got,"OK" if ok else "FAIL")
            pg.screenshot(path=f"/tmp/c_{w}_{mode}.png")
            if mode=="tilt":
                pg.evaluate("__tm.CTRL.base=null;for(let i=0;i<6;i++)__tm.onTilt({beta:90,gamma:0})")
                for _ in range(8): pg.evaluate("__tm.onTilt({beta:70,gamma:90})")
                lean=pg.evaluate("__tm.CTRL.lean"); print("  wheel clockwise 20deg -> lean",round(lean,2)); bad+= (lean<.8)
                for _ in range(8): pg.evaluate("__tm.onTilt({beta:110,gamma:90})")
                lean=pg.evaluate("__tm.CTRL.lean"); print("  wheel counter-clockwise -> lean",round(lean,2)); bad+= (lean>-.8)
        # tilt fallback: no sensor -> pad returns
        go(pg,"tilt"); pg.evaluate("for(let i=0;i<400;i++)__tm.update(1/60)"); print("  fallback pad visible:",vis(pg,"bL")); bad+= (not vis(pg,"bL"))
        # frame timing
        pg.evaluate("window.__ft=[];let l=performance.now();(function f(n){__ft.push(n-l);l=n;if(__ft.length<180)requestAnimationFrame(f)})(l)"); pg.wait_for_timeout(3500)
        ft=pg.evaluate("__ft.slice(10)"); print("  avg frame ms",round(sum(ft)/len(ft),1),"max",round(max(ft),1))
        print("  errs",errs); bad+=bool(errs); ctx.close()
print("BAD",bad)
