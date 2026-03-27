/**
 * Gamepad Tester — HTML UI version
 *
 * The canvas is a pure animation background layer:
 *   • Brand-colored gradient (Xbox green / PS navy / Nintendo red / default dark)
 *   • Orange dot trail for both analog sticks
 *   • Color ring burst on every button press
 *
 * All gamepad state is displayed in #gamepadPanel (HTMLMenu overlay):
 *   • LT / RT vertical fill bars
 *   • D-pad, face buttons, shoulder buttons, center buttons
 *   • Analog stick rings with movable thumb dot + x/y readout
 *   • Status bar with brand-color dot
 *   • Rumble toggle
 *
 * Trail canvas coordinates must match the CSS positions of the stick rings.
 */

// Canvas pixel positions of the LS / RS ring centres — keep in sync with gamepad_ui.css
const LS_CX = 220, LS_CY = 330;
const RS_CX = 420, RS_CY = 330;
const TRAIL_RADIUS = 38;  // max trail offset (matches stick ring inner radius)
const TRAIL_MAX    = 2000;

// Ordered button list — index is passed to SetButtonState; order must stay stable
const BUTTON_MAP = [
    { sel: "#btnFaceDown",  key: "FACE_DOWN",  pulse: "#4ade80" },
    { sel: "#btnFaceRight", key: "FACE_RIGHT", pulse: "#f87171" },
    { sel: "#btnFaceLeft",  key: "FACE_LEFT",  pulse: "#60a5fa" },
    { sel: "#btnFaceUp",    key: "FACE_UP",    pulse: "#fbbf24" },
    { sel: "#btnDpadUp",    key: "DPAD_UP",    pulse: "#818cf8" },
    { sel: "#btnDpadDown",  key: "DPAD_DOWN",  pulse: "#818cf8" },
    { sel: "#btnDpadLeft",  key: "DPAD_LEFT",  pulse: "#818cf8" },
    { sel: "#btnDpadRight", key: "DPAD_RIGHT", pulse: "#818cf8" },
    { sel: "#btnLB",        key: "LB",         pulse: "#818cf8" },
    { sel: "#btnRB",        key: "RB",         pulse: "#818cf8" },
    { sel: "#btnBack",      key: "BACK",       pulse: "#818cf8" },
    { sel: "#btnHome",      key: "HOME",       pulse: "#fbbf24" },
    { sel: "#btnStart",     key: "START",      pulse: "#818cf8" },
    { sel: "#btnLSPress",   key: "LS",         pulse: "#818cf8" },
    { sel: "#btnRSPress",   key: "RS",         pulse: "#818cf8" },
];

// ─────────────────────────────────────────────────────────────────
//  GamepadUI — HTML overlay panel
// ─────────────────────────────────────────────────────────────────

class GamepadUI extends HTMLMenu {
    constructor(game, canvas) {
        super(game, "#gamepadPanel", "#container", canvas, true);
        this._lastStatus = null;
        this._lastBrand  = undefined;
        this._lastLt = -1; this._lastRt = -1;
        this._lastLsX = 0; this._lastLsY = 0;
        this._lastRsX = 0; this._lastRsY = 0;
        this._btnStates = {};
        this._btnCounts = {};
    }

    Start() {
        super.Start();

        this.SetupElements([
            "#statusDot", "#statusText",
            "#ltBar", "#ltValue",
            "#rtBar", "#rtValue",
            "#lsThumb", "#lsX", "#lsY",
            "#rsThumb", "#rsX", "#rsY",
            "#rumbleBtn",
            ...BUTTON_MAP.map(b => b.sel),
        ]);

        this.SetupButtons([
            { selector: "#rumbleBtn", callback: () => this.game.ToggleRumble() },
        ]);
    }

    // Toggle pressed CSS class and increment down / up count badges.
    SetButtonState(index, pressed, countDown, countUp) {
        const b  = BUTTON_MAP[index];
        const el = this.elements[b.sel];
        if (!el)
            return;

        if (pressed !== this._btnStates[b.sel]) {
            this._btnStates[b.sel] = pressed;
            el.classList.toggle("pressed", pressed);
        }

        if (countDown) {
            const key = b.sel + "_dn";
            const n = (this._btnCounts[key] || 0) + 1;
            this._btnCounts[key] = n;
            const cnt = el.querySelector(".press-count");

            if (cnt)
                cnt.textContent = n;
        }
        if (countUp) {
            const key = b.sel + "_up";
            const n = (this._btnCounts[key] || 0) + 1;
            this._btnCounts[key] = n;
            const cnt = el.querySelector(".up-count");

            if (cnt)
                cnt.textContent = n;
        }
    }

    // Vertical trigger bar — height grows from 0 % (released) to 100 % (full press).
    SetTrigger(side, value) {
        const key = side === "lt" ? "_lastLt" : "_lastRt";
        if (Math.abs(value - this[key]) < 0.001)
            return;

        this[key] = value;
        const bar = this.elements[`#${side}Bar`];
        bar.style.height = (value * 100).toFixed(1) + "%";
        bar.parentElement.classList.toggle("active", value > 0.01);
        this.elements[`#${side}Value`].textContent = value.toFixed(3);
    }

    // Move the stick thumb dot and update x/y readout.
    SetStick(side, x, y) {
        const xKey = side === "ls" ? "_lastLsX" : "_lastRsX";
        const yKey = side === "ls" ? "_lastLsY" : "_lastRsY";
        if (Math.abs(x - this[xKey]) < 0.002 && Math.abs(y - this[yKey]) < 0.002)
            return;

        this[xKey] = x;
        this[yKey] = y;

        const maxPx = 36; // max thumb offset in px (keeps thumb inside ring border)
        const thumb = this.elements[`#${side}Thumb`];
        if (thumb) {
            thumb.style.transform =
                `translate(calc(-50% + ${(x * maxPx).toFixed(1)}px), calc(-50% + ${(y * maxPx).toFixed(1)}px))`;
        }
        
        this.elements[`#${side}X`].textContent = x.toFixed(3);
        this.elements[`#${side}Y`].textContent = y.toFixed(3);
    }

    // Update status bar text and brand-colour dot.
    SetStatus(text, brand) {
        if (text === this._lastStatus && brand === this._lastBrand)
            return;

        this._lastStatus = text;
        this._lastBrand = brand;

        if (this.elements["#statusText"])
            this.elements["#statusText"].textContent = text;

        this.elements["#statusDot"].className = "dot" + (brand ? ` dot-${brand}` : "");
    }

    SetRumbleButton(active) {
        const btn = this.elements["#rumbleBtn"];
        btn.textContent = active ? "🔊 Rumble ON" : "🔇 Rumble OFF";
        btn.classList.toggle("active", active);
    }
}

// ─────────────────────────────────────────────────────────────────
//  GamepadTesterHtml — game loop, canvas animation, input routing
// ─────────────────────────────────────────────────────────────────

class GamepadTesterHtml extends Game {
    constructor(renderer) {
        super(renderer);
        this.Configure({ screenWidth: 640, screenHeight: 480 });

        this.ui           = null;
        this.rumbleActive = false;

        this.pulses      = [];   // expanding ring bursts on button press
        this.wavePulses  = [];   // oscilloscope bumps traveling across the top strip
        this.waveTime    = 0;
        this.waveInputs  = { lsX: 0, lsMag: 0, rsX: 0, rsMag: 0, lt: 0, rt: 0 };
        this.lsTrail  = [{ x: 0, y: 0 }];
        this.rsTrail  = [{ x: 0, y: 0 }];
        this.lastGpId = "";

        this.lightOrange = Color.FromHexA("#ffd28f66");
        this.bgGradient  = null;

        drawStats = false;
    }

    Start() {
        super.Start();

        this.bgGradient = new LinearGradient(
            this.renderer,
            new Vector2(this.screenWidth, this.screenHeight).Normalize(),
            [[0, Color.FromHex("#0a0f1e")], [1, Color.FromHex("#1a2235")]]
        );

        this.ui = new GamepadUI(this, canvas);
        this.ui.Start();
    }

    ToggleRumble() {
        this.rumbleActive = !this.rumbleActive;
        this.ui.SetRumbleButton(this.rumbleActive);
    }

    Update(dt) {
        super.Update(dt);

        const connected = Input.gamepads.length > 0;

        // ── Button states ──────────────────────────────────────────────
        for (let i = 0; i < BUTTON_MAP.length; i++) {
            const b       = BUTTON_MAP[i];
            const pressed = connected && Input.IsGamepadButtonPressed(0, b.key);
            const down    = connected && Input.IsGamepadButtonDown(0, b.key);
            const up      = connected && Input.IsGamepadButtonUp(0, b.key);
            this.ui.SetButtonState(i, pressed, down, up);
            if (down) this._addPulse(b.pulse);
        }

        // ── Triggers ───────────────────────────────────────────────────
        const lt = connected ? Input.GetGamepadTriggerValue(0, "LT") : 0;
        const rt = connected ? Input.GetGamepadTriggerValue(0, "RT") : 0;
        this.ui.SetTrigger("lt", lt);
        this.ui.SetTrigger("rt", rt);

        // ── Sticks ─────────────────────────────────────────────────────
        const lsX = connected ? Input.GetGamepadStickAxisValue(0, "LS", 0) : 0;
        const lsY = connected ? Input.GetGamepadStickAxisValue(0, "LS", 1) : 0;
        const rsX = connected ? Input.GetGamepadStickAxisValue(0, "RS", 0) : 0;
        const rsY = connected ? Input.GetGamepadStickAxisValue(0, "RS", 1) : 0;
        this.ui.SetStick("ls", lsX, lsY);
        this.ui.SetStick("rs", rsX, rsY);

        // Trail history
        const lv = { x: lsX, y: lsY }, lp = this.lsTrail[this.lsTrail.length - 1];
        if (this.lsTrail.length < TRAIL_MAX && Vector2.SqrMagnitude(lp, lv) > 0.005)
            this.lsTrail.push(lv);
        const rv = { x: rsX, y: rsY }, rp = this.rsTrail[this.rsTrail.length - 1];
        if (this.rsTrail.length < TRAIL_MAX && Vector2.SqrMagnitude(rp, rv) > 0.005)
            this.rsTrail.push(rv);

        // ── Rumble while triggers are held ─────────────────────────────
        if (this.rumbleActive && connected && (lt > 0.05 || rt > 0.05))
            Input.RumbleGamepad(0, lt, rt, 100);

        // ── Wave inputs snapshot ───────────────────────────────────────
        const lsMag = Math.sqrt(lsX * lsX + lsY * lsY);
        const rsMag = Math.sqrt(rsX * rsX + rsY * rsY);
        this.waveInputs = { lsX, lsMag, rsX, rsMag, lt, rt };

        // ── Brand detection + gradient update ─────────────────────────
        if (connected) {
            const id    = Input.gamepads[0].gamepad.id;
            const brand = this._detectBrand(id.toLowerCase());
            this.ui.SetStatus(id, brand);
            if (id !== this.lastGpId) {
                this.lastGpId = id;
                this._applyBrand(brand);
            }
        } else {
            this.ui.SetStatus("No gamepad detected", null);
            if (this.lastGpId !== "") {
                this.lastGpId = "";
                this._applyBrand(null);
            }
        }

        // Age and cull pulse animations
        this.waveTime += dt;
        for (const p of this.pulses)      p.t += dt;
        for (const p of this.wavePulses)  p.t += dt;
        this.pulses      = this.pulses.filter(p => p.t < p.dur);
        this.wavePulses  = this.wavePulses.filter(p => p.t < p.dur);
    }

    _detectBrand(id) {
        if (id.includes("xbox"))                                        return "xbox";
        if (id.includes("dualsense") || id.includes("playstation"))     return "playstation";
        if (id.includes("pro controller"))                              return "nintendo";
        return "generic";
    }

    _applyBrand(brand) {
        const stops = {
            xbox:        ["#052e16", "#14532d"],
            playstation: ["#030c2e", "#0c1a4a"],
            nintendo:    ["#3b0a0a", "#7f1d1d"],
            generic:     ["#1e1b4b", "#312e81"],
        };
        const [c0, c1] = stops[brand] || ["#0a0f1e", "#1a2235"];
        this.bgGradient.SetColorStop(0, Color.FromHex(c0));
        this.bgGradient.SetColorStop(1, Color.FromHex(c1));
    }

    _addPulse(hex) {
        const c = Color.FromHex(hex);
        this.pulses.push({ r: c.r, g: c.g, b: c.b, t: 0, dur: 0.6 });
        this.wavePulses.push({ r: c.r, g: c.g, b: c.b, t: 0, dur: 1.4 });
    }

    Draw() {
        super.Draw();

        // Brand-colored background gradient
        this.renderer.DrawGradientRectangle(0, 0, this.screenWidth, this.screenHeight, this.bgGradient);

        // Stick trails — drawn at canvas positions matching the HTML stick rings
        for (const v of this.lsTrail)
            this.renderer.DrawFillCircle(LS_CX + v.x * TRAIL_RADIUS, LS_CY + v.y * TRAIL_RADIUS, 2, this.lightOrange);
        for (const v of this.rsTrail)
            this.renderer.DrawFillCircle(RS_CX + v.x * TRAIL_RADIUS, RS_CY + v.y * TRAIL_RADIUS, 2, this.lightOrange);

        // Button press ring bursts from canvas centre
        for (const p of this.pulses) {
            const prog  = p.t / p.dur;
            const alpha = (1 - prog) * 0.7;
            const r     = prog * 220;
            this.renderer.DrawStrokeCircle(
                this.screenHalfWidth, this.screenHalfHeight,
                r, new Color(p.r, p.g, p.b, alpha), 2
            );
        }

        this._drawOscilloscopeWave();
    }

    // ── Oscilloscope wave — top-center empty strip ─────────────────
    /**
     * Draws an oscilloscope-style wave across the top-center strip of the canvas
     * (the empty area between the LT and RT trigger boxes).
     *
     * The wave is made up of layered sine components, each driven by a different
     * gamepad input. Passes are drawn back-to-front so brighter colours appear on
     * top of the dim base:
     *
     *  Input         │ Effect on wave shape            │ Color overlay
     *  ──────────────┼─────────────────────────────────┼──────────────────────
     *  (idle)        │ Slow double-sine drift           │ Dim indigo (always on)
     *  LS magnitude  │ Increases amplitude of 1st sine  │ Orange
     *  LS X axis     │ Changes 1st sine travel speed    │ (tints orange pass)
     *  RS magnitude  │ Increases amplitude of 2nd sine  │ Yellow
     *  RS X axis     │ Changes 2nd sine travel speed    │ (tints yellow pass)
     *  LT pressure   │ Adds a slow wide swell           │ Purple, line grows
     *  RT pressure   │ Adds a fast tight ripple         │ Cyan, line grows
     *  Button press  │ Two Gaussian bumps travel outward│ Button's accent color
     *
     * Each colored input pass redraws the ENTIRE wave curve in that color, masked
     * by an alpha derived from the input value — so you always see the full shape,
     * just more or less brightly depending on how hard the input is pushed.
     *
     * Button bumps use a per-segment Gaussian envelope so only the region around
     * each traveling bump lights up in color; the rest remains dim indigo.
     */
    _drawOscilloscopeWave() {
        const WAVE_Y   = 100;   // vertical centre of the wave strip
        const WAVE_X0  = 90;    // left edge (just past LT zone)
        const WAVE_X1  = 550;   // right edge (just before RT zone)
        const WAVE_PTS = 120;   // number of line segments (resolution)
        const WAVE_CX  = (WAVE_X0 + WAVE_X1) / 2;

        const { lsX, lsMag, rsX, rsMag, lt, rt } = this.waveInputs;

        /**
         * Returns the canvas Y coordinate for a given X position.
         *
         * dy is the sum of four sine components:
         *   1. Primary low-frequency sine   — driven by LS magnitude & X axis
         *   2. Secondary mid-frequency sine — driven by RS magnitude & X axis
         *   3. LT component: slow wide swell (low spatial freq, slow time)
         *   4. RT component: fast tight ripple (high spatial freq, fast time)
         * Plus a Gaussian bump from each active button-press wavePulse.
         *
         * Each wavePulse spawns twin bumps that start at WAVE_CX and travel
         * symmetrically outward. sigma grows over time so they widen as they fade.
         */
        const waveY = (x) => {
            let dy = (3.0 + lsMag * 18) * Math.sin(x * 0.025 + this.waveTime * (1.2 + lsX * 1.5))  // LS
                   + (1.5 + rsMag * 12) * Math.sin(x * 0.060 - this.waveTime * (2.1 + rsX * 1.2))  // RS
                   + lt * 24            * Math.sin(x * 0.016 + this.waveTime * 0.9)                  // LT slow swell
                   + rt * 16            * Math.sin(x * 0.085 - this.waveTime * 4.2);                 // RT fast ripple

            for (const p of this.wavePulses) {
                const prog   = p.t / p.dur;
                const travel = prog * (WAVE_X1 - WAVE_X0) * 0.55;  // how far each bump has moved from center
                const sigma  = 20 + prog * 18;                       // bump widens as it travels
                const amp    = (1 - prog) * 30;                      // bump shrinks as it fades
                const dxR    = x - (WAVE_CX + travel);               // distance to right-traveling bump
                const dxL    = x - (WAVE_CX - travel);               // distance to left-traveling bump
                dy += amp * Math.exp(-dxR * dxR / (2 * sigma * sigma));
                dy += amp * Math.exp(-dxL * dxL / (2 * sigma * sigma));
            }
            return WAVE_Y + dy;
        };

        // Draws the full wave curve in one color at one line width.
        // Called once per colored pass — cheap since waveY is evaluated per segment.
        const drawPass = (col, lineW) => {
            for (let i = 0; i < WAVE_PTS; i++) {
                const x0 = WAVE_X0 + (i       / WAVE_PTS) * (WAVE_X1 - WAVE_X0);
                const x1 = WAVE_X0 + ((i + 1) / WAVE_PTS) * (WAVE_X1 - WAVE_X0);
                this.renderer.DrawLine(x0, waveY(x0), x1, waveY(x1), col, lineW);
            }
        };

        // Pass 1 — base (always visible, dim indigo)
        drawPass(new Color(0.38, 0.40, 0.94, 0.20), 1.5);

        // Pass 2 — LS magnitude → orange glow, alpha scales with stick deflection
        if (lsMag > 0.08)
            drawPass(new Color(1.00, 0.82, 0.56, lsMag * 0.40), 2);

        // Pass 3 — RS magnitude → yellow glow
        if (rsMag > 0.08)
            drawPass(new Color(0.98, 0.92, 0.38, rsMag * 0.40), 2);

        // Pass 4 — LT pressure → purple, line width grows with trigger depth
        if (lt > 0.02)
            drawPass(new Color(0.70, 0.45, 0.98, lt * 0.55), 1.5 + lt * 2);

        // Pass 5 — RT pressure → cyan, line width grows with trigger depth
        if (rt > 0.02)
            drawPass(new Color(0.30, 0.82, 0.98, rt * 0.55), 1.5 + rt * 2);

        // Pass 6 — Button press bumps: one per-segment pass for each active wavePulse.
        // Only segments near the traveling bump get meaningful alpha (Gaussian envelope),
        // so segments far from the bump cheaply skip with the < 0.015 guard.
        for (const p of this.wavePulses) {
            const prog   = p.t / p.dur;
            const travel = prog * (WAVE_X1 - WAVE_X0) * 0.55;
            const sigma  = 20 + prog * 18;
            for (let i = 0; i < WAVE_PTS; i++) {
                const x0  = WAVE_X0 + (i       / WAVE_PTS) * (WAVE_X1 - WAVE_X0);
                const x1  = WAVE_X0 + ((i + 1) / WAVE_PTS) * (WAVE_X1 - WAVE_X0);
                const xm  = (x0 + x1) * 0.5;
                const dxR = xm - (WAVE_CX + travel);
                const dxL = xm - (WAVE_CX - travel);
                const gau = Math.max(
                    Math.exp(-dxR * dxR / (2 * sigma * sigma)),
                    Math.exp(-dxL * dxL / (2 * sigma * sigma))
                );
                const alpha = gau * (1 - prog) * 0.9;
                if (alpha < 0.015) continue;    // skip segments too far from the bump
                this.renderer.DrawLine(x0, waveY(x0), x1, waveY(x1),
                    new Color(p.r, p.g, p.b, alpha), 2.5);
            }
        }
    }
}

window.onload = () => { Init(GamepadTesterHtml); };
