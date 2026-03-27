# 🎮 Super Gamepad Tester

Interactive browser-based gamepad tester — visualizes buttons, sticks, triggers, and D-pad in real time. Background adapts to your controller brand (Xbox, DualSense, Nintendo Switch Pro). No install, no dependencies, just open and play.

Two variants are available:

| Variant | Entry point | UI style |
|---|---|---|
| **HTML UI** | `index.html` | HTML/CSS overlay on an animated canvas background |
| **Canvas** | `index-basic.html` | Simple canvas-only alternative, all visuals drawn directly on the canvas |

**[▶ Try it live](https://maxi-jp.github.io/Super-Gamepad-Tester/)**

---

## Features

- **Full controller map** — D-pad, face buttons (A/B/X/Y), LB/RB, LT/RT, Start/Back/Home, and both analogue sticks
- **Trigger bars** — visual fill proportional to trigger pressure; a semi-transparent full-track tint appears as soon as any pressure is detected
- **Stick trail** — up to 2,000 historical stick positions drawn as an orange dot trail so you can see your movement patterns
- **Brand detection** — background gradient automatically switches to match your controller:
  - 🟢 **Xbox** — Xbox green
  - 🔵 **PlayStation DualSense** — PlayStation blue
  - 🔴 **Nintendo Switch Pro Controller** — Nintendo red
  - 🟣 **Other / generic** — indigo
- **Press & release counters** — each button shows a ↓ down-count (top-right) and a ↑ up-count (top-left) for the current session
- **Rumble toggle** — enable rumble and use LT (strong motor) + RT (weak motor) to feel live trigger pressure
- **No install, no build step** — open either HTML file in any modern browser and plug in a controller

### HTML UI variant extras (`index.html`)

The canvas runs as a pure animation background layer while all controls are standard HTML elements:

- **Frosted-glass HUD** — status bar, trigger bars, stick rings, buttons and rumble toggle are absolute-positioned HTML elements with `backdrop-filter: blur`
- **Status bar** — brand-color dot + controller ID, gradient that fades to transparent toward the right
- **Stick rings** — transparent so the orange canvas trail shows through; a movable thumb dot tracks the live axis position
- **Oscilloscope wave** — an animated wave in the top-center strip reacts to every input in real time:

  | Input | Wave effect | Color |
  |---|---|---|
  | _(idle)_ | Slow double-sine drift | Dim indigo |
  | LS magnitude / X axis | Increases amplitude + travel speed of 1st harmonic | Orange |
  | RS magnitude / X axis | Increases amplitude + travel speed of 2nd harmonic | Yellow |
  | LT pressure | Adds a slow wide swell; line grows thicker | Purple |
  | RT pressure | Adds a fast tight ripple; line grows thicker | Cyan |
  | Button press | Twin Gaussian bumps travel outward from center | Button's accent color |

- **Button ring bursts** — colored expanding rings from the canvas center on every button press

---

## Usage

1. Clone or download this repository
2. Open `index.html` **or** `index-html.html` in a browser (or serve with any static server)
3. Connect a gamepad via USB or Bluetooth
4. Press any button to let the browser detect it — the visualiser updates instantly

> **Browser support:** any browser that implements the [Gamepad API](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad_API) (Chrome, Edge, Firefox, Opera).

---

## Project structure

```
index.html                  # Full HTML UI + Canvas background entry point
index-basic.html            # Canvas-only entry point
styles.css                  # Shared page styles (header, badges, footer)
gamepad_ui.css              # HTML UI overlay styles (HUD layout, buttons, wave strip)
engine.js                   # HTML5_Engine bundle (renderer, input, game loop…)
gamepad_tester.js           # Canvas variant — game logic
gamepad_tester_html.js      # HTML UI variant — GamepadUI + GamepadTesterHtml
```

---

## Built with

[HTML5_Engine](https://github.com/maxi-jp/HTML5_Engine) — a lightweight vanilla-JS 2D game engine with Canvas/WebGL rendering and a unified input system.

---

## License

MIT
