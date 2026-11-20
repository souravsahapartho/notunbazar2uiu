# 🛺 টেসলা মামা: সিট ধরে রাখো!

A browser game about the bumpy auto-rickshaw ride from **Dhaka Natun Bazar → UIU**.
Hold the seat, keep your balance, don't let "Tesla mama" bump into anyone, and reach campus alive.

**Route:** Natun Bazar → Family Bazar → Sayed Nagar → 10 Tola → Bitumen Gate → U-turn ("শেষ টেবিল") → Masjid Al Mustafa → **UIU**

## Play

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

Deploy for free: GitHub repo → Settings → Pages → Deploy from branch `main` / root.

## Controls

| Key | Action |
|-----|--------|
| `SPACE` (hold) | Grip the seat. Cuts jolts, but drains stamina. |
| `←` `→` / `A` `D` | Lean to balance |
| `↓` / `S` | "মামা, ধীরে!" — slow down to avoid bumping vehicles |
| `M` | Mute |

On phones, on-screen buttons appear.

## Fare haggling

Before each ride you pick where to board and bargain with the auto driver (cut the price with the slider, or take his ask).
Fair fares live in `BOARDINGS` in `js/game.js`:

| Boarding | Dry | Rain |
|----------|-----|------|
| Natun Bazar | ৳50 | ৳50–70 |
| অফিস লাইন | ৳30–40 | ৳40–50 |
| দশতলা | ৳30 | ৳30–40 |

Drivers open high (৳60–80 on Natun Bazar, more in rain) and justify it ("ফাঁকা পড়ি", "বড়লোকের স্টুডেন্ট"); the student answers back automatically. About one driver in four is kind and takes the fair fare. Squeeze a greedy driver all the way down and he drives angrily fast; pay generously and he drives gently. Rain adds puddles and a wet-road tint. The অফিস লাইন boarding point is placed at Sayed Nagar — change `at` if that is wrong.

## Rules

- Potholes, puddles and broken speed breakers jolt you. Time your grip just before the wheel hits.
- If your balance bar reaches the edge you nearly fall (−25 life).
- Bumping a car/bus/rickshaw: −12 life. The other driver shouts, rickshaw pullers apologise.
- Too much honking costs points, and later life.
- Faster = more points, but more danger.
- Life reaches 0: a satirical condolence-notice scene appears in front of UIU with your name.
- Reach UIU: win and get a rating.

## Voices and sounds

No audio is downloaded or copied from other sites. Dialogue appears in speech bubbles and is read aloud with the browser's built-in Bangla text-to-speech when the device has a `bn` voice. Horn, thud and splash are synthesised with WebAudio.

All dialogue lives in `js/lines.js` — edit or add lines freely. If you want real recorded voices, record your own or use properly licensed clips, and hook them into `speak()` in `js/game.js`.

## Customise

- Stage names, sky colours, roughness: `STAGES` at the top of `js/game.js`
- Route length: `SEG` (metres per stage)
- U-turn position: `UTURN_AT`
- Landmarks are drawn procedurally in `drawLandmark()`

Note: the death-notice scene is a fictional parody and is not an official notice from UIU.

## What's new

- **Phone vs desktop:** phones get a touch pad (✋ ধরো / ◀ ▶ / 🐢 ধীরে) and auto-fullscreen in landscape; desktop uses SPACE, arrows and F for fullscreen.
- **First-time tutorial** (skippable, re-open from the menu with ❓).
- **Painted cycle-rickshaws** in traffic, parked at the Natun Bazar and Sayed Nagar stands, some waiting at corners.
- **Street life:** named shops (চা জয়, bKash-style recharge shops with text signs only, pharmacies, biryani, furniture, garments), hawker clothes vans, flowers, overhead wires, pedestrians on the footpath.
- **Risk:** pedestrians cross the road. Hit one and an angry crowd chases you (keep moving!). Wrong-side overtakes with oncoming traffic. Random jams near the Sayed Nagar auto stand and Bitumen Gate.
- **Voices:** every character keeps one fixed browser Bangla voice (Web Speech API). Subtitles can be switched on/off. No third-party audio is used.
- **End screen:** portrait phones show the condolence banners on top and score/buttons below; landscape and desktop show banners left and the card on the right.

Shop names and positions live in the `NAMED` list in `js/game.js`; they are stylised, not exact copies of real storefronts.

## Rickshaw mode & Natun Bazar outlets

- Pick **🚲 রিক্সা** in the menu to ride a painted cycle-rickshaw instead of the auto: slower, with its own fare range (guessed: Natun Bazar ৳60–80 dry, ৳90–120 rain).
- Natun Bazar now has a Cha Joy-style outlet (generic look, text sign only), a bKash/Nagad agent, confectionery stores, tea tongs, "লাস্ট ফার্মা" pharmacy and the "পরাজয় হাসপাতাল" between Natun Bazar and Family Bazar. Edit `NAMED` in `js/game.js` to change names/positions.

## Stand, voices & notices (latest)

- **Single vehicle:** the painted battery-powered auto-rickshaw ("Tesla"); no separate cycle-rickshaw mode any more.
- **Rickshaw stand:** you walk up to a jumble of 7 rickshaws, talk to the front driver by voice, answer with buttons (offer, "too much", "poor student", "haven't married yet", next rickshaw, or just get in and settle later), then climb in at the back.
- **Voices:** Dhakaiya lines, short and sparse. Pick 👦/👧 in the menu; the student's voice follows it (needs a Bangla voice on the device — otherwise subtitles appear automatically).
- **Phones:** a "rotate your phone" screen appears in portrait (can be skipped).
- **Easier:** smaller jolts/damage, fewer road-crossers and wrong-side overtakes.
- **On death:** two notices at UIU — শোকবার্তা and দোয়া প্রার্থনা (fictional, game satire).

## Realistic voices (voice pack)

Browser TTS cannot be trained, so every voice sounds alike. The game can instead play pre-rendered clips:

1. `node tools/dump_lines.js > tools/lines_dump.json` lists every spoken line with its voice key (driver, player_m, player_f, rick, car, bus, cng, crowd, ped).
2. Put your own voice ids in `tools/voices.json` (ElevenLabs Bengali, or Azure bn-BD/bn-IN neural voices).
3. `ELEVENLABS_API_KEY=... python3 tools/gen_voices.py` (or `AZURE_SPEECH_KEY=...`) writes `audio/*.mp3` and `audio/manifest.json`. Commit them.

The game plays a clip when it exists and falls back to browser TTS otherwise. Use only licensed or consented voices.

## What else is new
- 🤬 Street abuse lines (menu toggle, on by default) for collisions, rude refusals and mobs.
- Dramatic death: at low life he screams "বাঁচাও বাঁচাও… এখনো বিয়া করি নাই", the passenger is thrown off and the auto tips over, then the notices appear.
- Touch: pointer capture on the pad (no stuck buttons), haptics, safe-area insets, no zoom/long-press, PWA manifest + icon (Add to Home Screen on iPhone gives fullscreen).
- Tested on 10 viewports (Pixel 7, iPhone 14/SE, iPad, desktop; portrait and landscape) with Chrome emulation. Real iOS Safari is untested.

## Controls (pick in the menu)
- 🎮 **Manual** – ◀ ▶ lean, ✋ grip, 🐢 slow (or arrow keys / Space / S).
- 📱 **Tilt (ফোন হেলানো)** – roll the phone left/right to lean; tip the top edge toward you to grip, push it away to slow down. Calibrates at ride start. iOS asks for motion permission. Tick "↔ উল্টো" if the direction feels reversed on your phone (sensor axes differ by device; untested on real hardware).
- 🤖 **Auto balance** – the game keeps balance; you only grip/slow down. Easiest (default on phones).

In Tilt mode the on-screen ◀ ▶ pad is hidden (it returns automatically if no motion sensor is found); in Auto mode only ✋ 🐢 remain.

Physics was also made more forgiving (slower stamina drain, smaller fall/hit penalties, self-righting).

- Fixed signs: BITUMEN GATE, CHEF'S TABLE (শেফস টেবিল). "বিয়া করি নাই" is now only cried on hard crashes/death; haggling uses a plain student plea. New 🔥 calm-ride combo (x1–x5). Lean input is eased for smoother control.
