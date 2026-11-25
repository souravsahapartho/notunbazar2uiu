#!/usr/bin/env python3
"""Create the game's voices on ElevenLabs from *text descriptions* (Voice Design) and write their ids into tools/voices.json.

  export ELEVENLABS_API_KEY=...
  python3 tools/design_voices.py            # creates every missing variant
  python3 tools/design_voices.py --only driver

These voices are designed from a text description. Do NOT clone real people (e.g. interviewees in a TV clip) without their written consent.
Listen to the previews in your ElevenLabs dashboard and swap any you dislike, then run tools/gen_voices.py.
Request shapes follow ElevenLabs' public docs (text-to-voice/design, then text-to-voice); check them if the API has changed.
"""
import json, os, sys, urllib.request, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
P = ROOT / "tools/voices.json"; cfg = json.load(open(P, encoding="utf8"))
KEY = os.environ["ELEVENLABS_API_KEY"]
SAMPLE = "ল্যান মামা, উঠছেন? ধইরা বসেন, আইজকা রাস্তার অবস্থা ভালা না! সামনে আরও খানাখন্দ, শক্ত কইরা সিট ধরেন!"
BASE = "Bangladeshi Bengali speaker, natural Dhaka street dialect, conversational, "
DESC = {
 "driver": [BASE + d for d in [
   "middle-aged male rickshaw puller, deep rough voice, 45 years old, tired but warm",
   "older male rickshaw puller, raspy slow voice, 60 years old, wise and cheerful",
   "young male battery-rickshaw driver, quick energetic voice, 25 years old, cheeky",
   "heavy gravelly male voice, 50 years old, loud street vendor style, jokes a lot",
   "soft-spoken male driver, 35 years old, polite, slightly nasal"]],
 "player_m": [BASE + d for d in [
   "young male university student, 21 years old, friendly, a bit anxious",
   "young male student, 22 years old, bold and sarcastic, fast talker",
   "young male student, 20 years old, high-pitched, panicky"]],
 "player_f": [BASE + d for d in [
   "young female university student, 21 years old, clear and polite, a bit scared",
   "young female student, 22 years old, sharp and sassy, fast talker",
   "young female student, 20 years old, soft and shy but loud when scared"]],
 "car": [BASE + d for d in ["male car driver, 40 years old, impatient, honks and shouts", "male driver, 30 years old, gruff", "male driver, 50 years old, grumpy"]],
 "rick": [BASE + d for d in ["male rickshaw puller, 40 years old, shouting", "male rickshaw puller, 55 years old, hoarse", "young male rickshaw puller, 24 years old, loud"]],
 "bus": [BASE + d for d in ["bus helper (conductor), 28 years old, shouting stops fast", "bus helper, 35 years old, hoarse", "bus helper, 22 years old, high energy"]],
 "cng": [BASE + d for d in ["CNG auto driver, 38 years old, loud", "CNG auto driver, 45 years old, gruff", "CNG auto driver, 28 years old, fast"]],
 "crowd": [BASE + d for d in [
   "angry adult male in a street mob, 35 years old, loud and hoarse, shouting",
   "young angry male, 22 years old, high-pitched, shouting",
   "older angry male, 50 years old, deep gravelly, shouting",
   "angry male bystander, 30 years old, fast and breathless, shouting"]],
 "ped": [BASE + "male pedestrian, 40 years old, startled and loud"],
}
def call(path, body):
    req = urllib.request.Request("https://api.elevenlabs.io" + path, json.dumps(body).encode(), {"xi-api-key": KEY, "Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req, timeout=120))
only = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else None
voices = cfg["elevenlabs"]["voices"]
for role, descs in DESC.items():
    if only and role != only: continue
    slot = voices.setdefault(role, [] if len(descs) > 1 else {})
    for i, d in enumerate(descs):
        cur = slot[i] if isinstance(slot, list) and i < len(slot) else (slot if isinstance(slot, dict) else None)
        if cur and not cur.get("voice_id", "PUT_").startswith("PUT_"): continue
        pv = call("/v1/text-to-voice/design", {"voice_description": d, "text": SAMPLE, "model_id": "eleven_ttv_v3"})["previews"][0]
        vid = call("/v1/text-to-voice", {"voice_name": f"tm-{role}-{i+1}", "voice_description": d, "generated_voice_id": pv["generated_voice_id"]})["voice_id"]
        entry = {"voice_id": vid, "stability": .4, "style": .5}
        if isinstance(slot, list): slot[i] = entry
        else: voices[role] = entry
        print("created", role, i + 1, vid)
        json.dump(cfg, open(P, "w"), indent=2, ensure_ascii=False)
print("done: now run  python3 tools/gen_voices.py")
