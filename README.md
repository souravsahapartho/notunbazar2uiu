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
