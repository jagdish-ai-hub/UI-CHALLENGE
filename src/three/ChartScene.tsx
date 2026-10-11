import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Lights } from './common'

export interface Bar {
  label: string
  value: number
  color: string
}

function Pillar({ bar, i, max, hovered, onHover }: { bar: Bar; i: number; max: number; hovered: boolean; onHover: (i: number | null) => void }) {
  const g = useRef<THREE.Group>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const grow = useRef(0)
  const h = 0.25 + (bar.value / Math.max(max, 1)) * 2.2
  useFrame((_, dt) => {
    grow.current += (1 - grow.current) * Math.min(1, dt * 3.2)
    if (g.current) {
      g.current.scale.y = Math.max(0.001, grow.current)
      g.current.position.y = 0.2 + (hovered ? 0.12 : 0)
    }
    if (mat.current) mat.current.emissiveIntensity += ((hovered ? 0.45 : 0) - mat.current.emissiveIntensity) * Math.min(1, dt * 8)
  })
  const x = (i - 1.5) * 1.55
  return (
    <group position={[x, 0, 0]}>
      <group
        ref={g}
        position={[0, 0.2, 0]}
        onPointerOver={(e) => (e.stopPropagation(), onHover(i), (document.body.style.cursor = 'pointer'))}
        onPointerOut={() => (onHover(null), (document.body.style.cursor = ''))}
      >
        <RoundedBox args={[1.0, h, 1.0]} radius={0.12} smoothness={4} position={[0, h / 2, 0]}>
          <meshStandardMaterial ref={mat} color={bar.color} emissive={bar.color} emissiveIntensity={0} roughness={0.7} />
        </RoundedBox>
        <RoundedBox args={[0.82, 0.07, 0.82]} radius={0.03} smoothness={3} position={[0, h + 0.035, 0]}>
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </RoundedBox>
      </group>
    </group>
  )
}

function Cam() {
  const size = useThree((s) => s.size)
  const fov = 30
  const t = Math.tan((fov * Math.PI) / 360)
  const d = Math.max(8.8 / (2 * t * (size.width / size.height)), 6.6 / (2 * t))
  const el = (28 * Math.PI) / 180
  return <PerspectiveCamera makeDefault fov={fov} position={[0, Math.sin(el) * d + 1.1, Math.cos(el) * d]} onUpdate={(c) => c.lookAt(0, 1.15, 0)} />
}

export default function ChartScene({ bars, hovered, onHover }: { bars: Bar[]; hovered: number | null; onHover: (i: number | null) => void }) {
  const root = useRef<THREE.Group>(null)
  const max = Math.max(...bars.map((b) => b.value), 1)
  useFrame(({ pointer }, dt) => {
    if (!root.current) return
    const k = Math.min(1, dt * 3)
    root.current.rotation.y += (pointer.x * 0.35 - root.current.rotation.y) * k
  })
  return (
    <>
      <Cam />
      <Lights shadows intensity={1.05} />
      <group ref={root}>
        <RoundedBox args={[7.4, 0.2, 2.6]} radius={0.1} smoothness={4} position={[0, 0.1, 0]}>
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </RoundedBox>
        {/* back wall with gridlines */}
        <RoundedBox args={[7.4, 3.0, 0.1]} radius={0.04} smoothness={3} position={[0, 1.7, -1.25]}>
          <meshStandardMaterial color="#f8f9fa" roughness={0.9} />
        </RoundedBox>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <mesh key={f} position={[0, 0.2 + f * 2.5, -1.19]}>
            <planeGeometry args={[7.0, 0.018]} />
            <meshBasicMaterial color="#dadce0" />
          </mesh>
        ))}
        {bars.map((b, i) => (
          <Pillar key={b.label} bar={b} i={i} max={max} hovered={hovered === i} onHover={onHover} />
        ))}
      </group>
    </>
  )
}
