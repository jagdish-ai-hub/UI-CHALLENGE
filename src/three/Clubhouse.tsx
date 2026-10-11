import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import * as THREE from 'three'
import { google, teams, type TeamId } from '@/config/brand'
import { Clay, Lights, Person, RB, Shadowed, clay } from './common'
import { useSceneTier } from './tierContext'

interface Props {
  active: TeamId | null
  onActive: (t: TeamId | null) => void
  onSelect: (t: TeamId) => void
}

const WALL_H = 2.5
const FLOOR = 10.4

function IsoCamera() {
  const size = useThree((s) => s.size)
  const ref = useRef<THREE.OrthographicCamera>(null)
  const zoom = Math.min(size.width / 15.4, size.height / 10.4)
  useLayoutEffect(() => {
    const c = ref.current
    if (!c) return
    c.lookAt(0, 0.95, 0)
    c.updateProjectionMatrix()
  }, [zoom])
  return <OrthographicCamera ref={ref} makeDefault position={[9, 11.5, 9]} zoom={zoom} near={-60} far={120} />
}

function useChecker() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')!
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        g.fillStyle = (i + j) % 2 ? '#EEF0F3' : '#F9FAFB'
        g.fillRect(i * 128, j * 128, 128, 128)
      }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(FLOOR / 1.6, FLOOR / 1.6)
    t.anisotropy = 8
    return t
  }, [])
}

/* ------------------------------ props ------------------------------ */

function Chair({ position, rotation = 0, color = '#FFFFFF' }: { position: [number, number, number]; rotation?: number; color?: string }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RB size={[0.52, 0.08, 0.5]} position={[0, 0.34, 0]} color={color} radius={0.04} />
      <RB size={[0.5, 0.46, 0.07]} position={[0, 0.62, -0.25]} color={color} radius={0.035} />
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
        <Clay color={clay.dark} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.05, 20]} />
        <Clay color={clay.dark} />
      </mesh>
    </group>
  )
}

function Desk({
  position,
  rotation = 0,
  accent,
  shirt,
  tone = 0,
  phase = 0,
}: {
  position: [number, number, number]
  rotation?: number
  accent: string
  shirt?: string
  tone?: number
  phase?: number
}) {
  const bars: [number, number][] = [
    [0.34, 0],
    [0.5, 0.1],
    [0.26, 0.1],
    [0.42, 0],
  ]
  const barColors = [google.blue, accent, google.green, google.yellow]
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <RB size={[1.7, 0.08, 0.85]} position={[0, 0.58, 0]} color="#FFFFFF" radius={0.04} />
      {(
        [
          [-0.74, -0.34],
          [0.74, -0.34],
          [-0.74, 0.34],
          [0.74, 0.34],
        ] as const
      ).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.27, z]}>
          <cylinderGeometry args={[0.035, 0.035, 0.54, 8]} />
          <Clay color={clay.dark} />
        </mesh>
      ))}
      <mesh position={[0, 0.72, -0.22]}>
        <cylinderGeometry args={[0.03, 0.04, 0.18, 8]} />
        <Clay color={clay.dark} />
      </mesh>
      <RB size={[0.9, 0.54, 0.05]} position={[0, 1.03, -0.24]} color={clay.ink} radius={0.03} />
      <mesh position={[0, 1.03, -0.213]}>
        <planeGeometry args={[0.82, 0.46]} />
        <meshBasicMaterial color="#14171c" />
      </mesh>
      {bars.map(([w, ind], i) => (
        <mesh key={i} position={[-0.34 + ind + w / 2 - 0.1, 1.2 - i * 0.1, -0.21]}>
          <planeGeometry args={[w, 0.05]} />
          <meshBasicMaterial color={barColors[i]} />
        </mesh>
      ))}
      <RB size={[0.55, 0.025, 0.2]} position={[0.1, 0.63, 0.2]} color={clay.grey} radius={0.01} />
      <mesh position={[-0.62, 0.69, 0.2]}>
        <cylinderGeometry args={[0.07, 0.06, 0.12, 14]} />
        <Clay color={accent} />
      </mesh>
      {shirt && (
        <>
          <Chair position={[0, 0, 0.78]} rotation={Math.PI} />
          <Person position={[0, 0.0, 0.76]} rotation={Math.PI} color={shirt} tone={tone} pose="sit" phase={phase} />
        </>
      )}
    </group>
  )
}

function Plant({ position, s = 1 }: { position: [number, number, number]; s?: number }) {
  return (
    <group position={position} scale={s}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.2, 0.14, 0.4, 16]} />
        <Clay color="#FFFFFF" />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh key={i} position={[Math.cos(i * 1.05) * 0.12, 0.62 + (i % 3) * 0.14, Math.sin(i * 1.05) * 0.12]} scale={[1, 1.25, 1]}>
          <sphereGeometry args={[0.17, 14, 14]} />
          <Clay color={i % 2 ? '#2E9E57' : google.green} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------ walls ------------------------------ */

function Walls() {
  const segs = [google.blue, google.red, google.yellow, google.green]
  const len = FLOOR + 0.2
  const seg = len / 4
  const code: [number, number, string][] = [
    [0, 0.9, google.blue],
    [0.25, 1.3, google.green],
    [0.25, 0.7, google.yellow],
    [0.5, 1.1, '#F28B82'],
    [0.25, 0.5, google.blue],
    [0, 1.2, google.green],
    [0.25, 0.8, google.yellow],
  ]
  const swatch = [google.blue, google.red, google.yellow, google.green, '#D2E3FC', '#FAD2CF', '#FEEFC3', '#CEEAD6', google.green, google.yellow, google.red, google.blue]
  const frames = [
    { x: 1.45, c: '#AECBFA' },
    { x: 2.6, c: '#F6AEA9' },
    { x: 3.75, c: '#FDE293' },
  ]
  return (
    <>
      {/* back wall (-z) and left wall (-x) */}
      <RB size={[FLOOR + 0.22, WALL_H, 0.22]} position={[0, WALL_H / 2, -FLOOR / 2 - 0.11]} color="#FFFFFF" radius={0.05} />
      <RB size={[0.22, WALL_H, FLOOR]} position={[-FLOOR / 2 - 0.11, WALL_H / 2, 0]} color="#F8F9FA" radius={0.05} />
      {/* four-colour cap strips */}
      {segs.map((c, i) => (
        <RB key={`a${i}`} size={[seg - 0.03, 0.1, 0.26]} position={[-len / 2 + seg * (i + 0.5) + 0.0, WALL_H + 0.05, -FLOOR / 2 - 0.11]} color={c} radius={0.03} />
      ))}
      {segs.map((c, i) => (
        <RB key={`b${i}`} size={[0.26, 0.1, (FLOOR - 0.1) / 4 - 0.03]} position={[-FLOOR / 2 - 0.11, WALL_H + 0.05, -FLOOR / 2 + 0.2 + ((FLOOR - 0.1) / 4) * (i + 0.5)]} color={c} radius={0.03} />
      ))}
      {/* baseboards */}
      <RB size={[FLOOR, 0.14, 0.05]} position={[0, 0.07, -FLOOR / 2 + 0.03]} color={clay.grey} radius={0.015} />
      <RB size={[0.05, 0.14, FLOOR]} position={[-FLOOR / 2 + 0.03, 0.07, 0]} color={clay.grey} radius={0.015} />

      {/* TECH: code screen on left wall */}
      <RB size={[0.07, 1.4, 2.9]} position={[-FLOOR / 2 + 0.04, 1.55, -2.6]} color={clay.ink} radius={0.03} />
      {code.map(([ind, w, c], i) => (
        <mesh key={i} position={[-FLOOR / 2 + 0.085, 2.07 - i * 0.17, -2.6 - 1.2 + ind + w / 2]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[w, 0.075]} />
          <meshBasicMaterial color={c} />
        </mesh>
      ))}
      {/* TECH: whiteboard with flow on back wall */}
      <RB size={[2.5, 1.35, 0.07]} position={[-2.6, 1.55, -FLOOR / 2 + 0.04]} color="#FFFFFF" radius={0.03} />
      <RB size={[2.6, 1.45, 0.05]} position={[-2.6, 1.55, -FLOOR / 2 + 0.02]} color={clay.mid} radius={0.03} />
      {[
        [-3.3, google.blue],
        [-2.6, google.yellow],
        [-1.9, google.green],
      ].map(([x, c], i) => (
        <group key={i}>
          <RB size={[0.46, 0.32, 0.04]} position={[x as number, 1.7, -FLOOR / 2 + 0.09]} color={c as string} radius={0.04} />
          {i < 2 && (
            <mesh position={[(x as number) + 0.35, 1.7, -FLOOR / 2 + 0.085]}>
              <planeGeometry args={[0.24, 0.035]} />
              <meshBasicMaterial color={clay.ink} />
            </mesh>
          )}
        </group>
      ))}
      <mesh position={[-2.6, 1.2, -FLOOR / 2 + 0.085]}>
        <planeGeometry args={[1.8, 0.04]} />
        <meshBasicMaterial color={clay.mid} />
      </mesh>

      {/* MEDIA: framed photos and ON AIR light on back wall */}
      {frames.map((f, i) => (
        <group key={i} position={[f.x, 1.5, -FLOOR / 2 + 0.06]}>
          <RB size={[0.92, 1.12, 0.06]} color={clay.ink} radius={0.03} />
          <mesh position={[0, 0, 0.034]}>
            <planeGeometry args={[0.8, 1.0]} />
            <meshBasicMaterial color={f.c} />
          </mesh>
          <mesh position={[0, -0.12, 0.036]}>
            <circleGeometry args={[0.2, 24]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0, -0.34, 0.036]}>
            <planeGeometry args={[0.5, 0.18]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      ))}
      <mesh position={[2.6, 2.2, -FLOOR / 2 + 0.07]}>
        <boxGeometry args={[0.8, 0.2, 0.06]} />
        <meshStandardMaterial color={google.red} emissive={google.red} emissiveIntensity={0.6} roughness={0.6} />
      </mesh>

      {/* window on left wall */}
      <RB size={[0.09, 1.5, 2.1]} position={[-FLOOR / 2 + 0.05, 1.5, -0.05]} color="#FFFFFF" radius={0.03} />
      <mesh position={[-FLOOR / 2 + 0.1, 1.5, -0.05]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.9, 1.3]} />
        <meshBasicMaterial color="#D2E3FC" />
      </mesh>
      <mesh position={[-FLOOR / 2 + 0.105, 1.18, -0.05]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.9, 0.5]} />
        <meshBasicMaterial color="#E8F0FE" />
      </mesh>
      <mesh position={[-FLOOR / 2 + 0.11, 1.7, 0.4]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.18, 24]} />
        <meshBasicMaterial color={google.yellow} />
      </mesh>
      <RB size={[0.05, 1.3, 0.06]} position={[-FLOOR / 2 + 0.115, 1.5, -0.05]} color="#FFFFFF" radius={0.01} />
      <RB size={[0.05, 0.06, 1.9]} position={[-FLOOR / 2 + 0.115, 1.5, -0.05]} color="#FFFFFF" radius={0.01} />

      {/* DESIGN: swatch wall on left wall */}
      <RB size={[0.07, 1.6, 2.6]} position={[-FLOOR / 2 + 0.04, 1.5, 2.6]} color="#FFFFFF" radius={0.03} />
      {swatch.map((c, i) => (
        <RB key={i} size={[0.05, 0.4, 0.44]} position={[-FLOOR / 2 + 0.085, 2.0 - Math.floor(i / 4) * 0.5, 2.6 - 0.9 + (i % 4) * 0.6]} color={c} radius={0.04} />
      ))}
    </>
  )
}

/* ------------------------------ zones ------------------------------ */

function TechZone() {
  return (
    <>
      <Desk position={[0.3, 0, -1.45]} accent={google.red} shirt={google.blue} tone={0} />
      <Desk position={[-1.5, 0, 0.25]} rotation={Math.PI / 2} accent={google.yellow} shirt={google.blue} tone={3} phase={1.3} />
      {[0, 1, 2].map((i) => (
        <group key={i} position={[1.55, 0.18 + i * 0.34, -0.1]}>
          <RB size={[0.74, 0.3, 0.64]} color={i === 1 ? '#FFFFFF' : clay.grey} radius={0.05} />
          <mesh position={[0.22, 0, 0.325]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color={[google.green, google.yellow, google.green][i]} />
          </mesh>
          <mesh position={[0.1, 0, 0.325]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color={google.blue} />
          </mesh>
        </group>
      ))}
      <Plant position={[1.6, 0, 1.55]} s={1.15} />
    </>
  )
}

function MediaZone() {
  return (
    <>
      {/* editing desk */}
      <Desk position={[-1.0, 0, -1.45]} accent={google.red} shirt={google.red} tone={1} phase={0.7} />
      {/* tripod + camera, operator filming */}
      <group position={[0.6, 0, 0.5]} rotation={[0, -0.6, 0]}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + 0.5
          return (
            <mesh key={i} position={[Math.cos(a) * 0.2, 0.52, Math.sin(a) * 0.2]} rotation={[Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3]}>
              <cylinderGeometry args={[0.025, 0.03, 1.05, 8]} />
              <Clay color={clay.dark} />
            </mesh>
          )
        })}
        <RB size={[0.56, 0.36, 0.38]} position={[0, 1.12, 0]} color={clay.ink} radius={0.06} />
        <mesh position={[0.36, 1.12, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.14, 0.17, 0.24, 20]} />
          <Clay color={google.red} />
        </mesh>
        <mesh position={[0.49, 1.12, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.03, 20]} />
          <meshBasicMaterial color="#8ab4f8" />
        </mesh>
      </group>
      <Person position={[-0.3, 0, 0.95]} rotation={-0.9} color="#FFFFFF" tone={2} pose="hold" speed={0.9} />
      {/* softbox */}
      <group position={[1.6, 0, -0.5]} rotation={[0, -0.9, 0]}>
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
          <Clay color={clay.dark} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.06, 18]} />
          <Clay color={clay.dark} />
        </mesh>
        <mesh position={[0, 1.55, 0.06]}>
          <boxGeometry args={[0.95, 0.95, 0.14]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFF3C9" emissiveIntensity={0.85} roughness={0.9} />
        </mesh>
      </group>
      <Plant position={[-1.7, 0, 1.5]} />
    </>
  )
}

function DesignZone() {
  const arc = useMemo(() => new THREE.TorusGeometry(0.6, 0.03, 10, 48, Math.PI), [])
  const swatches = [google.blue, google.red, google.yellow, google.green]
  return (
    <>
      <group position={[-1.35, 0, 0.15]} rotation={[0, Math.PI / 2, 0]}>
        <RB size={[2.2, 0.08, 1.0]} position={[0, 0.58, 0]} color="#FFFFFF" radius={0.04} />
        {[-0.95, 0.95].map((x) => (
          <mesh key={x} position={[x, 0.27, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.54, 8]} />
            <Clay color={clay.dark} />
          </mesh>
        ))}
        <RB size={[1.1, 0.04, 0.72]} position={[0, 0.65, 0.02]} rotation={[0.14, 0, 0]} color={clay.ink} radius={0.03} />
        <mesh position={[0, 0.672, 0.02]} rotation={[-Math.PI / 2 + 0.14, 0, 0]}>
          <planeGeometry args={[1.0, 0.62]} />
          <meshBasicMaterial color={google.yellowTint} />
        </mesh>
        <mesh position={[-0.15, 0.68, 0.06]} rotation={[-Math.PI / 2 + 0.14, 0, 0.4]}>
          <planeGeometry args={[0.5, 0.05]} />
          <meshBasicMaterial color={google.blue} />
        </mesh>
        {swatches.map((c, i) => (
          <RB key={i} size={[0.2, 0.12, 0.2]} position={[-0.9 + i * 0.3, 0.68, 0.38]} color={c} radius={0.04} />
        ))}
      </group>
      <Chair position={[-0.45, 0, 0.15]} rotation={Math.PI / 2} />
      <Person position={[-0.48, 0, 0.15]} rotation={Math.PI / 2} color={google.yellow} tone={4} pose="sit" phase={0.4} />
      {/* floating bezier / pen tool */}
      <group position={[0.7, 1.9, 0.3]}>
        <mesh geometry={arc}>
          <Clay color={google.blue} />
        </mesh>
        {[-0.6, 0.6].map((x) => (
          <RB key={x} size={[0.15, 0.15, 0.15]} position={[x, 0, 0]} color="#FFFFFF" radius={0.03} />
        ))}
        <mesh position={[0, 0.6, 0]}>
          <sphereGeometry args={[0.09, 14, 14]} />
          <Clay color={google.red} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.6, 6]} />
          <Clay color={clay.mid} />
        </mesh>
      </group>
      <Person position={[1.3, 0, 1.1]} rotation={-2.4} color="#FFFFFF" tone={0} pose="wave" speed={0.8} phase={1} />
      <Plant position={[-1.6, 0, 1.6]} s={1.1} />
    </>
  )
}

function PrZone() {
  const bars: [number, string][] = [
    [0.35, google.blue],
    [0.55, google.yellow],
    [0.8, google.green],
    [0.62, google.red],
  ]
  return (
    <>
      <mesh position={[0, 0.54, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.08, 40]} />
        <Clay color="#FFFFFF" />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 0.54, 12]} />
        <Clay color={clay.dark} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.05, 24]} />
        <Clay color={clay.dark} />
      </mesh>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.7
        const x = Math.sin(a) * 1.4
        const z = Math.cos(a) * 1.4
        return (
          <group key={i}>
            <Chair position={[x, 0, z]} rotation={a + Math.PI} />
            <Person position={[x * 0.97, 0, z * 0.97]} rotation={a + Math.PI} color={i % 2 ? '#FFFFFF' : google.green} tone={i + 1} pose="sit" phase={i * 1.1} />
          </group>
        )
      })}
      {/* megaphone */}
      <group position={[0.1, 0.62, 0.05]} rotation={[0, 0.5, -0.2]}>
        <mesh rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.24, 0.45, 22]} />
          <Clay color={google.green} />
        </mesh>
        <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.2, 14]} />
          <Clay color={clay.dark} />
        </mesh>
      </group>
      {/* speech bubbles */}
      <group position={[0, 2.1, 0]}>
        {(
          [
            [-0.55, 0.05, google.blue, 0.22],
            [0.05, 0.3, google.yellow, 0.26],
            [0.65, 0, google.red, 0.2],
          ] as const
        ).map(([x, y, c, r], i) => (
          <mesh key={i} position={[x, y, 0]}>
            <sphereGeometry args={[r, 20, 20]} />
            <Clay color={c} />
          </mesh>
        ))}
      </group>
      {/* presentation board */}
      <group position={[1.55, 0, -1.55]} rotation={[0, 0.5, 0]}>
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, 0.55, -0.02]}>
            <cylinderGeometry args={[0.025, 0.025, 1.1, 8]} />
            <Clay color={clay.dark} />
          </mesh>
        ))}
        <RB size={[1.3, 0.9, 0.06]} position={[0, 1.35, 0]} color="#FFFFFF" radius={0.03} />
        {bars.map(([h, c], i) => (
          <mesh key={i} position={[-0.42 + i * 0.28, 1.0 + h / 2 - 0.0, 0.035]}>
            <planeGeometry args={[0.18, h * 0.8]} />
            <meshBasicMaterial color={c} />
          </mesh>
        ))}
      </group>
      <Plant position={[-1.7, 0, -1.7]} s={1.1} />
    </>
  )
}

const zoneContent: Record<TeamId, () => React.JSX.Element> = {
  tech: TechZone,
  media: MediaZone,
  design: DesignZone,
  pr: PrZone,
}

const OFF = 2.6
const zonePos: Record<TeamId, [number, number]> = {
  tech: [-OFF, -OFF],
  media: [OFF, -OFF],
  design: [-OFF, OFF],
  pr: [OFF, OFF],
}

function Zone({ team, active, onActive, onSelect }: { team: TeamId; active: boolean; onActive: (t: TeamId | null) => void; onSelect: (t: TeamId) => void }) {
  const lift = useRef<THREE.Group>(null)
  const edge = useRef<THREE.MeshStandardMaterial>(null)
  const color = teams[team].color
  const Content = zoneContent[team]
  const [x, z] = zonePos[team]
  useFrame((_, dt) => {
    const k = Math.min(1, dt * 8)
    if (lift.current) lift.current.position.y += ((active ? 0.12 : 0) - lift.current.position.y) * k
    if (edge.current) edge.current.emissiveIntensity += ((active ? 0.7 : 0) - edge.current.emissiveIntensity) * k
  })
  return (
    <group position={[x, 0, z]}>
      <group
        ref={lift}
        onPointerOver={(e) => {
          e.stopPropagation()
          onActive(team)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          onActive(null)
          document.body.style.cursor = ''
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(team)
        }}
      >
        {/* rug with coloured border */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[4.32, 0.04, 4.32]} />
          <meshStandardMaterial ref={edge} color={color} emissive={color} emissiveIntensity={0} roughness={0.8} />
        </mesh>
        <RB size={[4.1, 0.06, 4.1]} position={[0, 0.03, 0]} color={teams[team].soft} radius={0.14} />
        <group position={[0, 0.06, 0]}>
          <Content />
        </group>
      </group>
    </group>
  )
}

/* ------------------------------ logo + centre ------------------------------ */

function Segment({ a, b, color, r = 0.17 }: { a: [number, number]; b: [number, number]; color: string; r?: number }) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1])
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0])
  return (
    <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0]} rotation={[0, 0, ang - Math.PI / 2]}>
      <capsuleGeometry args={[r, len, 8, 18]} />
      <Clay color={color} rough={0.55} />
    </mesh>
  )
}

/** The GDG mark: two chevrons, four pills (red/blue, green/yellow), no centre dots. Faces the camera. */
function FloatingLogo() {
  const g = useRef<THREE.Group>(null)
  useFrame(({ clock, pointer }) => {
    if (!g.current) return
    const t = clock.elapsedTime
    g.current.position.y = 1.95 + Math.sin(t * 1.2) * 0.07
    g.current.rotation.y = Math.PI / 4 + Math.sin(t * 0.6) * 0.1 + pointer.x * 0.25
  })
  return (
    <group ref={g} position={[-0.15, 2.05, -3.9]} scale={1.0}>
      <Segment a={[-0.46, 0.66]} b={[-1.14, 0.12]} color={google.red} r={0.28} />
      <Segment a={[-1.14, -0.12]} b={[-0.46, -0.66]} color={google.blue} r={0.28} />
      <Segment a={[0.46, 0.66]} b={[1.14, 0.12]} color={google.green} r={0.28} />
      <Segment a={[1.14, -0.12]} b={[0.46, -0.66]} color={google.yellow} r={0.28} />
    </group>
  )
}

function BracketLogo() {
  const arcs = [google.blue, google.red, google.yellow, google.green]
  return (
    <>
      {/* plinth with four-colour ring */}
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[0.5, 0.58, 0.22, 36]} />
        <Clay color="#FFFFFF" />
      </mesh>
      {arcs.map((c, i) => (
        <mesh key={i} position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.66, 0.78, 24, 1, (i * Math.PI) / 2 + 0.08, Math.PI / 2 - 0.16]} />
          <meshBasicMaterial color={c} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}

function Walker() {
  const g = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!g.current) return
    const t = clock.elapsedTime * 0.55
    const r = 0.74
    g.current.position.set(Math.cos(t) * r, 0.06, Math.sin(t) * r)
    g.current.rotation.y = -t + Math.PI
  })
  return (
    <group ref={g}>
      <Person color={google.blue} tone={2} speed={2.4} scale={1.05} />
    </group>
  )
}

export default function Clubhouse({ active, onActive, onSelect }: Props) {
  const tier = useSceneTier()
  const checker = useChecker()
  const root = useRef<THREE.Group>(null)
  useFrame(({ pointer }, dt) => {
    if (!root.current) return
    root.current.rotation.y += (pointer.x * 0.08 - root.current.rotation.y) * Math.min(1, dt * 3)
  })
  return (
    <>
      <IsoCamera />
      <Lights castShadow={tier === 'high'} shadows={tier !== 'high'} />
      <group ref={root} position={[0, -0.3, 0]}>
        <Shadowed enabled={tier === 'high'}>
          <RB size={[FLOOR + 0.5, 0.34, FLOOR + 0.5]} position={[0, -0.17, 0]} color="#E8EAED" radius={0.12} />
          <RB size={[FLOOR, 0.1, FLOOR]} position={[0, -0.05, 0]} color="#FFFFFF" radius={0.08} />
          <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[FLOOR, FLOOR]} />
            <meshStandardMaterial map={checker} roughness={0.9} />
          </mesh>
          <Walls />
          {(Object.keys(zonePos) as TeamId[]).map((t) => (
            <Zone key={t} team={t} active={active === t} onActive={onActive} onSelect={onSelect} />
          ))}
          <FloatingLogo />
          <BracketLogo />
          <Walker />
        </Shadowed>
      </group>
    </>
  )
}
