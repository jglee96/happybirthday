import { useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'

function Flame({ halfH, flameOn, onBlow }) {
  const outerRef = useRef()
  const innerRef = useRef()
  const coreRef = useRef()
  const lightRef = useRef()
  const scaleRef = useRef(1)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (!flameOn) {
      scaleRef.current = Math.max(0, scaleRef.current - 0.08)
    } else {
      scaleRef.current = Math.min(1, scaleRef.current + 0.1)
    }

    const s = scaleRef.current

    if (outerRef.current) {
      outerRef.current.scale.x = s * (0.82 + Math.sin(t * 9.7) * 0.14)
      outerRef.current.scale.z = s * (0.82 + Math.cos(t * 8.1) * 0.14)
      outerRef.current.scale.y = s * (0.88 + Math.sin(t * 6.9) * 0.1)
      outerRef.current.rotation.y += 0.025
    }
    if (innerRef.current) {
      innerRef.current.scale.x = s * (0.78 + Math.sin(t * 13.2) * 0.2)
      innerRef.current.scale.z = s * (0.78 + Math.cos(t * 11.8) * 0.2)
      innerRef.current.scale.y = s * (0.9 + Math.sin(t * 8.4) * 0.1)
    }
    if (coreRef.current) {
      coreRef.current.scale.setScalar(s)
    }
    if (lightRef.current) {
      lightRef.current.intensity = s * (0.65 + Math.sin(t * 16) * 0.28)
    }
  })

  const yBase = halfH + 0.09

  return (
    <group
      position={[0, yBase, 0]}
      onClick={(e) => { e.stopPropagation(); onBlow() }}
    >
      {/* outer flame — orange */}
      <mesh ref={outerRef}>
        <coneGeometry args={[0.11, 0.35, 6]} />
        <meshBasicMaterial color="#ff6820" transparent opacity={0.75} depthWrite={false} />
      </mesh>
      {/* inner flame — yellow */}
      <mesh ref={innerRef} position={[0, 0.05, 0]}>
        <coneGeometry args={[0.06, 0.28, 6]} />
        <meshBasicMaterial color="#fff180" transparent opacity={0.95} depthWrite={false} />
      </mesh>
      {/* bright core */}
      <mesh ref={coreRef} position={[0, 0.07, 0]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color="#ffffff" depthWrite={false} />
      </mesh>
      {/* invisible larger click target */}
      <mesh visible={false}>
        <sphereGeometry args={[0.28, 6, 6]} />
        <meshBasicMaterial />
      </mesh>
      <pointLight ref={lightRef} color="#ff9040" intensity={0.7} distance={3.5} decay={2} />
    </group>
  )
}

export function Candle({ position, candleHeight = 0.72, color = '#f0829a', onBlow }) {
  const [flameOn, setFlameOn] = useState(true)
  const halfH = candleHeight / 2

  const handleBlow = useCallback(() => {
    if (!flameOn) return
    setFlameOn(false)
    onBlow?.()
  }, [flameOn, onBlow])

  return (
    <group position={position}>
      {/* body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.088, 0.092, candleHeight, 16]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.05} />
      </mesh>
      {/* top wax pool */}
      <mesh position={[0, halfH, 0]}>
        <cylinderGeometry args={[0.1, 0.094, 0.035, 16]} />
        <meshStandardMaterial color={color} roughness={0.25} />
      </mesh>
      {/* wick */}
      <mesh position={[0, halfH + 0.035, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.07, 8]} />
        <meshStandardMaterial color="#1a0500" roughness={1} />
      </mesh>
      <Flame halfH={halfH} flameOn={flameOn} onBlow={handleBlow} />
    </group>
  )
}
