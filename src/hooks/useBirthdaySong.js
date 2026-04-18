import { useRef, useCallback, useEffect } from 'react'

const BPM = 108
const BEAT = 60 / BPM

// Happy Birthday to You — C major, starting on G4
const SONG = [
  [392, 0.75], [392, 0.25], [440, 1], [392, 1], [523, 1], [494, 2],  // Happy Birthday to you
  [392, 0.75], [392, 0.25], [440, 1], [392, 1], [587, 1], [523, 2],  // Happy Birthday to you
  [392, 0.75], [392, 0.25], [784, 1], [659, 1], [523, 1], [494, 1], [440, 2], // Happy Birthday dear 마니
  [698, 0.75], [698, 0.25], [659, 1], [523, 1], [587, 1], [523, 3],  // Happy Birthday to you
]

const TOTAL_DURATION = SONG.reduce((s, [, d]) => s + d, 0) * BEAT

function scheduleNote(ctx, dst, freq, t, beats) {
  const dur = beats * BEAT
  const osc  = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  const g    = ctx.createGain()

  osc.type = 'triangle'
  osc.frequency.value = freq
  osc2.type = 'sine'
  osc2.frequency.value = freq * 2

  // volume envelope (attack + release to avoid clicks)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.22, t + 0.02)
  g.gain.setValueAtTime(0.20, t + dur * 0.75)
  g.gain.linearRampToValueAtTime(0, t + dur * 0.95)

  const g2 = ctx.createGain()
  g2.gain.value = 0.07
  osc.connect(g)
  osc2.connect(g2)
  g.connect(dst)
  g2.connect(dst)

  osc.start(t); osc.stop(t + dur)
  osc2.start(t); osc2.stop(t + dur)
}

export function useBirthdaySong() {
  const ctxRef    = useRef(null)
  const masterRef = useRef(null)
  const timerRef  = useRef(null)
  const startedRef = useRef(false)
  const mutedRef  = useRef(false)

  const scheduleLoop = useCallback((loopStart) => {
    const ctx    = ctxRef.current
    const master = masterRef.current
    if (!ctx || !master) return

    let t = loopStart
    SONG.forEach(([freq, beats]) => {
      scheduleNote(ctx, master, freq, t, beats)
      t += beats * BEAT
    })

    const msUntilNext = (loopStart + TOTAL_DURATION - ctx.currentTime - 0.25) * 1000
    timerRef.current = setTimeout(
      () => scheduleLoop(loopStart + TOTAL_DURATION),
      Math.max(0, msUntilNext)
    )
  }, [])

  const start = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true

    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ctxRef.current = ctx

    const master = ctx.createGain()
    master.gain.value = 1
    master.connect(ctx.destination)
    masterRef.current = master

    scheduleLoop(ctx.currentTime + 0.3)
  }, [scheduleLoop])

  const toggleMute = useCallback(() => {
    const master = masterRef.current
    const ctx    = ctxRef.current
    if (!master || !ctx) return false
    mutedRef.current = !mutedRef.current
    master.gain.setTargetAtTime(mutedRef.current ? 0 : 1, ctx.currentTime, 0.15)
    return mutedRef.current
  }, [])

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current)
      ctxRef.current?.close()
    }
  }, [])

  return { start, toggleMute }
}
