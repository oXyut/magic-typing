let audioCtx: AudioContext | null = null

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function note(
  freq: number,
  startOffset: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainValue = 0.15,
) {
  try {
    const ac = ctx()
    const osc = ac.createOscillator()
    const g = ac.createGain()
    osc.connect(g)
    g.connect(ac.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ac.currentTime + startOffset)
    g.gain.setValueAtTime(gainValue, ac.currentTime + startOffset)
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startOffset + duration)
    osc.start(ac.currentTime + startOffset)
    osc.stop(ac.currentTime + startOffset + duration + 0.01)
  } catch { /* ignore */ }
}

export function playCorrect() {
  note(880, 0, 0.055, 'triangle', 0.1)
}

export function playIncorrect() {
  note(140, 0, 0.09, 'sawtooth', 0.06)
}

export function playCardComplete() {
  // C major arpeggio: C5 → E5 → G5 → C6
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    note(f, i * 0.07, 0.22, 'sine', 0.15),
  )
}
