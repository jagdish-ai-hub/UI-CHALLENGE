import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { google, teams, type TeamId } from '@/config/brand'
import { Clay, Lights } from './common'

interface Props {
  name: string
  team: TeamId
  branch: string
}

function drawCard(c: HTMLCanvasElement, name: string, team: TeamId, branch: string) {
  const ctx = c.getContext('2d')!
  const W = c.width
  const H = c.height
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
  // header: soft team tint, full-colour GDG mark, team-colour rule
  ctx.fillStyle = teams[team].soft
  ctx.fillRect(0, 0, W, H * 0.3)
  ctx.fillStyle = teams[team].color
  ctx.fillRect(0, H * 0.3, W, H * 0.012)
  ctx.lineCap = 'round'
  const u = W * 0.0042
  const lx = W * 0.075
  const ly = H * 0.055
  const pill = (x1: number, y1: number, x2: number, y2: number, c: string) => {
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 15 * u
    ctx.beginPath()
    ctx.moveTo(lx + x1 * u, ly + y1 * u)
    ctx.lineTo(lx + x2 * u, ly + y2 * u)
    ctx.stroke()
    ctx.strokeStyle = c
    ctx.lineWidth = 12 * u
    ctx.stroke()
  }
  pill(22, 18, 8, 29.5, google.red)
  pill(8, 34.5, 22, 46, google.blue)
  pill(42, 18, 56, 29.5, google.green)
  pill(56, 34.5, 42, 46, google.yellow)
  ctx.fillStyle = '#202124'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `600 ${W * 0.062}px "Inter Variable", Inter, sans-serif`
  ctx.fillText('GDG on Campus', W * 0.92, H * 0.125)
  ctx.fillStyle = '#5f6368'
  ctx.font = `500 ${W * 0.034}px "JetBrains Mono Variable", monospace`
  ctx.fillText('ITER CHAPTER', W * 0.92, H * 0.185)
  // avatar disc
  ctx.fillStyle = teams[team].soft
  ctx.beginPath()
  ctx.arc(W / 2, H * 0.48, W * 0.19, 0, 7)
  ctx.fill()
  const initials = (name || 'Your Name')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
  ctx.fillStyle = teams[team].color
  ctx.font = `600 ${W * 0.17}px "Inter Tight Variable", Inter, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initials || 'YN', W / 2, H * 0.485)
  // name
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#202124'
  let size = W * 0.092
  const label = name.trim() || 'Your Name'
  ctx.font = `600 ${size}px "Inter Tight Variable", Inter, sans-serif`
  while (ctx.measureText(label).width > W * 0.84 && size > 20) {
    size -= 2
    ctx.font = `600 ${size}px "Inter Tight Variable", Inter, sans-serif`
  }
  ctx.fillText(label, W / 2, H * 0.76)
  ctx.fillStyle = '#5f6368'
  ctx.font = `500 ${W * 0.04}px "JetBrains Mono Variable", monospace`
  ctx.fillText(`${teams[team].label.toUpperCase()} · ${branch.toUpperCase()}`, W / 2, H * 0.82)
  // footer dots
  const cols = [google.blue, google.red, google.yellow, google.green]
  cols.forEach((col, i) => {
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(W / 2 + (i - 1.5) * W * 0.07, H * 0.92, W * 0.016, 0, 7)
    ctx.fill()
  })
}

export default function BadgeScene({ name, team, branch }: Props) {
  const group = useRef<THREE.Group>(null)
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 640
    c.height = 960
    return c
  }, [])
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [canvas])

  useEffect(() => {
    drawCard(canvas, name, team, branch)
    tex.needsUpdate = true
    // redraw once webfonts are ready
    document.fonts?.ready.then(() => {
      drawCard(canvas, name, team, branch)
      tex.needsUpdate = true
    })
  }, [name, team, branch, canvas, tex])

  const cardGeo = useMemo(() => {
    const w = 1.6
    const h = 2.4
    const r = 0.14
    const s = new THREE.Shape()
    s.moveTo(-w / 2 + r, -h / 2)
    s.lineTo(w / 2 - r, -h / 2)
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r)
    s.lineTo(w / 2, h / 2 - r)
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2)
    s.lineTo(-w / 2 + r, h / 2)
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r)
    s.lineTo(-w / 2, -h / 2 + r)
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2)
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 3 })
    g.translate(0, 0, -0.025)
    return g
  }, [])

  const vel = useRef(0)
  useFrame(({ clock, pointer }, dt) => {
    const g = group.current
    if (!g) return
    const t = clock.elapsedTime
    const targetY = pointer.x * 0.7 + Math.sin(t * 0.8) * 0.18
    const targetZ = Math.sin(t * 1.1) * 0.04 - pointer.x * 0.05
    // damped spring on yaw gives a lanyard-like swing
    const k = 22
    const c = 4.5
    vel.current += ((targetY - g.rotation.y) * k - vel.current * c) * dt
    g.rotation.y += vel.current * dt
    g.rotation.z += (targetZ - g.rotation.z) * Math.min(1, dt * 4)
    g.rotation.x = -pointer.y * 0.12
  })

  const acc = teams[team].color
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.1, 6.2]} fov={32} />
      <Lights shadows={false} intensity={1.05} />
      {/* lanyard */}
      <mesh position={[0, 2.6, -0.02]}>
        <boxGeometry args={[0.16, 2.0, 0.015]} />
        <meshStandardMaterial color={acc} roughness={0.7} />
      </mesh>
      <group ref={group} position={[0, 0.2, 0]}>
        {/* clip */}
        <mesh position={[0, 1.32, 0]}>
          <boxGeometry args={[0.34, 0.16, 0.08]} />
          <Clay color="#9aa0a6" rough={0.4} />
        </mesh>
        <mesh geometry={cardGeo}>
          <Clay color="#FFFFFF" />
        </mesh>
        <mesh position={[0, 0, 0.0525]}>
          <planeGeometry args={[1.58, 2.37]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, -0.0535]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.58, 2.37]} />
          <meshBasicMaterial color="#F1F3F4" />
        </mesh>
      </group>
    </>
  )
}
