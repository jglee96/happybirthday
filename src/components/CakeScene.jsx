import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { CakeMesh } from './CakeMesh'

// Adjusts camera for portrait vs landscape
function CameraAdapter({ portrait }) {
  const { camera } = useThree()
  useEffect(() => {
    if (portrait) {
      camera.fov = 60
      camera.position.set(0, 5.5, 16)
    } else {
      camera.fov = 46
      camera.position.set(0, 3.8, 12)
    }
    camera.updateProjectionMatrix()
  }, [portrait, camera])
  return null
}

export function CakeScene({ onCandleBlow, portrait }) {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0 }}
      shadows={false}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, Math.min(window.devicePixelRatio, 2)]}
    >
      <color attach="background" args={['#05050f']} />

      {/* star field */}
      <Stars radius={90} depth={55} count={2200} factor={4} saturation={0} fade speed={0.5} />

      {/* ── lighting: gentle, no glare ── */}
      {/* soft ambient — main fill */}
      <ambientLight intensity={0.85} color="#ffe0e8" />

      {/* key light: warm, moderate, angled */}
      <directionalLight
        position={[4, 7, 5]}
        intensity={1.2}
        color="#fff6ee"
      />

      {/* cool rim light from behind/left */}
      <directionalLight position={[-5, 2, -4]} intensity={0.22} color="#a0a8ff" />

      {/* warm bottom fill — reduces harsh undershadows */}
      <pointLight position={[0, -2, 3]} intensity={0.3} color="#ff9060" distance={12} decay={2} />

      {/* floating sparkles */}
      <Sparkles count={50} scale={[11, 9, 11]} size={2.5} speed={0.3} color="#ffd080" opacity={0.6} />

      <CakeMesh onCandleBlow={onCandleBlow} />

      {/* responsive camera */}
      <CameraAdapter portrait={portrait} />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.65}
        enableZoom
        enablePan={false}
        minDistance={portrait ? 8 : 5.5}
        maxDistance={portrait ? 24 : 18}
        minPolarAngle={Math.PI * 0.1}
        maxPolarAngle={Math.PI * 0.7}
        enableDamping
        dampingFactor={0.06}
        target={[0, 1.8, 0]}
        touches={{ ONE: 1, TWO: 2 }}  // ROTATE=1, DOLLY_PAN=2 for mobile
      />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.65}
          luminanceSmoothing={0.75}
          intensity={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  )
}
