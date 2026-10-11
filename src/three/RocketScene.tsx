import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { google } from '@/config/brand'
import { mulberry32 } from '@/lib/utils'
import { Clay, Lights, RB, clay } from './common'

const PUFFS = 48

export default function RocketScene({ trigger, onLaunch }: { trigger: number; onLaunch: () => void }) {
  const rocket = useRef<THREE.Group>(null)
  const flame = useRef<THREE.Mesh>(null)
  const puffs = useRef<THREE.InstancedMesh>(null)
  const t0 = useRef(-1)
  const lastTrigger = useRef(trigger)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const seeds = useMemo(() => {
    const r = mulberry32(99)
    return Array.from({ length: PUFFS }, (_, i) => ({ a: r() * Math.PI * 2, s: 0.6 + r() * 1.4, up: r() * 0.7, c: [google.blue, google.red, google.yellow, google.green, '#ffffff'][i % 5]! }))
  }, [])

  useEffect(() => {
    if (trigger !== lastTrigger.current) {
      lastTrigger.current = trigger
      t0.current = 0
    }
  }, [trigger])

  useFrame(({ clock, pointer }, dt) => {
    const R = rocket.current
    if (!R) return
    const t = clock.elapsedTime
    let lift = 0
    let shake = 0
    if (t0.current >= 0) {
      t0.current += dt
      const k = t0.current
      if (k < 0.7) shake = (k / 0.7) * 0.03
      else lift = Math.pow((k - 0.7) / 1.5, 2) * 9
      if (k > 3.0) t0.current = -1
    }
    const idle = t0.current < 0 ? Math.sin(t * 1.4) * 0.06 : 0
    R.position.y = 0.55 + idle + lift
    R.position.x = Math.sin(t * 60) * shake
    R.rotation.y = pointer.x * 0.5 + (t0.current >= 0 ? t * 3 : 0)
    R.rotation.z = -pointer.x * 0.05
    const launching = t0.current >= 0.7
    if (flame.current) {
      const f = launching ? 2.2 : t0.current >= 0 ? 1.1 : 0.5
      flame.current.scale.set(1, f * (0.85 + Math.sin(t * 40) * 0.15), 1)
      flame.current.position.y = -0.35 - f * 0.28
    }
    const im = puffs.current
    if (im) {
      const k = t0.current
      seeds.forEach((s, i) => {
        if (k < 0.5) {
          dummy.scale.setScalar(0.0001)
        } else {
          const age = Math.max(0, k - 0.5 - (i / PUFFS) * 0.8)
          const life = Math.min(1, age / 1.6)
          const r = life * s.s * 1.6
          dummy.position.set(Math.cos(s.a) * r, 0.2 + life * s.up * 1.2, Math.sin(s.a) * r)
          dummy.scale.setScalar(age <= 0 ? 0.0001 : (1 - life) * 0.3 * (0.6 + s.s * 0.4))
        }
        dummy.updateMatrix()
        im.setMatrixAt(i, dummy.matrix)
      })
      im.instanceMatrix.needsUpdate = true
    }
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.7, 8.2]} fov={32} onUpdate={(c) => c.lookAt(0, 1.55, 0)} />
      <Lights shadows intensity={1.1} />
      {/* pad */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[1.5, 1.65, 0.2, 40]} />
        <Clay color="#ffffff" />
      </mesh>
      {[google.blue, google.red, google.yellow, google.green].map((c, i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4
        return (
          <mesh key={i} position={[Math.cos(a) * 1.25, 0.22, Math.sin(a) * 1.25]}>
            <sphereGeometry args={[0.09, 14, 14]} />
            <meshBasicMaterial color={c} />
          </mesh>
        )
      })}
      <RB size={[0.14, 2.4, 0.14]} position={[-1.1, 1.4, -0.4]} color={clay.grey} radius={0.04} />
      <RB size={[0.9, 0.1, 0.14]} position={[-0.68, 2.2, -0.4]} color={clay.grey} radius={0.03} />

      <group ref={rocket} position={[0, 0.55, 0]} onClick={(e) => (e.stopPropagation(), onLaunch())} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.46, 0.46, 1.5, 36]} />
          <Clay color="#ffffff" rough={0.5} />
        </mesh>
        <mesh position={[0, 2.35, 0]}>
          <coneGeometry args={[0.46, 0.85, 36]} />
          <Clay color={google.red} rough={0.5} />
        </mesh>
        {[
          [0.72, google.blue],
          [0.98, google.yellow],
          [1.24, google.green],
        ].map(([y, c]) => (
          <mesh key={y as number} position={[0, y as number, 0]}>
            <cylinderGeometry args={[0.472, 0.472, 0.1, 36]} />
            <Clay color={c as string} />
          </mesh>
        ))}
        <mesh position={[0, 1.7, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.2, 0.04, 14, 30]} />
          <Clay color={clay.dark} />
        </mesh>
        <mesh position={[0, 1.7, 0.41]}>
          <circleGeometry args={[0.19, 28]} />
          <meshStandardMaterial color="#8ab4f8" roughness={0.2} metalness={0.2} />
        </mesh>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2
          return (
            <group key={i} rotation={[0, a, 0]}>
              <RB size={[0.1, 0.8, 0.62]} position={[0, 0.62, 0.55]} color={[google.blue, google.yellow, google.green][i]!} radius={0.04} rotation={[0.18, 0, 0]} />
            </group>
          )
        })}
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.28, 0.36, 0.2, 24]} />
          <Clay color={clay.dark} />
        </mesh>
        <mesh ref={flame} position={[0, -0.1, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.22, 0.6, 20]} />
          <meshBasicMaterial color={google.yellow} />
        </mesh>
      </group>

      <instancedMesh
        ref={(m) => {
          ;(puffs as React.MutableRefObject<THREE.InstancedMesh | null>).current = m
          if (m) seeds.forEach((s, i) => m.setColorAt(i, new THREE.Color(s.c)))
        }}
        args={[undefined, undefined, PUFFS]}
        position={[0, 0.2, 0]}
      >
        <sphereGeometry args={[1, 14, 14]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
    </>
  )
}
