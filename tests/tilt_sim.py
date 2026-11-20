import math
from playwright.sync_api import sync_playwright
JS_POSE = """
(args)=>{
  const [ang, phi, psi] = args, D=Math.PI/180;
  Object.defineProperty(screen.orientation,'angle',{get:()=>ang,configurable:true});
  const f=phi*D, p=psi*D;
  const gs=[Math.sin(f)*Math.cos(p), -Math.cos(f)*Math.cos(p), Math.sin(p)];
  const ax={0:[[1,0,0],[0,1,0]],90:[[0,1,0],[-1,0,0]],180:[[-1,0,0],[0,-1,0]],270:[[0,-1,0],[1,0,0]]}[ang];
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const gx=dot(gs,ax[0]), gy=dot(gs,ax[1]), gz=gs[2];
  // invert  gd=(sin g cos b, -sin b, -cos g cos b)  (W3C Z-X'-Y'' Euler)
  let b=Math.asin(Math.max(-1,Math.min(1,-gy))), g=Math.atan2(gx, -gz);
  if (Math.cos(b)<1e-6) g=0;
  __tm.onTilt({alpha:0,beta:b/D,gamma:g/D});
  return [__tm.CTRL.lean, __tm.CTRL.pitch];
}"""
bad=0
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    pg=b.new_page(viewport={"width":915,"height":412},has_touch=True,is_mobile=True); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto("http://localhost:8123/index.html"); pg.evaluate("localStorage.clear()"); pg.reload(); pg.wait_for_timeout(300)
    pg.click('#ctrlBtns [data-c="tilt"] small'); pg.click("#startBtn"); pg.wait_for_timeout(300)
    if pg.locator("#tutSkip").is_visible(): pg.click("#tutSkip")
    pg.wait_for_timeout(300); pg.evaluate("__tm.finishDeal(50,true)")
    for _ in range(80):
        if pg.evaluate("__tm.S.mode")=="play": break
        pg.wait_for_timeout(250)
    print("== direction matrix (all four screen rotations) ==")
    for ang in [0,90,180,270]:
        pg.evaluate("__tm.CTRL.base=null")
        for _ in range(6): pg.evaluate(JS_POSE,[ang,0,0])
        res={}
        for name,phi,psi in [("wheel right +18",18,0),("wheel left -18",-18,0),("top toward you +15",0,15),("top away -15",0,-15)]:
            for _ in range(10): r=pg.evaluate(JS_POSE,[ang,phi,psi])
            res[name]=[round(r[0],2),round(r[1],2)]
        ok = res["wheel right +18"][0]>.7 and res["wheel left -18"][0]<-.7 and res["top toward you +15"][1]>.7 and res["top away -15"][1]<-.7 and abs(res["wheel right +18"][1])<.15
        bad+= (not ok); print(ang,"OK" if ok else "FAIL",res)
    print("== simulated human playing in tilt mode (counter-rotates the phone against the lean) ==")
    for run in range(3):
        pg.evaluate("localStorage.setItem('tm_tiltTut','2')")
        out=pg.evaluate("""async (run)=>{
          const T=__tm,S=T.S; T.CTRL.mode='tilt'; S.life=100; S.stamina=100; S.dist=0; S.mode='play'; S.vehs=[]; S.peds=[]; S.mob=null; T.CTRL.base=null; S.falls=0; S.hits=0;
          let t=0, frames=0; const lag=[]; 
          for(let i=0;i<60*140 && S.mode==='play';i++){
            const phi=-Math.max(-22,Math.min(22,S.a*34)) + (Math.random()-.5)*3;   // human-like: turn phone against the lean + jitter
            const ang=[0,90,180,270][run%4]; Object.defineProperty(screen.orientation,'angle',{get:()=>ang,configurable:true});
            const D=Math.PI/180,f=phi*D,gs=[Math.sin(f),-Math.cos(f),0];
            const ax={0:[[1,0,0],[0,1,0]],90:[[0,1,0],[-1,0,0]],180:[[-1,0,0],[0,-1,0]],270:[[0,-1,0],[1,0,0]]}[ang];
            const gx=gs[0]*ax[0][0]+gs[1]*ax[0][1], gy=gs[0]*ax[1][0]+gs[1]*ax[1][1];
            const b=Math.asin(-gy), g=Math.atan2(gx,0);
            T.onTilt({alpha:0,beta:b/D,gamma:g/D});
            T.update(1/60); frames++;
          }
          return {mode:S.mode,dist:Math.round(S.dist),life:Math.round(S.life),falls:S.falls,hits:S.hits,sec:Math.round(frames/60)};
        }""",run)
        print(" run",run,out)
    print("errs",errs,"BAD",bad)
