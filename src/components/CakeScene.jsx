import { useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Sparkles } from '@react-three/drei'
import { CakeMesh } from './CakeMesh'

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
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
      performance={{ min: 0.5 }}
    >
      <color attach="background" args={['#05050f']} />

      <Stars radius={90} depth={55} count={800} factor={4} saturation={0} fade speed={0.5} />

      <ambientLight intensity={0.85} color="#ffe0e8" />
      <directionalLight position={[4, 7, 5]} intensity={1.2} color="#fff6ee" />
      <directionalLight position={[-5, 2, -4]} intensity={0.22} color="#a0a8ff" />
      <pointLight position={[0, -2, 3]} intensity={0.3} color="#ff9060" distance={12} decay={2} />

      <Sparkles count={24} scale={[11, 9, 11]} size={2.5} speed={0.3} color="#ffd080" opacity={0.6} />

      <CakeMesh onCandleBlow={onCandleBlow} />

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
        touches={{ ONE: 0, TWO: 2 }}
      />
    </Canvas>
  )
}
