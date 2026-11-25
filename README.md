# 🛺 মামা, শক্ত করে সিট ধরে বসেন!
### "Mama, hold the seat tight!" — the Natun Bazar → UIU battery-rickshaw game

> **The motto of the whole game: মামা, শক্ত করে সিট ধরে বসেন.** Hold the seat tight, or you fly off.

A funny, fast, fully responsive browser game about the bumpy **battery rickshaw** ride from **Dhaka's Natun Bazar to UIU**. Haggle the fare, hold the seat, dodge the traffic, and reach campus alive.

**Live:** https://notunbazar2uiu.vercel.app  ·  **Stack:** plain HTML, CSS and vanilla JavaScript on one canvas. Production is built (minified and obfuscated) into `dist/` by `npm run build`.

**Route:** Natun Bazar → Family Bazar → Sayed Nagar → 10 Tola → Bitumen Gate → U-turn at Chef's Table → Masjid Al Mustafa → **UIU**

## Features

- 🗣️ **Spoken fare haggling.** Walk up to a jumble of rickshaws, talk to the front driver, and bargain with buttons. Or skip the haggling. Boarding points: Natun Bazar, Family Bazar, Sayed Nagar, 10 Tola.
- 🎮 **Three control modes**, chosen in the menu:
  - **Manual:** buttons or keyboard.
  - **Tilt (ফোন হেলানো):** hold the phone like a steering wheel and turn it left/right to lean (works in any orientation). Tip the top edge toward you to grip and push it away to slow down. 🎯 recalibrates.
  - **Easy balance (সহজ):** the game balances for you. Easiest, and the default on phones.
- ➡️ **Lean cue.** An on-screen arrow shows which way to lean back.
- 🔥 **Calm-ride combo** from x1 to x5, plus a ছেলে/মেয়ে choice with matching voices.
- 💥 **Hard-crash drama:** a dying scream and a UIU mourning notice (শোকবার্তা and দোয়া প্রার্থনা) at the finish.
- 🏙️ **A real-looking Dhaka street**, studied from road footage: continuous walls of mid-rise buildings with AC units, balconies, laundry, water tanks and bright rooftop boards; rolled-down shop shutters; tangled utility poles; footbridges and a distant flyover; an overcast sky; worn, cracked, patched asphalt with manholes and faded lane marks; and a black-and-white striped divider.
- 🛺 **A detailed battery rickshaw:** tin-art side panel, ribbed painted hood with fringe and tassels, spoked wheels, and a driver with gamchha. The passenger has a backpack, bent knees on the footboard and two hands on the grab bar, and the cab shears slightly as you lose balance for a 2.5D feel.
- 😡 **The student gets angrier with every bump**: polite ("আস্তে চালান") → sharp ("চোখে দেখেন না?") → furious. Several different rickshaw-mama, boy and girl voices.
- 🏙️ **Shops.** Every shop has its own name (হাজি / নয়ন / মা বিরিয়ানি, আলকারিম রেস্টুরেন্ট, ফার্মেসি, টেলিকম with বিকাশ and নগদ boards), plus the Cha Joy outlet, the স্বপ্ন outlet, Last Pharma, the Porajoy hospital, tea tongs, hawker clothes vans and street life.
- 📍 **Landmarks:** the Bitumen Gate boulevard, the Chef's Table food court, Masjid Al Mustafa with the road to UIU, and the UIU campus gate.
- 🚌 **Traffic:** city buses in assorted colours, with roughly 1 bus in 10 being an orange **UIU shuttle**, plus rickshaws, CNGs and cars.
- 🎥 **U-turn camera:** the camera swings round to a rear view of the rickshaw, then shows the opposite side of the road (different shops).
- 🛣️ **Real junctions:** Bitumen Gate's boulevard and the road to UIU (left of Masjid Al Mustafa) branch off with curved kerbs, a zebra crossing, lamps and flanking buildings.
- 🤬 **Street abuse lines** (mild Dhaka style), toggleable in the menu.
- 📱 **Pro-game HUD:** small, round, translucent glass buttons that stay out of the way.
- 📱 **Responsive on every screen.** It is tested on Pixel, iPhone, iPad and desktop sizes in portrait and landscape, with safe-area insets, a rotate prompt and fullscreen. On iPhone, use Add to Home Screen for fullscreen.

## Controls

| Mode | How |
|------|-----|
| Keyboard | `SPACE` hold = grip · `←` `→` / `A` `D` = lean · `↓` / `S` = slow · `M` = mute |
| Touch (manual) | ◀ ▶ lean · ✋ grip · 🐢 slow |
| Touch (easy) | ✋ grip · 🐢 slow only |
| Tilt | Tilt left/right = lean · top edge toward you = grip · away = slow. Tick "↔ উল্টো" if directions feel reversed. |

## Run locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Deploy anywhere static: Vercel (import the repo, framework "Other"), or GitHub Pages (Settings → Pages → `main` / root).

## Realistic voices (ElevenLabs voice pack)

Browser text-to-speech cannot be trained, so by default every character sounds alike (the game only varies pitch and speed). For real voices, the game plays pre-rendered clips, and **every role has several different voices**: 5 rickshaw mamas, 3 boys, 3 girls, and 3 each for car, rickshaw, bus and CNG people. Each rickshaw mama keeps one voice for the whole ride; a new driver at the stand sounds different.

```bash
export ELEVENLABS_API_KEY=...            # your own key
python3 tools/design_voices.py           # creates the synthetic voices from text descriptions, saves ids to tools/voices.json
node tools/dump_lines.js > tools/lines_dump.json
python3 tools/gen_voices.py              # writes audio/*.mp3 + audio/manifest.json (one clip per line per voice)
git add audio tools && git commit -m "Add voice pack" && git push
```

`gen_voices.py --limit 5` is a cheap trial. Without a pack, the game falls back to browser voices. **Do not clone real people** (for example, people interviewed in a TV clip) without their consent; designed or library voices are safe.

## Project layout

```
index.html            menu, overlays, touch pad
style.css             responsive layouts (portrait / landscape / desktop)
js/game.js            game loop, physics, fare haggling, voices, rendering
js/art.js             all drawn sprites: rickshaw, shops, landmarks, buses
js/lines.js           every spoken Bangla line (including the escalating student anger)
js/guard.js           host/frame guard
tools/build.js        minify + obfuscate into dist/ (run by Vercel)
tools/                voice design + voice-pack generator
vercel.json           build config + security headers (CSP, frame blocking, permissions)
manifest.webmanifest  installable / fullscreen on phones
```

## Protection

- Production serves only a **minified, obfuscated single bundle** (`npm run build` → `dist/`), a strict **Content-Security-Policy**, no framing, and the debug hook is exposed on localhost only. The game refuses to run on unofficial hosts or inside other sites' frames.
- Honest limit: anything that runs in a browser can be copied by a determined person. To keep the readable source private, set the GitHub repo to **Private** (Settings → Danger zone); Vercel still deploys it.
- Licence: all rights reserved. See `LICENSE`.

## Notes

- Everything is a fictional, light-hearted parody. Shop names, notices and people are made up and are not real notices or real persons.
- Landmark art is hand-drawn from public descriptions and is approximate.
- Tilt sensor directions differ between phones. Real-device testing is welcome; open an issue.

Made by Sourav Saha (UIU CSE, Dhaka).
