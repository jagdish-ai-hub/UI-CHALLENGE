import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { google } from '@/config/brand'
import { kindColor, type ClubEvent } from '@/data/seed'
import { isoDay } from '@/lib/utils'
import { Lights } from './common'

const CELL = 1.08
const HEAD = 0.55
const PW = 7 * CELL
const PH = HEAD + 6 * CELL
const FONT_M = '"JetBrains Mono Variable", ui-monospace, monospace'
const FONT_S = '"Inter Variable", Inter, sans-serif'
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export function monthGrid(year: number, month: number) {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7 // Monday-first
  const cells: Date[] = []
  for (let i = 0; i < 42; i++) cells.push(new Date(year, month, 1 - offset + i))
  return cells
}

function drawMonth(c: HTMLCanvasElement, year: number, month: number, todayIso: string) {
  const ctx = c.getContext('2d')!
  const W = c.width
  const H = c.height
  const ppu = W / PW
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)
  // weekday header
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const cols = [google.blue, google.red, google.yellow, google.green, google.blue, google.red, google.green]
  DAYS.forEach((d, i) => {
    ctx.fillStyle = '#5f6368'
    ctx.font = `500 ${ppu * 0.2}px ${FONT_M}`
    ctx.fillText(d, (i + 0.5) * CELL * ppu, (HEAD * ppu) / 2 + 2)
    ctx.fillStyle = cols[i]!
    ctx.fillRect((i + 0.5) * CELL * ppu - ppu * 0.12, HEAD * ppu - 6, ppu * 0.24, 4)
  })
  const cells = monthGrid(year, month)
  cells.forEach((d, i) => {
    const col = i % 7
    const row = Math.floor(i / 7)
    const x = col * CELL * ppu + ppu * 0.04
    const y = (HEAD + row * CELL) * ppu + ppu * 0.04
    const s = CELL * ppu - ppu * 0.08
    const inMonth = d.getMonth() === month
    const iso = isoDay(d)
    const isToday = iso === todayIso
    ctx.fillStyle = isToday ? google.blueTint : inMonth ? '#f8f9fa' : '#ffffff'
    ctx.strokeStyle = isToday ? google.blue : '#e8eaed'
    ctx.lineWidth = isToday ? 5 : 2
    ctx.beginPath()
    ctx.roundRect(x, y, s, s, ppu * 0.12)
    ctx.fill()
    ctx.stroke()
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillStyle = isToday ? google.blue : inMonth ? '#202124' : '#bdc1c6'
    ctx.font = `${isToday ? 700 : 500} ${ppu * 0.2}px ${FONT_S}`
    ctx.fillText(String(d.getDate()), x + ppu * 0.1, y + ppu * 0.08)
  })
}

function FitCamera() {
  const size = useThree((s) => s.size)
  const ref = useRef<THREE.PerspectiveCamera>(null)
  const fov = 30
  const aspect = size.width / size.height
  const t = Math.tan((fov * Math.PI) / 360)
  const dW = 8.5 / (2 * t * aspect)
  const dH = 6.9 / (2 * t)
  const d = Math.max(dW, dH)
  const el = (56 * Math.PI) / 180
  useEffect(() => {
    ref.current?.lookAt(0, 0.2, 0.3)
  }, [d])
  return <PerspectiveCamera ref={ref} makeDefault fov={fov} position={[0, Math.sin(el) * d, Math.cos(el) * d + 0.3]} near={0.1} far={80} />
}

interface TowerProps {
  ev: ClubEvent
  x: number
  z: number
  w: number
  past: boolean
  selected: boolean
  hovered: boolean
  going: boolean
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
}

function Tower({ ev, x, z, w, past, selected, hovered, going, onHover, onSelect }: TowerProps) {
  const g = useRef<THREE.Group>(null)
  const mat = useRef<THREE.MeshStandardMaterial>(null)
  const base = kindColor[ev.kind]
  const color = useMemo(() => new THREE.Color(base).lerp(new THREE.Color('#dadce0'), past ? 0.65 : 0), [base, past])
  const height = 0.32 + Math.min(1, ev.going / Math.max(ev.capacity, 1)) * 0.95
  const grow = useRef(0)
  useFrame((_, dt) => {
    if (!g.current) return
    grow.current += (1 - grow.current) * Math.min(1, dt * 5)
    const lift = selected ? 0.22 : hovered ? 0.12 : 0
    g.current.scale.y = Math.max(0.001, grow.current)
    g.current.position.y = 0.12 + lift * grow.current
    if (mat.current) mat.current.emissiveIntensity += ((selected ? 0.5 : hovered ? 0.3 : 0) - mat.current.emissiveIntensity) * Math.min(1, dt * 8)
  })
  return (
    <group position={[x, 0.12, z]}>
      <group
        ref={g}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(ev.id)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          onHover(null)
          document.body.style.cursor = ''
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(ev.id)
        }}
      >
        <RoundedBox args={[w, height, w]} radius={0.1} smoothness={4} position={[0, height / 2, 0]}>
          <meshStandardMaterial ref={mat} color={color} emissive={color} emissiveIntensity={0} roughness={0.75} />
        </RoundedBox>
        {/* cap */}
        <RoundedBox args={[w * 0.9, 0.06, w * 0.9]} radius={0.025} smoothness={3} position={[0, height + 0.03, 0]}>
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </RoundedBox>
        {going && (
          <mesh position={[0, height + 0.3, 0]}>
            <sphereGeometry args={[0.13, 18, 18]} />
            <meshStandardMaterial color={google.green} roughness={0.5} />
          </mesh>
        )}
      </group>
    </group>
  )
}

interface Props {
  events: ClubEvent[]
  year: number
  month: number
  today: Date
  selectedId: string | null
  hoveredId: string | null
  rsvps: string[]
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
}

export default function CalendarScene({ events, year, month, today, selectedId, hoveredId, rsvps, onHover, onSelect }: Props) {
  const root = useRef<THREE.Group>(null)
  const todayIso = isoDay(today)
  const canvas = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 1362
    c.height = Math.round((1362 * PH) / PW)
    return c
  }, [])
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
  }, [canvas])

  useEffect(() => {
    const paint = () => {
      drawMonth(canvas, year, month, todayIso)
      tex.needsUpdate = true
    }
    paint()
    document.fonts?.ready.then(paint)
  }, [year, month, todayIso, canvas, tex])

  const cells = useMemo(() => monthGrid(year, month), [year, month])
  const byDate = useMemo(() => {
    const map = new Map<string, ClubEvent[]>()
    events.forEach((e) => map.set(e.date, [...(map.get(e.date) ?? []), e]))
    return map
  }, [events])

  useFrame(({ pointer }, dt) => {
    if (!root.current) return
    const k = Math.min(1, dt * 3)
    root.current.rotation.y += (pointer.x * 0.1 - root.current.rotation.y) * k
    root.current.rotation.x += (-pointer.y * 0.05 - root.current.rotation.x) * k
  })

  const towers: React.ReactNode[] = []
  cells.forEach((d, i) => {
    const evs = byDate.get(isoDay(d))
    if (!evs) return
    const col = i % 7
    const row = Math.floor(i / 7)
    const cx = -PW / 2 + (col + 0.5) * CELL
    const cz = -PH / 2 + HEAD + (row + 0.5) * CELL
    evs.forEach((ev, j) => {
      const n = evs.length
      const w = n === 1 ? 0.56 : 0.38
      const off = n === 1 ? 0 : (j - (n - 1) / 2) * 0.44
      towers.push(
        <Tower
          key={ev.id + year + month}
          ev={ev}
          x={cx + off}
          z={cz + 0.06}
          w={w}
          past={isoDay(d) < todayIso}
          selected={selectedId === ev.id}
          hovered={hoveredId === ev.id}
          going={rsvps.includes(ev.id)}
          onHover={onHover}
          onSelect={onSelect}
        />,
      )
    })
  })

  return (
    <>
      <FitCamera />
      <Lights shadows intensity={1.05} />
      <group ref={root}>
        <RoundedBox args={[PW + 0.35, 0.24, PH + 0.35]} radius={0.12} smoothness={4} position={[0, 0, 0]}>
          <meshStandardMaterial color="#ffffff" roughness={0.9} />
        </RoundedBox>
        <mesh position={[0, 0.125, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[PW, PH]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
        {towers}
      </group>
    </>
  )
}
