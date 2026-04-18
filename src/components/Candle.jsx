import { useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'

// ── Striped candle body ────────────────────────────────────────────────────
function StripedBody({ height, radius, color1, color2, stripes }) {
  const sh = height / stripes
  return (
    <group>
      {Array.from({ length: stripes }, (_, i) => (
        <mesh key={i} position={[0, -height / 2 + sh * (i + 0.5), 0]}>
          <cylinderGeometry args={[radius, radius * 1.04, sh + 0.003, 16]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? color1 : color2}
            roughness={0.52}
            metalness={0.0}
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Flame ──────────────────────────────────────────────────────────────────
function Flame({ halfH, flameOn, onBlow, scale = 1 }) {
  const outerRef = useRef()
  const innerRef = useRef()
  const coreRef  = useRef()
  const lightRef = useRef()
  const sRef = useRef(flameOn ? 1 : 0)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    sRef.current = flameOn
      ? Math.min(1, sRef.current + 0.1)
      : Math.max(0, sRef.current - 0.08)
    const s = sRef.current

    if (outerRef.current) {
      outerRef.current.scale.x = s * (0.82 + Math.sin(t * 9.7) * 0.14)
      outerRef.current.scale.z = s * (0.82 + Math.cos(t * 8.1) * 0.14)
      outerRef.current.scale.y = s * (0.88 + Math.sin(t * 6.9) * 0.10)
      outerRef.current.rotation.y += 0.025
    }
    if (innerRef.current) {
      innerRef.current.scale.x = s * (0.78 + Math.sin(t * 13.2) * 0.20)
      innerRef.current.scale.z = s * (0.78 + Math.cos(t * 11.8) * 0.20)
      innerRef.current.scale.y = s * (0.90 + Math.sin(t * 8.4)  * 0.10)
    }
    if (coreRef.current)  coreRef.current.scale.setScalar(s)
    if (lightRef.current) lightRef.current.intensity = s * (0.65 + Math.sin(t * 16) * 0.28)
  })

  const yBase = halfH + 0.09
  const sc    = scale

  return (
    <group position={[0, yBase, 0]} onClick={(e) => { e.stopPropagation(); onBlow() }}>
      <mesh ref={outerRef} scale={[sc, sc, sc]}>
        <coneGeometry args={[0.11, 0.35, 6]} />
        <meshBasicMaterial color="#ff6820" transparent opacity={0.78} depthWrite={false} />
      </mesh>
      <mesh ref={innerRef} position={[0, 0.05 * sc, 0]} scale={[sc, sc, sc]}>
        <coneGeometry args={[0.06, 0.28, 6]} />
        <meshBasicMaterial color="#fff480" transparent opacity={0.96} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef} position={[0, 0.07 * sc, 0]}>
        <sphereGeometry args={[0.045 * sc, 8, 8]} />
        <meshBasicMaterial color="#ffffff" depthWrite={false} />
      </mesh>
      {/* bigger click target */}
      <mesh visible={false}>
        <sphereGeometry args={[0.3 * sc, 6, 6]} />
        <meshBasicMaterial />
      </mesh>
      <pointLight ref={lightRef} color="#ff9040" intensity={0.7} distance={3.5 * sc} decay={2} />
    </group>
  )
}

// ── Candle ─────────────────────────────────────────────────────────────────
// isLarge=true  → 큰 양초 (10살 단위)
// isLarge=false → 작은 양초 (1살 단위)
export function Candle({ position, isLarge = false, color1 = '#f0829a', color2 = '#faccda', onBlow }) {
  const [flameOn, setFlameOn] = useState(true)

  const height = isLarge ? 1.12 : 0.52
  const radius = isLarge ? 0.112 : 0.068
  const stripes = isLarge ? 8 : 5
  const halfH  = height / 2
  const flameScale = isLarge ? 1.45 : 1.0

  const handleBlow = useCallback(() => {
    if (!flameOn) return
    setFlameOn(false)
    onBlow?.()
  }, [flameOn, onBlow])

  return (
    <group position={position}>
      {/* plastic holder ring */}
      <mesh position={[0, -halfH + 0.022, 0]}>
        <cylinderGeometry args={[radius * 1.85, radius * 1.55, 0.038, 14]} />
        <meshStandardMaterial color="#D8CEC4" roughness={0.45} metalness={0.12} />
      </mesh>
      {/* striped body */}
      <StripedBody
        height={height}
        radius={radius}
        color1={color1}
        color2={color2}
        stripes={stripes}
      />
      {/* wax pool on top */}
      <mesh position={[0, halfH, 0]}>
        <cylinderGeometry args={[radius * 1.1, radius, 0.032, 14]} />
        <meshStandardMaterial color={color1} roughness={0.28} />
      </mesh>
      {/* wick */}
      <mesh position={[0, halfH + 0.032, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.065, 8]} />
        <meshStandardMaterial color="#1a0500" roughness={1} />
      </mesh>
      <Flame halfH={halfH} flameOn={flameOn} onBlow={handleBlow} scale={flameScale} />
    </group>
  )
}
