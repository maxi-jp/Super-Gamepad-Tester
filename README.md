# 🎮 Super Gamepad Tester

Interactive browser-based gamepad tester — visualizes buttons, sticks, triggers, and D-pad in real time. Background adapts to your controller brand (Xbox, DualSense, Nintendo Switch Pro). No install, no dependencies, just open and play.

**[▶ Try it live](https://maxi-jp.github.io/Super-Gamepad-Tester/)**

---

## Features

- **Full controller map** — D-pad, face buttons (A/B/X/Y), LB/RB, LT/RT, Start/Back/Home, and both analogue sticks
- **Trigger bars** — visual fill proportional to the trigger pressure value
- **Stick trail** — up to 2,000 historical stick positions drawn as an orange dot trail so you can see your movement patterns
- **Brand detection** — background gradient automatically switches to match your controller:
  - 🟢 **Xbox** — Xbox green
  - 🔵 **PlayStation DualSense** — PlayStation blue
  - 🔴 **Nintendo Switch Pro Controller** — Nintendo red
  - ⚪ **Other / disconnected** — neutral grey
- **Press counters** — each button tracks how many times it has been pressed and released in the current session
- **No install, no build step** — open `index.html` in any modern browser and plug in a controller

---

## Usage

1. Clone or download this repository
2. Open `index.html` in a browser (or serve it with any static server)
3. Connect a gamepad via USB or Bluetooth
4. Press any button to let the browser detect it — the visualiser updates instantly

> **Browser support:** any browser that implements the [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API) (Chrome, Edge, Firefox, Opera).

---

## Project structure

```
index.html                  # Entry point & page shell
styles.css                  # CSS styles
engine.js                   # HTML5 Engine minify (renderer, input, game loop…)
gamepad_tester.js           # Gamepad tester game logic
```

---

## Built with

[HTML5_Engine](https://github.com/maxi-jp/HTML5_Engine) — a lightweight vanilla-JS 2D game engine with Canvas/WebGL rendering and a unified input system.

---

## License

MIT
