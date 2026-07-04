# PocketChord Mobile-First Redesign Plan

## Current State (v14)
- Live at: https://kartikey2004.github.io/pocketchord/
- Backup: `index_v14_backup.html`
- CSS-only modern styling applied (blue accent, glassmorphism)
- Layout still 3-column desktop structure
- All functionality working

## Goal
Transform into true mobile-first layout matching spec:
- Chord pads as primary hero element (full width, 2-column grid)
- Top bar (minimal: logo, key, MIDI status, record, audio, theme)
- Piano keyboard below top bar
- Controls hidden in tabs/sections below pads
- Floating transport bar above bottom nav
- Bottom navigation with 5 tabs (Home, Seq, FX, Inst, Settings)

## Critical Success Factor
**PRESERVE ALL ELEMENT IDs** — JavaScript depends on:
- `#keyScroller`, `#typeRow` (key/chord selectors)
- `#chords` (chord pad container)
- `#kbd` (piano keyboard)
- `#instrument`, `#volume` (instrument controls)
- `#seqUI`, `#arpUI`, `#voicingUI`, `#effectsRow` (control sections)
- `#synthCustomUI`, `#panic`, `#themeBtn`, `#enableAudio`, `#midiStatus`
- All event listeners and DOM queries depend on these exact IDs

## Step-by-Step Implementation

### Phase 1: Extract & Backup
```bash
# Save current working state
git checkout -b redesign-v15
cp index.html index_v15_mobile_first.html

# Extract key sections
head -705 index.html > _head.html        # DOCTYPE through </style>
tail -n +705 index.html > _script.html   # <script> through EOF
```

### Phase 2: Build New HTML Structure
**New body structure (all inside .wrap):**

```html
<body>
  <div id="startOverlay">...</div>
  <div id="toast"></div>
  
  <div class="wrap">
    <!-- 1. TOP BAR (MINIMAL) -->
    <div class="topbar">
      <h1><span class="dot"></span> PocketChord</h1>
      <div id="display">...</div>
      <div id="midiStatus" style="display:none;">...</div>
      <button id="themeBtn">🌙</button>
      <button id="enableAudio">🔊</button>
    </div>

    <!-- 2. KEY SELECTOR (LARGE CARD) -->
    <div class="key-selector">
      <!-- Contains #keyScroller, #typeRow from original Col 1 -->
    </div>

    <!-- 3. PIANO KEYBOARD -->
    <div class="piano-section">
      <div class="kbd" id="kbd"></div>
    </div>

    <!-- 4. MAIN CONTENT (HERO AREA - PADS) -->
    <div class="main-content">
      <!-- Chord pads section with #chords -->
      <div class="chords" id="chords"></div>
      
      <!-- Tempo display -->
      <div class="tempo-card">
        <div id="tempoValue">100</div>
        <div>BPM</div>
      </div>
    </div>

    <!-- 5. EXPANDABLE SECTIONS (TABS) -->
    <div class="controls-section">
      <div id="effectsRow">...</div>
      <div id="voicingUI">...</div>
      <div id="seqUI">...</div>
      <div id="synthCustomUI">...</div>
      <div id="arpUI">...</div>
    </div>

    <!-- 6. FLOATING TRANSPORT BAR -->
    <div class="transport">
      <button id="playBtn">▶ Play</button>
      <button id="stopBtn">■ Stop</button>
      <button id="recBtn">● Rec</button>
    </div>

    <!-- 7. BOTTOM NAVIGATION -->
    <nav class="bottom-nav">
      <button class="nav-tab active" data-section="home">Home</button>
      <button class="nav-tab" data-section="sequencer">Seq</button>
      <button class="nav-tab" data-section="effects">FX</button>
      <button class="nav-tab" data-section="instruments">Inst</button>
      <button class="nav-tab" data-section="settings">⚙</button>
    </nav>
  </div>
</body>
```

### Phase 3: Reorganize Original Elements
**Col 1 (Sound Shaping) → Tab Pages:**
- Key/Type selectors → Key Selector card
- Instrument/Volume → Instruments tab
- Effects → Effects tab
- Octave/Inversion/Voicing → Effects tab (expandable)
- Arpeggiator → Effects tab (expandable)

**Col 2 (Play) → Hero Area:**
- Chord pads (#chords) → Main content area
- Tempo display → Below pads

**Col 3 (Arrange) → Sequencer Tab:**
- Looper → Sequencer tab
- Chord Sequencer → Sequencer tab
- Step sequencer controls → Sequencer tab

### Phase 4: CSS Reorganization

**Key CSS Changes:**
```css
/* Layout */
body { display: flex; flex-direction: column; height: 100dvh; }
.wrap { flex: 1; display: flex; flex-direction: column; padding: 0; }

/* Top bar: minimal */
.topbar { 
  padding: 10px 12px; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  border-bottom: 1px solid var(--border);
}

/* Key selector: large card */
.key-selector { 
  padding: 12px; 
  flex: 0 0 auto; 
}
.key-card { 
  display: flex; 
  justify-content: space-between; 
  padding: 14px 18px; 
  border-radius: 16px; 
}

/* Piano: responsive height */
.piano-section { 
  flex: 0 0 auto; 
  padding: 8px 12px; 
  height: 50px; 
}
.kbd { display: flex; gap: 2px; }

/* Main content: HERO AREA */
.main-content { 
  flex: 1 1 auto; 
  overflow-y: auto; 
  padding: 12px; 
}
.chords { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 10px; 
  margin-bottom: 12px; 
}
.chord-btn { 
  aspect-ratio: 1; 
  border-radius: 16px; 
  font-size: 18px; 
}

/* Controls section (expandable/tabbed) */
.controls-section { 
  flex: 0 0 auto; 
  padding: 12px; 
  overflow-y: auto; 
  max-height: 200px; 
}

/* Transport bar: floating above nav */
.transport { 
  flex: 0 0 auto; 
  display: flex; 
  justify-content: space-between; 
  padding: 10px 12px; 
  border-top: 1px solid var(--border); 
}

/* Bottom navigation */
.bottom-nav { 
  flex: 0 0 auto; 
  display: flex; 
  border-top: 1px solid var(--border); 
}
.nav-tab { 
  flex: 1; 
  padding: 12px 8px; 
  border: none; 
  background: transparent; 
}
.nav-tab.active { 
  border-top: 2px solid var(--accent); 
  color: var(--accent); 
}
```

### Phase 5: Tab Navigation JS
```javascript
// Simple tab switching (add before </script>)
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const section = tab.getAttribute('data-section');
    
    // Hide all sections
    document.querySelectorAll('[data-section]').forEach(s => s.style.display = 'none');
    
    // Show active section
    document.querySelector(`[data-section="${section}"]`).style.display = 'block';
    
    // Update nav buttons
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});
```

### Phase 6: Testing Checklist

Before deployment:
- [ ] **HTML loads without errors** (no console errors)
- [ ] **All element IDs present** (grep for all critical IDs in new file)
- [ ] **Audio works** (tap chord, hear sound)
- [ ] **All controls accessible** (scroll through each tab, all controls visible)
- [ ] **Layout responsive** (test at 360px, 390px, 480px widths)
- [ ] **Piano keyboard visible** (at correct size ~20% of screen)
- [ ] **Chord pads full width** (2-column grid, fills main area)
- [ ] **Bottom nav working** (tap each tab, correct section shows)
- [ ] **Touch targets large** (48px minimum, easy to tap)
- [ ] **No visual glitches** (no overlapping elements, proper spacing)

### Phase 7: Deployment

```bash
# Test locally first
# Then: git add index.html && git commit -m "Full mobile-first redesign"
# Then: bump sw.js to v15
# Then: git push
```

## Implementation Notes

### What Must NOT Change
- Zero changes to JavaScript (beyond adding tab switching)
- All element IDs must exist (old IDs, new positions)
- All data attributes and classes must be preserved
- Audio engine, synth, sequencer untouched

### What Will Change
- HTML structure (reordering, wrapping in sections)
- CSS layout (flexbox columns instead of grid)
- Visual appearance (already updated in v14: blue accent, glassmorphism, rounded corners)
- Navigation (tabs to access different sections)

### Risk Mitigation
1. Keep old file as backup (`index_v14_backup.html`)
2. Test locally in preview before pushing
3. Check console for missing ID errors
4. Verify each control section renders
5. Small commits if needed (can revert one at a time)

### Estimated Time
- Restructure HTML: 45 min (careful, line-by-line)
- CSS reorganization: 30 min
- Tab JS + testing: 20 min
- Total: ~1.5 hours with fresh tokens

## Success Metrics
- ✅ Chord pads dominate screen on mobile (80% of viewport height)
- ✅ Controls accessible but not cluttering home view
- ✅ All synthesis/sequencer features work
- ✅ Feels like a premium mobile app (per spec)
- ✅ No console errors or missing IDs

## Next Steps
1. When tokens refreshed, follow Phase 1-7 in order
2. Test in preview thoroughly before live deployment
3. Keep old backup for emergency revert
4. Once live, gather user feedback before further iterations

---

**Status:** Ready for implementation in next session with fresh tokens
**Backup:** index_v14_backup.html  
**Target:** Mobile-first layout matching spec
