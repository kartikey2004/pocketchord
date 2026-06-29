# PocketChord

A pocket chord synthesizer, arpeggiator & step sequencer that runs entirely in the browser — no install, no backend. Built with [Tone.js](https://tonejs.github.io/).

Play harmonically-correct chords with single taps, design your own synth, and drive a deep performance arpeggiator. Installable as a PWA (Add to Home Screen) and works offline.

## Features
- 7 diatonic chord pads across all 12 keys and 8 scales/modes
- Chord types: triad / 7th / 9th / sus2 / sus4, with voicings (close, open, drop-2/3, wide, piano, guitar, strings)
- 6 built-in instruments + a full **custom subtractive synth** (2 osc + sub + noise → filter → amp, LFO, JSON presets)
- **Performance arpeggiator**: 18 patterns, octave modes, gate, velocity/accent/humanize, probability, Euclidean rhythms, bass-split, melody hold, phrase generator, 15 one-tap style presets
- Metronome, tap tempo, looper (overdub), and a multi-track chord step sequencer
- Latch / sustain, live piano-keyboard visualization, light/dark theme
- Touch, mouse, and Web MIDI input

## Run it
Just open `index.html` in a modern browser, or serve the folder:

```
python -m http.server 8123
```

Then open `http://localhost:8123`.

## License
Personal project — use freely.
