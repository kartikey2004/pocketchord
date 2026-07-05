<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
</script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
<style>
  :root {
    --bg: #0f0f0f;
    --panel: #1a1a1d;
    --panel-2: #232328;
    --border: #2e2e35;
    --text: #e8e8ec;
    --muted: #8a8a95;
    --accent: #3B82F6;
    --accent-2: #ffb23e;
    --record: #ef4444;
    --glow: rgba(59, 130, 246, 0.3);
    --shadow: 0 8px 24px rgba(0,0,0,0.3);
    --shadow-sm: 0 4px 12px rgba(0,0,0,0.2);
    --good: #36d399;
    --bad: #6b6b75;
  }
  body.light {
    --bg: #eef1f5;
    --panel: #ffffff;
    --panel-2: #e9edf2;
    --border: #d3d9e0;
    --text: #1b1e24;
    --muted: #6a7280;
    --accent: #1f7ae0;
    --accent-2: #d9821a;
    --glow: rgba(31,122,224,0.35);
    --bad: #b6bcc6;
  }
  html, body { transition: background 0.2s ease, color 0.2s ease; }

  /* Tap-to-start overlay */
  #startOverlay {
    position: fixed; inset: 0; z-index: 100;
    background: radial-gradient(circle at 50% 40%, #1a1a20, #0b0b0d);
    display: flex; align-items: center; justify-content: center; padding: 24px;
    text-align: center;
  }
  #startOverlay.gone { display: none; }
  .start-card { max-width: 340px; }
  .start-dot { width: 18px; height: 18px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 24px var(--glow); margin: 0 auto 18px; animation: pulseDot 1.6s ease-in-out infinite; }
  @keyframes pulseDot { 50% { transform: scale(1.25); opacity: 0.6; } }
  .start-title { font-size: 30px; font-weight: 700; letter-spacing: 0.5px; color: #f0f0f4; }
  .start-sub { font-size: 14px; color: #9a9aa6; margin: 10px 0 26px; line-height: 1.5; }
  .start-btn {
    background: var(--accent); color: #04121f; border: none; border-radius: 14px;
    padding: 16px 34px; font-family: inherit; font-size: 18px; font-weight: 700; cursor: pointer;
    box-shadow: 0 0 26px var(--glow); -webkit-tap-highlight-color: transparent;
  }
  .start-btn:active { transform: scale(0.97); }
  .start-loading { font-size: 12px; color: #7a7a86; margin-top: 16px; min-height: 16px; }

  #toast {
    position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%) translateY(20px);
    z-index: 90; background: var(--panel-2); color: var(--text); border: 1px solid var(--border);
    border-radius: 999px; padding: 9px 16px; font-size: 13px; font-weight: 600;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4); opacity: 0; pointer-events: none;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  #toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; -webkit-touch-callout: none; }
  html, body {
    margin: 0; padding: 0;
    background: var(--bg);
    color: var(--text);
    font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif;
    overscroll-behavior: none;
    /* Stop long-press selection/callout menus on a touch instrument */
    -webkit-user-select: none; user-select: none;
  }
  input, select, textarea { -webkit-user-select: auto; user-select: auto; }
  body {
    margin: 0; box-sizing: border-box;
    padding: calc(10px + env(safe-area-inset-top)) calc(10px + env(safe-area-inset-right)) calc(10px + env(safe-area-inset-bottom)) calc(10px + env(safe-area-inset-left));
    display: flex;
    flex-direction: column;
    height: 100dvh;
  }
  .wrap { max-width: 1320px; width: 100%; margin: 0 auto; flex: 1; display: flex; flex-direction: column; }

  /* Glassmorphism: panels with backdrop blur */
  .panel, .toggle, .chip, button, select, input[type="range"] {
    background: linear-gradient(135deg, rgba(35, 35, 40, 0.8) 0%, rgba(26, 26, 29, 0.8) 100%);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(46, 46, 53, 0.5);
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    transition: all 0.15s ease;
  }
  .toggle.on, button.on, .chord-btn.held {
    background: linear-gradient(135deg, var(--accent) 0%, rgba(59, 130, 246, 0.8) 100%);
    box-shadow: 0 0 16px var(--glow);
  }
  .chord-btn, .start-btn {
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    transition: all 0.06s ease;
  }
  .chord-btn:active { transform: scale(0.95); box-shadow: 0 0 16px var(--glow); }

  /* Large touch targets */
  button, .toggle, select {
    min-height: 48px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 600;
  }
  .toggle.small { min-height: 44px; padding: 8px 12px; font-size: 12px; }
  input[type="range"] { height: 6px; }

  /* Tab navigation */
  .tab-nav {
    display: flex;
    gap: 4px;
    margin-bottom: 8px;
    background: var(--panel);
    padding: 6px;
    border-radius: 12px;
    backdrop-filter: blur(8px);
  }
  .tab-nav button {
    flex: 1;
    padding: 8px 12px;
    font-size: 12px;
    background: transparent;
    border: 1px solid transparent;
    color: var(--muted);
    border-radius: 10px;
  }
  .tab-nav button.active {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
  }
  @media (min-width: 941px) {
    body { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; }
  }
  h1 {
    font-size: 17px; font-weight: 700; margin: 0;
    letter-spacing: 0.5px; display: flex; align-items: center; gap: 8px; white-space: nowrap;
  }
  h1 .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 12px var(--glow); }
  .panel {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 10px 11px;
  }

  /* Dashboard layout */
  .topbar { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
  .topbar .oled { flex: 1 1 auto; margin-bottom: 0; padding: 8px 16px; }
  .topbar .oled .oled-main { font-size: 28px; }
  .board { display: grid; grid-template-columns: 0.92fr 1fr 1.05fr; gap: 10px; align-items: start; }
  .col { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
  @media (max-width: 940px) {
    .wrap { padding: 0; display: flex; flex-direction: column; height: 100%; }
    body { padding: 0; }

    /* Top bar: minimal, fixed */
    .topbar {
      flex: 0 0 auto;
      flex-wrap: wrap;
      gap: 8px;
      padding: calc(8px + env(safe-area-inset-top)) 12px 8px 12px;
      border-bottom: 1px solid var(--border);
      background: var(--bg);
      z-index: 10;
    }
    .topbar h1 { font-size: 15px; }
    .topbar .oled { flex: 1 1 auto; margin-bottom: 0; padding: 6px 10px; }
    .topbar .oled .oled-main { font-size: 20px; }

    /* Keyboard section */
    .board > .col:nth-child(1) > .panel:first-child {
      flex: 0 0 auto;
      margin: 0;
      padding: 0 12px;
      border: none;
      background: none;
      box-shadow: none;
    }
    .kbd { height: 40px; margin: 8px 12px; border-radius: 8px; }

    /* Hero area: Chord pads dominant */
    .board {
      display: flex;
      flex-direction: column;
      gap: 0;
      margin: 0;
      flex: 1 1 auto;
      overflow-y: auto;
      padding-bottom: 60px; /* Space for fixed bottom nav */
    }

    /* Column 2 (chords) - HERO */
    .board > .col:nth-child(2) {
      order: 2;
      flex: 1 1 auto;
      padding: 0 12px 12px 12px;
      overflow: visible;
    }
    .board > .col:nth-child(2) > .panel {
      margin: 0;
      padding: 0;
      border: none;
      background: none;
      box-shadow: none;
    }
    .chords {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin: 12px 0;
    }
    .chord-btn {
      aspect-ratio: 1;
      padding: 8px;
      min-height: auto;
      font-size: 14px;
    }
    .chord-btn .name { font-size: 20px; }
    .chord-btn .deg { font-size: 10px; }

    /* Tempo display under chords */
    .board > .col:nth-child(2) > .panel:nth-child(2) {
      margin-top: 0;
      padding: 10px;
      min-height: auto;
    }

    /* Column 1 (sound shaping) - Hidden, shown in tabs */
    .board > .col:nth-child(1) {
      order: 4;
      flex: 0 0 auto;
      padding: 0 12px 12px 12px;
      background: transparent;
      border: none;
      display: none;
    }
    .board > .col:nth-child(1).tab-active { display: flex; }

    /* Column 3 (arrange) - Hidden, shown in tabs */
    .board > .col:nth-child(3) {
      order: 3;
      flex: 0 0 auto;
      padding: 0 12px 12px 12px;
      overflow: visible;
      background: transparent;
      border: none;
      display: none;
    }
    .board > .col:nth-child(3).tab-active { display: flex; }

    /* Common panel styling for mobile */
    .panel {
      margin: 8px 0;
      padding: 12px;
      border-radius: 12px;
    }
    .label { font-size: 10px; margin-bottom: 6px; }
    .toggle { padding: 8px 12px; font-size: 12px; min-height: 40px; }
    .toggle.small { padding: 6px 10px; font-size: 11px; min-height: 36px; }
    select { font-size: 12px; min-height: 40px; }
    .row { gap: 6px; }
    .grid2 { gap: 8px; }
    .stack { gap: 2px; }

    /* Bottom navigation (fixed) */
    .board::after {
      content: '';
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: var(--bg);
      border-top: 1px solid var(--border);
      z-index: 20;
      padding-bottom: env(safe-area-inset-bottom);
    }
  }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); margin-bottom: 6px; }

  /* Selectors */
  .scroller { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: thin; }
  .scroller::-webkit-scrollbar { height: 5px; }
  .scroller::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
  .chip {
    flex: 0 0 auto;
    background: var(--panel-2);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 10px;
    padding: 9px 13px;
    font-size: 14px; font-weight: 600;
    cursor: pointer;
    transition: all 0.12s ease;
    white-space: nowrap;
  }
  .chip:hover { border-color: var(--accent); }
  .chip.active {
    background: var(--accent);
    border-color: var(--accent);
    color: #04121f;
    box-shadow: 0 0 14px var(--glow);
  }
  .chip.amber.active { background: var(--accent-2); border-color: var(--accent-2); box-shadow: 0 0 14px rgba(255,178,62,0.5); }

  select {
    background: var(--panel-2);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 9px 11px;
    font-family: inherit;
    font-size: 14px; font-weight: 600;
    cursor: pointer;
    flex: 1 1 auto;
  }

  /* Chord buttons */
  .chords {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .chord-btn {
    position: relative;
    aspect-ratio: 1 / 1.05;
    border-radius: 16px;
    border: 1px solid var(--border);
    background: linear-gradient(160deg, var(--panel-2), #18181c);
    color: var(--text);
    cursor: pointer;
    user-select: none;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 3px;
    transition: transform 0.06s ease, box-shadow 0.1s ease, background 0.1s ease;
    touch-action: none;
  }
  .chord-btn .deg { font-size: 12px; color: var(--muted); font-weight: 600; }
  .chord-btn .name { font-size: 23px; font-weight: 700; letter-spacing: 0.3px; }
  .chord-btn.span2 { grid-column: span 3; aspect-ratio: auto; padding: 16px; }
  .chord-btn.held {
    transform: scale(0.96);
    background: linear-gradient(160deg, var(--accent), #1d6fb0);
    color: #02121f;
    box-shadow: 0 0 26px var(--glow);
  }
  .chord-btn.held .deg { color: rgba(2,18,31,0.7); }

  /* small toggles */
  .toggle {
    background: var(--panel-2);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 10px;
    padding: 9px 12px;
    font-size: 13px; font-weight: 600;
    cursor: pointer; flex: 1 1 auto;
    transition: all 0.12s ease;
    min-width: 56px;
  }
  .toggle.on { background: var(--accent-2); border-color: var(--accent-2); color: #1a1206; box-shadow: 0 0 12px rgba(255,178,62,0.45); }
  .toggle.small { flex: 0 0 auto; min-width: 42px; padding: 9px 10px; }

  .knob-wrap { display: flex; align-items: center; gap: 8px; flex: 1 1 auto; }
  input[type=range] {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 5px; border-radius: 4px;
    background: var(--border); outline: none;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 18px; height: 18px; border-radius: 50%;
    background: var(--accent); cursor: pointer;
    box-shadow: 0 0 8px var(--glow);
  }
  input[type=range]::-moz-range-thumb {
    width: 18px; height: 18px; border-radius: 50%; border: none;
    background: var(--accent); cursor: pointer;
  }

  .status { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 600; }
  .status .led { width: 9px; height: 9px; border-radius: 50%; background: var(--bad); }
  .status.connected .led { background: var(--good); box-shadow: 0 0 8px var(--good); }

  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .stack { display: flex; flex-direction: column; gap: 4px; }
  .val { font-size: 13px; font-weight: 700; min-width: 34px; text-align: right; color: var(--accent); }
  .hint { font-size: 10px; color: var(--muted); margin-top: 5px; line-height: 1.4; }
  .rec-dot { width: 9px; height: 9px; border-radius: 50%; background: #ff4d4d; }
  .blink { animation: blink 1s steps(2,start) infinite; }
  @keyframes blink { 50% { opacity: 0.2; } }

  /* OLED display */
  .oled {
    display: flex; align-items: center; justify-content: space-between;
    background: #03121a; border: 1px solid #0c3a4d; border-radius: 14px;
    padding: 12px 16px; margin-bottom: 12px;
    box-shadow: inset 0 0 26px rgba(46,167,255,0.12);
    font-family: 'Space Grotesk', monospace;
  }
  .oled-side { display: flex; flex-direction: column; gap: 3px; min-width: 64px; }
  .oled-side span { color: #38d6ff; font-size: 12px; font-weight: 600; text-shadow: 0 0 8px rgba(56,214,255,0.7); }
  .oled-deg { font-size: 18px !important; opacity: 0.85; }
  .oled-flags {
    align-items: flex-end; text-align: right; justify-content: center;
    color: var(--accent-2); font-size: 11px; font-weight: 700; letter-spacing: 1px;
    text-shadow: 0 0 8px rgba(255,178,62,0.6); white-space: pre-line;
  }
  .oled-main {
    flex: 1 1 auto; text-align: center;
    color: #6ee7ff; font-size: 34px; font-weight: 700; letter-spacing: 1px;
    text-shadow: 0 0 14px rgba(56,214,255,0.8);
  }
  .oled.counting { border-color: #5e1f1f; box-shadow: inset 0 0 26px rgba(255,77,77,0.18); }
  .oled.counting .oled-main {
    color: #ff8d8d; font-size: 44px; text-shadow: 0 0 18px rgba(255,90,90,0.9);
    animation: countpulse 0.18s ease;
  }
  .oled.counting .oled-side span { color: #ff8d8d; text-shadow: 0 0 8px rgba(255,90,90,0.7); }
  @keyframes countpulse { from { transform: scale(1.35); opacity: 0.5; } to { transform: scale(1); opacity: 1; } }

  /* Real-time piano keyboard visualization */
  .kbd {
    position: relative; height: 46px; margin-bottom: 10px;
    background: var(--panel); border: 1px solid var(--border); border-radius: 10px;
    overflow: hidden; display: flex; padding: 4px; gap: 0;
  }
  .kbd .wk {
    position: relative; flex: 1 1 0; border-right: 1px solid var(--border);
    background: linear-gradient(180deg, #fbfbfb, #e7e7ea); border-radius: 0 0 3px 3px;
  }
  .kbd .wk:last-child { border-right: none; }
  .kbd .wk.lit { background: linear-gradient(180deg, var(--accent), #1d6fb0); box-shadow: 0 0 10px var(--glow); }
  .kbd .bk {
    position: absolute; top: 0; width: 1.6%; height: 60%; z-index: 2;
    background: linear-gradient(180deg, #2a2a2e, #111); border-radius: 0 0 3px 3px; transform: translateX(-50%);
  }
  .kbd .bk.lit { background: linear-gradient(180deg, var(--accent-2), #b06a14); box-shadow: 0 0 10px rgba(255,178,62,0.6); }

  .beat-dots { display: flex; gap: 8px; }
  .beat-dots .bd {
    width: 14px; height: 14px; border-radius: 50%;
    background: var(--panel-2); border: 1px solid var(--border);
    transition: all 0.05s ease;
  }
  .beat-dots .bd.on { background: var(--accent); box-shadow: 0 0 10px var(--glow); transform: scale(1.15); }
  .beat-dots .bd.accent.on { background: var(--accent-2); box-shadow: 0 0 12px rgba(255,178,62,0.6); }

  .playhead {
    height: 6px; border-radius: 4px; background: var(--panel-2);
    border: 1px solid var(--border); overflow: hidden; margin-bottom: 10px;
  }
  .playhead-fill { height: 100%; width: 0%; background: var(--accent); box-shadow: 0 0 8px var(--glow); }
  .playhead.rec .playhead-fill { background: #ff4d4d; box-shadow: 0 0 8px #ff4d4d; }

  /* Step sequencer */
  .seq-grid { display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px; }
  .seq-cell {
    aspect-ratio: 1 / 1; border-radius: 9px; border: 1px solid var(--border);
    background: var(--panel-2); color: var(--text);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px;
    font-size: 11px; font-weight: 700; cursor: pointer; user-select: none;
    transition: transform 0.05s ease, box-shadow 0.08s ease, background 0.08s ease;
    overflow: hidden;
  }
  .seq-cell .sidx { font-size: 9px; color: var(--muted); font-weight: 600; }
  .seq-cell.empty .sname { color: var(--muted); }
  .seq-cell.filled { background: linear-gradient(160deg, #27333d, #1b232a); }
  .seq-cell.cur { border-color: var(--accent-2); box-shadow: 0 0 0 2px var(--accent-2) inset; }
  .seq-cell.play { background: var(--accent); color: #04121f; box-shadow: 0 0 14px var(--glow); transform: scale(0.94); }
  .seq-cell.play .sidx { color: rgba(4,18,31,0.65); }

  .seq-tracks { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 2px; }
  .seq-tracks .strack {
    flex: 0 0 auto; display: flex; align-items: center; gap: 6px;
    background: var(--panel-2); border: 1px solid var(--border); border-left: 3px solid var(--tc, var(--accent));
    border-radius: 9px; padding: 7px 10px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;
  }
  .seq-tracks .strack.active { border-color: var(--accent); box-shadow: 0 0 10px var(--glow); }
  .seq-tracks .strack.muted { opacity: 0.45; }
  .seq-tracks .strack .tdot { width: 9px; height: 9px; border-radius: 50%; background: var(--tc, var(--accent)); }
  .seq-tracks .add-track {
    flex: 0 0 auto; background: transparent; border: 1px dashed var(--border); color: var(--muted);
    border-radius: 9px; padding: 7px 12px; font-size: 14px; font-weight: 700; cursor: pointer;
  }
  .seq-tracks .add-track:hover { border-color: var(--accent); color: var(--accent); }
  .seq-tracks .trm { margin-left: 2px; color: var(--muted); font-size: 11px; padding: 0 2px; border-radius: 4px; }
  .seq-tracks .trm:hover { color: #ff6b6b; background: rgba(255,107,107,0.12); }

  /* Synth Designer modal */
  .modal {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.72); backdrop-filter: blur(3px);
    display: flex; align-items: center; justify-content: center; padding: 16px;
  }
  .modal.hidden { display: none; }
  .modal-card {
    background: var(--panel); border: 1px solid var(--border); border-radius: 16px;
    width: 100%; max-width: 860px; max-height: 92vh; overflow: auto; padding: 14px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  }
  .modal-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
  .modal-head input, .modal-head select {
    background: var(--panel-2); color: var(--text); border: 1px solid var(--border);
    border-radius: 8px; padding: 7px 9px; font-family: inherit; font-size: 12px; font-weight: 600;
  }
  .synth-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  @media (max-width: 620px) { .synth-grid { grid-template-columns: 1fr; } }
  .synth-sec { background: var(--panel-2); border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; }
  .synth-sec .sec-title { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--accent); font-weight: 700; margin-bottom: 8px; }
  .synth-ctrl { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
  .synth-ctrl > label { font-size: 11px; color: var(--muted); width: 70px; flex: 0 0 auto; }
  .synth-ctrl input[type=range] { flex: 1 1 auto; }
  .synth-ctrl select {
    flex: 1 1 auto; background: var(--bg); color: var(--text); border: 1px solid var(--border);
    border-radius: 8px; padding: 5px 8px; font-family: inherit; font-size: 12px; font-weight: 600;
  }
  .synth-ctrl .cval { font-size: 11px; font-weight: 700; color: var(--accent-2); width: 48px; text-align: right; flex: 0 0 auto; }

  .accent-grid { display: grid; grid-template-columns: repeat(16, 1fr); gap: 4px; }
  @media (max-width: 620px) { .accent-grid { grid-template-columns: repeat(8, 1fr); } }
  .accent-grid .acc {
    aspect-ratio: 1 / 1.4; border-radius: 6px; border: 1px solid var(--border);
    background: var(--bg); color: var(--muted); cursor: pointer; user-select: none;
    display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700;
  }
  .accent-grid .acc.normal { color: var(--text); background: var(--panel-2); }
  .accent-grid .acc.accent { color: #04121f; background: var(--accent); box-shadow: 0 0 8px var(--glow); }
  .accent-grid .acc.ghost  { color: var(--muted); background: #1a1a1d; }
  .accent-grid .acc.silent { color: #5a3030; background: #241416; border-style: dashed; }
</style>
</head>
<body>
  <!-- Tap-to-start: unlocks audio (browsers require a gesture) so the first pad always sounds -->
  <div id="startOverlay">
    <div class="start-card">
      <div class="start-dot"></div>
      <div class="start-title">PocketChord</div>
      <div class="start-sub">Tap a button to play a chord Â· hold to sustain</div>
      <button class="start-btn" id="startBtn">â–¶ Tap to start</button>
      <div class="start-loading" id="startLoading"></div>
    </div>
  </div>

  <div id="toast"></div>

  <div class="wrap">
  <!-- Top bar: title Â· display Â· status Â· transport-safety -->
  <div class="topbar">
    <h1><span class="dot"></span> PocketChord</h1>
    <div class="oled" id="display">
      <div class="oled-side">
        <span id="dispKey">C maj</span>
        <span class="oled-deg" id="dispDeg">I</span>
      </div>
      <div class="oled-main" id="dispChord">â€”</div>
      <div class="oled-side oled-flags" id="dispFlags"></div>
    </div>
    <div class="status" id="midiStatus" title="Tap to scan MIDI"><span class="led"></span><span id="midiText">MIDIâ€¦</span></div>
    <button class="chip" id="themeBtn" title="Toggle light / dark">ðŸŒ™</button>
    <button class="chip" id="panic" style="background:#3a1414;border-color:#5e1f1f;color:#ffb3b3;">â¹ Off</button>
    <button class="chip" id="enableAudio">ðŸ”Š Enable</button>
  </div>

  <!-- Real-time keyboard visualization -->
  <div class="kbd" id="kbd"></div>

  <div class="board">
    <!-- ===== Column A â€” sound shaping ===== -->
    <div class="col">
      <!-- Key + Type -->
      <div class="panel">
        <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div class="label" style="margin:0;">Key</div>
          <div class="row" id="modeRow" style="flex:0 0 auto;"></div>
        </div>
        <div class="scroller" id="keyScroller"></div>
        <div class="label" style="margin-top:10px;">Chord Type</div>
        <div class="row" id="typeRow"></div>
      </div>

      <!-- Instrument + Volume -->
      <div class="panel">
        <div class="grid2">
          <div class="stack">
            <div class="label">Instrument (live)</div>
            <div class="row" style="gap:6px;flex-wrap:nowrap;">
              <select id="instrument" style="flex:1 1 auto;min-width:0;">
                <option value="piano">ðŸŽ¹ Piano</option>
                <option value="pad">ðŸŒ«ï¸ Warm Pad</option>
                <option value="epiano">ðŸŽ›ï¸ Electric Piano</option>
                <option value="strings">ðŸŽ» Strings</option>
                <option value="lead">âš¡ Synth Lead</option>
                <option value="organ">ðŸª— Organ</option>
                <option value="custom">ðŸŽšï¸ Custom Synth</option>
              </select>
              <button class="toggle small" id="editSynth" title="Open Synth Designer">âš™</button>
            </div>
          </div>
          <div class="stack">
            <div class="label">Master Volume</div>
            <div class="knob-wrap">
              <input type="range" id="volume" min="-40" max="6" value="-8" step="1" />
              <span class="val" id="volVal">-8</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Effects + Octave + Inversion -->
      <div class="panel">
        <div class="label">Effects</div>
        <div class="row" style="margin-bottom:10px;">
          <button class="toggle" id="fxReverb">Reverb</button>
          <button class="toggle" id="fxDelay">Delay</button>
          <button class="toggle" id="fxChorus">Chorus</button>
          <button class="toggle" id="fxStrum">Strum</button>
          <button class="toggle" id="fxBass">Bass</button>
        </div>
        <div class="grid2">
          <div class="stack">
            <div class="label">Octave <span id="octVal" class="val" style="color:var(--accent-2)">0</span></div>
            <div class="row">
              <button class="toggle small" id="octDown">âˆ’</button>
              <button class="toggle small" id="octUp">+</button>
            </div>
          </div>
          <div class="stack">
            <div class="label">Inversion</div>
            <div class="row" id="invRow"></div>
          </div>
        </div>
        <div class="grid2" style="margin-top:10px;">
          <div class="stack">
            <div class="label">Voicing</div>
            <select id="voicingSel">
              <option value="close">Close</option>
              <option value="open">Open</option>
              <option value="drop2">Drop-2</option>
              <option value="drop3">Drop-3</option>
              <option value="wide">Wide</option>
              <option value="piano">Piano</option>
              <option value="guitar">Guitar</option>
              <option value="strings">Strings</option>
            </select>
          </div>
          <div class="stack">
            <div class="label">Strum dir / speed</div>
            <div class="row" style="gap:6px;flex-wrap:nowrap;">
              <select id="strumDir" style="flex:1 1 auto;min-width:0;">
                <option value="down">Down</option>
                <option value="up">Up</option>
                <option value="alt">Alt</option>
                <option value="random">Rnd</option>
              </select>
              <input type="range" id="strumSpeed" min="4" max="60" step="1" value="18" style="flex:1 1 auto;min-width:0;" />
            </div>
          </div>
        </div>
      </div>

      <!-- Arpeggiator -->
      <div class="panel">
        <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div class="label" style="margin:0;">Arpeggiator</div>
          <div class="row" style="flex:0 0 auto;gap:6px;">
            <button class="toggle small" id="arpEdit" title="Open Arp Designer">âš™</button>
            <button class="toggle small" id="arpOn">Off</button>
          </div>
        </div>
        <div class="grid2">
          <div class="stack">
            <div class="label">Pattern</div>
            <select id="arpPatternSel"></select>
          </div>
          <div class="stack">
            <div class="label">Rate</div>
            <div class="row" id="arpRate"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Column B â€” play ===== -->
    <div class="col">
      <!-- Chord pads -->
      <div class="panel">
        <div class="chords" id="chords"></div>
      </div>

      <!-- Tempo + Metronome -->
      <div class="panel">
        <div class="grid2">
          <div class="stack">
            <div class="label">Tempo <span id="bpmVal" class="val" style="color:var(--accent-2)">100</span> BPM</div>
            <div class="knob-wrap">
              <input type="range" id="bpm" min="50" max="200" value="100" step="1" />
            </div>
          </div>
          <div class="stack">
            <div class="label">Metronome / Tap</div>
            <div class="row">
              <button class="toggle" id="metro">ðŸ”‡ Off</button>
              <button class="toggle" id="tapTempo">Tap</button>
            </div>
          </div>
        </div>
        <div class="beat-dots" id="beatDots" style="margin-top:10px;"></div>
        <div class="label" style="margin-top:10px;">Performance</div>
        <div class="row">
          <button class="toggle" id="latchBtn">Latch</button>
          <button class="toggle" id="sustainBtn">Sustain</button>
        </div>
      </div>
    </div>

    <!-- ===== Column C â€” arrange ===== -->
    <div class="col">
      <!-- Looper -->
      <div class="panel">
        <div class="label">Looper <span id="loopInfo" style="color:var(--muted);text-transform:none;letter-spacing:0;">â€” empty</span></div>
        <div class="playhead" id="playhead"><div class="playhead-fill" id="playheadFill"></div></div>
        <div class="row" style="margin-bottom:8px;">
          <button class="toggle" id="loopRec"><span class="rec-dot" style="display:inline-block;margin-right:6px;vertical-align:middle;"></span>Record</button>
          <button class="toggle" id="loopPlay">â–¶ Play</button>
          <button class="toggle" id="loopClear">Clear</button>
        </div>
        <div class="row">
          <div class="stack" style="flex:1 1 auto;">
            <div class="label">Length</div>
            <select id="loopBars">
              <option value="1">1 bar</option>
              <option value="2">2 bars</option>
              <option value="4" selected>4 bars</option>
              <option value="8">8 bars</option>
            </select>
          </div>
          <div class="stack" style="flex:0 0 auto;">
            <div class="label">Options</div>
            <div class="row">
              <button class="toggle small on" id="quantize">âŒ— Quantize</button>
              <button class="toggle small on" id="countin">Count-in</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step Sequencer -->
      <div class="panel">
        <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div class="label" style="margin:0;">Chord Sequencer</div>
          <div class="row" style="flex:0 0 auto;">
            <button class="toggle small" id="seqEdit">âœŽ Edit</button>
            <button class="toggle small" id="seqPlay">â–¶ Play</button>
          </div>
        </div>
        <div class="seq-tracks" id="seqTracks"></div>
        <div class="row seq-track-ctrl" style="margin:8px 0 10px;">
          <select id="trackInst" style="flex:1 1 auto;">
            <option value="piano">ðŸŽ¹ Piano</option>
            <option value="pad">ðŸŒ«ï¸ Warm Pad</option>
            <option value="epiano">ðŸŽ›ï¸ Electric Piano</option>
            <option value="strings">ðŸŽ» Strings</option>
            <option value="lead">âš¡ Synth Lead</option>
            <option value="organ">ðŸª— Organ</option>
            <option value="custom">ðŸŽšï¸ Custom Synth</option>
          </select>
          <button class="toggle small" id="trackMute">Mute</button>
          <div class="row" style="flex:0 0 auto;align-items:center;gap:4px;">
            <span class="label" style="margin:0;">Oct</span>
            <button class="toggle small" id="trackOctDown">âˆ’</button>
            <span class="val" id="trackOct" style="min-width:22px;color:var(--accent-2)">0</span>
            <button class="toggle small" id="trackOctUp">+</button>
          </div>
        </div>
        <div class="seq-grid" id="seqGrid"></div>
        <div class="row" style="margin-top:10px;">
          <div class="stack" style="flex:1 1 auto;">
            <div class="label">Steps</div>
            <div class="row" id="seqLen"></div>
          </div>
          <div class="stack" style="flex:1 1 auto;">
            <div class="label">Step rate</div>
            <div class="row" id="seqRate"></div>
          </div>
          <div class="stack" style="flex:0 0 auto;">
            <div class="label">Cursor</div>
            <div class="row">
              <button class="toggle small" id="seqRest">Rest â†’</button>
              <button class="toggle small" id="seqClear">Clear</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>

  <!-- Synth Designer modal -->
  <div class="modal hidden" id="synthModal">
    <div class="modal-card">
      <div class="modal-head">
        <div class="label" style="margin:0;font-size:13px;">ðŸŽšï¸ Synth Designer</div>
        <div class="row" style="flex:0 0 auto;gap:6px;">
          <input id="presetName" placeholder="preset name" style="width:120px;" />
          <button class="toggle small" id="presetSave">Save</button>
          <select id="presetList" style="flex:0 0 auto;min-width:90px;"><option value="">Loadâ€¦</option></select>
          <button class="toggle small" id="presetExport">â¬‡ JSON</button>
          <button class="toggle small" id="presetImport">â¬† JSON</button>
          <input type="file" id="presetFile" accept="application/json" style="display:none;" />
          <button class="toggle small" id="presetInit">Init</button>
          <button class="chip" id="synthClose">âœ•</button>
        </div>
      </div>
      <div class="synth-grid" id="synthGrid"></div>
    </div>
  </div>

  <!-- Arp Designer modal -->
  <div class="modal hidden" id="arpModal">
    <div class="modal-card">
      <div class="modal-head">
        <div class="label" style="margin:0;font-size:13px;">ðŸŽ›ï¸ Arpeggiator</div>
        <div class="row" style="flex:0 0 auto;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
          <input id="arpPresetName" placeholder="preset name" style="width:108px;" />
          <button class="toggle small" id="arpPresetSave">Save</button>
          <select id="arpPresetList" style="min-width:84px;"><option value="">Loadâ€¦</option></select>
          <button class="toggle small" id="arpPresetDelete" title="Delete selected">ðŸ—‘</button>
          <button class="toggle small" id="arpPresetExport" title="Export JSON">â¬‡</button>
          <button class="toggle small" id="arpPresetImport" title="Import JSON">â¬†</button>
          <input type="file" id="arpPresetFile" accept="application/json" style="display:none;" />
          <button class="toggle small" id="arpModalOn">Off</button>
          <button class="chip" id="arpClose">âœ•</button>
        </div>
      </div>
      <div class="synth-grid" id="arpGrid"></div>
      <div class="synth-sec" style="margin-top:10px;">
        <div class="sec-title">Accent / Step pattern <span style="color:var(--muted);text-transform:none;letter-spacing:0;font-weight:400;">â€” click to cycle: Normal Â· Accent Â· ghost Â· â€”silentâ€”</span></div>
        <div class="accent-grid" id="accentGrid"></div>
      </div>
    </div>
  </div>

<script>
/* ============================================================
   PocketChord â€” single-file HiChord-style chord synth
   ============================================================ */

const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
// 7-note scales/modes (intervals from root). Triad qualities + roman labels are derived.
const MODE_DEFS = {
  major:        { label: 'Major',         intervals: [0, 2, 4, 5, 7, 9, 11] },
  minor:        { label: 'Minor',         intervals: [0, 2, 3, 5, 7, 8, 10] },
  harmonicMinor:{ label: 'Harmonic Minor',intervals: [0, 2, 3, 5, 7, 8, 11] },
  melodicMinor: { label: 'Melodic Minor', intervals: [0, 2, 3, 5, 7, 9, 11] },
  dorian:       { label: 'Dorian',        intervals: [0, 2, 3, 5, 7, 9, 10] },
  phrygian:     { label: 'Phrygian',      intervals: [0, 1, 3, 5, 7, 8, 10] },
  lydian:       { label: 'Lydian',        intervals: [0, 2, 4, 6, 7, 9, 11] },
  mixolydian:   { label: 'Mixolydian',    intervals: [0, 2, 4, 5, 7, 9, 10] },
};
const ROMAN_BASE = ['I','II','III','IV','V','VI','VII'];
// Derive the diatonic triad quality at a degree from the scale's interval set.
function triadQualityFromIntervals(intervals, deg) {
  const at = (i) => intervals[i % 7] + 12 * Math.floor(i / 7);
  const root = at(deg), third = at(deg + 2), fifth = at(deg + 4);
  const t = ((third - root) % 12 + 12) % 12, f = ((fifth - root) % 12 + 12) % 12;
  if (t === 4 && f === 7) return 'maj';
  if (t === 3 && f === 7) return 'min';
  if (t === 3 && f === 6) return 'dim';
  if (t === 4 && f === 8) return 'aug';
  return 'maj';
}
const SCALES = {};
for (const [name, def] of Object.entries(MODE_DEFS)) {
  const qualities = def.intervals.map((_, d) => triadQualityFromIntervals(def.intervals, d));
  const roman = qualities.map((q, i) => {
    let r = ROMAN_BASE[i];
    if (q === 'min' || q === 'dim') r = r.toLowerCase();
    if (q === 'dim') r += 'Â°'; else if (q === 'aug') r += '+';
    return r;
  });
  SCALES[name] = { intervals: def.intervals, qualities, roman, label: def.label };
}
function scale() { return SCALES[state.mode] || SCALES.major; }

// Build chord intervals from the scale-degree quality + selected chord type.
// Returns semitone offsets from the chord root.
function chordIntervals(quality, type) {
  switch (type) {
    case 'sus2': return [0, 2, 7];
    case 'sus4': return [0, 5, 7];
    case '7th':
      if (quality === 'maj') return [0, 4, 7, 11];           // maj7
      if (quality === 'min') return [0, 3, 7, 10];           // min7
      if (quality === 'aug') return [0, 4, 8, 11];           // augMaj7
      return [0, 3, 6, 10];                                  // dim -> m7b5
    case '9th':
      if (quality === 'maj') return [0, 4, 7, 11, 14];       // maj9
      if (quality === 'min') return [0, 3, 7, 10, 14];       // min9
      if (quality === 'aug') return [0, 4, 8, 11, 14];       // aug9
      return [0, 3, 6, 10, 14];                              // dim9-ish
    case 'triad':
    default:
      if (quality === 'maj') return [0, 4, 7];
      if (quality === 'min') return [0, 3, 7];
      if (quality === 'aug') return [0, 4, 8];               // augmented
      return [0, 3, 6];                                      // dim
  }
}

// In a major key the V chord becomes dominant when using 7th/9th (degree index 4).
function isDominant(degreeIndex, type) {
  return state.mode === 'major' && degreeIndex === 4 && (type === '7th' || type === '9th');
}
function degreeQuality(degreeIndex) { return scale().qualities[degreeIndex]; }
function intervalsFor(degreeIndex, type) {
  if (isDominant(degreeIndex, type)) {
    return type === '9th' ? [0, 4, 7, 10, 14] : [0, 4, 7, 10];
  }
  return chordIntervals(degreeQuality(degreeIndex), type);
}

// Human-readable chord name
function chordName(rootName, degreeIndex, type) {
  const q = degreeQuality(degreeIndex);
  const dom = isDominant(degreeIndex, type);
  if (type === 'sus2') return rootName + 'sus2';
  if (type === 'sus4') return rootName + 'sus4';
  if (type === 'triad') {
    if (q === 'maj') return rootName + 'maj';
    if (q === 'min') return rootName + 'min';
    if (q === 'aug') return rootName + 'aug';
    return rootName + 'dim';
  }
  if (type === '7th') {
    if (dom) return rootName + '7';
    if (q === 'maj') return rootName + 'maj7';
    if (q === 'min') return rootName + 'min7';
    if (q === 'aug') return rootName + 'augMaj7';
    return rootName + 'm7â™­5';
  }
  if (type === '9th') {
    if (dom) return rootName + '9';
    if (q === 'maj') return rootName + 'maj9';
    if (q === 'min') return rootName + 'min9';
    if (q === 'aug') return rootName + 'aug9';
    return rootName + 'dim9';
  }
  return rootName;
}

/* ---------- App state ---------- */
const state = {
  keyIndex: 0,        // 0 = C
  mode: 'major',      // 'major' | 'minor'
  type: 'triad',
  octaveShift: 0,     // -2..+2
  inversion: 0,       // 0 root, 1 first, 2 second
  voicing: 'close',   // close|open|drop2|drop3|wide|piano|guitar|strings
  instrument: 'epiano',   // instant synth default (piano streams samples â€” opt-in)
  strum: false,
  strumDir: 'down',   // down|up|alt|random
  strumSpeed: 18,     // ms between notes
  strumFlip: false,   // internal: alternate toggle
  latch: false,       // chord stays held after release; new press replaces
  sustain: false,     // pedal: releases are ignored; presses accumulate
  bass: false,
  fx: { reverb: false, delay: false, chorus: false },
  arp: {
    on: false, pattern: 'up', rate: '8n',
    octave: '0',                 // 0 | 1 | 2 | 3 | down | alt | ping
    gate: 0.7, legato: false,    // gate 0.1..1
    velMode: 'fixed', baseVel: 0.85,   // fixed|accent|cresc|decresc|random|human
    swing: 0,                    // 0..0.6 (delay of off-beats)
    humTime: 0, humVel: 0, humGate: 0, // 0..1 humanize amounts
    probability: 100,            // 0..100 global chance per step
    accent: new Array(16).fill('normal'),  // per-step: normal|accent|ghost|silent
    euclid: { steps: 16, pulses: 8, rotation: 0 },
    bassSplit: false, bassOctave: -1,  // hold root low while arpeggiating the rest
    melodyHold: false,                 // hold the top note while arpeggiating the rest
    ratchet: 1,                        // adaptive density: hits per step (1..3)
  },
  audioReady: false,
};

/* ---------- Compute MIDI notes for a chord ---------- */
const BASE_MIDI_C4 = 60;
function chordMidiNotes(degreeIndex) {
  // Chord root = key root (C4 + keyIndex) + scale-degree interval, plus octave shift.
  let rootMidi = BASE_MIDI_C4 + state.keyIndex + scale().intervals[degreeIndex];
  rootMidi += state.octaveShift * 12;

  const ivs = intervalsFor(degreeIndex, state.type);
  let notes = ivs.map(iv => rootMidi + iv);

  // inversions: move lowest N notes up an octave
  for (let i = 0; i < state.inversion && i < notes.length - 1; i++) {
    notes[i] += 12;
  }
  notes.sort((a, b) => a - b);
  notes = applyVoicing(notes);
  // bass note: add the root an octave below
  if (state.bass) notes.push(rootMidi - 12);
  notes = [...new Set(notes)].sort((a, b) => a - b);
  return notes;
}
// Re-voice a sorted chord (MIDI numbers) by spreading notes across octaves.
function applyVoicing(notes) {
  let n = notes.slice();
  const top = n.length - 1;
  switch (state.voicing) {
    case 'open':                                  // lift the 2nd-from-bottom an octave
      if (n.length >= 3) n[1] += 12; break;
    case 'drop2':                                 // 2nd voice from the top down an octave
      if (n.length >= 2) n[top - 1] -= 12; break;
    case 'drop3':                                 // 3rd voice from the top down an octave
      if (n.length >= 3) n[top - 2] -= 12; break;
    case 'wide':                                  // bottom down, top up â€” very spread
      if (n.length >= 2) { n[0] -= 12; n[top] += 12; } break;
    case 'piano':                                 // bass root + close upper voices
      n.unshift(n[0] - 12); break;
    case 'guitar':                                // low root + doubled root on top
      n.unshift(n[0] - 12); n.push(n[1] + 12); break;
    case 'strings':                               // fan out into octave-separated divisi
      n = n.map((m, i) => m + 12 * Math.floor(i / 2) - 12); break;
    case 'close':
    default: break;
  }
  return n.sort((a, b) => a - b);
}
function midiToNoteName(m) { return Tone.Frequency(m, 'midi').toNote(); }

/* ============================================================
   Synth engine + effects chain
   ============================================================ */
let synth = null;
let reverb, delay, chorus, masterVol;
let fxBuilt = false;

let metroSynth, metroLoop;
function buildFX() {
  // Master bus: volume -> limiter -> destination, so big chords/arps never clip.
  const limiter = new Tone.Limiter(-1).toDestination();
  masterVol = new Tone.Volume(parseFloat(document.getElementById('volume').value)).connect(limiter);
  reverb = new Tone.Reverb({ decay: 1.5, wet: 0 }).connect(masterVol);
  delay  = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.1, wet: 0 }).connect(reverb);
  chorus = new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0 }).connect(delay).start();

  // Metronome: short click, accented downbeat. Dry (bypasses fx), straight to master.
  metroSynth = new Tone.MembraneSynth({
    pitchDecay: 0.008, octaves: 2,
    envelope: { attack: 0.001, decay: 0.14, sustain: 0, release: 0.02 }
  });
  metroSynth.volume.value = -4;
  metroSynth.connect(masterVol);
  metroLoop = new Tone.Loop((time) => {
    const beat = parseInt(Tone.Transport.position.split(':')[1], 10) % 4;
    if (loopState.metro) {
      const accent = beat === 0;
      metroSynth.triggerAttackRelease(accent ? 'C5' : 'G4', '16n', time, accent ? 1 : 0.5);
    }
    Tone.Draw.schedule(() => lightBeat(beat), time);
  }, '4n').start(0);

  buildArp();
  buildSeq();
  fxBuilt = true;
}

/* ============================================================
   Custom subtractive synth engine â€” your own engine.
   Per voice: Osc1 + Osc2 + Sub + Noise -> mix -> Filter -> Amp.
   Filter has its own envelope; an LFO can modulate pitch/filter/amp.
   Presets are plain JSON (portable). Implements the Tone instrument
   subset the app uses, so it drops in like any other instrument.
   ============================================================ */
function defaultSynthParams() {
  return {
    osc1:  { type: 'sawtooth', octave: 0,  detune: 0, level: 0.6 },
    osc2:  { type: 'square',   octave: 0,  detune: 8, level: 0.35 },
    sub:   { type: 'sine',     level: 0.0 },
    noise: { type: 'white',    level: 0.0 },
    filter:{ type: 'lowpass',  cutoff: 2200, res: 3, envAmount: 2.0 }, // envAmount = octaves
    filterEnv: { attack: 0.02, decay: 0.30, sustain: 0.40, release: 0.6 },
    ampEnv:    { attack: 0.01, decay: 0.25, sustain: 0.75, release: 0.7 },
    lfo:   { rate: 5, depth: 0, target: 'off' },  // off | pitch | filter | amp
  };
}
// One shared, live-editable preset; every custom-synth instance reads from it.
// IMPORTANT: keep the SAME object reference (engines capture it) â€” mutate, never reassign.
const customParams = defaultSynthParams();
const customEngines = new Set();
function applyCustomParamsToAll() { customEngines.forEach(e => e.applyParams()); }
function assignParamsDeep(target, src) {
  for (const k in src) {
    if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k])) {
      if (!target[k] || typeof target[k] !== 'object') target[k] = {};
      assignParamsDeep(target[k], src[k]);
    } else target[k] = src[k];
  }
}
// Replace the whole preset in place, then push to every live custom synth.
function loadCustomPreset(p) { assignParamsDeep(customParams, p); applyCustomParamsToAll(); }

function createCustomSynth() {
  const params = customParams;            // shared reference
  const MAX = 8;
  const out = new Tone.Gain(1);
  const vol = new Tone.Volume(0);
  out.connect(vol);
  const lfo = new Tone.LFO({ frequency: params.lfo.rate, min: -1, max: 1 }).start();
  const voices = [];

  function makeVoice() {
    const osc1 = new Tone.OmniOscillator(220, params.osc1.type).start();
    const osc2 = new Tone.OmniOscillator(220, params.osc2.type).start();
    const sub  = new Tone.OmniOscillator(110, params.sub.type).start();
    const noise = new Tone.Noise(params.noise.type).start();
    const g1 = new Tone.Gain(0), g2 = new Tone.Gain(0), gs = new Tone.Gain(0), gn = new Tone.Gain(0);
    const mix = new Tone.Gain(1);
    const filter = new Tone.Filter(2000, params.filter.type);
    filter.frequency.value = 0;                       // driven entirely by the filter envelope
    const amp = new Tone.AmplitudeEnvelope();
    const lfoGain = new Tone.Gain(1);                 // for amp-tremolo LFO target
    const fenv = new Tone.FrequencyEnvelope();
    osc1.connect(g1); osc2.connect(g2); sub.connect(gs); noise.connect(gn);
    g1.connect(mix); g2.connect(mix); gs.connect(mix); gn.connect(mix);
    mix.connect(filter); filter.connect(amp); amp.connect(lfoGain); lfoGain.connect(out);
    fenv.connect(filter.frequency);
    return { osc1, osc2, sub, noise, g1, g2, gs, gn, mix, filter, amp, lfoGain, fenv,
             note: null, busy: false, startedAt: 0, freeTimer: null };
  }
  function applyVoice(v) {
    v.osc1.type = params.osc1.type; v.osc2.type = params.osc2.type; v.sub.type = params.sub.type;
    v.noise.type = params.noise.type;
    v.g1.gain.rampTo(params.osc1.level, 0.02); v.g2.gain.rampTo(params.osc2.level, 0.02);
    v.gs.gain.rampTo(params.sub.level, 0.02);  v.gn.gain.rampTo(params.noise.level, 0.02);
    v.filter.type = params.filter.type; v.filter.Q.rampTo(params.filter.res, 0.02);
    v.fenv.baseFrequency = params.filter.cutoff; v.fenv.octaves = Math.max(0, params.filter.envAmount);
    v.fenv.attack = params.filterEnv.attack; v.fenv.decay = params.filterEnv.decay;
    v.fenv.sustain = params.filterEnv.sustain; v.fenv.release = params.filterEnv.release;
    v.amp.attack = params.ampEnv.attack; v.amp.decay = params.ampEnv.decay;
    v.amp.sustain = params.ampEnv.sustain; v.amp.release = params.ampEnv.release;
  }
  function routeLFO() {
    try { lfo.disconnect(); } catch (_) {}
    voices.forEach(v => { v.lfoGain.gain.value = 1; });
    const t = params.lfo.target, d = params.lfo.depth;
    lfo.frequency.rampTo(params.lfo.rate, 0.05);
    if (t === 'pitch')  { lfo.min = -d * 100;  lfo.max = d * 100;  voices.forEach(v => { lfo.connect(v.osc1.detune); lfo.connect(v.osc2.detune); }); }
    else if (t === 'filter') { lfo.min = -d * 3500; lfo.max = d * 3500; voices.forEach(v => lfo.connect(v.filter.frequency)); }
    else if (t === 'amp') { lfo.min = 0; lfo.max = d; voices.forEach(v => { v.lfoGain.gain.value = 1 - d; lfo.connect(v.lfoGain.gain); }); }
  }
  for (let i = 0; i < MAX; i++) voices.push(makeVoice());
  voices.forEach(applyVoice); routeLFO();

  function alloc(note) {
    let v = voices.find(x => x.note === note && x.busy);
    if (!v) v = voices.find(x => !x.busy);
    if (!v) v = voices.slice().sort((a, b) => a.startedAt - b.startedAt)[0];
    return v;
  }
  function attackVoice(v, note, time, vel, dur) {
    if (v.freeTimer) { clearTimeout(v.freeTimer); v.freeTimer = null; }
    applyVoice(v);
    const f = Tone.Frequency(note).toFrequency();
    v.osc1.frequency.setValueAtTime(f * Math.pow(2, params.osc1.octave), time);
    v.osc1.detune.setValueAtTime(params.osc1.detune, time);
    v.osc2.frequency.setValueAtTime(f * Math.pow(2, params.osc2.octave), time);
    v.osc2.detune.setValueAtTime(params.osc2.detune, time);
    v.sub.frequency.setValueAtTime(f * 0.5, time);
    v.note = note; v.busy = true; v.startedAt = Tone.now();
    if (dur == null) { v.amp.triggerAttack(time, vel); v.fenv.triggerAttack(time); }
    else {
      v.amp.triggerAttackRelease(dur, time, vel); v.fenv.triggerAttackRelease(dur, time);
      const ms = (Tone.Time(dur).toSeconds() + params.ampEnv.release + 0.05) * 1000;
      v.freeTimer = setTimeout(() => { v.busy = false; v.note = null; v.freeTimer = null; }, ms);
    }
  }
  const toArr = n => Array.isArray(n) ? n : [n];

  const engine = {
    volume: vol.volume,
    connect(dest) { vol.connect(dest); return engine; },
    triggerAttack(notes, time, vel = 0.9) {
      const t = time != null ? time : Tone.now();
      toArr(notes).forEach(n => attackVoice(alloc(n), n, t, vel, null));
    },
    triggerRelease(notes, time) {
      const t = time != null ? time : Tone.now();
      toArr(notes).forEach(n => voices.filter(v => v.note === n && v.busy).forEach(v => {
        v.amp.triggerRelease(t); v.fenv.triggerRelease(t); v.busy = false; v.note = null;
      }));
    },
    triggerAttackRelease(notes, dur, time, vel = 0.9) {
      const t = time != null ? time : Tone.now();
      toArr(notes).forEach(n => attackVoice(alloc(n), n, t, vel, dur));
    },
    releaseAll() {
      voices.forEach(v => { if (v.busy) { v.amp.triggerRelease(); v.fenv.triggerRelease(); } v.busy = false; v.note = null; });
    },
    applyParams() { voices.forEach(applyVoice); routeLFO(); },
    dispose() {
      customEngines.delete(engine);
      try { lfo.dispose(); } catch (_) {}
      voices.forEach(v => { if (v.freeTimer) clearTimeout(v.freeTimer);
        [v.osc1, v.osc2, v.sub, v.noise, v.g1, v.g2, v.gs, v.gn, v.mix, v.filter, v.amp, v.lfoGain, v.fenv].forEach(n => { try { n.dispose(); } catch (_) {} }); });
      try { out.dispose(); vol.dispose(); } catch (_) {}
    },
  };
  customEngines.add(engine);
  return engine;
}

function makeSynth(kind, maxVoices = 8) {
  if (kind === 'custom') return createCustomSynth();
  if (kind === 'piano') {
    return new Tone.Sampler({
      urls: {
        'A0':'A0.mp3','C1':'C1.mp3','D#1':'Ds1.mp3','F#1':'Fs1.mp3',
        'A1':'A1.mp3','C2':'C2.mp3','D#2':'Ds2.mp3','F#2':'Fs2.mp3',
        'A2':'A2.mp3','C3':'C3.mp3','D#3':'Ds3.mp3','F#3':'Fs3.mp3',
        'A3':'A3.mp3','C4':'C4.mp3','D#4':'Ds4.mp3','F#4':'Fs4.mp3',
        'A4':'A4.mp3','C5':'C5.mp3','D#5':'Ds5.mp3','F#5':'Fs5.mp3',
        'A5':'A5.mp3','C6':'C6.mp3','D#6':'Ds6.mp3','F#6':'Fs6.mp3',
        'A6':'A6.mp3','C7':'C7.mp3','D#7':'Ds7.mp3','F#7':'Fs7.mp3',
        'A7':'A7.mp3','C8':'C8.mp3'
      },
      release: 1.2,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      onload: () => showToast('ðŸŽ¹ Piano ready')
    });
  }
  if (kind === 'pad') {
    return new Tone.PolySynth(Tone.AMSynth, {
      maxPolyphony: maxVoices,
      harmonicity: 1.5,
      envelope: { attack: 0.6, decay: 0.3, sustain: 0.8, release: 2.5 },
      modulationEnvelope: { attack: 0.8, decay: 0.2, sustain: 0.6, release: 2 },
      oscillator: { type: 'sine' }
    });
  }
  if (kind === 'epiano') {
    return new Tone.PolySynth(Tone.FMSynth, {
      maxPolyphony: maxVoices,
      harmonicity: 3, modulationIndex: 8,
      envelope: { attack: 0.005, decay: 0.6, sustain: 0.1, release: 1.4 },
      modulationEnvelope: { attack: 0.01, decay: 0.4, sustain: 0.0, release: 0.6 }
    });
  }
  if (kind === 'strings') {
    return new Tone.PolySynth(Tone.AMSynth, {
      maxPolyphony: maxVoices,
      harmonicity: 2,
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.9, decay: 0.3, sustain: 0.9, release: 1.8 }
    });
  }
  if (kind === 'lead') {
    return new Tone.PolySynth(Tone.Synth, {
      maxPolyphony: maxVoices,
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.02, decay: 0.2, sustain: 0.6, release: 0.6 }
    });
  }
  if (kind === 'organ') {
    return new Tone.PolySynth(Tone.Synth, {
      maxPolyphony: maxVoices,
      oscillator: { type: 'fatsawtooth', count: 3, spread: 20 },
      envelope: { attack: 0.01, decay: 0.0, sustain: 1.0, release: 0.25 }
    });
  }
  return new Tone.PolySynth(Tone.Synth, { maxPolyphony: 8 });
}

function loadInstrument(kind) {
  if (!fxBuilt) buildFX();
  if (synth) { try { synth.releaseAll && synth.releaseAll(); } catch(e){} synth.dispose(); }
  synth = makeSynth(kind);
  synth.volume.value = 0;
  synth.connect(chorus);
  if (kind === 'piano' && synth.loaded === false) showToast('ðŸŽ¹ Loading piano samplesâ€¦', 0);
}

let _toastTimer = null;
function showToast(msg, ms = 1600) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  if (ms > 0) _toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

/* ============================================================
   Playing chords
   ============================================================ */
const heldChords = new Map(); // degreeIndex -> note names currently sounding
const strumTimeouts = new Map(); // degreeIndex -> array of setTimeout IDs for strum attacks

// Order chord notes for strumming by direction (down = low->high, up = high->low).
function strumNotes(notes) {
  let dir = state.strumDir;
  if (dir === 'alt') { state.strumFlip = !state.strumFlip; dir = state.strumFlip ? 'up' : 'down'; }
  if (dir === 'random') { const a = notes.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
  return dir === 'up' ? notes.slice().reverse() : notes.slice();
}

function playChord(degreeIndex, velocity = 0.9) {
  if (!state.audioReady || !synth) return;
  if (state.latch && heldChords.has(degreeIndex)) { releaseChord(degreeIndex, true); return; } // latch: re-press toggles off
  if (state.latch) [...heldChords.keys()].forEach(d => { if (d !== degreeIndex) releaseChord(d, true); }); // latch: replace others
  if (heldChords.has(degreeIndex)) return; // already held
  const notes = chordMidiNotes(degreeIndex).map(midiToNoteName);
  heldChords.set(degreeIndex, notes);

  if (state.arp.on) {
    // Arp mode: don't sustain â€” the arp loop reads heldChords and plays one note per tick.
    arpReset();
    syncTransport();
  } else if (state.strum) {
    // Original strum: schedule note attacks with delays. Track timeouts so we can cancel
    // pending attacks if the chord is released early (prevents stuck notes on fast re-press).
    const timeoutIds = strumNotes(notes).map((n, i) =>
      setTimeout(() => synth.triggerAttack(n, undefined, velocity), i * state.strumSpeed)
    );
    strumTimeouts.set(degreeIndex, timeoutIds);
  } else {
    synth.triggerAttack(notes, undefined, velocity);
  }
  updateDisplay(degreeIndex);
  recordChordStart(degreeIndex, velocity);
  seqWrite(degreeIndex);
  setHeldVisual(degreeIndex, true);
  updateKeyboard();
}

// `force` releases even in latch/sustain mode (used by panic, latch-replace, toggling off).
function releaseChord(degreeIndex, force) {
  if (!heldChords.has(degreeIndex)) return;
  if ((state.latch || state.sustain) && !force) return; // hold/latch/sustain: ignore the key-up
  const notes = heldChords.get(degreeIndex);
  // Cancel any pending strum attacks for this degree (so fast re-presses don't orphan notes).
  if (strumTimeouts.has(degreeIndex)) {
    strumTimeouts.get(degreeIndex).forEach(id => clearTimeout(id));
    strumTimeouts.delete(degreeIndex);
  }
  if (synth && !state.arp.on) synth.triggerRelease(notes);
  heldChords.delete(degreeIndex);
  recordChordEnd(degreeIndex);
  if (state.arp.on) syncTransport();
  setHeldVisual(degreeIndex, false);
  updateKeyboard();
  // Once nothing is held, flush any orphaned voice left by a rapid same-chord
  // retrigger (PolySynth voice-steal â€” worst on sustaining sounds like Organ).
  // Legit release tails are already releasing, so re-releasing them is a no-op.
  if (synth && synth.releaseAll && !state.arp.on && heldChords.size === 0) {
    try { synth.releaseAll(); } catch (_) {}
  }
}

// Loop playback path: schedule a finished chord (attack+release) at an exact audio time.
function triggerChordAt(degreeIndex, velocity, dur, time) {
  if (!synth) return;
  const notes = chordMidiNotes(degreeIndex).map(midiToNoteName);
  if (state.strum) {
    notes.forEach((n, i) => synth.triggerAttackRelease(n, dur, time + i * 0.03, velocity));
  } else {
    synth.triggerAttackRelease(notes, dur, time, velocity);
  }
  Tone.Draw.schedule(() => flashButton(degreeIndex), time);
}
function flashButton(degreeIndex) {
  const el = document.querySelector('.chord-btn[data-deg="' + degreeIndex + '"]');
  if (!el) return;
  el.classList.add('held');
  setTimeout(() => { if (!heldChords.has(degreeIndex)) el.classList.remove('held'); }, 130);
}

function setHeldVisual(degreeIndex, on) {
  const el = document.querySelector('.chord-btn[data-deg="'+degreeIndex+'"]');
  if (el) el.classList.toggle('held', on);
}

// Panic: force-release every held chord + flush any lingering synth voices.
// Safety net for lost pointerup/keyup, window blur, tab hide, or DOM rebuilds.
function releaseAllChords() {
  [...heldChords.keys()].forEach(d => releaseChord(d, true));
  heldChords.clear();
  activePtr.clear();
  for (const k in keyHeld) keyHeld[k] = false;
  try { if (synth && synth.releaseAll) synth.releaseAll(); } catch (_) {}
  for (let d = 0; d < 7; d++) setHeldVisual(d, false);
  updateKeyboard();
}
// keydown/keyup state for the 1â€“7 keyboard shortcuts (declared here so panic can reset it).
const keyHeld = {};

/* ============================================================
   Arpeggiator â€” when on, a transport loop plays held-chord notes
   one at a time, following the selected pattern + rate.
   ============================================================ */
let arpLoop = null, arpStep = 0;
function arpReset() { arpStep = 0; }

// ----- note pools from held chords -----
function heldNoteOrder() {            // notes in the order chords were pressed
  const seen = new Set(), order = [];
  heldChords.forEach(notes => notes.forEach(n => { if (!seen.has(n)) { seen.add(n); order.push(n); } }));
  return order;
}
function heldNotesSorted() {          // notes low -> high
  return heldNoteOrder().slice().sort((a, b) => Tone.Frequency(a).toMidi() - Tone.Frequency(b).toMidi());
}
const transposeNote = (n, semis) => Tone.Frequency(n).transpose(semis).toNote();

function octaveSpec() {
  switch (state.arp.octave) {
    case '1':   return { mode: 'span',  offs: [0, 1] };
    case '2':   return { mode: 'span',  offs: [0, 1, 2] };
    case '3':   return { mode: 'span',  offs: [0, 1, 2, 3] };
    case 'down':return { mode: 'span',  offs: [-1] };
    case 'alt': return { mode: 'multi', offs: [0, 1] };       // whole pattern, alternating octave
    case 'ping':return { mode: 'multi', offs: [0, 1, 2, 1] }; // up the octaves and back
    default:    return { mode: 'span',  offs: [0] };
  }
}
const expandSpan = (base, offs) => offs.reduce((out, o) => out.concat(base.map(n => transposeNote(n, o * 12))), []);

// Order a flat note list into steps per the selected pattern. Each step is an array of notes.
function applyPattern(list) {
  if (!list.length) return [];
  switch (state.arp.pattern) {
    case 'down':      return list.slice().reverse().map(x => [x]);
    case 'updownInc': return list.concat(list.slice().reverse()).map(x => [x]);
    case 'updownEx':  return list.concat(list.slice(1, -1).reverse()).map(x => [x]);
    case 'revorder':  return list.slice().reverse().map(x => [x]);
    case 'order':
    case 'up':
    default:          return list.map(x => [x]);
  }
}
// Figuration patterns = chord-tone index sequences (octave-wrapping). Covers piano
// broken-chord accompaniments and guitar fingerstyle picks.
const FIGURATIONS = {
  alberti:   [0, 2, 1, 2],                 // Alberti bass: low-high-mid-high
  broken:    [0, 1, 2, 1],
  classical: [0, 1, 2, 3, 2, 1],           // classical up-down arpeggio
  ballad:    [0, 2, 1, 2, 0, 2, 1, 2],
  ostinato:  [0, 2, 3, 2, 1, 2, 3, 2],     // cinematic ostinato
  travis:    [0, 2, 1, 3, 0, 2, 1, 3],     // fingerstyle (Travis-like)
  poppick:   [0, 2, 3, 1],
};
// Held notes for the arp, minus any note reserved for bass-split / melody-hold.
function arpPoolNotes(orderBased) {
  const sorted = heldNotesSorted();
  let base = orderBased ? heldNoteOrder() : sorted.slice();
  if (sorted.length > 1) {
    if (state.arp.bassSplit)  base = base.filter(n => n !== sorted[0]);
    if (state.arp.melodyHold) base = base.filter(n => n !== sorted[sorted.length - 1]);
  }
  return base.length ? base : sorted;   // never empty
}
// ---- Phrase generator: a melodic line from chord tones + scale passing/neighbor tones ----
function scalePCs() { return new Set(scale().intervals.map(i => (state.keyIndex + i) % 12)); }
function scaleStep(midi, dir) { const pcs = scalePCs(); let m = midi + dir; for (let k = 0; k < 13 && !pcs.has(((m % 12) + 12) % 12); k++) m += dir; return m; }
function generatePhrase() {
  const tones = heldNotesSorted().map(n => Tone.Frequency(n).toMidi());
  if (!tones.length) return [];
  const len = 8; const steps = []; let cur = tones[Math.floor(Math.random() * tones.length)];
  for (let i = 0; i < len; i++) {
    const r = Math.random();
    if (r < 0.12) { steps.push([]); continue; }                       // rest (rhythmic variation)
    if (r < 0.24) { steps.push([midiToNoteName(cur)]); continue; }      // repeated note
    const c = Math.random();
    if (c < 0.5) {                                                     // move to a chord tone
      const up = Math.random() < 0.6;
      const cand = tones.filter(t => up ? t > cur : t < cur);
      cur = cand.length ? (up ? Math.min(...cand) : Math.max(...cand)) : tones[Math.floor(Math.random() * tones.length)];
    } else {                                                           // passing / neighbor tone
      cur = scaleStep(cur, Math.random() < 0.5 ? 1 : -1);
    }
    steps.push([midiToNoteName(cur)]);
  }
  return steps;
}
let _phrase = [], _phraseSig = '';
const phraseSig = () => heldNoteOrder().join(',') + '|' + state.keyIndex + state.mode;
function getPhrase() { const sig = phraseSig(); if (sig !== _phraseSig) { _phraseSig = sig; _phrase = generatePhrase(); } return _phrase; }
function regeneratePhrase() { _phrase = generatePhrase(); _phraseSig = phraseSig(); }

// Build the full step sequence for one loop given held notes + pattern + octave mode.
function buildArpSequence() {
  const p = state.arp.pattern;
  const orderBased = (p === 'order' || p === 'revorder');
  const base = arpPoolNotes(orderBased);
  if (!base.length) return { steps: [], random: false };

  if (p === 'phrase') return { steps: getPhrase(), random: false };
  if (FIGURATIONS[p]) {
    const fig = FIGURATIONS[p], pool = heldNotesSorted();
    const usable = arpPoolNotes(false);   // sorted, minus reserved notes
    const src = usable.length ? usable : pool;
    const steps = fig.map(i => {
      const oct = Math.floor(i / src.length);
      return [transposeNote(src[i % src.length], oct * 12)];
    });
    return { steps, random: false };
  }
  const oc = octaveSpec();
  if (p === 'chord')   return { steps: [expandSpan(base, oc.mode === 'span' ? oc.offs : [0])], random: false };
  if (p === 'lowrep')  return { steps: [[base[0]]], random: false };
  if (p === 'highrep') return { steps: [[base[base.length - 1]]], random: false };
  if (p === 'random')  return { steps: expandSpan(base, oc.offs).map(x => [x]), random: true };
  if (oc.mode === 'span') return { steps: applyPattern(expandSpan(base, oc.offs)), random: false };
  // multi: run the whole pattern once per octave offset
  let steps = [];
  oc.offs.forEach(o => { steps = steps.concat(applyPattern(base.map(n => transposeNote(n, o * 12)))); });
  return { steps, random: false };
}

// Euclidean rhythm: spread `pulses` as evenly as possible over `steps`, then rotate.
function euclid(steps, pulses, rotation) {
  steps = Math.max(1, steps | 0);
  pulses = Math.max(0, Math.min(steps, pulses | 0));
  const pat = [];   // step 0 is always a pulse (when pulses>0); evenly distributed
  for (let i = 0; i < steps; i++) pat.push(((i * pulses) % steps) < pulses ? 1 : 0);
  const r = ((rotation % steps) + steps) % steps;
  return pat.slice(r).concat(pat.slice(0, r));
}

function arpVelocity(posIdx, total) {
  const a = state.arp;
  const pos = total > 1 ? posIdx / (total - 1) : 0;
  let v;
  switch (a.velMode) {
    case 'cresc':   v = 0.35 + 0.6 * pos; break;
    case 'decresc': v = 0.95 - 0.6 * pos; break;
    case 'random':  v = 0.5 + Math.random() * 0.5; break;
    case 'human':   v = a.baseVel + (Math.random() * 2 - 1) * 0.12; break;
    case 'accent':  v = (posIdx % 4 === 0) ? a.baseVel * 1.25 : a.baseVel * 0.78; break;
    case 'fixed':
    default:        v = a.baseVel; break;
  }
  return Math.max(0.05, Math.min(1, v));
}

function buildArp() {
  arpLoop = new Tone.Loop((time) => {
    const a = state.arp;
    if (!a.on || !synth) return;
    const { steps, random } = buildArpSequence();
    if (!steps.length) return;
    const total = steps.length;
    const idx = arpStep; arpStep++;
    const posIdx = idx % total;
    const stepNotes = random ? steps[Math.floor(Math.random() * total)] : steps[posIdx];
    const stepSecBase = Tone.Time(a.rate).toSeconds();

    // Bass-split / melody-hold: sustain a reserved note across each pattern cycle.
    if ((a.bassSplit || a.melodyHold) && posIdx === 0) {
      const sorted = heldNotesSorted();
      if (sorted.length > 1) {
        const holdDur = total * stepSecBase * 0.98;
        if (a.bassSplit)  synth.triggerAttackRelease(transposeNote(sorted[0], a.bassOctave * 12), holdDur, time, 0.85);
        if (a.melodyHold) synth.triggerAttackRelease(sorted[sorted.length - 1], holdDur, time, 0.8);
      }
    }

    const acc = a.accent[idx % a.accent.length];
    if (acc === 'silent') return;
    if (a.probability < 100 && Math.random() * 100 > a.probability) return;

    const stepSec = Tone.Time(a.rate).toSeconds();
    let vel = arpVelocity(posIdx, total);
    if (acc === 'accent') vel = Math.min(1, vel * 1.3);
    else if (acc === 'ghost') vel *= 0.45;
    if (a.humVel) vel = Math.max(0.05, Math.min(1, vel + (Math.random() * 2 - 1) * a.humVel * 0.4));

    let t = time;
    if (a.swing && (idx % 2 === 1)) t += stepSec * a.swing * 0.5;   // delay off-beats
    if (a.humTime) t += (Math.random() * 2 - 1) * a.humTime * 0.02;

    let gate = a.legato ? 1.0 : a.gate;
    if (a.humGate) gate = Math.max(0.05, Math.min(1.3, gate * (1 + (Math.random() * 2 - 1) * a.humGate * 0.4)));
    // Adaptive density: ratchet = multiple hits subdividing the step.
    const rt = Math.max(1, a.ratchet | 0);
    const sub = stepSec / rt;
    const dur = Math.max(0.02, sub * gate);
    for (let k = 0; k < rt; k++) {
      const tk = t + k * sub;
      stepNotes.forEach(n => synth.triggerAttackRelease(n, dur, tk, vel));
    }
    if (stepNotes.length) Tone.Draw.schedule(() => stepNotes.forEach(flashKey), t);
  }, state.arp.rate).start(0);
}

/* ============================================================
   Multi-track step sequencer â€” each track has its own instrument,
   octave, mute, and pattern; all share the transport + harmony.
   A step holds a scale degree (0-6) or null (rest).
   Playback follows the live key/scale/type, so it transposes.
   ============================================================ */
const TRACK_COLORS = ['#2ea7ff', '#ffb23e', '#36d399', '#c77dff'];
const TRACK_DEFAULT_INST = ['piano', 'lead', 'pad', 'strings'];
function makeTrack(i) {
  return { instrument: TRACK_DEFAULT_INST[i] || 'lead', synth: null, steps: new Array(seqState.len).fill(null), muted: false, octave: 0 };
}
const seqState = { len: 16, rate: '8n', playing: false, edit: false, cursor: 0, pos: 0, tracks: [], active: 0 };
seqState.tracks.push(makeTrack(0));
function activeTrack() { return seqState.tracks[seqState.active]; }

let seqLoop = null;
function buildSeq() {
  seqLoop = new Tone.Loop((time) => {
    if (!seqState.playing) return;
    const idx = seqState.pos % seqState.len;
    const dur = Tone.Time(seqState.rate).toSeconds() * 0.92;
    seqState.tracks.forEach(tr => {
      if (tr.muted || !tr.synth) return;
      const deg = tr.steps[idx];
      if (deg == null) return;
      const notes = chordMidiNotes(deg).map(m => midiToNoteName(m + tr.octave * 12));
      tr.synth.triggerAttackRelease(notes, dur, time, 0.9);
    });
    Tone.Draw.schedule(() => seqHighlightPlay(idx), time);
    seqState.pos++;
  }, seqState.rate).start(0);
}
// (Re)create the Tone synth for one track and route it through the fx chain.
function buildTrackSynth(tr) {
  if (!fxBuilt) buildFX();
  if (tr.synth) { try { tr.synth.releaseAll && tr.synth.releaseAll(); } catch(e){} tr.synth.dispose(); }
  tr.synth = makeSynth(tr.instrument, 4);  // Track synths: 4 voices max (conserve CPU with multiple tracks)
  tr.synth.connect(chorus);
}
function buildAllTrackSynths() { seqState.tracks.forEach(buildTrackSynth); }

// Called from playChord when Edit is on â€” writes the played degree to the active track.
function seqWrite(deg) {
  if (!seqState.edit) return;
  activeTrack().steps[seqState.cursor] = deg;
  seqRenderLabels();
  seqState.cursor = (seqState.cursor + 1) % seqState.len;
  seqRefreshCursor();
}

/* ============================================================
   HiChord-style display readout
   ============================================================ */
function updateDisplay(degreeIndex) {
  const keyEl = document.getElementById('dispKey');
  const flagsEl = document.getElementById('dispFlags');
  if (keyEl) keyEl.textContent = NOTES[state.keyIndex] + ' ' + (scale().label || '').slice(0, 5);
  if (flagsEl) {
    const flags = [];
    if (state.arp.on) flags.push('ARP');
    if (state.bass) flags.push('BASS');
    if (state.strum) flags.push('STRUM');
    flagsEl.textContent = flags.join(' ');
  }
  const chordEl = document.getElementById('dispChord');
  const degEl = document.getElementById('dispDeg');
  if (degreeIndex != null && chordEl) {
    const rootName = NOTES[(state.keyIndex + scale().intervals[degreeIndex]) % 12];
    chordEl.textContent = chordName(rootName, degreeIndex, state.type);
    if (degEl) degEl.textContent = scale().roman[degreeIndex];
  }
}

/* ============================================================
   UI building
   ============================================================ */
// Key selector
const keyScroller = document.getElementById('keyScroller');
NOTES.forEach((n, i) => {
  const b = document.createElement('button');
  b.className = 'chip' + (i === state.keyIndex ? ' active' : '');
  b.textContent = n;
  b.onclick = () => {
    state.keyIndex = i;
    [...keyScroller.children].forEach((c, j) => c.classList.toggle('active', j === i));
    refreshChords();
    updateDisplay();
  };
  keyScroller.appendChild(b);
});

// Scale selector â€” Major/Minor + modes. Chords, arp and sequencer all follow it.
const modeRow = document.getElementById('modeRow');
const modeSel = document.createElement('select');
Object.entries(MODE_DEFS).forEach(([val, def]) => {
  const o = document.createElement('option'); o.value = val; o.textContent = def.label; modeSel.appendChild(o);
});
modeSel.value = state.mode;
modeSel.onchange = () => { state.mode = modeSel.value; refreshChords(); updateDisplay(); };
modeRow.appendChild(modeSel);

// Type selector
const TYPES = [['triad','Triad'],['7th','7th'],['9th','9th'],['sus2','Sus2'],['sus4','Sus4']];
const typeRow = document.getElementById('typeRow');
TYPES.forEach(([val, lbl]) => {
  const b = document.createElement('button');
  b.className = 'chip amber' + (val === state.type ? ' active' : '');
  b.textContent = lbl;
  b.onclick = () => {
    state.type = val;
    [...typeRow.children].forEach(c => c.classList.toggle('active', c.textContent === lbl));
    refreshChords();
    updateDisplay();
  };
  typeRow.appendChild(b);
});

// Inversion selector
const invRow = document.getElementById('invRow');
['Root','1st','2nd'].forEach((lbl, i) => {
  const b = document.createElement('button');
  b.className = 'toggle small' + (i === 0 ? ' on' : '');
  b.textContent = lbl;
  b.onclick = () => {
    state.inversion = i;
    [...invRow.children].forEach((c, j) => c.classList.toggle('on', j === i));
    revoiceHeldChords();
  };
  invRow.appendChild(b);
});

// Chord buttons. Built ONCE; key/mode/type changes only relabel + re-voice in place,
// so a held button keeps its pointer capture (no rebuild = no stuck/cut notes) and the
// sounding chord morphs to the new key/type continuously.
const chordsEl = document.getElementById('chords');
function buildChordButtons() {
  chordsEl.innerHTML = '';
  for (let d = 0; d < 7; d++) {
    const btn = document.createElement('div');
    btn.className = 'chord-btn' + (d === 6 ? ' span2' : '');
    btn.dataset.deg = d;
    btn.innerHTML = '<span class="deg"></span><span class="name"></span>';
    attachChordHandlers(btn, d);
    chordsEl.appendChild(btn);
  }
  updateChordLabels();
}
function updateChordLabels() {
  [...chordsEl.children].forEach((btn, d) => {
    const rootName = NOTES[(state.keyIndex + scale().intervals[d]) % 12];
    btn.querySelector('.deg').textContent = scale().roman[d];
    btn.querySelector('.name').textContent = chordName(rootName, d, state.type);
    btn.classList.toggle('held', heldChords.has(d));
  });
  if (typeof seqGrid !== 'undefined' && seqGrid.children.length) seqRenderLabels();
}
// Re-voice every held chord to the CURRENT key/mode/type/octave/inversion/bass.
// Diffs old vs new notes so common tones keep ringing (smooth, glitch-free morph).
function revoiceHeldChords() {
  if (!heldChords.size) return;
  heldChords.forEach((oldNotes, d) => {
    const newNotes = chordMidiNotes(d).map(midiToNoteName);
    if (!state.arp.on && synth) {
      const oldSet = new Set(oldNotes), newSet = new Set(newNotes);
      const toRelease = oldNotes.filter(n => !newSet.has(n));
      const toAttack = newNotes.filter(n => !oldSet.has(n));
      if (toRelease.length) synth.triggerRelease(toRelease);
      if (toAttack.length) synth.triggerAttack(toAttack, undefined, 0.9);
    }
    heldChords.set(d, newNotes);   // arp mode: loop picks up the new notes automatically
  });
}
// Relabel + re-voice together â€” call after any voicing-affecting control change.
function refreshChords() { updateChordLabels(); revoiceHeldChords(); }

// Map every active pointerId to the degree it pressed. Release is driven by a
// WINDOW-level pointerup/pointercancel keyed by that id â€” which is far harder to
// lose than an element's own event, so rapid double-taps can't leave a stuck note.
const activePtr = new Map(); // pointerId -> degreeIndex
function attachChordHandlers(btn, degreeIndex) {
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    ensureAudio();
    // Self-heal: if this degree is somehow still held (a previous up was dropped),
    // release it first so a fast re-press always restarts cleanly instead of sticking.
    if (heldChords.has(degreeIndex)) releaseChord(degreeIndex);
    activePtr.set(e.pointerId, degreeIndex);
    playChord(degreeIndex);
  });
}
// One global release path for ALL chord pointers, wherever they end.
function endChordPointer(e) {
  if (!activePtr.has(e.pointerId)) return;
  const d = activePtr.get(e.pointerId);
  activePtr.delete(e.pointerId);
  releaseChord(d);
}
window.addEventListener('pointerup', endChordPointer);
window.addEventListener('pointercancel', endChordPointer);

// Hardware safety net: a fast double-tap can make the browser swallow a pointer's
// up/cancel entirely, leaving a stuck note. touchend/touchcancel/mouseup reflect the
// PHYSICAL release, so when nothing is actually pressed any longer, force-release every
// lingering pointer-held chord. (Per-finger release above keeps multi-touch correct.)
function reconcileRelease(e) {
  const noneStillDown = e.touches ? e.touches.length === 0 : (e.buttons === 0);
  if (noneStillDown && activePtr.size) {
    [...activePtr.values()].forEach(d => releaseChord(d));
    activePtr.clear();
  }
}
window.addEventListener('touchend', reconcileRelease, { passive: true });
window.addEventListener('touchcancel', reconcileRelease, { passive: true });
window.addEventListener('mouseup', reconcileRelease);

/* ---------- Controls wiring ---------- */
document.getElementById('instrument').onchange = (e) => {
  state.instrument = e.target.value;
  loadInstrument(state.instrument);
};

/* ---------- Synth Designer UI ---------- */
(function () {
  const OSC_TYPES = ['sine','triangle','sawtooth','square','pulse','pwm','fatsawtooth','fatsquare'];
  const SUB_TYPES = ['sine','square','triangle'];
  const NOISE_TYPES = ['white','pink','brown'];
  const FILTER_TYPES = ['lowpass','highpass','bandpass','notch'];
  const LFO_TARGETS = ['off','pitch','filter','amp'];
  const grid = document.getElementById('synthGrid');
  const modal = document.getElementById('synthModal');

  const getP = (path) => path.split('.').reduce((o, k) => o[k], customParams);
  function setP(path, val) {
    const ks = path.split('.'); const last = ks.pop();
    ks.reduce((o, k) => o[k], customParams)[last] = val;
    applyCustomParamsToAll();
  }
  function ctrlRange(sec, label, path, min, max, step, fmt) {
    const row = document.createElement('div'); row.className = 'synth-ctrl';
    const l = document.createElement('label'); l.textContent = label;
    const r = document.createElement('input'); r.type = 'range'; r.min = min; r.max = max; r.step = step; r.value = getP(path);
    const v = document.createElement('span'); v.className = 'cval';
    const show = () => v.textContent = fmt ? fmt(+r.value) : (+r.value);
    show();
    r.oninput = () => { setP(path, +r.value); show(); };
    row.append(l, r, v); sec.appendChild(row);
  }
  function ctrlSelect(sec, label, path, opts) {
    const row = document.createElement('div'); row.className = 'synth-ctrl';
    const l = document.createElement('label'); l.textContent = label;
    const s = document.createElement('select');
    opts.forEach(o => { const op = document.createElement('option'); op.value = o; op.textContent = o; s.appendChild(op); });
    s.value = getP(path);
    s.onchange = () => setP(path, s.value);
    row.append(l, s); sec.appendChild(row);
  }
  function section(title) {
    const sec = document.createElement('div'); sec.className = 'synth-sec';
    const t = document.createElement('div'); t.className = 'sec-title'; t.textContent = title;
    sec.appendChild(t); grid.appendChild(sec); return sec;
  }
  function buildDesigner() {
    grid.innerHTML = '';
    let s;
    s = section('Oscillator 1');
    ctrlSelect(s, 'Wave', 'osc1.type', OSC_TYPES);
    ctrlRange(s, 'Octave', 'osc1.octave', -2, 2, 1);
    ctrlRange(s, 'Detune', 'osc1.detune', -50, 50, 1, v => v + 'Â¢');
    ctrlRange(s, 'Level', 'osc1.level', 0, 1, 0.01, v => Math.round(v * 100) + '%');
    s = section('Oscillator 2');
    ctrlSelect(s, 'Wave', 'osc2.type', OSC_TYPES);
    ctrlRange(s, 'Octave', 'osc2.octave', -2, 2, 1);
    ctrlRange(s, 'Detune', 'osc2.detune', -50, 50, 1, v => v + 'Â¢');
    ctrlRange(s, 'Level', 'osc2.level', 0, 1, 0.01, v => Math.round(v * 100) + '%');
    s = section('Sub / Noise');
    ctrlSelect(s, 'Sub wave', 'sub.type', SUB_TYPES);
    ctrlRange(s, 'Sub lvl', 'sub.level', 0, 1, 0.01, v => Math.round(v * 100) + '%');
    ctrlSelect(s, 'Noise', 'noise.type', NOISE_TYPES);
    ctrlRange(s, 'Noise lvl', 'noise.level', 0, 1, 0.01, v => Math.round(v * 100) + '%');
    s = section('Filter');
    ctrlSelect(s, 'Type', 'filter.type', FILTER_TYPES);
    ctrlRange(s, 'Cutoff', 'filter.cutoff', 60, 12000, 10, v => Math.round(v) + 'Hz');
    ctrlRange(s, 'Reso', 'filter.res', 0, 20, 0.1);
    ctrlRange(s, 'Env amt', 'filter.envAmount', 0, 6, 0.1, v => v + 'oct');
    s = section('Filter Envelope');
    ctrlRange(s, 'Attack', 'filterEnv.attack', 0.001, 3, 0.001, v => v + 's');
    ctrlRange(s, 'Decay', 'filterEnv.decay', 0.001, 3, 0.001, v => v + 's');
    ctrlRange(s, 'Sustain', 'filterEnv.sustain', 0, 1, 0.01);
    ctrlRange(s, 'Release', 'filterEnv.release', 0.001, 5, 0.001, v => v + 's');
    s = section('Amp Envelope');
    ctrlRange(s, 'Attack', 'ampEnv.attack', 0.001, 3, 0.001, v => v + 's');
    ctrlRange(s, 'Decay', 'ampEnv.decay', 0.001, 3, 0.001, v => v + 's');
    ctrlRange(s, 'Sustain', 'ampEnv.sustain', 0, 1, 0.01);
    ctrlRange(s, 'Release', 'ampEnv.release', 0.001, 5, 0.001, v => v + 's');
    s = section('LFO');
    ctrlSelect(s, 'Target', 'lfo.target', LFO_TARGETS);
    ctrlRange(s, 'Rate', 'lfo.rate', 0.1, 20, 0.1, v => v + 'Hz');
    ctrlRange(s, 'Depth', 'lfo.depth', 0, 1, 0.01, v => Math.round(v * 100) + '%');
  }

  function openDesigner() {
    const sel = document.getElementById('instrument');
    if (sel.value !== 'custom') { sel.value = 'custom'; sel.dispatchEvent(new Event('change', { bubbles: true })); }
    ensureAudio();
    buildDesigner(); refreshPresetList();
    modal.classList.remove('hidden');
  }
  const closeDesigner = () => modal.classList.add('hidden');
  document.getElementById('editSynth').onclick = openDesigner;
  document.getElementById('synthClose').onclick = closeDesigner;
  modal.addEventListener('click', e => { if (e.target === modal) closeDesigner(); });

  // Presets (localStorage + JSON file export/import)
  const LS = 'pocketchord_synth_presets';
  const loadStore = () => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (_) { return {}; } };
  const saveStore = (o) => localStorage.setItem(LS, JSON.stringify(o));
  function refreshPresetList() {
    const sel = document.getElementById('presetList'); const o = loadStore();
    sel.innerHTML = '<option value="">Loadâ€¦</option>' + Object.keys(o).map(n => `<option>${n}</option>`).join('');
  }
  document.getElementById('presetSave').onclick = () => {
    const name = (document.getElementById('presetName').value || 'My Preset').trim();
    const o = loadStore(); o[name] = JSON.parse(JSON.stringify(customParams)); saveStore(o); refreshPresetList();
    document.getElementById('presetList').value = name;
  };
  document.getElementById('presetList').onchange = (e) => {
    const p = loadStore()[e.target.value]; if (!p) return;
    loadCustomPreset(p); buildDesigner();
    document.getElementById('presetName').value = e.target.value;
  };
  document.getElementById('presetInit').onclick = () => { loadCustomPreset(defaultSynthParams()); buildDesigner(); };
  document.getElementById('presetExport').onclick = () => {
    const name = (document.getElementById('presetName').value || 'preset').trim();
    const blob = new Blob([JSON.stringify(customParams, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.json'; a.click();
  };
  document.getElementById('presetImport').onclick = () => document.getElementById('presetFile').click();
  document.getElementById('presetFile').onchange = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { try { loadCustomPreset(JSON.parse(rd.result)); buildDesigner(); } catch (_) { alert('Invalid preset JSON'); } };
    rd.readAsText(f); e.target.value = '';
  };
})();

// Voicing + strum direction/speed
document.getElementById('voicingSel').onchange = (e) => { state.voicing = e.target.value; refreshChords(); };
document.getElementById('strumDir').onchange = (e) => { state.strumDir = e.target.value; };
document.getElementById('strumSpeed').oninput = (e) => { state.strumSpeed = +e.target.value; };

const volSlider = document.getElementById('volume');
volSlider.oninput = (e) => {
  const v = parseFloat(e.target.value);
  document.getElementById('volVal').textContent = v;
  if (masterVol) masterVol.volume.rampTo(v, 0.05);
};

function fxToggle(id, key, node) {
  const el = document.getElementById(id);
  el.onclick = () => {
    state.fx[key] = !state.fx[key];
    el.classList.toggle('on', state.fx[key]);
    if (node()) node().wet.rampTo(state.fx[key] ? (key === 'reverb' ? 0.5 : key === 'delay' ? 0.35 : 0.6) : 0, 0.1);
  };
}
fxToggle('fxReverb', 'reverb', () => reverb);
fxToggle('fxDelay', 'delay', () => delay);
fxToggle('fxChorus', 'chorus', () => chorus);

document.getElementById('fxStrum').onclick = function() {
  state.strum = !state.strum;
  this.classList.toggle('on', state.strum);
  updateDisplay();
};
document.getElementById('fxBass').onclick = function() {
  state.bass = !state.bass;
  this.classList.toggle('on', state.bass);
  revoiceHeldChords();
  updateDisplay();
};

// Arpeggiator controls
const ARP_PATTERNS = [
  ['up','Up'],['down','Down'],['updownInc','Up-Down (incl)'],['updownEx','Up-Down (excl)'],
  ['random','Random'],['order','Order Played'],['revorder','Reverse Order'],
  ['chord','Chord Repeat'],['lowrep','Lowest Repeat'],['highrep','Highest Repeat'],
  ['alberti','Alberti Bass'],['broken','Broken Chord'],['classical','Classical Arp'],
  ['ballad','Ballad'],['ostinato','Cinematic Ostinato'],['travis','Fingerstyle (Travis)'],['poppick','Pop Pick'],
  ['phrase','Phrase (generated)'],
];
function setArpOn(on) {
  state.arp.on = on;
  ['arpOn','arpModalOn'].forEach(id => { const b = document.getElementById(id); if (b) { b.classList.toggle('on', on); b.textContent = on ? 'On' : 'Off'; } });
  if (synth) { try { synth.releaseAll && synth.releaseAll(); } catch (e) {} }   // avoid hung notes on mode switch
  arpReset(); syncTransport(); updateDisplay();
}
const arpOnBtn = document.getElementById('arpOn');
arpOnBtn.onclick = async () => { await ensureAudio(); setArpOn(!state.arp.on); };
document.getElementById('arpModalOn').onclick = async () => { await ensureAudio(); setArpOn(!state.arp.on); };

const arpPatternSel = document.getElementById('arpPatternSel');
ARP_PATTERNS.forEach(([v, l]) => { const o = document.createElement('option'); o.value = v; o.textContent = l; arpPatternSel.appendChild(o); });
arpPatternSel.value = state.arp.pattern;
function setArpPattern(val) { state.arp.pattern = val; arpReset(); if (arpPatternSel.value !== val) arpPatternSel.value = val; }
arpPatternSel.onchange = () => setArpPattern(arpPatternSel.value);

const arpRateRow = document.getElementById('arpRate');
function setArpRate(val) {
  state.arp.rate = val;
  if (arpLoop) arpLoop.interval = val;
  [...arpRateRow.children].forEach(c => c.classList.toggle('on', c.dataset.val === val));
}
[['4n','Â¼'],['8n','â…›'],['16n','1/16'],['8t','â…›t']].forEach(([val, lbl]) => {
  const b = document.createElement('button');
  b.className = 'toggle small' + (val === state.arp.rate ? ' on' : '');
  b.textContent = lbl; b.dataset.val = val;
  b.onclick = () => setArpRate(val);
  arpRateRow.appendChild(b);
});

/* ---------- Arp Designer modal ---------- */
(function () {
  const grid = document.getElementById('arpGrid');
  const modal = document.getElementById('arpModal');
  const accentGrid = document.getElementById('accentGrid');
  const setA = (path, val) => { const ks = path.split('.'); const last = ks.pop(); ks.reduce((o, k) => o[k], state.arp)[last] = val; };
  const getA = (path) => path.split('.').reduce((o, k) => o[k], state.arp);

  function section(title) {
    const sec = document.createElement('div'); sec.className = 'synth-sec';
    const t = document.createElement('div'); t.className = 'sec-title'; t.textContent = title;
    sec.appendChild(t); grid.appendChild(sec); return sec;
  }
  function ctrlRange(sec, label, path, min, max, step, fmt, onSet) {
    const row = document.createElement('div'); row.className = 'synth-ctrl';
    const l = document.createElement('label'); l.textContent = label;
    const r = document.createElement('input'); r.type = 'range'; r.min = min; r.max = max; r.step = step; r.value = getA(path);
    const v = document.createElement('span'); v.className = 'cval';
    const show = () => v.textContent = fmt ? fmt(+r.value) : (+r.value);
    show();
    r.oninput = () => { setA(path, +r.value); show(); if (onSet) onSet(+r.value); };
    row.append(l, r, v); sec.appendChild(row);
  }
  function ctrlSelect(sec, label, path, opts, onSet) {
    const row = document.createElement('div'); row.className = 'synth-ctrl';
    const l = document.createElement('label'); l.textContent = label;
    const s = document.createElement('select');
    opts.forEach(o => { const op = document.createElement('option'); op.value = o.v; op.textContent = o.l; s.appendChild(op); });
    s.value = getA(path);
    s.onchange = () => { setA(path, s.value); if (onSet) onSet(s.value); };
    row.append(l, s); sec.appendChild(row);
  }
  function ctrlToggle(sec, label, path) {
    const row = document.createElement('div'); row.className = 'synth-ctrl';
    const l = document.createElement('label'); l.textContent = label;
    const b = document.createElement('button'); b.className = 'toggle small' + (getA(path) ? ' on' : '');
    b.textContent = getA(path) ? 'On' : 'Off'; b.style.flex = '1 1 auto';
    b.onclick = () => { setA(path, !getA(path)); b.classList.toggle('on', getA(path)); b.textContent = getA(path) ? 'On' : 'Off'; };
    row.append(l, b); sec.appendChild(row);
  }
  const ACC_CYCLE = ['normal','accent','ghost','silent'];
  const ACC_SYM = { normal: 'â€¢', accent: 'â–²', ghost: 'Â·', silent: 'â€“' };
  function buildAccent() {
    accentGrid.innerHTML = '';
    accentGrid.style.gridTemplateColumns = `repeat(${Math.min(state.arp.accent.length, 16)}, 1fr)`;
    state.arp.accent.forEach((val, i) => {
      const c = document.createElement('div'); c.className = 'acc ' + val; c.textContent = ACC_SYM[val];
      c.onclick = () => {
        const nv = ACC_CYCLE[(ACC_CYCLE.indexOf(state.arp.accent[i]) + 1) % 4];
        state.arp.accent[i] = nv; c.className = 'acc ' + nv; c.textContent = ACC_SYM[nv];
      };
      accentGrid.appendChild(c);
    });
  }

  // ---- Rhythm presets: bundle rate + swing + step/accent mask ----
  const accMask = (len, accents, silents) => Array.from({ length: len }, (_, i) =>
    (silents && silents.includes(i)) ? 'silent' : (accents && accents.includes(i)) ? 'accent' : 'normal');
  const RHYTHM_PRESETS = {
    'Straight 8th':  { rate: '8n',  swing: 0,    accent: accMask(8,  [0]) },
    'Straight 16th': { rate: '16n', swing: 0,    accent: accMask(16, [0, 4, 8, 12]) },
    'Triplet':       { rate: '8t',  swing: 0,    accent: accMask(12, [0, 3, 6, 9]) },
    'Swing':         { rate: '8n',  swing: 0.34, accent: accMask(8,  [0, 4]) },
    'Shuffle':       { rate: '16n', swing: 0.5,  accent: accMask(16, [0, 4, 8, 12], [1, 3, 5, 7, 9, 11, 13, 15]) },
    'Waltz':         { rate: '4n',  swing: 0,    accent: accMask(3,  [0]) },
    'Bossa':         { rate: '16n', swing: 0.16, accent: accMask(16, [0, 3, 6, 10, 12], [1, 2, 4, 5, 7, 8, 9, 11, 13, 14, 15]) },
  };
  function applyRhythm(name) {
    const p = RHYTHM_PRESETS[name]; if (!p) return;
    setArpRate(p.rate); state.arp.swing = p.swing; state.arp.accent = p.accent.slice(); arpReset();
    build();
  }

  // ---- Style "one-tap" presets: configure the whole performance + a fitting instrument ----
  const STYLE_PRESETS = {
    'Cinematic':   { instrument:'strings', pattern:'up',        octave:'1', rate:'8n',  gate:0.95, legato:true,  velMode:'cresc',  baseVel:0.7,  swing:0,    humTime:0.2, humVel:0.2, humGate:0, probability:100, accent:accMask(8,[0]) },
    'Hans Zimmer': { instrument:'strings', pattern:'order',     octave:'1', rate:'8n',  gate:0.55, legato:false, velMode:'accent', baseVel:0.8,  swing:0,    humTime:0.1, humVel:0.15,humGate:0, probability:100, accent:accMask(8,[0,4]) },
    'Interstellar':{ instrument:'organ',   pattern:'up',        octave:'2', rate:'8n',  gate:0.9,  legato:true,  velMode:'cresc',  baseVel:0.6,  swing:0,    humTime:0.15,humVel:0.15,humGate:0, probability:100, accent:accMask(8,[0]) },
    'Einaudi':     { instrument:'piano',   pattern:'up',        octave:'1', rate:'8n',  gate:0.8,  legato:false, velMode:'human',  baseVel:0.7,  swing:0,    humTime:0.25,humVel:0.25,humGate:0.1, probability:100, accent:accMask(8,[0]) },
    'Jazz Ballad': { instrument:'epiano',  pattern:'updownInc', octave:'1', rate:'8n',  gate:0.7,  legato:false, velMode:'human',  baseVel:0.65, swing:0.34, humTime:0.3, humVel:0.3, humGate:0.15,probability:96,  accent:accMask(8,[0,4]) },
    'Pop Piano':   { instrument:'piano',   pattern:'up',        octave:'1', rate:'8n',  gate:0.6,  legato:false, velMode:'accent', baseVel:0.8,  swing:0,    humTime:0.08,humVel:0.1, humGate:0, probability:100, accent:accMask(8,[0,4]) },
    'Coldplay':    { instrument:'piano',   pattern:'up',        octave:'1', rate:'8n',  gate:0.55, legato:false, velMode:'fixed',  baseVel:0.78, swing:0,    humTime:0.06,humVel:0.08,humGate:0, probability:100, accent:accMask(8,[0]) },
    'Worship':     { instrument:'pad',     pattern:'up',        octave:'1', rate:'8n',  gate:0.95, legato:true,  velMode:'cresc',  baseVel:0.65, swing:0,    humTime:0.15,humVel:0.15,humGate:0, probability:100, accent:accMask(8,[0]) },
    'Lo-fi':       { instrument:'epiano',  pattern:'up',        octave:'1', rate:'8n',  gate:0.6,  legato:false, velMode:'human',  baseVel:0.62, swing:0.4,  humTime:0.4, humVel:0.35,humGate:0.2, probability:88,  accent:accMask(8,[0,4]) },
    'EDM':         { instrument:'lead',    pattern:'up',        octave:'1', rate:'16n', gate:0.5,  legato:false, velMode:'accent', baseVel:0.9,  swing:0,    humTime:0,   humVel:0,   humGate:0, probability:100, accent:accMask(16,[0,4,8,12]) },
    'House':       { instrument:'lead',    pattern:'updownEx',  octave:'1', rate:'16n', gate:0.5,  legato:false, velMode:'accent', baseVel:0.85, swing:0.12, humTime:0,   humVel:0.05,humGate:0, probability:100, accent:accMask(16,[0,4,8,12]) },
    'Trance':      { instrument:'lead',    pattern:'up',        octave:'2', rate:'16n', gate:0.45, legato:false, velMode:'accent', baseVel:0.9,  swing:0,    humTime:0,   humVel:0,   humGate:0, probability:100, accent:accMask(16,[0,2,4,6,8,10,12,14]) },
    'Synthwave':   { instrument:'lead',    pattern:'updownInc', octave:'1', rate:'16n', gate:0.6,  legato:false, velMode:'fixed',  baseVel:0.82, swing:0,    humTime:0,   humVel:0,   humGate:0, probability:100, accent:accMask(16,[0,8]) },
    'Indian Classical':{ instrument:'organ', pattern:'updownInc', octave:'1', rate:'8n', gate:0.85, legato:false, velMode:'human', baseVel:0.7, swing:0,    humTime:0.3, humVel:0.25,humGate:0.1, probability:100, accent:accMask(8,[0]) },
    'Bollywood':   { instrument:'strings', pattern:'updownInc', octave:'1', rate:'8n',  gate:0.75, legato:false, velMode:'accent', baseVel:0.8,  swing:0.12, humTime:0.12,humVel:0.15,humGate:0, probability:100, accent:accMask(8,[0,4]) },
  };
  function applyStyle(name) {
    const st = STYLE_PRESETS[name]; if (!st) return;
    if (st.instrument) { const sel = document.getElementById('instrument'); if (sel.value !== st.instrument) { sel.value = st.instrument; sel.dispatchEvent(new Event('change', { bubbles: true })); } }
    Object.keys(st).forEach(k => {
      if (k === 'instrument') return;
      if (k === 'accent') state.arp.accent = st.accent.slice();
      else state.arp[k] = st[k];
    });
    if (st.rate) setArpRate(st.rate);
    if (st.pattern) setArpPattern(st.pattern);
    arpReset();
    if (!state.arp.on) setArpOn(true);
    build();
  }

  // ---- arp preset save/load/export/import (localStorage + JSON) ----
  const arpSnapshot = () => { const { on, ...rest } = state.arp; return JSON.parse(JSON.stringify(rest)); };
  function applyArpData(d) {
    Object.keys(d).forEach(k => {
      if (k === 'accent') state.arp.accent = (d.accent || []).slice();
      else if (k === 'euclid') state.arp.euclid = Object.assign({}, d.euclid);
      else state.arp[k] = d[k];
    });
    if (d.rate) setArpRate(d.rate);
    if (d.pattern) setArpPattern(d.pattern);
    arpReset(); build();
  }
  const ALS = 'pocketchord_arp_presets';
  const aLoad = () => { try { return JSON.parse(localStorage.getItem(ALS)) || {}; } catch (_) { return {}; } };
  const aSave = (o) => localStorage.setItem(ALS, JSON.stringify(o));
  function refreshArpPresets() {
    const sel = document.getElementById('arpPresetList'); const o = aLoad();
    sel.innerHTML = '<option value="">Loadâ€¦</option>' + Object.keys(o).map(n => `<option>${n}</option>`).join('');
  }
  document.getElementById('arpPresetSave').onclick = () => {
    const name = (document.getElementById('arpPresetName').value || 'My Arp').trim();
    const o = aLoad(); o[name] = arpSnapshot(); aSave(o); refreshArpPresets(); document.getElementById('arpPresetList').value = name;
  };
  document.getElementById('arpPresetList').onchange = (e) => {
    const p = aLoad()[e.target.value]; if (!p) return;
    applyArpData(p); document.getElementById('arpPresetName').value = e.target.value;
  };
  document.getElementById('arpPresetDelete').onclick = () => {
    const sel = document.getElementById('arpPresetList'); const name = sel.value; if (!name) return;
    const o = aLoad(); delete o[name]; aSave(o); refreshArpPresets();
  };
  document.getElementById('arpPresetExport').onclick = () => {
    const name = (document.getElementById('arpPresetName').value || 'arp').trim();
    const blob = new Blob([JSON.stringify(arpSnapshot(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name + '.arp.json'; a.click();
  };
  document.getElementById('arpPresetImport').onclick = () => document.getElementById('arpPresetFile').click();
  document.getElementById('arpPresetFile').onchange = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { try { applyArpData(JSON.parse(rd.result)); } catch (_) { alert('Invalid arp preset JSON'); } };
    rd.readAsText(f); e.target.value = '';
  };
  function applyEuclid() {
    const e = state.arp.euclid;
    const pat = euclid(e.steps, e.pulses, e.rotation);
    state.arp.accent = pat.map((x, i) => x ? (i === 0 ? 'accent' : 'normal') : 'silent');
    buildAccent();
  }
  function build() {
    grid.innerHTML = '';
    let s = section('Style â€” one tap');
    s.style.gridColumn = '1 / -1';
    const styleRow = document.createElement('div'); styleRow.className = 'row';
    Object.keys(STYLE_PRESETS).forEach(name => {
      const b = document.createElement('button'); b.className = 'chip'; b.textContent = name;
      b.onclick = () => applyStyle(name);
      styleRow.appendChild(b);
    });
    s.appendChild(styleRow);

    s = section('Pattern & Octaves');
    ctrlSelect(s, 'Pattern', 'pattern', ARP_PATTERNS.map(p => ({ v: p[0], l: p[1] })), v => setArpPattern(v));
    const phRow = document.createElement('div'); phRow.className = 'synth-ctrl';
    const phL = document.createElement('label'); phL.textContent = 'Phrase';
    const phB = document.createElement('button'); phB.className = 'toggle small'; phB.style.flex = '1 1 auto'; phB.textContent = 'ðŸŽ² New phrase';
    phB.onclick = () => { setArpPattern('phrase'); regeneratePhrase(); build(); };
    phRow.append(phL, phB); s.appendChild(phRow);
    ctrlSelect(s, 'Octaves', 'octave', [
      { v:'0',l:'0' },{ v:'1',l:'+1' },{ v:'2',l:'+2' },{ v:'3',l:'+3' },
      { v:'down',l:'Down 1' },{ v:'alt',l:'Alternate' },{ v:'ping',l:'Ping-Pong' }], () => arpReset());
    s = section('Bass / Melody');
    ctrlToggle(s, 'Bass split', 'bassSplit');
    ctrlRange(s, 'Bass oct', 'bassOctave', -2, 0, 1);
    ctrlToggle(s, 'Melody hold', 'melodyHold');
    s = section('Timing');
    ctrlSelect(s, 'Rate', 'rate', [{ v:'4n',l:'1/4' },{ v:'8n',l:'1/8' },{ v:'16n',l:'1/16' },{ v:'8t',l:'1/8 trip' }], v => setArpRate(v));
    ctrlRange(s, 'Gate', 'gate', 0.1, 1, 0.01, v => Math.round(v * 100) + '%');
    ctrlToggle(s, 'Legato', 'legato');
    ctrlRange(s, 'Swing', 'swing', 0, 0.6, 0.01, v => Math.round(v * 100) + '%');
    s = section('Velocity');
    ctrlSelect(s, 'Mode', 'velMode', [
      { v:'fixed',l:'Fixed' },{ v:'accent',l:'Accent' },{ v:'cresc',l:'Crescendo' },
      { v:'decresc',l:'Decrescendo' },{ v:'random',l:'Random' },{ v:'human',l:'Humanized' }]);
    ctrlRange(s, 'Base level', 'baseVel', 0.1, 1, 0.01, v => Math.round(v * 100) + '%');
    s = section('Humanize');
    ctrlRange(s, 'Timing', 'humTime', 0, 1, 0.01, v => Math.round(v * 100) + '%');
    ctrlRange(s, 'Velocity', 'humVel', 0, 1, 0.01, v => Math.round(v * 100) + '%');
    ctrlRange(s, 'Gate', 'humGate', 0, 1, 0.01, v => Math.round(v * 100) + '%');
    s = section('Probability');
    ctrlRange(s, 'Chance', 'probability', 0, 100, 1, v => v + '%');

    s = section('Density');
    const drow = document.createElement('div'); drow.className = 'row';
    [['Sparse','4n',1],['Medium','8n',1],['Dense','16n',1],['Very Dense','16n',2]].forEach(([lbl, rate, rt]) => {
      const b = document.createElement('button'); b.className = 'toggle small'; b.textContent = lbl;
      b.onclick = () => { setArpRate(rate); state.arp.ratchet = rt; arpReset();
        [...drow.children].forEach(c => c.classList.toggle('on', c === b)); };
      drow.appendChild(b);
    });
    s.appendChild(drow);

    s = section('Rhythm preset');
    const rrow = document.createElement('div'); rrow.className = 'row';
    Object.keys(RHYTHM_PRESETS).forEach(name => {
      const b = document.createElement('button'); b.className = 'toggle small'; b.textContent = name;
      b.onclick = () => applyRhythm(name);
      rrow.appendChild(b);
    });
    s.appendChild(rrow);

    s = section('Euclidean');
    ctrlRange(s, 'Steps', 'euclid.steps', 1, 16, 1, null, applyEuclid);
    ctrlRange(s, 'Pulses', 'euclid.pulses', 0, 16, 1, null, applyEuclid);
    ctrlRange(s, 'Rotation', 'euclid.rotation', 0, 15, 1, null, applyEuclid);

    buildAccent();
  }
  function open() { ensureAudio(); build(); refreshArpPresets();
    const mOn = document.getElementById('arpModalOn'); mOn.classList.toggle('on', state.arp.on); mOn.textContent = state.arp.on ? 'On' : 'Off';
    modal.classList.remove('hidden');
  }
  document.getElementById('arpEdit').onclick = open;
  document.getElementById('arpClose').onclick = () => modal.classList.add('hidden');
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });
})();

/* ---------- Step sequencer UI ---------- */
const INST_LABEL = { piano:'Piano', pad:'Pad', epiano:'EP', strings:'Strings', lead:'Lead', organ:'Organ' };
const seqGrid = document.getElementById('seqGrid');
function seqRender() {
  seqGrid.innerHTML = '';
  for (let i = 0; i < seqState.len; i++) {
    const c = document.createElement('div');
    c.className = 'seq-cell';
    c.dataset.i = i;
    c.onclick = () => { seqState.cursor = i; if (!seqState.edit) toggleSeqEdit(true); seqRefreshCursor(); };
    seqGrid.appendChild(c);
  }
  seqRenderLabels();
  seqRefreshCursor();
}
function seqRenderLabels() {
  const steps = activeTrack().steps;
  [...seqGrid.children].forEach((c, i) => {
    const deg = steps[i];
    const name = deg == null ? 'Â·' : chordName(NOTES[(state.keyIndex + scale().intervals[deg]) % 12], deg, state.type);
    c.innerHTML = '<span class="sidx">' + (i + 1) + '</span><span class="sname">' + name + '</span>';
    c.classList.toggle('filled', deg != null);
    c.classList.toggle('empty', deg == null);
    c.style.setProperty('--tc', TRACK_COLORS[seqState.active % TRACK_COLORS.length]);
  });
}
function seqRefreshCursor() {
  [...seqGrid.children].forEach((c, i) => c.classList.toggle('cur', seqState.edit && i === seqState.cursor));
}
function seqHighlightPlay(idx) {
  [...seqGrid.children].forEach((c, i) => c.classList.toggle('play', i === idx));
}

/* ---- tracks ---- */
const seqTracks = document.getElementById('seqTracks');
const trackInst = document.getElementById('trackInst');
const trackMuteBtn = document.getElementById('trackMute');
const trackOctEl = document.getElementById('trackOct');
function seqRenderTracks() {
  seqTracks.innerHTML = '';
  seqState.tracks.forEach((tr, i) => {
    const el = document.createElement('div');
    el.className = 'strack' + (i === seqState.active ? ' active' : '') + (tr.muted ? ' muted' : '');
    el.style.setProperty('--tc', TRACK_COLORS[i % TRACK_COLORS.length]);
    el.innerHTML = '<span class="tdot"></span>T' + (i + 1) + ' Â· ' + INST_LABEL[tr.instrument] +
      (seqState.tracks.length > 1 ? ' <span class="trm" data-rm="' + i + '">âœ•</span>' : '');
    el.onclick = (e) => {
      if (e.target.dataset && e.target.dataset.rm != null) { removeTrack(+e.target.dataset.rm); return; }
      selectTrack(i);
    };
    seqTracks.appendChild(el);
  });
  if (seqState.tracks.length < TRACK_COLORS.length) {
    const add = document.createElement('button');
    add.className = 'add-track'; add.textContent = '+';
    add.onclick = addTrack;
    seqTracks.appendChild(add);
  }
}
function syncTrackControls() {
  const tr = activeTrack();
  trackInst.value = tr.instrument;
  trackMuteBtn.classList.toggle('on', tr.muted);
  trackMuteBtn.textContent = tr.muted ? 'Muted' : 'Mute';
  trackOctEl.textContent = (tr.octave > 0 ? '+' : '') + tr.octave;
}
function selectTrack(i) {
  seqState.active = i;
  syncTrackControls();
  seqRenderTracks();
  seqRenderLabels();
  seqRefreshCursor();
}
function addTrack() {
  if (seqState.tracks.length >= TRACK_COLORS.length) return;
  const tr = makeTrack(seqState.tracks.length);
  seqState.tracks.push(tr);
  if (state.audioReady) buildTrackSynth(tr);
  selectTrack(seqState.tracks.length - 1);
}
function removeTrack(i) {
  if (seqState.tracks.length <= 1) return;
  const tr = seqState.tracks[i];
  if (tr.synth) { try { tr.synth.releaseAll && tr.synth.releaseAll(); } catch(e){} tr.synth.dispose(); }
  seqState.tracks.splice(i, 1);
  if (seqState.active >= seqState.tracks.length) seqState.active = seqState.tracks.length - 1;
  selectTrack(seqState.active);
}
trackInst.onchange = async (e) => {
  activeTrack().instrument = e.target.value;
  await ensureAudio();
  buildTrackSynth(activeTrack());
  seqRenderTracks();
};
trackMuteBtn.onclick = () => { const tr = activeTrack(); tr.muted = !tr.muted; syncTrackControls(); seqRenderTracks(); };
document.getElementById('trackOctDown').onclick = () => changeTrackOct(-1);
document.getElementById('trackOctUp').onclick = () => changeTrackOct(1);
function changeTrackOct(d) { const tr = activeTrack(); tr.octave = Math.max(-2, Math.min(2, tr.octave + d)); syncTrackControls(); }

const seqEditBtn = document.getElementById('seqEdit');
function toggleSeqEdit(on) {
  seqState.edit = (on === undefined) ? !seqState.edit : on;
  seqEditBtn.classList.toggle('on', seqState.edit);
  seqRefreshCursor();
}
seqEditBtn.onclick = () => toggleSeqEdit();

const seqPlayBtn = document.getElementById('seqPlay');
seqPlayBtn.onclick = async () => {
  await ensureAudio();
  seqState.playing = !seqState.playing;
  seqPlayBtn.classList.toggle('on', seqState.playing);
  seqPlayBtn.textContent = seqState.playing ? 'â–  Stop' : 'â–¶ Play';
  if (seqState.playing) seqState.pos = 0;
  else seqHighlightPlay(-1);
  syncTransport();
};

document.getElementById('seqRest').onclick = () => {
  activeTrack().steps[seqState.cursor] = null;
  seqRenderLabels();
  seqState.cursor = (seqState.cursor + 1) % seqState.len;
  seqRefreshCursor();
};
document.getElementById('seqClear').onclick = () => {
  activeTrack().steps.fill(null);
  seqState.cursor = 0;
  seqRenderLabels();
  seqRefreshCursor();
};

const seqLenRow = document.getElementById('seqLen');
[4, 8, 16, 32].forEach(n => {
  const b = document.createElement('button');
  b.className = 'toggle small' + (n === seqState.len ? ' on' : '');
  b.textContent = n;
  b.onclick = () => {
    seqState.len = n;
    seqState.tracks.forEach(tr => {
      const old = tr.steps;
      const ns = new Array(n).fill(null);
      for (let i = 0; i < Math.min(n, old.length); i++) ns[i] = old[i];
      tr.steps = ns;
    });
    if (seqState.cursor >= n) seqState.cursor = 0;
    [...seqLenRow.children].forEach(c => c.classList.toggle('on', parseInt(c.textContent, 10) === n));
    seqRender();
  };
  seqLenRow.appendChild(b);
});

const seqRateRow = document.getElementById('seqRate');
// Â½ = half note, Â¼t/â…›t = triplets (divide the beat into 3 â€” the "1/3" feel).
[['2n','Â½'],['4n','Â¼'],['4t','Â¼t'],['8n','â…›'],['8t','â…›t'],['16n','1/16']].forEach(([val, lbl]) => {
  const b = document.createElement('button');
  b.className = 'toggle small' + (val === seqState.rate ? ' on' : '');
  b.textContent = lbl;
  b.onclick = () => {
    seqState.rate = val;
    if (seqLoop) seqLoop.interval = val;
    [...seqRateRow.children].forEach(c => c.classList.toggle('on', c.textContent === lbl));
  };
  seqRateRow.appendChild(b);
});

// Octave
document.getElementById('octUp').onclick = () => changeOctave(1);
document.getElementById('octDown').onclick = () => changeOctave(-1);
function changeOctave(delta) {
  state.octaveShift = Math.max(-2, Math.min(2, state.octaveShift + delta));
  document.getElementById('octVal').textContent = (state.octaveShift > 0 ? '+' : '') + state.octaveShift;
  revoiceHeldChords();
}

/* ============================================================
   Audio enable (browsers require a gesture)
   ============================================================ */
async function ensureAudio() {
  if (state.audioReady) return;
  await Tone.start();
  loadInstrument(state.instrument);
  buildAllTrackSynths();
  state.audioReady = true;
  const btn = document.getElementById('enableAudio');
  btn.textContent = 'ðŸ”Š Audio ready';
  btn.classList.add('active');
}
document.getElementById('enableAudio').onclick = ensureAudio;

// Tap-to-start overlay: unlock audio + load the (instant) default synth, THEN reveal the app.
(function () {
  const ov = document.getElementById('startOverlay');
  const loading = document.getElementById('startLoading');
  let starting = false;
  async function start() {
    if (starting) return; starting = true;
    loading.textContent = 'startingâ€¦';
    try { await ensureAudio(); } catch (_) {}
    ov.classList.add('gone');
  }
  document.getElementById('startBtn').onclick = start;
  ov.addEventListener('pointerdown', start);   // tapping anywhere works
})();

/* ============================================================
   Web MIDI
   ============================================================ */
const WHITE_KEY_TO_DEGREE = { 0:0, 2:1, 4:2, 5:3, 7:4, 9:5, 11:6 }; // C D E F G A B -> 1..7
function handleMIDI(msg) {
  const [status, data1, data2] = msg.data;
  const cmd = status & 0xf0;
  if (cmd === 0x90 && data2 > 0) {          // note on
    const deg = WHITE_KEY_TO_DEGREE[data1 % 12];
    if (deg !== undefined) { ensureAudio(); playChord(deg, Math.max(0.3, data2 / 127)); }
  } else if (cmd === 0x80 || (cmd === 0x90 && data2 === 0)) { // note off
    const deg = WHITE_KEY_TO_DEGREE[data1 % 12];
    if (deg !== undefined) releaseChord(deg);
  } else if (cmd === 0xb0) {                 // control change
    if (data1 === 1 && data2 > 0) {          // mod wheel -> cycle type
      // optional: cycle chord type on full mod
    }
  }
}
function setMidiStatus(connected, text, title) {
  const s = document.getElementById('midiStatus');
  s.classList.toggle('connected', connected);
  s.title = title || '';
  s.style.cursor = 'pointer';
  // Only surface MIDI when a device is actually connected â€” no scary "blocked/error"
  // messaging for the vast majority (mobile / no controller). Hot-plug auto-reveals it.
  s.style.display = connected ? '' : 'none';
  document.getElementById('midiText').textContent = text;
}

let midiAccess = null;
function initMIDI() {
  if (!navigator.requestMIDIAccess) {
    // API absent entirely â€” wrong browser or a sandboxed/insecure context.
    const why = !window.isSecureContext
      ? 'MIDI: needs https/localhost'
      : 'MIDI: use Chrome or Edge';
    setMidiStatus(false, why, 'Web MIDI is only available in Chromium browsers (Chrome/Edge/Brave) over a secure context. Open this file in Chrome â€” not Safari, Firefox, or an embedded preview.');
    return;
  }
  navigator.requestMIDIAccess({ sysex: false }).then(midi => {
    midiAccess = midi;
    const attach = () => {
      const names = [];
      midi.inputs.forEach(input => { input.onmidimessage = handleMIDI; names.push(input.name); });
      const n = names.length;
      setMidiStatus(n > 0,
        n > 0 ? ('MIDI: ' + (n === 1 ? names[0] : n + ' devices') + ' âœ“') : 'MIDI: no devices â€” tap to rescan',
        n > 0 ? names.join(', ') : 'No MIDI inputs found. Plug in your controller and close any DAW / Arturia MCC / Analog Lab that may be holding the port, then tap to rescan.');
    };
    attach();
    midi.onstatechange = attach;
  }).catch(() => setMidiStatus(false, 'MIDI: blocked â€” tap to retry', 'The browser blocked MIDI access (permission denied or blocked by an embedded frame). Open in Chrome/Edge directly and allow MIDI.'));
}
// Tap the status to (re)scan after plugging in or freeing the port.
document.getElementById('midiStatus').addEventListener('click', initMIDI);
initMIDI();

/* ============================================================
   Tempo + Metronome + Transport
   ============================================================ */
// Set up the global transport (Tone is loaded synchronously, so this is safe now).
Tone.Transport.bpm.value = 100;
Tone.Transport.loop = true;
Tone.Transport.loopStart = 0;
Tone.Transport.loopEnd = '4m';

const beatDots = document.getElementById('beatDots');
for (let i = 0; i < 4; i++) {
  const d = document.createElement('div');
  d.className = 'bd' + (i === 0 ? ' accent' : '');
  beatDots.appendChild(d);
}
function lightBeat(beat) {
  [...beatDots.children].forEach((d, i) => d.classList.toggle('on', i === beat));
}

// BPM
const bpmSlider = document.getElementById('bpm');
bpmSlider.oninput = (e) => {
  const v = parseInt(e.target.value, 10);
  document.getElementById('bpmVal').textContent = v;
  Tone.Transport.bpm.rampTo(v, 0.1);
  refreshLoopLength();
};
function setBpm(b) {
  b = Math.max(50, Math.min(200, Math.round(b)));
  Tone.Transport.bpm.rampTo(b, 0.1);
  bpmSlider.value = b; document.getElementById('bpmVal').textContent = b;
  refreshLoopLength();
}

/* ---------- Theme Â· Tap tempo Â· Latch Â· Sustain ---------- */
const themeBtn = document.getElementById('themeBtn');
function applyTheme(light) {
  document.body.classList.toggle('light', light);
  themeBtn.textContent = light ? 'â˜€ï¸' : 'ðŸŒ™';
  try { localStorage.setItem('pc_theme', light ? 'light' : 'dark'); } catch (_) {}
}
themeBtn.onclick = () => applyTheme(!document.body.classList.contains('light'));
applyTheme((() => { try { return localStorage.getItem('pc_theme') === 'light'; } catch (_) { return false; } })());

let tapTimes = [];
document.getElementById('tapTempo').onclick = (e) => {
  const now = performance.now();
  tapTimes.push(now); tapTimes = tapTimes.filter(t => now - t < 2500);
  if (tapTimes.length >= 2) {
    const iv = tapTimes.slice(1).map((t, i) => t - tapTimes[i]);
    setBpm(60000 / (iv.reduce((a, b) => a + b, 0) / iv.length));
  }
  e.target.classList.add('on'); setTimeout(() => e.target.classList.remove('on'), 110);
};

const latchBtn = document.getElementById('latchBtn'), sustainBtn = document.getElementById('sustainBtn');
latchBtn.onclick = () => { state.latch = !state.latch; latchBtn.classList.toggle('on', state.latch); if (!state.latch) releaseAllChords(); };
sustainBtn.onclick = () => { state.sustain = !state.sustain; sustainBtn.classList.toggle('on', state.sustain); if (!state.sustain) releaseAllChords(); };

/* ---------- Real-time piano keyboard ---------- */
const KBD_LO = 48, KBD_HI = 84;   // C3..C6
const kbdEl = document.getElementById('kbd');
const whiteKeyEls = {}, blackKeyEls = {};
const isBlackPc = pc => [1, 3, 6, 8, 10].includes(((pc % 12) + 12) % 12);
function buildKeyboard() {
  kbdEl.innerHTML = '';
  const whites = [];
  for (let m = KBD_LO; m <= KBD_HI; m++) if (!isBlackPc(m)) whites.push(m);
  whites.forEach(m => { const w = document.createElement('div'); w.className = 'wk'; w.dataset.m = m; kbdEl.appendChild(w); whiteKeyEls[m] = w; });
  for (let m = KBD_LO; m <= KBD_HI; m++) {
    if (isBlackPc(m)) {
      const b = document.createElement('div'); b.className = 'bk'; b.dataset.m = m;
      b.style.left = (whites.filter(x => x < m).length / whites.length * 100) + '%';
      kbdEl.appendChild(b); blackKeyEls[m] = b;
    }
  }
}
function activeMidiSet() {
  const s = new Set();
  heldChords.forEach(notes => notes.forEach(n => s.add(Tone.Frequency(n).toMidi())));
  return s;
}
function updateKeyboard() {
  if (!kbdEl || !kbdEl.children.length) return;
  const act = activeMidiSet();
  for (const m in whiteKeyEls) whiteKeyEls[m].classList.toggle('lit', act.has(+m));
  for (const m in blackKeyEls) blackKeyEls[m].classList.toggle('lit', act.has(+m));
}
function flashKey(noteName) {
  const m = Tone.Frequency(noteName).toMidi();
  const el = whiteKeyEls[m] || blackKeyEls[m];
  if (!el) return;
  el.classList.add('lit');
  setTimeout(() => { if (!activeMidiSet().has(m)) el.classList.remove('lit'); }, 150);
}

// Metronome toggle
const metroBtn = document.getElementById('metro');
metroBtn.onclick = async () => {
  await ensureAudio();
  loopState.metro = !loopState.metro;
  metroBtn.classList.toggle('on', loopState.metro);
  metroBtn.textContent = loopState.metro ? 'ðŸ”Š On' : 'ðŸ”‡ Off';
  if (loopState.metro && !transportRunning()) Tone.Transport.position = 0;
  syncTransport();
};

/* ============================================================
   Looper â€” Tone.Transport + Tone.Part, bar-synced, overdub
   ============================================================ */
const loopState = {
  recording: false,
  playing: false,
  metro: false,
  bars: 4,
  lengthSec: 0,
  quantize: true,
  countin: true,
  events: [],          // {time, deg, vel, dur}
};
let loopPart = null;
const pending = {};    // deg -> {time, vel} captured between attack/release while recording

function transportRunning() { return Tone.Transport.state === 'started'; }
function transportNeeded() { return loopState.playing || loopState.recording || loopState.metro || state.arp.on || seqState.playing; }
function syncTransport() {
  if (transportNeeded()) {
    if (!transportRunning()) Tone.Transport.start('+0.03');
  } else if (transportRunning()) {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    lightBeat(-1);
  }
}
function refreshLoopLength() {
  loopState.lengthSec = Tone.Time(loopState.bars + 'm').toSeconds();
  Tone.Transport.loopEnd = loopState.bars + 'm';
  if (loopPart) loopPart.loopEnd = loopState.bars + 'm';
}
function ensurePart() {
  if (loopPart) return;
  loopPart = new Tone.Part((time, ev) => triggerChordAt(ev.deg, ev.vel, ev.dur, time), []);
  loopPart.loop = true;
  loopPart.loopStart = 0;
  loopPart.loopEnd = loopState.bars + 'm';
}
function quantizeTime(t) {
  if (!loopState.quantize) return t;
  const step = Tone.Time('16n').toSeconds();
  return Math.round(t / step) * step;
}

// ---- recording hooks (called from playChord/releaseChord) ----
function recordChordStart(deg, vel) {
  if (!loopState.recording) return;
  pending[deg] = { time: Tone.Transport.seconds % loopState.lengthSec, vel: vel || 0.9 };
}
function recordChordEnd(deg) {
  if (!loopState.recording || !pending[deg]) return;
  const p = pending[deg];
  delete pending[deg];
  let start = quantizeTime(p.time) % loopState.lengthSec;
  if (start < 0) start += loopState.lengthSec;
  let end = Tone.Transport.seconds % loopState.lengthSec;
  let dur = end - start;
  if (dur <= 0.02) dur += loopState.lengthSec;        // wrapped past the loop point
  dur = Math.max(0.05, Math.min(dur, loopState.lengthSec * 0.98));
  const ev = { time: start, deg, vel: p.vel, dur };
  loopState.events.push(ev);
  ensurePart();
  loopPart.add(start, ev);
}

// ---- playback control ----
function setPlaying(on) {
  loopState.playing = on;
  if (on) { ensurePart(); loopPart.stop(0); loopPart.start(0); }
  else { if (loopPart) loopPart.stop(); for (let d = 0; d < 7; d++) releaseChord(d); }
}

// ---- count-in: a visible 4-beat pre-count (clicks + big countdown), then callback ----
function countIn(done) {
  const beatSec = 60 / Tone.Transport.bpm.value;
  const total = 4;
  let b = 0;
  metroBtn.disabled = true;
  recBtn.classList.add('blink');
  const chordEl = document.getElementById('dispChord');
  const keyEl = document.getElementById('dispKey');
  const prevKey = keyEl ? keyEl.textContent : '';
  if (keyEl) keyEl.textContent = 'COUNT-IN';
  document.getElementById('display').classList.add('counting');
  const tick = () => {
    if (b >= total) {
      metroBtn.disabled = false;
      if (keyEl) keyEl.textContent = prevKey;
      if (chordEl) chordEl.textContent = 'â— REC';
      document.getElementById('display').classList.remove('counting');
      done();
      return;
    }
    const accent = b === 0;
    if (metroSynth) metroSynth.triggerAttackRelease(accent ? 'C5' : 'G4', '16n', undefined, accent ? 1 : 0.5);
    lightBeat(b % 4);
    if (chordEl) {
      chordEl.textContent = String(total - b);             // 4, 3, 2, 1
      chordEl.style.animation = 'none'; void chordEl.offsetWidth; chordEl.style.animation = '';
    }
    b++;
    setTimeout(tick, beatSec * 1000);
  };
  tick();
}

// ---- Record button ----
const recBtn = document.getElementById('loopRec');
function recUI(on) {
  recBtn.classList.toggle('on', on);
  recBtn.classList.toggle('blink', on);
  document.getElementById('playhead').classList.toggle('rec', on);
}
function beginRecord() {
  ensurePart();
  refreshLoopLength();
  const fresh = !loopState.playing;
  loopState.recording = true;
  if (fresh) {
    Tone.Transport.position = 0;
    setPlaying(true);              // establish the loop / allow overdub playback
    document.getElementById('loopPlay').textContent = 'â–  Stop';
  }
  syncTransport();
  recUI(true);
  updateLoopInfo('â— recordingâ€¦');
}
function stopRecording() {
  loopState.recording = false;
  Object.keys(pending).forEach(d => recordChordEnd(parseInt(d, 10)));
  recUI(false);
  updateLoopInfo(loopState.events.length + ' notes Â· ' + loopState.bars + ' bars');
}
recBtn.onclick = async () => {
  await ensureAudio();
  if (loopState.recording) { stopRecording(); return; }
  if (loopState.countin && !loopState.playing) countIn(beginRecord);
  else beginRecord();
};

// ---- Play / Stop button ----
const playBtn = document.getElementById('loopPlay');
playBtn.onclick = async () => {
  await ensureAudio();
  if (loopState.playing) {
    setPlaying(false);
    syncTransport();
    playBtn.textContent = 'â–¶ Play';
  } else if (loopState.events.length) {
    Tone.Transport.position = 0;
    setPlaying(true);
    syncTransport();
    playBtn.textContent = 'â–  Stop';
  }
};

// ---- Clear ----
document.getElementById('loopClear').onclick = () => {
  if (loopState.recording) stopRecording();
  setPlaying(false);
  if (loopPart) { loopPart.dispose(); loopPart = null; }
  loopState.events = [];
  for (const k in pending) delete pending[k];
  syncTransport();
  playBtn.textContent = 'â–¶ Play';
  updateLoopInfo('â€” empty');
};

// ---- Length / options ----
document.getElementById('loopBars').onchange = (e) => {
  loopState.bars = parseInt(e.target.value, 10);
  refreshLoopLength();
  if (!loopState.events.length) updateLoopInfo('â€” empty');
};
const quantBtn = document.getElementById('quantize');
quantBtn.onclick = () => { loopState.quantize = !loopState.quantize; quantBtn.classList.toggle('on', loopState.quantize); };
const countinBtn = document.getElementById('countin');
countinBtn.onclick = () => { loopState.countin = !loopState.countin; countinBtn.classList.toggle('on', loopState.countin); };

function updateLoopInfo(txt) { document.getElementById('loopInfo').textContent = 'â€” ' + txt; }

// ---- Playhead animation ----
(function animatePlayhead() {
  const fill = document.getElementById('playheadFill');
  const tick = () => {
    if (transportRunning() && loopState.lengthSec > 0) {
      const p = (Tone.Transport.seconds % loopState.lengthSec) / loopState.lengthSec;
      fill.style.width = (p * 100).toFixed(1) + '%';
    } else {
      fill.style.width = '0%';
    }
    requestAnimationFrame(tick);
  };
  tick();
})();

refreshLoopLength();

/* ---------- init ---------- */
document.getElementById('instrument').value = state.instrument;   // reflect the instant-synth default
buildChordButtons();
buildKeyboard();
seqRenderTracks();
syncTrackControls();
seqRender();
updateDisplay();

// Keyboard shortcuts (1-7) for desktop testing
const keyMap = { '1':0,'2':1,'3':2,'4':3,'5':4,'6':5,'7':6 };
window.addEventListener('keydown', (e) => {
  if (keyMap[e.key] !== undefined && !keyHeld[e.key]) {
    keyHeld[e.key] = true; ensureAudio(); playChord(keyMap[e.key]);
  }
});
window.addEventListener('keyup', (e) => {
  if (keyMap[e.key] !== undefined) { keyHeld[e.key] = false; releaseChord(keyMap[e.key]); }
});

// Global safety nets: never leave a note ringing if focus/visibility is lost.
window.addEventListener('blur', releaseAllChords);
document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAllChords(); });

// Suppress the long-press context menu (Android "Download/Share/Print", iOS callout)
// so holding a pad sustains instead of popping a browser menu. Allow it on form fields.
document.addEventListener('contextmenu', (e) => {
  if (!e.target.closest('input, select, textarea')) e.preventDefault();
});

// Manual panic: kill everything currently sounding (live chords + all track voices).
document.getElementById('panic').onclick = () => {
  releaseAllChords();
  seqState.tracks.forEach(t => { try { t.synth && t.synth.releaseAll && t.synth.releaseAll(); } catch (_) {} });
};

/* Mobile tab switching for controls (column 1) and sequencer (column 3) */
(function setupMobileTabs() {
  if (window.innerWidth <= 940) {
    const col1 = document.querySelector('.board > .col:nth-child(1)');
    const col3 = document.querySelector('.board > .col:nth-child(3)');

    // Create tab buttons container (inserted after topbar, before chords)
    const tabContainer = document.createElement('div');
    tabContainer.className = 'mobile-tabs';
    tabContainer.style.cssText = `
      flex: 0 0 auto; padding: 8px 12px 0; display: flex; gap: 4px;
      background: var(--bg); border-bottom: 1px solid var(--border);
    `;

    const btnEffects = document.createElement('button');
    btnEffects.textContent = 'FX';
    btnEffects.className = 'mobile-tab-btn active';
    btnEffects.style.cssText = `
      flex: 1; padding: 10px; background: var(--accent); color: #fff; border: none;
      border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 12px;
    `;

    const btnSeq = document.createElement('button');
    btnSeq.textContent = 'Seq';
    btnSeq.className = 'mobile-tab-btn';
    btnSeq.style.cssText = `
      flex: 1; padding: 10px; background: var(--panel-2); color: var(--text); border: none;
      border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 12px;
    `;

    tabContainer.appendChild(btnEffects);
    tabContainer.appendChild(btnSeq);

    // Insert tabs into DOM after topbar
    const topbar = document.querySelector('.topbar');
    if (topbar && topbar.nextSibling) {
      topbar.parentNode.insertBefore(tabContainer, topbar.nextSibling);
    }

    // Tab click handlers
    btnEffects.onclick = () => {
      col1.classList.add('tab-active');
      col3.classList.remove('tab-active');
      btnEffects.style.background = 'var(--accent)';
      btnEffects.style.color = '#fff';
      btnSeq.style.background = 'var(--panel-2)';
      btnSeq.style.color = 'var(--text)';
    };

    btnSeq.onclick = () => {
      col1.classList.remove('tab-active');
      col3.classList.add('tab-active');
      btnSeq.style.background = 'var(--accent)';
      btnSeq.style.color = '#fff';
      btnEffects.style.background = 'var(--panel-2)';
      btnEffects.style.color = 'var(--text)';
    };
  }
})();
</script>
