import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { google } from '@/config/brand'
import { mulberry32 } from '@/lib/utils'
import { Clay, Lights, RB, clay } from './common'

const STATION_T = [0.13, 0.4, 0.66, 0.91]

function makeCurve() {
  const pts: [number, number][] = [
    [-7, 9],
    [-4, 5.5],
    [-5.5, 1],
    [-1.5, -2.5],
    [2.8, -1.2],
    [4.8, -5.5],
    [2, -9.8],
    [-2.8, -12.5],
    [-1.2, -17],
    [3, -20],
  ]
  return new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'catmullrom', 0.5)
}

function Road({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  const geo = useMemo(() => {
    const n = 260
    const pos: number[] = []
    const idx: number[] = []
    for (let i = 0; i <= n; i++) {
      const t = i / n
      const p = curve.getPointAt(t)
      const tg = curve.getTangentAt(t)
      const nx = -tg.z
      const nz = tg.x
      pos.push(p.x + nx * 0.85, 0.03, p.z + nz * 0.85, p.x - nx * 0.85, 0.03, p.z - nz * 0.85)
      if (i < n) {
        const a = i * 2
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    return g
  }, [curve])
  const dashes = useMemo(() => {
    const out: { p: THREE.Vector3; a: number }[] = []
    const len = curve.getLength()
    for (let d = 0.4; d < len; d += 1.1) {
      const t = d / len
      const p = curve.getPointAt(t)
      const tg = curve.getTangentAt(t)
      out.push({ p, a: Math.atan2(tg.x, tg.z) })
    }
    return out
  }, [curve])
  return (
    <>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#ffffff" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {dashes.map((d, i) => (
        <mesh key={i} position={[d.p.x, 0.05, d.p.z]} rotation={[-Math.PI / 2, 0, -d.a]}>
          <planeGeometry args={[0.1, 0.5]} />
          <meshBasicMaterial color={google.yellow} />
        </mesh>
      ))}
    </>
  )
}

function Tree({ x, z, s = 1 }: { x: number; z: number; s?: number }) {
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.5, 8]} />
        <Clay color="#8d6e63" />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <coneGeometry args={[0.42, 0.9, 12]} />
        <Clay color={google.green} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <coneGeometry args={[0.32, 0.7, 12]} />
        <Clay color="#2e9e57" />
      </mesh>
    </group>
  )
}

function Flag() {
  const f = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (f.current) f.current.rotation.y = Math.sin(clock.elapsedTime * 2) * 0.15
  })
  return (
    <group>
      <RB size={[1.6, 0.18, 1.6]} position={[0, 0.09, 0]} color="#ffffff" radius={0.06} />
      {/* clubhouse */}
      <RB size={[1.1, 0.8, 0.9]} position={[0, 0.58, 0.1]} color="#ffffff" radius={0.06} />
      <mesh position={[0, 1.2, 0.1]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.95, 0.5, 4]} />
        <Clay color={google.yellow} />
      </mesh>
      <RB size={[0.22, 0.4, 0.04]} position={[0, 0.38, 0.57]} color={google.yellow} radius={0.02} />
      <mesh position={[0.9, 1.2, -0.5]}>
        <cylinderGeometry args={[0.03, 0.03, 2.1, 8]} />
        <Clay color={clay.dark} />
      </mesh>
      <mesh ref={f} position={[1.2, 2.05, -0.5]}>
        <boxGeometry args={[0.6, 0.38, 0.03]} />
        <Clay color={google.yellow} />
      </mesh>
    </group>
  )
}

function Trophy() {
  const g = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.elapsedTime * 0.8
  })
  const cup = useMemo(() => {
    const pts = [
      [0, 0],
      [0.32, 0],
      [0.1, 0.12],
      [0.08, 0.45],
      [0.34, 0.6],
      [0.52, 1.0],
      [0.42, 1.15],
      [0.38, 1.0],
      [0.4, 0.78],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(pts, 28)
  }, [])
  return (
    <group>
      <RB size={[1.5, 0.5, 1.5]} position={[0, 0.25, 0]} color={google.blue} radius={0.08} />
      <RB size={[1.2, 0.18, 1.2]} position={[0, 0.58, 0]} color="#ffffff" radius={0.05} />
      <group ref={g} position={[0, 0.7, 0]} scale={1.1}>
        <mesh geometry={cup}>
          <meshStandardMaterial color={google.yellow} roughness={0.35} metalness={0.4} side={THREE.DoubleSide} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.5, 0.88, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.16, 0.035, 8, 20, Math.PI]} />
            <meshStandardMaterial color={google.yellow} roughness={0.35} metalness={0.4} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Crowd() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const items = useMemo(() => {
    const r = mulberry32(25)
    return Array.from({ length: 70 }, (_, i) => ({ x: (r() - 0.5) * 2.6, z: 0.2 + r() * 1.6, c: [google.blue, google.red, google.yellow, google.green, '#ffffff'][i % 5]!, ph: r() * 6 }))
  }, [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  useFrame(({ clock }) => {
    const m = ref.current
    if (!m) return
    items.forEach((it, i) => {
      dummy.position.set(it.x, 0.28 + Math.abs(Math.sin(clock.elapsedTime * 3 + it.ph)) * 0.12, it.z)
      dummy.updateMatrix()
      m.setMatrixAt(i, dummy.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  })
  useMemo(() => undefined, [])
  return (
    <instancedMesh
      ref={(m) => {
        ;(ref as React.MutableRefObject<THREE.InstancedMesh | null>).current = m
        if (m) items.forEach((it, i) => m.setColorAt(i, new THREE.Color(it.c)))
      }}
      args={[undefined, undefined, items.length]}
    >
      <capsuleGeometry args={[0.1, 0.18, 4, 8]} />
      <meshStandardMaterial roughness={0.8} />
    </instancedMesh>
  )
}

function Stage() {
  return (
    <group>
      <RB size={[3.2, 0.2, 2.6]} position={[0, 0.1, 0.4]} color="#ffffff" radius={0.08} />
      <RB size={[3.0, 1.3, 0.12]} position={[0, 0.85, -0.85]} color={google.red} radius={0.05} />
      {[-1, 0, 1].map((x) => (
        <mesh key={x} position={[x * 0.9, 1.1, -0.76]}>
          <circleGeometry args={[0.22, 20]} />
          <meshBasicMaterial color={[google.yellow, '#ffffff', google.blue][x + 1]!} />
        </mesh>
      ))}
      <Crowd />
    </group>
  )
}

function Tower() {
  const cubes = useMemo(() => {
    const cols = [google.blue, google.red, google.yellow, google.green]
    return Array.from({ length: 60 }, (_, i) => ({ x: (i % 3) * 0.42 - 0.42, y: Math.floor(i / 3) * 0.2 + 0.3, c: cols[i % 4]! }))
  }, [])
  const g = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (g.current) g.current.rotation.y = clock.elapsedTime * 0.25
  })
  return (
    <group>
      <RB size={[1.7, 0.2, 1.7]} position={[0, 0.1, 0]} color="#ffffff" radius={0.06} />
      <group ref={g}>
        {cubes.map((c, i) => (
          <RB key={i} size={[0.36, 0.17, 0.36]} position={[c.x, c.y, (i % 2) * 0.0]} color={c.c} radius={0.04} />
        ))}
      </group>
    </group>
  )
}

function Bus({ curve, progress }: { curve: THREE.CatmullRomCurve3; progress: React.RefObject<number> }) {
  const g = useRef<THREE.Group>(null)
  const cur = useRef(0)
  useFrame(({ clock }, dt) => {
    if (!g.current) return
    const target = Math.min(0.995, Math.max(0.002, (progress.current ?? 0) * 0.96 + 0.02))
    cur.current += (target - cur.current) * Math.min(1, dt * 3)
    const p = curve.getPointAt(cur.current)
    const tg = curve.getTangentAt(cur.current)
    g.current.position.set(p.x, 0.02 + Math.sin(clock.elapsedTime * 14) * 0.008, p.z)
    g.current.rotation.y = Math.atan2(tg.x, tg.z)
  })
  const stripes = [google.blue, google.red, google.yellow, google.green]
  return (
    <group ref={g}>
      <RB size={[0.8, 0.62, 1.7]} position={[0, 0.5, 0]} color="#ffffff" radius={0.1} />
      <RB size={[0.82, 0.12, 1.72]} position={[0, 0.32, 0]} color={google.blue} radius={0.04} />
      {stripes.map((c, i) => (
        <RB key={i} size={[0.83, 0.08, 0.4]} position={[0, 0.52, -0.62 + i * 0.42]} color={c} radius={0.02} />
      ))}
      {[-0.6, 0, 0.6].map((z) => (
        <RB key={z} size={[0.86, 0.15, 0.34]} position={[0, 0.69, z]} color="#bcd7fb" radius={0.03} />
      ))}
      {([[-0.4, -0.55], [0.4, -0.55], [-0.4, 0.55], [0.4, 0.55]] as const).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.17, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.17, 0.17, 0.1, 18]} />
          <Clay color={clay.ink} />
        </mesh>
      ))}
    </group>
  )
}

export default function MilestoneTrack({ progress }: { progress: React.RefObject<number> }) {
  const curve = useMemo(makeCurve, [])
  const cam = useRef<THREE.PerspectiveCamera>(null)
  const look = useRef(new THREE.Vector3())
  const ready = useRef(false)

  const trees = useMemo(() => {
    const r = mulberry32(7)
    const samples = Array.from({ length: 120 }, (_, i) => curve.getPointAt(i / 119))
    const out: { x: number; z: number; s: number }[] = []
    let tries = 0
    while (out.length < 46 && tries++ < 600) {
      const x = (r() - 0.5) * 26
      const z = 11 - r() * 34
      if (samples.some((p) => Math.hypot(p.x - x, p.z - z) < 2.6)) continue
      out.push({ x, z, s: 0.7 + r() * 0.7 })
    }
    return out
  }, [curve])

  const stations = useMemo(
    () =>
      STATION_T.map((t) => {
        const p = curve.getPointAt(t)
        const tg = curve.getTangentAt(t)
        const side = 2.9
        return { x: p.x + -tg.z * side, z: p.z + tg.x * side, ry: Math.atan2(tg.x, tg.z) + Math.PI / 2 }
      }),
    [curve],
  )

  useFrame((_, dt) => {
    const c = cam.current
    if (!c) return
    const t = Math.min(0.995, Math.max(0.002, (progress.current ?? 0) * 0.96 + 0.02))
    const p = curve.getPointAt(t)
    const tg = curve.getTangentAt(t)
    const desired = new THREE.Vector3(p.x - tg.x * 5.6 + -tg.z * 3.4, 6.0, p.z - tg.z * 5.6 + tg.x * 3.4)
    const lookTarget = new THREE.Vector3(p.x + tg.x * 2.6, 0.4, p.z + tg.z * 2.6)
    if (!ready.current) {
      c.position.copy(desired)
      look.current.copy(lookTarget)
      ready.current = true
    }
    const k = Math.min(1, dt * 3.5)
    c.position.lerp(desired, k)
    look.current.lerp(lookTarget, k)
    c.lookAt(look.current)
  })

  return (
    <>
      <PerspectiveCamera ref={cam} makeDefault fov={40} near={0.1} far={90} position={[-8, 5, 12]} />
      <Lights shadows={false} intensity={1.1} />
      <mesh position={[0, -0.02, -4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#d7efdf" roughness={1} />
      </mesh>
      <Road curve={curve} />
      {trees.map((t, i) => (
        <Tree key={i} x={t.x} z={t.z} s={t.s} />
      ))}
      {[Flag, Trophy, Stage, Tower].map((S, i) => (
        <group key={i} position={[stations[i]!.x, 0, stations[i]!.z]} rotation={[0, stations[i]!.ry, 0]}>
          <S />
        </group>
      ))}
      <Bus curve={curve} progress={progress} />
    </>
  )
}
