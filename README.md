# 🛺 মামা, শক্ত করে সিট ধরে বসেন!

If you've ever taken a battery rickshaw from Natun Bazar to UIU, you already know the ride: haggling over the fare, potholes, buses squeezing past, and holding the seat for dear life. I turned that into a small browser game. You bargain with the driver, hold on, and try to reach the university gate without falling off.

**Play:** https://notunbazar2uiu.vercel.app

Plain HTML, CSS and vanilla JavaScript on one canvas. No framework, no runtime dependencies.

## The ride

Natun Bazar → Family Bazar → Sayed Nagar → 10 Tola → Bitumen Gate → U-turn at Chef's Table → Masjid Al Mustafa → left turn → UIU gate.

The road is split into 20 equal units (3, 5, 2, 2, 3, 2, 3), so each stretch matches the real distance. Traffic keeps to the left like it does in Bangladesh: you ride in the outer lane, and the oncoming lanes are on the near side. After the U-turn the camera crosses over, you head back the other way, and a second left turn just past the mosque takes you onto the UIU road. The rickshaw you board is the one named "টেসলা / TESLA".

## Playing

| Mode | How |
|------|-----|
| Keyboard | Space (hold) = grip, ← → or A D = lean, ↓ or S = slow, M = mute |
| Touch, manual | ◀ ▶ lean, ✋ grip, 🐢 slow |
| Touch, easy | The game balances for you; only ✋ and 🐢 |
| Tilt | Tilt the phone left or right to lean. Tip the top edge towards you to grip, away to slow |

Before the ride you can haggle with the driver in Bangla, or skip it. The passenger gets angrier with every bump, and the street has plenty to say about it (mild abuse lines can be switched off in the menu).

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. To deploy, import the repo on Vercel (framework "Other"); it runs `npm run build` and serves `dist/`.

## Voices

Every spoken line has a pre-recorded clip in `audio/`, so the game talks on any phone, even ones with no Bangla voice installed. The clips are made offline with eSpeak NG and ffmpeg:

```bash
python3 tools/gen_offline.py
```

They sound plain. For richer voices there is an ElevenLabs pipeline: put your own key in `ELEVENLABS_API_KEY`, then run `tools/design_voices.py` once and `tools/gen_voices.py` after it. Please don't clone real people's voices.

## Layout

```
index.html           menu, overlays, touch pad
style.css            portrait, landscape and desktop layouts
js/game.js           loop, physics, fare talk, voices, drawing
js/art.js            all the drawn sprites
js/lines.js          every spoken line
js/guard.js          host and frame check
tools/               build script and voice tools
audio/               voice clips and manifest
vercel.json          security headers
```

## Security

- The production bundle is minified and obfuscated, served with a strict Content-Security-Policy, no framing, HSTS and a locked-down Permissions-Policy. The debug hook only exists on localhost.
- Anything that runs in a browser can be copied by someone determined. To keep the readable source private, set the GitHub repo to Private; Vercel can still deploy it.
- License: the Vantyr License, Version 1.0 (see `LICENSE`).

## If the game feels slow

The game tells you when the slowness is your internet and not the game. If your connection drops or gets very slow while you play, a small note appears at the top. The ride itself keeps running; only the voices need the network, and each clip is saved on your device after it plays once.

## Notes

It is a light-hearted parody. Shop names, notices and characters are made up. The landmark art is hand-drawn and approximate. Phones report tilt differently, so if the direction feels reversed, tick "↔ উল্টো" in the menu or open an issue.

## License

Copyright (c) 2026 Vantyr
Licensed under the Vantyr License, Version 1.0.
See [LICENSE](LICENSE) for the full terms, or read it at https://github.com/vantyrit/vantyr-license.

You are free to use, modify and share this project, including commercially, as long as you keep the copyright notice and the license, mark any files you changed, and don't present a modified copy as the official release. The Vantyr name and logo are not covered by the license.

Made by Sourav Saha, UIU CSE, Dhaka, as a Vantyr project.
