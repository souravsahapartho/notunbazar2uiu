#!/usr/bin/env python3
# Copyright (c) 2026 Vantyr. Licensed under the Vantyr License, Version 1.0. See LICENSE in the project root.
"""Build audio/*.mp3 + audio/manifest.json from every game line.

  export ELEVENLABS_API_KEY=...   (or AZURE_SPEECH_KEY=...)
  node tools/dump_lines.js > tools/lines_dump.json
  python3 tools/gen_voices.py            # skips clips that already exist
  python3 tools/gen_voices.py --limit 5  # try a few first
  python3 tools/gen_voices.py --variants 1 --chars 9000  # free plan: one voice per role, stays under the monthly quota

Only use voices you are licensed to use (library/designed voices, or people who consented to cloning).
The game falls back to browser TTS for any line missing from the manifest.
"""
import json, os, sys, urllib.request, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIO = ROOT / "audio"; AUDIO.mkdir(exist_ok=True)
cfg = json.load(open(ROOT / "tools/voices.json", encoding="utf8"))
lines = json.load(open(ROOT / "tools/lines_dump.json", encoding="utf8"))
limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else None
# --chars N stops after about N characters (the free ElevenLabs plan allows roughly 10000 a month)
budget = int(sys.argv[sys.argv.index("--chars") + 1]) if "--chars" in sys.argv else None
# --variants N makes only the first N voices per role, so the budget covers every role
maxvar = int(sys.argv[sys.argv.index("--variants") + 1]) if "--variants" in sys.argv else None
spent = 0

def fnv(s):  # must match fnv() in js/game.js (FNV-1a over UTF-8 bytes)
    h = 0x811c9dc5
    for b in s.encode("utf8"):
        h = ((h ^ b) * 0x01000193) & 0xffffffff
    return f"{h:08x}"

NVAR = cfg.get("variants", {})   # how many different voices each role has (must match NVAR in js/game.js)

def eleven(key, text, var=0):
    vs = cfg["elevenlabs"]["voices"].get(key)
    if isinstance(vs, list): vs = vs[var % len(vs)] if vs else None
    v = vs
    if not v or v["voice_id"].startswith("PUT_"): return None
    body = {"text": text, "model_id": cfg["elevenlabs"]["model"],
            "voice_settings": {"stability": v.get("stability", .5), "similarity_boost": .8, "style": v.get("style", .3)}}
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{v['voice_id']}", json.dumps(body).encode(),
        {"xi-api-key": os.environ["ELEVENLABS_API_KEY"], "Content-Type": "application/json", "Accept": "audio/mpeg"})
    return urllib.request.urlopen(req, timeout=60).read()

def azure(key, text):
    a = cfg["azure"]; name = a["voices"].get(key)
    if not name: return None
    st = a.get("styles", {}).get(key, {})
    ssml = (f"<speak version='1.0' xml:lang='bn-BD'><voice name='{name}'><prosody rate='{st.get('rate','0%')}' "
            f"pitch='{st.get('pitch','0%')}'>{text}</prosody></voice></speak>")
    req = urllib.request.Request(f"https://{a['region']}.tts.speech.microsoft.com/cognitiveservices/v1", ssml.encode("utf8"),
        {"Ocp-Apim-Subscription-Key": os.environ["AZURE_SPEECH_KEY"], "Content-Type": "application/ssml+xml",
         "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3"})
    return urllib.request.urlopen(req, timeout=60).read()

synth = eleven if cfg["provider"] == "elevenlabs" else azure
mf_path = AUDIO / "manifest.json"
manifest = json.load(open(mf_path)) if mf_path.exists() else {}
done = 0
for it in lines:
  for var in range(min(NVAR.get(it["key"], 1), maxvar or 99)):          # one clip per voice variant: key#variant|text
    h = fnv(f"{it['key']}#{var}|{it['text']}"); fn = f"{h}.mp3"
    if (AUDIO / fn).exists(): manifest[h] = fn; continue
    if budget and spent + len(it["text"]) > budget: continue
    try: data = synth(it["key"], it["text"], var) if cfg["provider"] == "elevenlabs" else synth(it["key"], it["text"])
    except Exception as e: print("fail", it["key"], var, it["text"][:20], e); continue
    if not data: continue
    spent += len(it["text"])
    (AUDIO / fn).write_bytes(data); manifest[h] = fn; done += 1; print("ok", it["key"], var, it["text"][:24])
    if limit and done >= limit: break
  if limit and done >= limit: break
json.dump(manifest, open(mf_path, "w"), indent=0)
print(f"{done} new clips, {len(manifest)} in manifest")
