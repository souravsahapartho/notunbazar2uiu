# 🛺 টেসলা মামা: সিট ধরে রাখো!
### Tesla Mama: Hold the Seat!

A funny, fast, fully responsive browser game about the bumpy battery auto-rickshaw ride from **Dhaka's Natun Bazar to UIU**. Haggle the fare, hold the seat, dodge the traffic, and reach campus alive.

**Live:** https://notunbazar2uiu.vercel.app  ·  **Stack:** plain HTML, CSS and vanilla JavaScript on one canvas. No build step, no dependencies.

**Route:** Natun Bazar → Family Bazar → Sayed Nagar → 10 Tola → Bitumen Gate → U-turn at Chef's Table → Masjid Al Mustafa → **UIU**

## Features

- 🗣️ **Spoken fare haggling.** Walk up to a jumble of rickshaws, talk to the front driver, and bargain with buttons. Or skip the haggling. Boarding points: Natun Bazar, Family Bazar, Sayed Nagar, 10 Tola.
- 🎮 **Three control modes**, chosen in the menu:
  - **Manual:** buttons or keyboard.
  - **Tilt (ফোন হেলানো):** tilt the phone to lean. Tip the top edge toward you to grip and push it away to slow down.
  - **Auto balance:** the game balances for you. Easiest, and the default on phones.
- ➡️ **Lean cue.** An on-screen arrow shows which way to lean back.
- 🔥 **Calm-ride combo** from x1 to x5, plus a ছেলে/মেয়ে choice with matching voices.
- 💥 **Hard-crash drama:** a dying scream and a UIU mourning notice (শোকবার্তা and দোয়া প্রার্থনা) at the finish.
- 🏙️ **A detailed Dhaka street.** Every shop has its own name (হাজি / নয়ন / মা বিরিয়ানি, আলকারিম রেস্টুরেন্ট, ফার্মেসি, টেলিকম with বিকাশ and নগদ boards), plus the Cha Joy outlet, the স্বপ্ন outlet, Last Pharma, the Porajoy hospital, tea tongs, hawker clothes vans and street life.
- 📍 **Landmarks:** the Bitumen Gate boulevard, the Chef's Table food court, Masjid Al Mustafa with the road to UIU, and the UIU campus gate.
- 🚌 **UIU shuttle buses** share the road, along with rickshaws, CNGs and cars.
- 🤬 **Street abuse lines** (mild Dhaka style), toggleable in the menu.
- 📱 **Responsive on every screen.** It is tested on Pixel, iPhone, iPad and desktop sizes in portrait and landscape, with safe-area insets, a rotate prompt and fullscreen. On iPhone, use Add to Home Screen for fullscreen.

## Controls

| Mode | How |
|------|-----|
| Keyboard | `SPACE` hold = grip · `←` `→` / `A` `D` = lean · `↓` / `S` = slow · `M` = mute |
| Touch (manual) | ◀ ▶ lean · ✋ grip · 🐢 slow |
| Touch (auto) | ✋ grip · 🐢 slow only |
| Tilt | Tilt left/right = lean · top edge toward you = grip · away = slow. Tick "↔ উল্টো" if directions feel reversed. |

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Deploy anywhere static: Vercel (import the repo, framework "Other"), or GitHub Pages (Settings → Pages → `main` / root).

## Realistic voices (voice pack)

Browser text-to-speech cannot be trained, so by default every character sounds similar. The game can instead play pre-rendered clips:

1. `node tools/dump_lines.js > tools/lines_dump.json` lists every spoken line and its voice key (driver, player_m, player_f, rick, car, bus, cng, crowd, ped).
2. Put your own voice ids in `tools/voices.json` (ElevenLabs Bengali voices, or Azure bn-BD / bn-IN neural voices).
3. `ELEVENLABS_API_KEY=... python3 tools/gen_voices.py` (or `AZURE_SPEECH_KEY=...`) writes `audio/*.mp3` and `audio/manifest.json`. Commit them.

The game plays a clip when one exists and falls back to the browser voice otherwise. Use only licensed voices, or voices of people who consented to cloning.

## Project layout

```
index.html            menu, overlays, touch pad
style.css             responsive layouts (portrait / landscape / desktop)
js/game.js            game loop, physics, fare haggling, voices, rendering
js/art.js             all drawn sprites: rickshaw, shops, landmarks, buses
js/lines.js           every spoken Bangla line
tools/                voice-pack generator
manifest.webmanifest  installable / fullscreen on phones
```

## Notes

- Everything is a fictional, light-hearted parody. Shop names, notices and people are made up and are not real notices or real persons.
- Landmark art is hand-drawn from public descriptions and is approximate.
- Tilt sensor directions differ between phones. Real-device testing is welcome; open an issue.

Made by Sourav Saha (UIU CSE, Dhaka).
