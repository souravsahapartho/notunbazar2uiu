#!/usr/bin/env python3
"""Build audio/*.mp3 + audio/manifest.json from every game line.

  export ELEVENLABS_API_KEY=...   (or AZURE_SPEECH_KEY=...)
  node tools/dump_lines.js > tools/lines_dump.json
  python3 tools/gen_voices.py            # skips clips that already exist
  python3 tools/gen_voices.py --limit 5  # try a few first

Only use voices you are licensed to use (library/designed voices, or people who consented to cloning).
The game falls back to browser TTS for any line missing from the manifest.
"""
import json, os, sys, urllib.request, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
AUDIO = ROOT / "audio"; AUDIO.mkdir(exist_ok=True)
cfg = json.load(open(ROOT / "tools/voices.json", encoding="utf8"))
lines = json.load(open(ROOT / "tools/lines_dump.json", encoding="utf8"))
limit = int(sys.argv[sys.argv.index("--limit") + 1]) if "--limit" in sys.argv else None

def fnv(s):  # must match fnv() in js/game.js (FNV-1a over UTF-8 bytes)
    h = 0x811c9dc5
    for b in s.encode("utf8"):
        h = ((h ^ b) * 0x01000193) & 0xffffffff
    return f"{h:08x}"

def eleven(key, text):
    v = cfg["elevenlabs"]["voices"].get(key)
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
    h = fnv(f"{it['key']}|{it['text']}"); fn = f"{h}.mp3"
    if (AUDIO / fn).exists(): manifest[h] = fn; continue
    try: data = synth(it["key"], it["text"])
    except Exception as e: print("fail", it["key"], it["text"][:20], e); continue
    if not data: continue
    (AUDIO / fn).write_bytes(data); manifest[h] = fn; done += 1; print("ok", it["key"], it["text"][:24])
    if limit and done >= limit: break
json.dump(manifest, open(mf_path, "w"), indent=0)
print(f"{done} new clips, {len(manifest)} in manifest")
