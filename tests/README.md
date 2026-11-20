# Tests (Playwright + Chrome)

Serve the game (`python3 -m http.server 8123`) and run, with `playwright` installed:

- `tilt_sim.py` – feeds simulated phone poses in all four screen rotations (steering-wheel roll, top toward/away) and checks lean/grip/slow directions, then plays a ride with a simulated tilting human.
- `devices_e2e.py` – 10 viewports (Pixel, iPhone, iPad, desktop; portrait + landscape): menu, tutorial, fare bar, touch pad, grip hold/release, death card.
- `controls_e2e.py` – Manual/Tilt/Auto UI per mode, tilt fallback pad, frame timing.

Edit the Chrome path (`/usr/bin/google-chrome`) at the top of each script if needed.
