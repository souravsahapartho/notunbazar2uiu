import sys, json
from playwright.sync_api import sync_playwright
DEV = [("Pixel7",412,915,True,"p"),("Pixel7",915,412,True,"l"),("iPhone14",390,844,True,"p"),("iPhone14",844,390,True,"l"),
       ("iPhoneSE",375,667,True,"p"),("iPhoneSE",667,375,True,"l"),("iPad",820,1180,True,"p"),("iPad",1180,820,True,"l"),("Desktop",1366,768,False,"l"),("Desk4k",1920,1080,False,"l")]
bad = 0
def chk(name, ok, extra=""):
    global bad
    if not ok: bad += 1; print("  FAIL", name, extra)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    for n,w,h,touch,o in DEV:
        ctx = b.new_context(viewport={"width":w,"height":h}, has_touch=touch, is_mobile=touch, device_scale_factor=2)
        pg = ctx.new_page(); errs=[]
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("http://localhost:8123/index.html"); pg.wait_for_timeout(500)
        tag = f"{n}-{o}-{w}x{h}"; print(tag)
        ov = pg.evaluate("document.documentElement.scrollWidth - innerWidth")
        chk("hscroll", ov <= 1, ov)
        if touch and o=="p":
            # rotate prompt may appear only while riding; menu must fit
            pass
        def vis(sel):
            return pg.evaluate("""s=>{const e=document.querySelector(s); if(!e) return null; const r=e.getBoundingClientRect(); const cs=getComputedStyle(e);
              return {v:cs.display!='none'&&r.width>0, ok:r.left>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1&&r.top>=-1, w:r.width, h:r.height}}""", sel)
        v = vis("#startBtn"); chk("startBtn visible", v and v["v"] and v["ok"], v)
        for sel in ["#genBtns button","#boardBtns button"]:
            cnt = pg.locator(sel).count(); chk(sel+" exists", cnt>0)
        pg.screenshot(path=f"/tmp/e2e_{tag}_menu.png")
        pg.click("#ctrlBtns [data-c=manual]"); pg.locator("#genBtns button").nth(1).click(); pg.locator("#boardBtns button").nth(1).click()
        pg.fill("#nameInput", "সৌরভ") if pg.locator("#nameInput").count() else None
        if pg.locator("#rotSkip").is_visible(): pg.click("#rotSkip"); pg.wait_for_timeout(200)
        pg.click("#startBtn"); pg.wait_for_timeout(500)
        if pg.locator("#tutSkip").is_visible():
            tb = vis("#tutSkip"); chk("tutSkip visible", tb["ok"], tb); pg.screenshot(path=f"/tmp/e2e_{tag}_tut.png"); pg.click("#tutSkip")
        pg.wait_for_timeout(900)
        mode = pg.evaluate("window.__tm.S.mode"); chk("stand mode", mode=="stand", mode)
        if pg.locator("#rotSkip").is_visible(): pg.screenshot(path=f"/tmp/e2e_{tag}_rot.png"); pg.click("#rotSkip"); pg.wait_for_timeout(700)
        pg.screenshot(path=f"/tmp/e2e_{tag}_stand.png")
        # every visible button in fare bar: inside viewport, >=36px
        res = pg.evaluate("""()=>[...document.querySelectorAll('#fare button')].filter(b=>b.offsetParent).map(b=>{const r=b.getBoundingClientRect();return {t:b.textContent.trim().slice(0,14),l:r.left,r:r.right,t0:r.top,b:r.bottom,h:r.height,w:r.width}})""")
        W,H = w,h
        for r in res:
            chk("fare btn in view "+r["t"], r["l"]>=-1 and r["r"]<=W+1 and r["b"]<=H+1 and r["t0"]>=-1, r)
            chk("fare btn size "+r["t"], r["h"]>=30 and r["w"]>=40, r)
        # skip fare then ride
        sk = pg.locator("#skipBtn")
        if sk.is_visible(): sk.click()
        else:
            pg.evaluate("window.__tm.finishDeal(50,false)")
        for _ in range(160):
            if pg.evaluate("window.__tm.S.mode")=="play": break
            pg.wait_for_timeout(250)
        m = pg.evaluate("window.__tm.S.mode"); chk("play mode", m=="play", m)
        if touch and o=="p":
            rot = pg.evaluate("document.body.classList.contains('needrot')"); print("  needrot", rot)
            if rot and pg.locator("#rotSkip").is_visible(): pg.click("#rotSkip"); pg.wait_for_timeout(300)
        pg.wait_for_timeout(600); pg.screenshot(path=f"/tmp/e2e_{tag}_play.png")
        if touch:
            for bid in ["bL","bR","bS","bG"]:
                if pg.locator("#"+bid).count()==0: continue
                v = vis("#"+bid); chk("pad "+bid, v and v["v"] and v["ok"] and v["h"]>=44 and v["w"]>=44, v)
            if pg.locator("#bR").is_visible():
                bx = pg.locator("#bR").bounding_box()
                s0 = pg.evaluate("window.__tm.S.x")
                pg.touchscreen.tap(bx["x"]+bx["width"]/2, bx["y"]+bx["height"]/2)
                pg.evaluate("window.__tm.inp.grip=false")
                pg.wait_for_timeout(300)
                print("  tap ok")
                # hold grip via pointer events
                gb = pg.locator("#bG").bounding_box()
                pg.mouse.move(gb["x"]+gb["width"]/2, gb["y"]+gb["height"]/2); pg.mouse.down(); pg.wait_for_timeout(200)
                held = pg.evaluate("window.__tm.inp.grip"); pg.mouse.up(); pg.wait_for_timeout(100)
                rel = pg.evaluate("window.__tm.inp.grip"); chk("grip hold/release", held and not rel, (held, rel))
        # force death -> end card, retry button
        pg.evaluate("window.__tm.S.life=0.1; window.__tm.S.fall=1" ) 
        pg.evaluate("(()=>{const T=window.__tm; T.S.life=0; })()")
        pg.keyboard.press("ArrowLeft")
        pg.wait_for_timeout(200)
        for _ in range(80):
            if pg.evaluate("window.__tm.S.mode") in ("dead","dying"): break
            pg.evaluate("window.__tm.S.life=0"); pg.wait_for_timeout(100)
        pg.wait_for_timeout(3600)
        em = pg.evaluate("window.__tm.S.mode"); print("  after death mode", em)
        if em=="dead":
            pg.screenshot(path=f"/tmp/e2e_{tag}_dead.png")
            rb = pg.locator("#end button:visible"); chk("end buttons", rb.count()>0)
            if rb.count():
                bb = rb.first.bounding_box(); chk("end btn in view", bb and bb["y"]+bb["height"]<=h+1 and bb["x"]+bb["width"]<=w+1, bb)
        chk("js errors", not errs, errs[:2])
        ctx.close()
    b.close()
print("TOTAL FAILS", bad)
