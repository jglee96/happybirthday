import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Candle } from './Candle'

// ── seeded RNG (stable across renders) ──────────────────────────────────────
function s(seed) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

// ── Ganache drip ─────────────────────────────────────────────────────────────
function Drips({ radius, yTop, count, color = '#2a0a14' }) {
  const drips = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2 + (s(i * 7.3) - 0.5) * 0.28,
        len:   0.12 + s(i * 3.7 + 1) * 0.32,
        rOff:  s(i * 5.1) * 0.04,
        thick: 0.035 + s(i * 11.7) * 0.025,
      })),
    [count]
  )
  return (
    <>
      {drips.map((d, i) => {
        const r = radius - d.rOff
        return (
          <mesh
            key={i}
            position={[Math.cos(d.angle) * r, yTop - d.len / 2 - 0.01, Math.sin(d.angle) * r]}
          >
            <capsuleGeometry args={[d.thick, d.len, 4, 8]} />
            <meshStandardMaterial color={color} roughness={0.08} metalness={0.0} />
          </mesh>
        )
      })}
    </>
  )
}

// ── Piped cream rosette ───────────────────────────────────────────────────────
function Rosette({ position, color = '#FFF0F3', scale = 1 }) {
  const r  = 0.068 * scale
  const off = 0.088 * scale
  const angles = [0, 60, 120, 180, 240, 300]
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[r, 8, 8]} />
        <meshStandardMaterial color={color} roughness={0.1} metalness={0.03} />
      </mesh>
      {angles.map((deg, i) => {
        const a = (deg * Math.PI) / 180
        return (
          <mesh key={i} position={[Math.cos(a) * off, 0, Math.sin(a) * off]}>
            <sphereGeometry args={[r * 0.82, 7, 7]} />
            <meshStandardMaterial color={color} roughness={0.1} metalness={0.03} />
          </mesh>
        )
      })}
    </group>
  )
}

// ── Ring of rosettes around a tier base/top ─────────────────────────────────
function RosetteRing({ radius, y, count, color, rScale = 1 }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2
        return (
          <Rosette
            key={i}
            position={[Math.cos(a) * radius, y, Math.sin(a) * radius]}
            color={color}
            scale={rScale}
          />
        )
      })}
    </>
  )
}

// ── Gold fondant ribbon ───────────────────────────────────────────────────────
function GoldBand({ radius, y, height = 0.07 }) {
  return (
    <mesh position={[0, y, 0]}>
      <cylinderGeometry args={[radius + 0.01, radius + 0.01, height, 64]} />
      <meshStandardMaterial color="#C8A84B" roughness={0.3} metalness={0.7} />
    </mesh>
  )
}

// ── Macaron ───────────────────────────────────────────────────────────────────
function Macaron({ position, rotation = [0, 0, 0], color = '#F4A0B8' }) {
  return (
    <group position={position} rotation={rotation}>
      {/* top shell */}
      <mesh position={[0, 0.085, 0]} scale={[1, 0.42, 1]}>
        <sphereGeometry args={[0.19, 14, 10]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.0} />
      </mesh>
      {/* bottom shell */}
      <mesh position={[0, -0.085, 0]} scale={[1, 0.42, 1]}>
        <sphereGeometry args={[0.19, 14, 10]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.0} />
      </mesh>
      {/* ganache filling */}
      <mesh>
        <cylinderGeometry args={[0.175, 0.175, 0.065, 16]} />
        <meshStandardMaterial color="#fff4f0" roughness={0.12} />
      </mesh>
    </group>
  )
}

// ── Strawberry ────────────────────────────────────────────────────────────────
function Strawberry({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* body (cone flipped: wide top = calyx, point at bottom) */}
      <mesh rotation={[Math.PI, 0, 0]} position={[0, 0.14, 0]}>
        <coneGeometry args={[0.15, 0.3, 10]} />
        <meshStandardMaterial color="#C81010" roughness={0.58} />
      </mesh>
      {/* rounded tip */}
      <mesh position={[0, -0.01, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#B00C0C" roughness={0.6} />
      </mesh>
      {/* calyx leaves */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const a = (deg * Math.PI) / 180
        return (
          <group
            key={i}
            position={[Math.cos(a) * 0.06, 0.3, Math.sin(a) * 0.06]}
            rotation={[0.7, a, 0]}
          >
            <mesh scale={[1, 0.18, 0.55]}>
              <sphereGeometry args={[0.1, 6, 4]} />
              <meshStandardMaterial color="#2E6B1A" roughness={0.72} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

// ── Pearl cluster ─────────────────────────────────────────────────────────────
function PearlRow({ radius, y, count, colors = ['#e8c97a', '#f0829a', '#ffc2d1'] }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * radius, y, Math.sin(a) * radius]}>
            <sphereGeometry args={[0.085, 10, 10]} />
            <meshStandardMaterial
              color={colors[i % colors.length]}
              roughness={0.25}
              metalness={0.3}
            />
          </mesh>
        )
      })}
    </>
  )
}

// ── Simple flower ─────────────────────────────────────────────────────────────
function Flower({ position, outerColor = '#F8B4C8', innerColor = '#D4608A', scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* outer petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const a = (deg * Math.PI) / 180
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.17, 0, Math.sin(a) * 0.17]}
            rotation={[-0.6, a, 0]}
          >
            <sphereGeometry args={[0.1, 7, 6]} />
            <meshStandardMaterial color={outerColor} roughness={0.42} />
          </mesh>
        )
      })}
      {/* inner petals */}
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const a = (deg * Math.PI) / 180
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.09, 0.04, Math.sin(a) * 0.09]}
            rotation={[-0.4, a, 0]}
          >
            <sphereGeometry args={[0.075, 7, 6]} />
            <meshStandardMaterial color={innerColor} roughness={0.38} />
          </mesh>
        )
      })}
      {/* center */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#F5D060" roughness={0.22} metalness={0.2} />
      </mesh>
    </group>
  )
}

// ── Leaf ─────────────────────────────────────────────────────────────────────
function Leaf({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation} scale={[0.9, 0.14, 1.4]}>
      <sphereGeometry args={[0.12, 7, 5]} />
      <meshStandardMaterial color="#3A7D24" roughness={0.65} />
    </mesh>
  )
}

// ── Cake stand (pedestal) ─────────────────────────────────────────────────────
function CakeStand() {
  return (
    <group>
      {/* plate */}
      <mesh position={[0, -0.07, 0]}>
        <cylinderGeometry args={[3.65, 3.65, 0.14, 64]} />
        <meshStandardMaterial color="#FAF0E6" roughness={0.5} metalness={0.08} />
      </mesh>
      {/* plate edge bevel */}
      <mesh position={[0, -0.07, 0]}>
        <cylinderGeometry args={[3.72, 3.65, 0.08, 64]} />
        <meshStandardMaterial color="#E8D8C4" roughness={0.55} metalness={0.1} />
      </mesh>
      {/* pillar */}
      <mesh position={[0, -0.62, 0]}>
        <cylinderGeometry args={[0.38, 0.52, 1.0, 32]} />
        <meshStandardMaterial color="#FAF0E6" roughness={0.5} metalness={0.06} />
      </mesh>
      {/* base disc */}
      <mesh position={[0, -1.15, 0]}>
        <cylinderGeometry args={[2.1, 2.1, 0.1, 64]} />
        <meshStandardMaterial color="#FAF0E6" roughness={0.5} metalness={0.08} />
      </mesh>
    </group>
  )
}

// ── Main CakeMesh ─────────────────────────────────────────────────────────────
export function CakeMesh({ onCandleBlow }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.55) * 0.06
    }
  })

  // ── dimensions ──────────────────────────────────────────────────────────────
  const B  = { r: 2.9,  h: 1.45 }   // bottom tier
  const M  = { r: 1.95, h: 1.2  }   // middle tier
  const T  = { r: 1.28, h: 0.92 }   // top tier
  const FH = 0.12                     // frosting disc height

  // ── Y stack ─────────────────────────────────────────────────────────────────
  const yBtop = B.h
  const yM    = yBtop + FH
  const yMtop = yM + M.h
  const yT    = yMtop + FH
  const yTtop = yT + T.h
  const yC    = yTtop + FH   // candle bases

  // ── candle positions ─────────────────────────────────────────────────────────
  // 2 large (10년) at center, 9 small (1년) in ring → total 29
  const largeCandlePos = [[-0.35, yC + 1.12 / 2, 0], [0.35, yC + 1.12 / 2, 0]]
  const smallCandlePos = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2
    return [Math.cos(a) * 0.72, yC + 0.52 / 2, Math.sin(a) * 0.72]
  })
  const LARGE_COLS = [['#E8C97A','#FFF0D0'],['#F4A0B8','#FFD0E0']]
  const SMALL_COLS = [
    ['#F4A0B8','#FFD0E0'],['#C4AADA','#E8D8F8'],['#A8C8E8','#D0E8F8'],
    ['#F4B896','#FFD8C0'],['#A8D8B8','#D0F0E0'],['#E8C97A','#FFF0D0'],
    ['#F4A0B8','#FFD0E0'],['#C4AADA','#E8D8F8'],['#F4B896','#FFD8C0'],
  ]

  // ── macaron positions (on top tier frosting) ────────────────────────────────
  const macarons = [
    { pos:[0.72, yTtop+FH+0.085, -0.22], rot:[0, 0.4, 0.3],  color:'#F4A0B8' },
    { pos:[-0.6, yTtop+FH+0.085,  0.35], rot:[0, 2.1, -0.25], color:'#A8C8A8' },
    { pos:[0.15, yTtop+FH+0.085,  0.7],  rot:[0, 1.0, 0.2],  color:'#C4AADA' },
  ]

  // ── strawberry positions (on plate) ─────────────────────────────────────────
  const berryAngles = [0, 45, 90, 135, 180, 225, 270, 315]
  const FROST = '#FFF0F5'
  const DRIP  = '#1a0510'

  return (
    <group ref={groupRef}>
      <CakeStand />

      {/* ── bottom tier ──────────────────────────────────────────────────── */}
      <mesh position={[0, B.h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[B.r, B.r * 1.018, B.h, 72]} />
        <meshStandardMaterial color="#782650" roughness={0.9} />
      </mesh>
      {/* naked-cake cream bands */}
      <mesh position={[0, B.h * 0.33, 0]}>
        <cylinderGeometry args={[B.r + 0.012, B.r + 0.012, 0.07, 72]} />
        <meshStandardMaterial color="#FFF0F5" roughness={0.65} />
      </mesh>
      <mesh position={[0, B.h * 0.67, 0]}>
        <cylinderGeometry args={[B.r + 0.012, B.r + 0.012, 0.07, 72]} />
        <meshStandardMaterial color="#FFF0F5" roughness={0.65} />
      </mesh>
      {/* gold band */}
      <GoldBand radius={B.r} y={B.h * 0.38} />
      {/* frosting top */}
      <mesh position={[0, yBtop + FH / 2, 0]}>
        <cylinderGeometry args={[B.r + 0.2, B.r + 0.2, FH, 72]} />
        <meshStandardMaterial color={FROST} roughness={0.55} metalness={0.0} />
      </mesh>
      {/* ganache drips */}
      <Drips radius={B.r + 0.16} yTop={yBtop} count={28} color={DRIP} />
      {/* rosette border at base (sitting on plate) */}
      <RosetteRing radius={B.r * 0.92} y={0.07}    count={18} color={FROST} rScale={0.9} />
      {/* rosette border at top (just above frosting edge) */}
      <RosetteRing radius={B.r + 0.18} y={yBtop + FH + 0.06} count={22} color={FROST} rScale={0.82} />
      {/* pearl row mid-tier */}
      <PearlRow radius={B.r + 0.02} y={B.h * 0.62} count={20} />

      {/* strawberries around plate */}
      {berryAngles.map((deg, i) => {
        const a = (deg * Math.PI) / 180
        const r = 3.05
        return (
          <Strawberry
            key={i}
            position={[Math.cos(a) * r, -0.07, Math.sin(a) * r]}
            scale={0.88}
          />
        )
      })}

      {/* ── middle tier ──────────────────────────────────────────────────── */}
      <mesh position={[0, yM + M.h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[M.r, M.r * 1.018, M.h, 72]} />
        <meshStandardMaterial color="#8C3260" roughness={0.9} />
      </mesh>
      <mesh position={[0, yM + M.h * 0.33, 0]}>
        <cylinderGeometry args={[M.r + 0.012, M.r + 0.012, 0.06, 72]} />
        <meshStandardMaterial color="#FFF0F5" roughness={0.65} />
      </mesh>
      <mesh position={[0, yM + M.h * 0.67, 0]}>
        <cylinderGeometry args={[M.r + 0.012, M.r + 0.012, 0.06, 72]} />
        <meshStandardMaterial color="#FFF0F5" roughness={0.65} />
      </mesh>
      <GoldBand radius={M.r} y={yM + M.h * 0.4} />
      <mesh position={[0, yMtop + FH / 2, 0]}>
        <cylinderGeometry args={[M.r + 0.16, M.r + 0.16, FH, 72]} />
        <meshStandardMaterial color={FROST} roughness={0.55} metalness={0.0} />
      </mesh>
      <Drips radius={M.r + 0.12} yTop={yMtop} count={20} color={DRIP} />
      <RosetteRing radius={M.r + 0.14} y={yMtop + FH + 0.055} count={17} color={FROST} rScale={0.78} />
      <PearlRow radius={M.r + 0.02} y={yM + M.h * 0.6} count={15} />

      {/* flowers on middle tier side */}
      {[0, 120, 240].map((deg, i) => {
        const a = (deg * Math.PI) / 180
        return (
          <Flower
            key={i}
            position={[Math.cos(a) * (M.r - 0.1), yM + M.h * 0.48, Math.sin(a) * (M.r - 0.1)]}
            scale={0.7}
          />
        )
      })}

      {/* ── top tier ─────────────────────────────────────────────────────── */}
      <mesh position={[0, yT + T.h / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[T.r, T.r * 1.018, T.h, 72]} />
        <meshStandardMaterial color="#A03870" roughness={0.9} />
      </mesh>
      <mesh position={[0, yT + T.h * 0.33, 0]}>
        <cylinderGeometry args={[T.r + 0.012, T.r + 0.012, 0.05, 72]} />
        <meshStandardMaterial color="#FFF0F5" roughness={0.65} />
      </mesh>
      <mesh position={[0, yT + T.h * 0.67, 0]}>
        <cylinderGeometry args={[T.r + 0.012, T.r + 0.012, 0.05, 72]} />
        <meshStandardMaterial color="#FFF0F5" roughness={0.65} />
      </mesh>
      <GoldBand radius={T.r} y={yT + T.h * 0.42} />
      <mesh position={[0, yTtop + FH / 2, 0]}>
        <cylinderGeometry args={[T.r + 0.13, T.r + 0.13, FH, 72]} />
        <meshStandardMaterial color={FROST} roughness={0.55} metalness={0.0} />
      </mesh>
      <Drips radius={T.r + 0.09} yTop={yTtop} count={14} color={DRIP} />
      <RosetteRing radius={T.r + 0.11} y={yTtop + FH + 0.05} count={12} color={FROST} rScale={0.72} />

      {/* macarons on top tier */}
      {macarons.map((m, i) => (
        <Macaron key={i} position={m.pos} rotation={m.rot} color={m.color} />
      ))}

      {/* floral arrangement center-top */}
      <Flower
        position={[0, yTtop + FH + 0.15, 0]}
        outerColor="#F8C4D8"
        innerColor="#E0608A"
        scale={1.15}
      />
      {/* leaves around center flower */}
      {[0, 90, 180, 270].map((deg, i) => {
        const a = (deg * Math.PI) / 180
        return (
          <Leaf
            key={i}
            position={[Math.cos(a) * 0.32, yTtop + FH + 0.12, Math.sin(a) * 0.32]}
            rotation={[0.3, a + 0.3, 0.2]}
          />
        )
      })}

      {/* ── candles: 2 large (10년) + 9 small (1년) = 29 ──────────────────── */}
      {largeCandlePos.map((pos, i) => (
        <Candle
          key={`large-${i}`}
          position={pos}
          isLarge={true}
          color1={LARGE_COLS[i][0]}
          color2={LARGE_COLS[i][1]}
          onBlow={onCandleBlow}
        />
      ))}
      {smallCandlePos.map((pos, i) => (
        <Candle
          key={`small-${i}`}
          position={pos}
          isLarge={false}
          color1={SMALL_COLS[i][0]}
          color2={SMALL_COLS[i][1]}
          onBlow={onCandleBlow}
        />
      ))}
    </group>
  )
}
