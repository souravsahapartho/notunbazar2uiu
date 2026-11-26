#!/usr/bin/env python3
# Copyright (c) 2026 Vantyr. Licensed under the Vantyr License, Version 1.0. See LICENSE in the project root.
"""Offline Bangla voice pack: no API key, no internet needed. Uses the eSpeak NG engine (pip install espeakng-loader)
and ffmpeg to write audio/*.mp3 + audio/manifest.json for every game line, one clip per role/variant.

  pip install espeakng-loader
  node tools/dump_lines.js > tools/lines_dump.json
  python3 tools/gen_offline.py

The voices are plain, but they work on every phone. Clips made later by tools/gen_voices.py (ElevenLabs/Azure) use the
same file names, so they simply replace these.  Existing manifest entries are never overwritten unless --force is given."""
import ctypes, json, pathlib, subprocess, sys
import espeakng_loader as E

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIO = ROOT / "audio"; AUDIO.mkdir(exist_ok=True)
lines = json.load(open(ROOT / "tools/lines_dump.json", encoding="utf8"))
# ambient street calls (see AMB in js/game.js)
for k, t in [("rick", "ভাই রিক্সা লাগবে? ইউআইইউ!"), ("chop", "গরম গরম চপ, পেঁয়াজু!"), ("hawker", "ভাই, এই শার্ট একশো টাকা!"),
             ("rick", "রিক্সা, রিক্সা! সাঈদ নগর!"), ("tea", "চা-পান, চা-পান!"), ("ped", "ওই ভাই, দেইখা চালান!"),
             ("bus", "বিটুমিন গেট, বিটুমিন গেট! নামেন নামেন!"), ("ped", "ইউআইইউ, ইউআইইউ!")]:
    lines.append({"key": k, "text": t})
NVAR = {"crowd": 4, "driver": 5, "player_m": 3, "player_f": 3, "car": 3, "rick": 3, "bus": 3, "cng": 3}
# (espeak voice, pitch 0-99, words per minute, amplitude) per role and variant
STYLE = {
 "driver":   [(b"bn+m3", 34, 138, 110), (b"bn+m1", 40, 150, 110), (b"bn+m2", 46, 165, 110), (b"bn+m6", 28, 128, 110), (b"bn+m7", 56, 172, 110)],
 "player_m": [(b"bn+m1", 62, 168, 100), (b"bn+m4", 56, 176, 100), (b"bn+m5", 66, 158, 100)],
 "player_f": [(b"bn+f1", 72, 170, 100), (b"bn+f2", 80, 176, 100), (b"bn+f3", 68, 162, 100)],
 "car":      [(b"bn+m3", 30, 175, 150), (b"bn+m2", 36, 185, 150), (b"bn+m6", 26, 170, 150)],
 "rick":     [(b"bn+m1", 44, 170, 140), (b"bn+m4", 38, 160, 140), (b"bn+m7", 58, 185, 140)],
 "bus":      [(b"bn+m2", 32, 195, 160), (b"bn+m3", 36, 188, 160), (b"bn+m5", 48, 200, 160)],
 "cng":      [(b"bn+m1", 42, 180, 140), (b"bn+m3", 38, 172, 140), (b"bn+m7", 60, 190, 140)],
 "crowd":    [(b"bn+m3", 32, 200, 190), (b"bn+m1", 50, 210, 190), (b"bn+m6", 26, 195, 190), (b"bn+m7", 58, 215, 190)],
 "ped":      [(b"bn+f1", 66, 175, 120)],
 "hawker":   [(b"bn+m2", 48, 190, 140)], "tea": [(b"bn+m1", 40, 170, 130)], "chop": [(b"bn+m3", 36, 175, 130)],
}
def fnv(s):
    h = 0x811c9dc5
    for b in s.encode("utf8"): h = ((h ^ b) * 0x01000193) & 0xffffffff
    return f"{h:08x}"
lib = ctypes.CDLL(E.get_library_path()); buf = []
CB = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.c_void_p)
def _cb(w, n, ev):
    if w and n > 0: buf.append(ctypes.string_at(w, n * 2))
    return 0
_keep = CB(_cb)
SR = lib.espeak_Initialize(1, 0, E.get_data_path().encode(), 0); lib.espeak_SetSynthCallback(_keep)
def speak(text, voice, pitch, rate, amp):
    buf.clear(); lib.espeak_SetVoiceByName(voice)
    lib.espeak_SetParameter(1, rate, 0); lib.espeak_SetParameter(2, amp, 0); lib.espeak_SetParameter(3, pitch, 0); lib.espeak_SetParameter(4, 2, 0)
    t = text.encode(); lib.espeak_Synth(t, len(t) + 1, 0, 0, 0, 1, None, None); lib.espeak_Synchronize()
    return b"".join(buf)
mf_path = AUDIO / "manifest.json"; manifest = json.load(open(mf_path)) if mf_path.exists() else {}
force = "--force" in sys.argv; n = 0
for it in lines:
    sty = STYLE.get(it["key"], STYLE["driver"])
    for var in range(NVAR.get(it["key"], 1)):
        h = fnv(f"{it['key']}#{var}|{it['text']}"); fn = f"{h}.mp3"
        if (AUDIO / fn).exists() and not force: manifest[h] = fn; continue
        v, p, r, a = sty[var % len(sty)]
        pcm = speak(it["text"], v, p, r, a)
        if not pcm: continue
        pr = subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "1", "-i", "-",
                             "-af", "highpass=f=110,acompressor=threshold=-18dB:ratio=3,volume=2.2,alimiter=limit=0.95",
                             "-ac", "1", "-b:a", "32k", str(AUDIO / fn)], input=pcm)
        if pr.returncode == 0: manifest[h] = fn; n += 1
json.dump(manifest, open(mf_path, "w"), indent=0)
print(n, "new clips,", len(manifest), "in manifest")
