import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { teams, type TeamId } from '@/config/brand'
import type { Member } from '@/data/seed'
import { mulberry32 } from '@/lib/utils'
import { Lights } from './common'

const centers: Record<TeamId, [number, number, number]> = {
  tech: [-2.0, 1.05, 0.6],
  media: [2.0, 1.1, -0.8],
  design: [-1.8, -1.15, -1.0],
  pr: [1.9, -1.15, 1.0],
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

interface Props {
  members: Member[]
  team: TeamId | null
  hoveredId: string | null
  focusId?: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
  autoRotate?: boolean
}

export default function MemberNetwork({ members, team, hoveredId, focusId, onHover, onSelect, autoRotate = true }: Props) {
  const group = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const scales = useRef<number[]>([])

  const nodes = useMemo(
    () =>
      members.map((m) => {
        const r = mulberry32(hash(m.id))
        const c = centers[m.team]
        // point in a sphere around the team centre
        let x = 0
        let y = 0
        let z = 0
        do {
          x = r() * 2 - 1
          y = r() * 2 - 1
          z = r() * 2 - 1
        } while (x * x + y * y + z * z > 1)
        const R = m.lead ? 0.22 : 1.0
        return { m, p: new THREE.Vector3(c[0] + x * R, c[1] + y * R, c[2] + z * R) }
      }),
    [members],
  )

  const linePos = useMemo(() => {
    const out: number[] = []
    nodes.forEach((a, i) => {
      const same = nodes
        .map((b, j) => ({ j, d: a.p.distanceTo(b.p), b }))
        .filter((o) => o.j !== i && o.b.m.team === a.m.team)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2)
      same.forEach((o) => out.push(a.p.x, a.p.y, a.p.z, o.b.p.x, o.b.p.y, o.b.p.z))
      const cross = nodes.find((b, j) => j > i && b.m.team !== a.m.team && b.m.branch === a.m.branch && a.p.distanceTo(b.p) < 2.4 && (i + j) % 5 === 0)
      if (cross) out.push(a.p.x, a.p.y, a.p.z, cross.p.x, cross.p.y, cross.p.z)
    })
    return new Float32Array(out)
  }, [nodes])

  const colors = useMemo(() => nodes.map((n) => new THREE.Color(teams[n.m.team].color)), [nodes])
  const grey = useMemo(() => new THREE.Color('#dadce0'), [])
  const tmp = useMemo(() => new THREE.Color(), [])

  useEffect(() => {
    scales.current = nodes.map(() => 1)
  }, [nodes])

  useFrame(({ pointer }, dt) => {
    const g = group.current
    const im = mesh.current
    if (!g || !im) return
    if (autoRotate) g.rotation.y += dt * 0.16
    g.rotation.x += (-pointer.y * 0.25 - g.rotation.x) * Math.min(1, dt * 3)
    nodes.forEach((n, i) => {
      const isHover = hoveredId === n.m.id || focusId === n.m.id
      const dim = team && n.m.team !== team
      const target = (n.m.lead ? 1.7 : 1) * (isHover ? 1.7 : dim ? 0.45 : 1)
      const cur = scales.current[i] ?? 1
      const s = cur + (target - cur) * Math.min(1, dt * 9)
      scales.current[i] = s
      dummy.position.copy(n.p)
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      im.setMatrixAt(i, dummy.matrix)
      tmp.copy(colors[i]!).lerp(grey, dim ? 0.75 : 0)
      im.setColorAt(i, tmp)
    })
    im.instanceMatrix.needsUpdate = true
    if (im.instanceColor) im.instanceColor.needsUpdate = true
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.1, 10.6]} fov={34} />
      <Lights shadows={false} intensity={1.1} />
      <group ref={group}>
        {(Object.keys(centers) as TeamId[]).map((t) => (
          <mesh key={t} position={centers[t]}>
            <sphereGeometry args={[1.3, 28, 28]} />
            <meshBasicMaterial color={teams[t].color} transparent opacity={team === null || team === t ? 0.09 : 0.02} depthWrite={false} />
          </mesh>
        ))}
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePos, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color="#9aa0a6" transparent opacity={0.4} />
        </lineSegments>
        <instancedMesh
          ref={mesh}
          args={[undefined, undefined, nodes.length]}
          onPointerMove={(e) => {
            e.stopPropagation()
            if (e.instanceId !== undefined) onHover(nodes[e.instanceId]!.m.id)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            onHover(null)
            document.body.style.cursor = ''
          }}
          onClick={(e) => {
            e.stopPropagation()
            if (e.instanceId !== undefined) onSelect(nodes[e.instanceId]!.m.id)
          }}
        >
          <sphereGeometry args={[0.105, 20, 20]} />
          <meshStandardMaterial roughness={0.55} />
        </instancedMesh>
      </group>
    </>
  )
}
