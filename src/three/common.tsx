import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ContactShadows, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { google } from '@/config/brand'

export const G = {
  blue: new THREE.Color(google.blue),
  red: new THREE.Color(google.red),
  yellow: new THREE.Color(google.yellow),
  green: new THREE.Color(google.green),
}

export const clay = {
  white: '#F4F5F7',
  cream: '#FFFFFF',
  grey: '#DADCE0',
  mid: '#BDC1C6',
  dark: '#3C4043',
  ink: '#202124',
}

export function Lights({ shadows = true, castShadow = false, intensity = 1 }: { shadows?: boolean; castShadow?: boolean; intensity?: number }) {
  return (
    <>
      <hemisphereLight args={['#ffffff', '#dfe4ec', 0.95 * intensity]} />
      <directionalLight
        position={[7, 12, 6]}
        intensity={1.55 * intensity}
        color="#fff8ec"
        castShadow={castShadow}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={1}
        shadow-camera-far={42}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
        shadow-radius={6}
      />
      <directionalLight position={[-6, 5, -4]} intensity={0.45 * intensity} color="#dbe7ff" />
      {shadows && !castShadow && (
        <ContactShadows position={[0, 0.001, 0]} opacity={0.22} scale={22} blur={2.6} far={4} resolution={512} frames={90} color="#1f2a44" />
      )}
    </>
  )
}

export function Clay({ color, rough = 0.82, ...rest }: { color: string | THREE.Color; rough?: number } & Record<string, unknown>) {
  return <meshStandardMaterial color={color} roughness={rough} metalness={0} {...rest} />
}

/** Soft rounded box (position is the box centre). */
export function RB({
  size,
  position = [0, 0, 0],
  rotation,
  color,
  radius = 0.035,
  rough,
}: {
  size: [number, number, number]
  position?: [number, number, number]
  rotation?: [number, number, number]
  color: string
  radius?: number
  rough?: number
}) {
  return (
    <RoundedBox args={size} radius={Math.min(radius, Math.min(...size) / 2 - 0.001)} smoothness={3} position={position} rotation={rotation}>
      <Clay color={color} rough={rough} />
    </RoundedBox>
  )
}

/** Marks every mesh below as casting and receiving shadows. */
export function Shadowed({ children, enabled = true }: { children: React.ReactNode; enabled?: boolean }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(() => {
    if (!enabled || !ref.current || ref.current.userData.done) return
    ref.current.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) {
        m.castShadow = true
        m.receiveShadow = true
      }
    })
    ref.current.userData.done = true
  })
  return <group ref={ref}>{children}</group>
}

const skin = ['#F3CBA7', '#E2AE80', '#C98F61', '#8F5E3F', '#FFDDBA']
const hairCol = ['#2B2118', '#3B2A1E', '#1C1C1C', '#5B3A24', '#7A4B2A']

export type Pose = 'stand' | 'sit' | 'wave' | 'hold'

/** Clay person with legs, arms, head and a hair style; poses animate softly. */
export function Person({
  position = [0, 0, 0],
  rotation = 0,
  color,
  pants = clay.dark,
  tone = 0,
  pose = 'stand',
  speed = 1,
  phase = 0,
  scale = 1.2,
}: {
  position?: [number, number, number]
  rotation?: number
  color: string
  pants?: string
  tone?: number
  pose?: Pose
  speed?: number
  phase?: number
  scale?: number
}) {
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const armL = useRef<THREE.Group>(null)
  const armR = useRef<THREE.Group>(null)
  const sit = pose === 'sit'
  const torsoY = sit ? 0.7 : 0.84
  const headY = torsoY + 0.5

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phase
    if (body.current) body.current.position.y = Math.sin(t * 2) * 0.01
    if (head.current) {
      head.current.rotation.z = Math.sin(t * 1.3) * 0.06
      head.current.rotation.x = sit ? 0.12 + Math.sin(t * 2.7) * 0.04 : Math.sin(t * 1.9) * 0.03
    }
    const L = armL.current
    const R = armR.current
    if (!L || !R) return
    if (pose === 'sit') {
      L.rotation.x = -1.15 + Math.sin(t * 9) * 0.05
      R.rotation.x = -1.15 + Math.sin(t * 9 + 2) * 0.05
    } else if (pose === 'hold') {
      L.rotation.x = -1.25
      R.rotation.x = -1.25
      L.rotation.z = 0.18
      R.rotation.z = -0.18
    } else if (pose === 'wave') {
      L.rotation.z = 0.1
      R.rotation.z = -2.5 + Math.sin(t * 5) * 0.35
    } else {
      L.rotation.z = 0.08 + Math.sin(t * 1.5) * 0.03
      R.rotation.z = -0.08 - Math.sin(t * 1.5) * 0.03
    }
  })

  const hair = hairCol[(tone + 1) % hairCol.length]!
  return (
    <group position={position} rotation={[0, rotation, 0]} scale={scale}>
      <group ref={body}>
        {sit ? (
          <>
            {[-1, 1].map((s) => (
              <group key={s}>
                <mesh position={[s * 0.1, 0.4, 0.16]} rotation={[Math.PI / 2, 0, 0]}>
                  <capsuleGeometry args={[0.08, 0.26, 4, 10]} />
                  <Clay color={pants} />
                </mesh>
                <mesh position={[s * 0.1, 0.2, 0.34]}>
                  <capsuleGeometry args={[0.07, 0.26, 4, 10]} />
                  <Clay color={pants} />
                </mesh>
                <mesh position={[s * 0.1, 0.05, 0.4]}>
                  <boxGeometry args={[0.12, 0.06, 0.2]} />
                  <Clay color="#FFFFFF" />
                </mesh>
              </group>
            ))}
          </>
        ) : (
          <>
            {[-1, 1].map((s) => (
              <group key={s}>
                <mesh position={[s * 0.1, 0.36, 0]}>
                  <capsuleGeometry args={[0.08, 0.5, 4, 10]} />
                  <Clay color={pants} />
                </mesh>
                <mesh position={[s * 0.1, 0.04, 0.04]}>
                  <boxGeometry args={[0.13, 0.07, 0.22]} />
                  <Clay color="#FFFFFF" />
                </mesh>
              </group>
            ))}
          </>
        )}
        <mesh position={[0, torsoY, 0]}>
          <capsuleGeometry args={[0.19, 0.3, 6, 16]} />
          <Clay color={color} />
        </mesh>
        <group ref={armL} position={[-0.25, torsoY + 0.17, 0]}>
          <mesh position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.06, 0.26, 4, 10]} />
            <Clay color={color} />
          </mesh>
          <mesh position={[0, -0.38, 0]}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <Clay color={skin[tone % skin.length]!} />
          </mesh>
        </group>
        <group ref={armR} position={[0.25, torsoY + 0.17, 0]}>
          <mesh position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.06, 0.26, 4, 10]} />
            <Clay color={color} />
          </mesh>
          <mesh position={[0, -0.38, 0]}>
            <sphereGeometry args={[0.06, 10, 10]} />
            <Clay color={skin[tone % skin.length]!} />
          </mesh>
        </group>
        <group ref={head} position={[0, headY, 0]}>
          <mesh>
            <sphereGeometry args={[0.2, 24, 24]} />
            <Clay color={skin[tone % skin.length]!} />
          </mesh>
          <mesh position={[0, 0.045, -0.025]} rotation={[-0.25, 0, 0]}>
            <sphereGeometry args={[0.212, 24, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <Clay color={hair} />
          </mesh>
          {tone % 5 === 1 && (
            <mesh position={[0, 0.26, -0.04]}>
              <sphereGeometry args={[0.09, 12, 12]} />
              <Clay color={hair} />
            </mesh>
          )}
          {tone % 5 === 2 && (
            <mesh position={[0, -0.04, -0.14]} rotation={[0.2, 0, 0]}>
              <capsuleGeometry args={[0.1, 0.22, 4, 10]} />
              <Clay color={hair} />
            </mesh>
          )}
          {tone % 5 === 3 && (
            <>
              {[-0.1, 0, 0.1].map((x) => (
                <mesh key={x} position={[x, 0.2, -0.02]}>
                  <sphereGeometry args={[0.075, 10, 10]} />
                  <Clay color={hair} />
                </mesh>
              ))}
            </>
          )}
        </group>
      </group>
    </group>
  )
}

/** Rounded slab helper with its bottom at `position` (used for floors and platforms). */
export function Slab({
  size,
  position = [0, 0, 0],
  color,
  radius = 0.06,
}: {
  size: [number, number, number]
  position?: [number, number, number]
  color: string
  radius?: number
}) {
  const geo = useMemo(() => {
    const [w, h, d] = size
    const s = new THREE.Shape()
    const r = Math.min(radius, w / 2, d / 2)
    const x = -w / 2
    const y = -d / 2
    s.moveTo(x + r, y)
    s.lineTo(x + w - r, y)
    s.quadraticCurveTo(x + w, y, x + w, y + r)
    s.lineTo(x + w, y + d - r)
    s.quadraticCurveTo(x + w, y + d, x + w - r, y + d)
    s.lineTo(x + r, y + d)
    s.quadraticCurveTo(x, y + d, x, y + d - r)
    s.lineTo(x, y + r)
    s.quadraticCurveTo(x, y, x + r, y)
    const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelSize: Math.min(0.025, r * 0.5), bevelThickness: Math.min(0.025, h * 0.4), bevelSegments: 2 })
    g.rotateX(-Math.PI / 2)
    return g
  }, [size, radius])
  return (
    <mesh geometry={geo} position={position}>
      <Clay color={color} />
    </mesh>
  )
}
