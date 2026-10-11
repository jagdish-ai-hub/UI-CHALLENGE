import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'
import { useTier } from '@/lib/useTier'
import type { RefObject } from 'react'

/** One fixed WebGL context. Every <SceneFrame> is drawn into it through drei's View. */
export default function SceneCanvas({ eventSource }: { eventSource: RefObject<HTMLElement | null> }) {
  const tier = useTier()
  if (tier === 'off') return null
  return (
    <Canvas
      flat
      shadows
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
      dpr={[1, tier === 'high' ? 1.75 : 1.25]}
      gl={{ antialias: tier === 'high', alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 40 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <View.Port />
    </Canvas>
  )
}
