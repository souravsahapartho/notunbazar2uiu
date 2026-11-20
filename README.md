# 🛺 টেসলা মামা: সিট ধরে রাখো!

A browser game about the bumpy auto-rickshaw ride from **Dhaka Natun Bazar → UIU**.
Hold the seat, keep your balance, don't let "Tesla mama" bump into anyone, and reach campus alive.

**Route:** Natun Bazar → Family Bazar → Sahebnagar → 10 Tola → Vitamin Gate → U-turn ("শেষ টেবিল") → Masjid Al Mustafa → **UIU**

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

Drivers open high (৳60–80 on Natun Bazar, more in rain) and justify it ("ফাঁকা পড়ি", "বড়লোকের স্টুডেন্ট"); the student answers back automatically. About one driver in four is kind and takes the fair fare. Squeeze a greedy driver all the way down and he drives angrily fast; pay generously and he drives gently. Rain adds puddles and a wet-road tint. The অফিস লাইন boarding point is placed at Sahebnagar — change `at` if that is wrong.

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
- **Painted cycle-rickshaws** in traffic, parked at the Natun Bazar and Sahebnagar stands, some waiting at corners.
- **Street life:** named shops (চা জয়, bKash-style recharge shops with text signs only, pharmacies, biryani, furniture, garments), hawker clothes vans, flowers, overhead wires, pedestrians on the footpath.
- **Risk:** pedestrians cross the road. Hit one and an angry crowd chases you (keep moving!). Wrong-side overtakes with oncoming traffic. Random jams near the Sahebnagar auto stand and Vitamin Gate.
- **Voices:** every character keeps one fixed browser Bangla voice (Web Speech API). Subtitles can be switched on/off. No third-party audio is used.
- **End screen:** portrait phones show the condolence banners on top and score/buttons below; landscape and desktop show banners left and the card on the right.

Shop names and positions live in the `NAMED` list in `js/game.js`; they are stylised, not exact copies of real storefronts.
