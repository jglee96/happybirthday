import { useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, Sparkles, Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { CakeMesh } from './CakeMesh'

const TOTAL = 5

export function CakeScene({ onAllBlown }) {
  const [blown, setBlown] = useState(0)

  const handleBlow = useCallback(() => {
    setBlown((prev) => {
      const next = prev + 1
      if (next >= TOTAL) onAllBlown?.()
      return next
    })
  }, [onAllBlown])

  const allOut = blown >= TOTAL

  return (
    <div className="cake-section">
      <div className="cake-canvas-wrap">
        <Canvas
          camera={{ position: [0, 3.8, 12], fov: 46 }}
          shadows
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#05050f']} />
          <fog attach="fog" args={['#05050f', 14, 32]} />

          {/* stars background */}
          <Stars radius={80} depth={60} count={2500} factor={4} saturation={0} fade speed={0.6} />

          {/* lighting */}
          <ambientLight intensity={0.35} color="#ffe4e1" />
          <directionalLight
            position={[6, 9, 5]}
            intensity={1.6}
            color="#fff8f0"
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={0.5}
            shadow-camera-far={30}
            shadow-camera-top={8}
            shadow-camera-bottom={-4}
            shadow-camera-left={-8}
            shadow-camera-right={8}
          />
          <directionalLight position={[-5, 3, -4]} intensity={0.25} color="#8888ff" />
          <Environment preset="studio" background={false} environmentIntensity={0.4} />

          {/* sparkles floating around */}
          <Sparkles
            count={60}
            scale={[12, 10, 12]}
            size={3}
            speed={0.35}
            color="#ffd080"
            opacity={0.7}
          />

          <CakeMesh onCandleBlow={handleBlow} />

          {/* floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.28, 0]} receiveShadow>
            <planeGeometry args={[22, 22]} />
            <meshStandardMaterial color="#06061a" roughness={0.85} metalness={0.15} />
          </mesh>

          <OrbitControls
            autoRotate
            autoRotateSpeed={0.7}
            enableZoom
            enablePan={false}
            minDistance={5.5}
            maxDistance={18}
            minPolarAngle={Math.PI * 0.12}
            maxPolarAngle={Math.PI * 0.72}
            enableDamping
            dampingFactor={0.06}
            target={[0, 2.0, 0]}
          />

          <EffectComposer>
            <Bloom
              luminanceThreshold={0.55}
              luminanceSmoothing={0.7}
              intensity={1.2}
              mipmapBlur
            />
          </EffectComposer>
        </Canvas>
      </div>

      {/* top label */}
      <div className="cake-overlay-top">
        <p>스물여덟 번째 생일</p>
      </div>

      {/* candle dot indicators */}
      <div className="candle-counter">
        {Array.from({ length: TOTAL }, (_, i) => (
          <div key={i} className={`candle-dot${i < blown ? ' out' : ''}`} />
        ))}
      </div>

      {/* bottom hint */}
      <div className={`cake-hint${allOut ? ' celebration' : ''}`}>
        <p>
          {allOut
            ? '🎉 생일 축하해, 마니야! 🎉'
            : '드래그로 회전 · 촛불을 클릭해서 꺼봐 🕯️'}
        </p>
      </div>
    </div>
  )
}
