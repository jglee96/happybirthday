import { useState, useEffect, useRef, useCallback } from 'react'
import { CakeScene } from './components/CakeScene'

const TOTAL = 5
const CONFETTI_COLORS = ['#e8c97a', '#f0829a', '#ffc2d1', '#fff8ee', '#c0deff', '#c9e8c0']

function useConfetti(active) {
  const canvasRef = useRef()
  const particlesRef = useRef([])
  const rafRef = useRef()

  const launch = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    for (let i = 0; i < 200; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: canvas.height * (.2 + Math.random() * .4),
        vx: (Math.random() - .5) * 15,
        vy: -(Math.random() * 18 + 5),
        r: Math.random() * 6 + 3,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rot: Math.random() * 360,
        rotV: (Math.random() - .5) * 13,
        rect: Math.random() > .45,
        alpha: 1,
      })
    }
  }, [])

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)
    launch()

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current = particlesRef.current.filter(p => p.alpha > .01)
      particlesRef.current.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += .4; p.vx *= .993
        p.rot += p.rotV; p.alpha -= .01
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.fillStyle = p.color
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot * Math.PI / 180)
        if (p.rect) ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r)
        else { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2); ctx.fill() }
        ctx.restore()
      })
      if (particlesRef.current.length > 0) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize) }
  }, [active, launch])

  return canvasRef
}

export default function App() {
  const [blown, setBlown] = useState(0)
  const allBlown = blown >= TOTAL
  const confettiRef = useConfetti(allBlown)

  const [portrait, setPortrait] = useState(
    typeof window !== 'undefined' && window.innerWidth < window.innerHeight
  )
  useEffect(() => {
    const update = () => setPortrait(window.innerWidth < window.innerHeight)
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])

  const handleBlow = useCallback(() => {
    setBlown(prev => Math.min(prev + 1, TOTAL))
  }, [])

  return (
    <div className="app">
      <canvas className="confetti-canvas" ref={confettiRef} />

      {/* 3D canvas */}
      <div className="canvas-wrap">
        <CakeScene onCandleBlow={handleBlow} portrait={portrait} />
      </div>

      {/* readability scrims */}
      <div className="scrim-top" />
      <div className="scrim-bottom" />

      {/* title block */}
      <div className="overlay-top">
        <span className="overlay-label">Happy Birthday</span>
        <h1 className="overlay-title">마니</h1>
        <span className="overlay-date">1998 · 04 · 18</span>
        <span className="overlay-sub">스물여덟 번째 생일을 축하해</span>
      </div>

      {/* candle dots */}
      <div className="candle-counter">
        {Array.from({ length: TOTAL }, (_, i) => (
          <div key={i} className={`candle-dot${i < blown ? ' out' : ''}`} />
        ))}
      </div>

      {/* bottom hint */}
      <div className="overlay-bottom">
        <p className={`hint-text${allBlown ? ' celebration' : ''}`}>
          {allBlown ? '🎉  생일 축하해, 마니야!  🎉' : '촛불을 클릭해서 꺼봐  🕯️'}
        </p>
      </div>
    </div>
  )
}
