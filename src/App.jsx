import { useState, useEffect, useRef, useCallback } from 'react'
import { Hero } from './components/Hero'
import { CakeScene } from './components/CakeScene'

function useConfetti(active) {
  const canvasRef = useRef()
  const particlesRef = useRef([])
  const rafRef = useRef()

  const COLORS = ['#e8c97a', '#f0829a', '#ffc2d1', '#fff8ee', '#c0deff', '#c9e8c0']

  const launch = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    for (let i = 0; i < 220; i++) {
      particlesRef.current.push({
        x: Math.random() * canvas.width,
        y: canvas.height * (0.3 + Math.random() * 0.3),
        vx: (Math.random() - 0.5) * 16,
        vy: -(Math.random() * 20 + 6),
        r: Math.random() * 6 + 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rot: Math.random() * 360,
        rotV: (Math.random() - 0.5) * 14,
        isRect: Math.random() > 0.45,
        alpha: 1,
      })
    }
  }, [])

  useEffect(() => {
    if (!active) return
    launch()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function tick() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0.01)
      particlesRef.current.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.42
        p.vx *= 0.992
        p.rot += p.rotV
        p.alpha -= 0.011
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.fillStyle = p.color
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rot * Math.PI) / 180)
        if (p.isRect) {
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r)
        } else {
          ctx.beginPath()
          ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      })
      if (particlesRef.current.length > 0) rafRef.current = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [active, launch])

  return canvasRef
}

export default function App() {
  const [allBlown, setAllBlown] = useState(false)
  const confettiRef = useConfetti(allBlown)

  return (
    <>
      <canvas ref={confettiRef} className="confetti-overlay" />
      <Hero />
      <span className="divider" />
      <CakeScene onAllBlown={() => setAllBlown(true)} />
      <footer>
        <div className="footer-heart">🤍</div>
        <p className="footer-text">마니 · 생일 축하해 · 2026</p>
      </footer>
    </>
  )
}
