import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer, PerspectiveCamera, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { google, teams, type TeamId } from '@/config/brand'
import { Lights } from './common'
import { mulberry32 } from '@/lib/utils'

interface Props {
  name: string
  team: TeamId
  branch: string
}

const CW = 1.6
const CH = 2.4
const FONT_D = '"Inter Tight Variable", "Inter Variable", Inter, sans-serif'
const FONT_S = '"Inter Variable", Inter, sans-serif'
const FONT_M = '"JetBrains Mono Variable", ui-monospace, monospace'

function hash(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function badgeId(name: string, team: TeamId) {
  const n = hash((name || 'your name').toLowerCase() + team) % 9000
  return `GDG-26-${String(n + 1000)}`
}

function pill(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, x1: number, y1: number, x2: number, y2: number, c: string, outline = '#ffffff') {
  ctx.lineCap = 'round'
  ctx.strokeStyle = outline
  ctx.lineWidth = 15 * u
  ctx.beginPath()
  ctx.moveTo(x + x1 * u, y + y1 * u)
  ctx.lineTo(x + x2 * u, y + y2 * u)
  ctx.stroke()
  ctx.strokeStyle = c
  ctx.lineWidth = 12 * u
  ctx.stroke()
}

/** The GDG mark: two chevrons, four pills, no centre dots. (x, y) is the top-left of a 64-unit box. */
function mark(ctx: CanvasRenderingContext2D, x: number, y: number, u: number, outline?: string) {
  pill(ctx, x, y, u, 22, 18, 8, 29.5, google.red, outline)
  pill(ctx, x, y, u, 8, 34.5, 22, 46, google.blue, outline)
  pill(ctx, x, y, u, 42, 18, 56, 29.5, google.green, outline)
  pill(ctx, x, y, u, 56, 34.5, 42, 46, google.yellow, outline)
}

function fit(ctx: CanvasRenderingContext2D, text: string, maxW: number, start: number, weight = 600, family = FONT_D) {
  let size = start
  ctx.font = `${weight} ${size}px ${family}`
  while (ctx.measureText(text).width > maxW && size > 18) {
    size -= 2
    ctx.font = `${weight} ${size}px ${family}`
  }
  return size
}

function qr(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, seed: number) {
  const n = 25
  const m = size / n
  const rnd = mulberry32(seed)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(x - m, y - m, size + 2 * m, size + 2 * m)
  ctx.fillStyle = '#202124'
  const inFinder = (i: number, j: number) => (i < 8 && j < 8) || (i > n - 9 && j < 8) || (i < 8 && j > n - 9)
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) if (!inFinder(i, j) && rnd() > 0.52) ctx.fillRect(x + i * m, y + j * m, m + 0.4, m + 0.4)
  const finder = (fx: number, fy: number) => {
    ctx.fillStyle = '#202124'
    ctx.fillRect(x + fx * m, y + fy * m, 7 * m, 7 * m)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x + (fx + 1) * m, y + (fy + 1) * m, 5 * m, 5 * m)
    ctx.fillStyle = '#202124'
    ctx.fillRect(x + (fx + 2) * m, y + (fy + 2) * m, 3 * m, 3 * m)
  }
  finder(0, 0)
  finder(n - 7, 0)
  finder(0, n - 7)
}

function drawFront(c: HTMLCanvasElement, name: string, team: TeamId, branch: string) {
  const ctx = c.getContext('2d')!
  const W = c.width
  const H = c.height
  const t = teams[team]
  ctx.clearRect(0, 0, W, H)

  // paper
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#ffffff')
  bg.addColorStop(1, '#f4f6f8')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // header band with faint pill pattern
  const hh = H * 0.27
  ctx.fillStyle = t.soft
  ctx.fillRect(0, 0, W, hh)
  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, W, hh)
  ctx.clip()
  ctx.globalAlpha = 0.5
  for (let i = 0; i < 6; i++) {
    pill(ctx, W * (0.1 + i * 0.2), -H * 0.02, W * 0.0042, 22, 18, 8, 29.5, '#ffffff', '#ffffff00')
    pill(ctx, W * (0.1 + i * 0.2), H * 0.06, W * 0.0042, 8, 34.5, 22, 46, '#ffffff', '#ffffff00')
  }
  ctx.restore()
  ctx.fillStyle = t.color
  ctx.fillRect(0, hh, W, H * 0.011)

  // logo + wordmark
  mark(ctx, W * 0.07, H * 0.085, W * 0.0046)
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'right'
  ctx.fillStyle = '#202124'
  ctx.font = `600 ${W * 0.066}px ${FONT_D}`
  ctx.fillText('GDG on Campus', W * 0.93, H * 0.14)
  ctx.fillStyle = '#5f6368'
  ctx.font = `500 ${W * 0.031}px ${FONT_M}`
  ctx.fillText('ITER CHAPTER · 2026', W * 0.93, H * 0.185)

  // tag line
  ctx.textAlign = 'left'
  ctx.fillStyle = '#5f6368'
  ctx.font = `500 ${W * 0.032}px ${FONT_M}`
  ctx.fillText('MEMBER IDENTITY CARD', W * 0.07, H * 0.325)
  // status pill
  const pillW = W * 0.25
  ctx.fillStyle = t.color
  ctx.beginPath()
  ctx.roundRect(W * 0.93 - pillW, H * 0.3, pillW, H * 0.032, H * 0.016)
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.font = `600 ${W * 0.026}px ${FONT_M}`
  ctx.fillText('APPLICANT', W * 0.93 - pillW / 2, H * 0.3235)

  // avatar with four-colour ring
  const cx = W / 2
  const cy = H * 0.5
  const R = W * 0.2
  const cols = [google.blue, google.red, google.yellow, google.green]
  ctx.lineWidth = W * 0.016
  ctx.lineCap = 'round'
  cols.forEach((col, i) => {
    ctx.strokeStyle = col
    ctx.beginPath()
    ctx.arc(cx, cy, R + W * 0.03, (i * Math.PI) / 2 + 0.22, ((i + 1) * Math.PI) / 2 - 0.22)
    ctx.stroke()
  })
  const grad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.4, R * 0.1, cx, cy, R)
  grad.addColorStop(0, '#ffffff')
  grad.addColorStop(1, t.soft)
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.fill()
  const initials =
    (name || 'Your Name')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join('') || 'YN'
  ctx.fillStyle = t.color === google.yellow ? '#b06000' : t.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `600 ${W * 0.17}px ${FONT_D}`
  ctx.fillText(initials, cx, cy + W * 0.008)

  // holographic verified sticker (painted), lower right of the avatar
  const sx = cx + R * 0.82
  const sy = cy + R * 0.82
  const sr = W * 0.06
  const holo = ctx.createConicGradient(0.6, sx, sy)
  ;[google.blue, '#c58af9', google.red, google.yellow, google.green, '#78d9ec', google.blue].forEach((col, i, a) => holo.addColorStop(i / (a.length - 1), col))
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(sx, sy, sr + W * 0.008, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = holo
  ctx.beginPath()
  ctx.arc(sx, sy, sr, 0, Math.PI * 2)
  ctx.fill()
  const shine = ctx.createLinearGradient(sx - sr, sy - sr, sx + sr, sy + sr)
  shine.addColorStop(0, 'rgba(255,255,255,0.75)')
  shine.addColorStop(0.5, 'rgba(255,255,255,0)')
  shine.addColorStop(1, 'rgba(255,255,255,0.35)')
  ctx.fillStyle = shine
  ctx.beginPath()
  ctx.arc(sx, sy, sr, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = W * 0.012
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(sx - sr * 0.4, sy + sr * 0.02)
  ctx.lineTo(sx - sr * 0.08, sy + sr * 0.34)
  ctx.lineTo(sx + sr * 0.46, sy - sr * 0.3)
  ctx.stroke()

  // name + role
  ctx.textBaseline = 'alphabetic'
  const label = name.trim() || 'Your Name'
  ctx.fillStyle = '#202124'
  fit(ctx, label, W * 0.84, W * 0.1)
  ctx.fillText(label, cx, H * 0.745)
  ctx.fillStyle = '#5f6368'
  ctx.font = `500 ${W * 0.034}px ${FONT_M}`
  ctx.fillText(`${t.label.toUpperCase()} TEAM · ${branch.toUpperCase()}`, cx, H * 0.78)

  // info row
  const info: [string, string][] = [
    ['TEAM', t.label.split(' ')[0]!],
    ['BATCH', '2026'],
    ['ACCESS', 'Hub'],
  ]
  const colW = (W * 0.86) / 3
  info.forEach(([k, v], i) => {
    const x = W * 0.07 + i * colW
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#dadce0'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(x, H * 0.805, colW - W * 0.025, H * 0.058, W * 0.02)
    ctx.fill()
    ctx.stroke()
    ctx.textAlign = 'left'
    ctx.fillStyle = '#80868b'
    ctx.font = `500 ${W * 0.024}px ${FONT_M}`
    ctx.fillText(k, x + W * 0.025, H * 0.826)
    ctx.fillStyle = '#202124'
    ctx.font = `600 ${W * 0.034}px ${FONT_S}`
    ctx.fillText(v, x + W * 0.025, H * 0.853)
  })

  // QR + barcode + id
  const seed = hash((name || 'x') + team)
  ctx.fillStyle = '#f1f3f4'
  ctx.fillRect(0, H * 0.885, W, H * 0.115)
  qr(ctx, W * 0.085, H * 0.893, W * 0.14, seed)
  const idStr = badgeId(name, team)
  ctx.fillStyle = '#202124'
  ctx.textAlign = 'left'
  ctx.font = `600 ${W * 0.04}px ${FONT_M}`
  ctx.fillText(idStr, W * 0.28, H * 0.915)
  const rnd = mulberry32(seed ^ 0x9e37)
  let bx = W * 0.28
  while (bx < W * 0.92) {
    const w = (1 + Math.floor(rnd() * 3)) * W * 0.0045
    ctx.fillRect(bx, H * 0.925, w, H * 0.044)
    bx += w + (1 + Math.floor(rnd() * 2)) * W * 0.0045
  }
  // footer strip
  const fh = H * 0.014
  cols.forEach((col, i) => {
    ctx.fillStyle = col
    ctx.fillRect((W / 4) * i, H - fh, W / 4, fh)
  })
}

function drawBack(c: HTMLCanvasElement, team: TeamId) {
  const ctx = c.getContext('2d')!
  const W = c.width
  const H = c.height
  const t = teams[team]
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#ffffff')
  bg.addColorStop(1, t.tint)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  // magstripe
  ctx.fillStyle = '#202124'
  ctx.fillRect(0, H * 0.13, W, H * 0.085)
  // big faint mark
  ctx.globalAlpha = 0.16
  mark(ctx, W * 0.1, H * 0.34, W * 0.0125, '#ffffff00')
  ctx.globalAlpha = 1
  ctx.textAlign = 'center'
  ctx.fillStyle = '#202124'
  ctx.font = `600 ${W * 0.07}px ${FONT_D}`
  ctx.fillText('Build. Learn. Grow.', W / 2, H * 0.68)
  ctx.fillStyle = '#5f6368'
  ctx.font = `500 ${W * 0.034}px ${FONT_S}`
  const lines = ['This card belongs to the GDG on Campus', 'ITER Chapter. If found, please return it to', 'the club desk, Innovation Hub.']
  lines.forEach((l, i) => ctx.fillText(l, W / 2, H * 0.74 + i * H * 0.034))
  ctx.fillStyle = t.color
  ctx.font = `600 ${W * 0.034}px ${FONT_M}`
  ctx.fillText('gdg.community/iter', W / 2, H * 0.88)
  const cols = [google.blue, google.red, google.yellow, google.green]
  const fh = H * 0.014
  cols.forEach((col, i) => {
    ctx.fillStyle = col
    ctx.fillRect((W / 4) * i, H - fh, W / 4, fh)
  })
}

function roundedShape(w: number, h: number, r: number, slot = true) {
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
  if (slot) {
    const sw = 0.44
    const sh = 0.09
    const sy = h / 2 - 0.12
    const hole = new THREE.Path()
    hole.moveTo(-sw / 2 + sh / 2, sy - sh / 2)
    hole.lineTo(sw / 2 - sh / 2, sy - sh / 2)
    hole.absarc(sw / 2 - sh / 2, sy, sh / 2, -Math.PI / 2, Math.PI / 2, false)
    hole.lineTo(-sw / 2 + sh / 2, sy + sh / 2)
    hole.absarc(-sw / 2 + sh / 2, sy, sh / 2, Math.PI / 2, (Math.PI * 3) / 2, false)
    s.holes.push(hole)
  }
  return s
}

function faceGeometry(w: number, h: number, r: number) {
  const g = new THREE.ShapeGeometry(roundedShape(w, h, r), 24)
  const uv = g.attributes.uv!
  const pos = g.attributes.position!
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h)
  return g
}

function stripTexture(team: TeamId) {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = teams[team].color
  ctx.fillRect(0, 0, 64, 256)
  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fillRect(4, 0, 2, 256)
  ctx.fillRect(58, 0, 2, 256)
  ctx.save()
  ctx.translate(32, 128)
  ctx.rotate(-Math.PI / 2)
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `700 22px ${FONT_D}`
  ctx.fillText('GDG ON CAMPUS', -2, 0)
  ctx.restore()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 8
  return t
}

function Strap({ from, to, tex }: { from: [number, number]; to: [number, number]; tex: THREE.Texture }) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1])
  const ang = Math.atan2(to[1] - from[1], to[0] - from[0])
  const t = useMemo(() => {
    const c = tex.clone()
    c.needsUpdate = true
    c.repeat.set(1, Math.max(1, Math.round(len / 1.1)))
    return c
  }, [tex, len])
  return (
    <mesh position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, -0.02]} rotation={[0, 0, ang - Math.PI / 2]}>
      <planeGeometry args={[0.17, len]} />
      <meshStandardMaterial map={t} roughness={0.7} side={THREE.DoubleSide} />
    </mesh>
  )
}

export default function BadgeScene({ name, team, branch }: Props) {
  const swing = useRef<THREE.Group>(null)
  const flipper = useRef<THREE.Group>(null)
  const [flipped, setFlipped] = useState(false)

  const front = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 768
    c.height = 1152
    return c
  }, [])
  const back = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 768
    c.height = 1152
    return c
  }, [])
  const frontTex = useMemo(() => {
    const t = new THREE.CanvasTexture(front)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [front])
  const backTex = useMemo(() => {
    const t = new THREE.CanvasTexture(back)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [back])
  const strip = useMemo(() => stripTexture(team), [team])

  useEffect(() => {
    const paint = () => {
      drawFront(front, name, team, branch)
      drawBack(back, team)
      frontTex.needsUpdate = true
      backTex.needsUpdate = true
    }
    paint()
    document.fonts?.ready.then(paint)
  }, [name, team, branch, front, back, frontTex, backTex])

  const bodyGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedShape(CW, CH, 0.14), { depth: 0.05, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 4, curveSegments: 24 })
    g.translate(0, 0, -0.025)
    return g
  }, [])
  const faceGeo = useMemo(() => faceGeometry(CW - 0.03, CH - 0.03, 0.125), [])

  // pendulum state
  const st = useRef({ th: 0, w: 0, yaw: 0, yv: 0, px: 0 })
  useFrame(({ clock, pointer }, dt) => {
    const g = swing.current
    const f = flipper.current
    if (!g || !f) return
    const d = Math.min(dt, 0.033)
    const s = st.current
    const t = clock.elapsedTime
    // pointer velocity pushes the card sideways like a real lanyard
    const pv = (pointer.x - s.px) / Math.max(d, 1e-3)
    s.px = pointer.x
    const force = -pv * 0.9 + Math.sin(t * 0.9) * 0.35
    s.w += (-18 * s.th - 1.6 * s.w + force) * d
    s.th += s.w * d
    s.th = Math.max(-0.7, Math.min(0.7, s.th))
    g.rotation.z = s.th
    // yaw: follow cursor, spring toward target
    const target = pointer.x * 0.45 + Math.sin(t * 0.7) * 0.08
    s.yv += ((target - s.yaw) * 30 - s.yv * 6) * d
    s.yaw += s.yv * d
    g.rotation.y = s.yaw
    g.rotation.x = -pointer.y * 0.1
    // flip animation
    const ft = flipped ? Math.PI : 0
    f.rotation.y += (ft - f.rotation.y) * Math.min(1, d * 7)
  })

  const anchorY = 1.78
  const cardY = -1.62

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.45, 6.0]} fov={30} onUpdate={(c) => c.lookAt(0, 0.42, 0)} />
      <Lights shadows={false} intensity={1.15} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.6} position={[0, 4, 5]} scale={[9, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.6} position={[-5, 1, 3]} scale={[1.4, 6, 1]} color="#dbe8ff" />
        <Lightformer form="rect" intensity={1.6} position={[5, 0, 3]} scale={[1.4, 6, 1]} color="#fff2db" />
        <Lightformer form="circle" intensity={1.2} position={[0, -3, 4]} scale={4} color="#ffffff" />
      </Environment>

      {/* lanyard straps from above meeting at the ring */}
      <Strap from={[-1.15, 4.4]} to={[0, anchorY]} tex={strip} />
      <Strap from={[1.15, 4.4]} to={[0, anchorY]} tex={strip} />

      <group ref={swing} position={[0, anchorY, 0]}>
        {/* ring + clip */}
        <mesh position={[0, -0.08, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.11, 0.022, 14, 36]} />
          <meshStandardMaterial color="#c9ced6" metalness={1} roughness={0.22} />
        </mesh>
        <RoundedBox args={[0.3, 0.2, 0.06]} radius={0.04} smoothness={4} position={[0, -0.27, 0]}>
          <meshStandardMaterial color="#d3d8df" metalness={1} roughness={0.2} />
        </RoundedBox>
        <mesh position={[0, -0.42, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.18, 8]} />
          <meshStandardMaterial color="#c9ced6" metalness={1} roughness={0.25} />
        </mesh>

        <group position={[0, cardY + 0.0, 0]}>
          <group ref={flipper} onClick={(e) => (e.stopPropagation(), setFlipped((v) => !v))} onPointerOver={() => (document.body.style.cursor = 'pointer')} onPointerOut={() => (document.body.style.cursor = '')}>
            {/* plastic body */}
            <mesh geometry={bodyGeo}>
              <meshPhysicalMaterial color="#ffffff" roughness={0.45} clearcoat={1} clearcoatRoughness={0.12} />
            </mesh>
            {/* printed faces */}
            <mesh geometry={faceGeo} position={[0, 0, 0.041]}>
              <meshPhysicalMaterial map={frontTex} roughness={0.35} clearcoat={1} clearcoatRoughness={0.08} />
            </mesh>
            <mesh geometry={faceGeo} position={[0, 0, -0.041]} rotation={[0, Math.PI, 0]}>
              <meshPhysicalMaterial map={backTex} roughness={0.35} clearcoat={1} clearcoatRoughness={0.08} />
            </mesh>
          </group>
        </group>
      </group>
    </>
  )
}
