import { google } from '@/config/brand'

export interface GalleryItem {
  id: string
  title: string
  caption: string
  year: string
  tint: string
  color: string
  kind: 'git' | 'sprint' | 'cloud' | 'fair' | 'media' | 'stage'
  /** Replace with a real photo path (e.g. '/gallery/open-source.jpg') and it is used instead of the generated art. */
  src?: string
}

export const gallery: GalleryItem[] = [
  { id: 'g1', title: 'Open Source Weekend', caption: 'First pull requests, mentors on call, 92 contributors.', year: '2026', tint: google.blueTint, color: google.blue, kind: 'git' },
  { id: 'g2', title: 'Design Sprint Night', caption: 'Brief, sketch, prototype and pitch before midnight.', year: '2026', tint: google.yellowTint, color: google.yellow, kind: 'sprint' },
  { id: 'g3', title: 'Cloud Study Jam', caption: 'Hands-on Cloud Run and Firebase labs in Seminar Hall B.', year: '2026', tint: '#E3F2FD', color: google.blue, kind: 'cloud' },
  { id: 'g4', title: 'Orientation & Club Fair', caption: 'Four teams, four booths, 241 new faces.', year: '2026', tint: google.greenTint, color: google.green, kind: 'fair' },
  { id: 'g5', title: 'Content Creator Meetup', caption: 'Shooting and editing for tech communities.', year: '2025', tint: google.redTint, color: google.red, kind: 'media' },
  { id: 'g6', title: 'Winter Hackathon', caption: '1,200 participants and the loudest finale yet.', year: '2025', tint: '#F3E8FD', color: '#a142f4', kind: 'stage' },
]

const FONT_M = '"JetBrains Mono Variable", ui-monospace, monospace'
const FONT_D = '"Inter Tight Variable", Inter, sans-serif'

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}
function circ(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, fill: string) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

/** Generated placeholder artwork. Real photos can replace it by setting `src`. */
export function renderArt(item: GalleryItem, w = 900, h = 1200): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const U = w / 100
  ctx.fillStyle = item.tint
  ctx.fillRect(0, 0, w, h)
  const { blue, red, yellow, green } = google
  const G = [blue, red, yellow, green]

  // soft floor
  rr(ctx, -20 * U, h * 0.7, w + 40 * U, h * 0.4, 0, 'rgba(255,255,255,0.55)')

  switch (item.kind) {
    case 'git': {
      rr(ctx, 14 * U, h * 0.2, 72 * U, h * 0.36, 4 * U, '#202124')
      rr(ctx, 16 * U, h * 0.22, 68 * U, h * 0.3, 3 * U, '#14171c')
      ;[0.34, 0.5, 0.28, 0.6, 0.4].forEach((l, i) => rr(ctx, (20 + (i % 2) * 5) * U, h * (0.25 + i * 0.045), l * 56 * U, 2 * U, U, G[i % 4]!))
      rr(ctx, 6 * U, h * 0.565, 88 * U, 4 * U, 2 * U, '#dadce0')
      ctx.lineWidth = 1.8 * U
      ctx.lineCap = 'round'
      const pts = [
        [20, 0.7],
        [40, 0.75],
        [60, 0.7],
        [80, 0.75],
      ]
      ctx.strokeStyle = '#bdc1c6'
      ctx.beginPath()
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x! * U, h * y!) : ctx.moveTo(x! * U, h * y!)))
      ctx.stroke()
      pts.forEach(([x, y], i) => circ(ctx, x! * U, h * y!, 3.6 * U, G[i]!))
      circ(ctx, 50 * U, h * 0.84, 3.6 * U, green)
      ctx.beginPath()
      ctx.moveTo(40 * U, h * 0.75)
      ctx.lineTo(50 * U, h * 0.84)
      ctx.lineTo(60 * U, h * 0.7)
      ctx.stroke()
      break
    }
    case 'sprint': {
      const notes: [number, number, number, string][] = [
        [12, 0.14, -6, yellow],
        [40, 0.12, 4, '#FDE293'],
        [66, 0.16, -3, red],
        [20, 0.36, 5, blue],
        [52, 0.38, -4, green],
        [76, 0.42, 6, yellow],
        [30, 0.6, -5, '#FAD2CF'],
        [60, 0.64, 3, '#D2E3FC'],
      ]
      notes.forEach(([x, y, a, col]) => {
        ctx.save()
        ctx.translate((x + 11) * U, h * y + 11 * U)
        ctx.rotate((a * Math.PI) / 180)
        ctx.shadowColor = 'rgba(0,0,0,0.12)'
        ctx.shadowBlur = 2 * U
        ctx.shadowOffsetY = U
        rr(ctx, -11 * U, -11 * U, 22 * U, 22 * U, 2 * U, col)
        ctx.shadowColor = 'transparent'
        rr(ctx, -7 * U, -4 * U, 14 * U, 1.6 * U, U, 'rgba(0,0,0,0.25)')
        rr(ctx, -7 * U, 0, 10 * U, 1.6 * U, U, 'rgba(0,0,0,0.2)')
        ctx.restore()
      })
      break
    }
    case 'cloud': {
      ;[
        [30, 0.2, 1],
        [66, 0.32, 0.8],
      ].forEach(([x, y, s]) => {
        ;[
          [0, 0, 11],
          [11, -3, 13],
          [24, 0, 10],
          [12, 4, 12],
        ].forEach(([dx, dy, r]) => circ(ctx, (x! + dx! * s!) * U, h * y! + dy! * s! * U, r! * s! * U, '#ffffff'))
      })
      ;[0, 1, 2].forEach((i) => {
        rr(ctx, (20 + i * 22) * U, h * 0.5, 16 * U, h * 0.2, 2 * U, '#ffffff')
        ;[0, 1, 2].forEach((j) => {
          rr(ctx, (22 + i * 22) * U, h * 0.52 + j * 6.2 * U, 12 * U, 4 * U, U, '#e8eaed')
          circ(ctx, (25 + i * 22) * U, h * 0.52 + j * 6.2 * U + 2 * U, 0.9 * U, [green, yellow, blue][(i + j) % 3]!)
        })
      })
      ctx.fillStyle = blue
      ctx.beginPath()
      ctx.moveTo(52 * U, h * 0.38)
      ctx.lineTo(44 * U, h * 0.47)
      ctx.lineTo(50 * U, h * 0.47)
      ctx.lineTo(46 * U, h * 0.55)
      ctx.lineTo(58 * U, h * 0.44)
      ctx.lineTo(52 * U, h * 0.44)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'fair': {
      ;[0, 1, 2, 3].forEach((i) => {
        const x = 8 + i * 22
        const col = G[i]!
        for (let s = 0; s < 4; s++) rr(ctx, (x + s * 4.2) * U, h * 0.3, 4.2 * U, h * 0.09, 0, s % 2 ? '#ffffff' : col)
        ctx.fillStyle = col
        ctx.beginPath()
        ctx.moveTo((x - 1) * U, h * 0.3)
        ctx.lineTo((x + 18) * U, h * 0.3)
        ctx.lineTo((x + 20) * U, h * 0.24)
        ctx.lineTo((x - 3) * U, h * 0.24)
        ctx.closePath()
        ctx.fill()
        rr(ctx, (x + 1) * U, h * 0.39, 14.5 * U, h * 0.24, 0, '#ffffff')
        rr(ctx, (x + 3) * U, h * 0.43, 10.5 * U, 8 * U, 2 * U, col + '55')
        circ(ctx, (x + 8) * U, h * 0.67, 3 * U, col)
        rr(ctx, (x + 4.6) * U, h * 0.69, 6.8 * U, 8 * U, 3 * U, col)
      })
      break
    }
    case 'media': {
      rr(ctx, 22 * U, h * 0.3, 56 * U, h * 0.22, 5 * U, '#202124')
      circ(ctx, 50 * U, h * 0.41, 13 * U, '#3c4043')
      circ(ctx, 50 * U, h * 0.41, 9 * U, red)
      circ(ctx, 50 * U, h * 0.41, 4 * U, '#8ab4f8')
      rr(ctx, 28 * U, h * 0.26, 14 * U, 5 * U, 2 * U, '#202124')
      circ(ctx, 72 * U, h * 0.335, 1.8 * U, yellow)
      // film strip
      rr(ctx, 0, h * 0.64, w, 14 * U, 0, '#202124')
      for (let i = 0; i < 14; i++) rr(ctx, (i * 7.4 + 1) * U, h * 0.64 + 1.5 * U, 4 * U, 3 * U, U, '#f1f3f4')
      for (let i = 0; i < 14; i++) rr(ctx, (i * 7.4 + 1) * U, h * 0.64 + 9.5 * U, 4 * U, 3 * U, U, '#f1f3f4')
      ;[12, 36, 60, 84].forEach((x, i) => rr(ctx, (x - 6) * U, h * 0.64 + 5 * U, 12 * U, 4 * U, 0, G[i]!))
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.moveTo(46 * U, h * 0.78)
      ctx.lineTo(46 * U, h * 0.85)
      ctx.lineTo(54 * U, h * 0.815)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'stage': {
      G.forEach((col, i) => {
        ctx.save()
        ctx.globalAlpha = 0.35
        ctx.fillStyle = col
        ctx.beginPath()
        ctx.moveTo((14 + i * 24) * U, h * 0.06)
        ctx.lineTo((2 + i * 28) * U, h * 0.7)
        ctx.lineTo((26 + i * 20) * U, h * 0.7)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
        circ(ctx, (14 + i * 24) * U, h * 0.06, 3 * U, col)
      })
      rr(ctx, 6 * U, h * 0.7, 88 * U, h * 0.06, 2 * U, '#202124')
      for (let i = 0; i < 24; i++) circ(ctx, (6 + i * 3.9) * U, h * (0.82 + ((i * 7) % 5) * 0.012), 2.6 * U, ['#3c4043', '#5f6368', '#202124'][i % 3]!)
      ;[18, 40, 62, 80].forEach((x, i) => circ(ctx, x * U, h * (0.12 + (i % 2) * 0.08), 1.4 * U, '#ffffff'))
      break
    }
  }
  // year chip
  rr(ctx, 6 * U, 6 * U, 17 * U, 7 * U, 3.5 * U, '#ffffffcc')
  ctx.fillStyle = '#202124'
  ctx.font = `600 ${3.2 * U}px ${FONT_M}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(item.year, 14.5 * U, 9.7 * U)
  ctx.font = `600 ${6 * U}px ${FONT_D}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#202124'
  ctx.fillText(item.title.length > 20 ? item.title.slice(0, 20) : item.title, 6 * U, h - 10 * U)
  return c
}
