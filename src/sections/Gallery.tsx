import { useCallback, useEffect, useRef, useState, lazy } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { SceneFrame } from '@/three/lazy'
import { Reveal, SectionHeading } from '@/components/ui/primitives'
import { gallery, renderArt } from '@/data/gallery'
import { google } from '@/config/brand'
import { cn } from '@/lib/utils'

const GalleryScene = lazy(() => import('@/three/GalleryScene'))

export default function Gallery() {
  const [index, setIndex] = useState(2)
  const [open, setOpen] = useState<number | null>(null)
  const target = useRef(2)
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null)
  const frame = useRef<HTMLDivElement>(null)

  const go = useCallback((i: number) => {
    const n = Math.max(0, Math.min(gallery.length - 1, i))
    target.current = n
    setIndex(n)
  }, [])

  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, start: target.current, moved: false }
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 6) d.moved = true
    const w = frame.current?.clientWidth ?? 800
    target.current = Math.max(-0.4, Math.min(gallery.length - 0.6, d.start - (dx / w) * 4.4))
  }
  const onUp = () => {
    const d = drag.current
    drag.current = null
    if (d?.moved) go(Math.round(target.current))
  }

  const pick = (i: number) => {
    if (drag.current?.moved) return
    if (i === index) setOpen(i)
    else go(i)
  }

  useEffect(() => {
    if (open === null) return
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((v) => (v === null ? v : Math.min(gallery.length - 1, v + 1)))
      if (e.key === 'ArrowLeft') setOpen((v) => (v === null ? v : Math.max(0, v - 1)))
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open])

  const cur = gallery[index]!

  return (
    <section id="gallery" className="relative scroll-mt-20 bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <SectionHeading eyebrow="Gallery · memories" color={google.green} line1="Moments we" line2="shipped together.">
          Drag the stack, or use the arrows. Click the centre card to open it full size.
        </SectionHeading>

        <Reveal className="mt-14">
          <div
            ref={frame}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') go(index + 1)
              if (e.key === 'ArrowLeft') go(index - 1)
              if (e.key === 'Enter') setOpen(index)
            }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
            className="touch-pan-y select-none rounded-[2rem] bg-g-green-50 p-3 sm:p-4"
            aria-label="Photo gallery carousel. Use left and right arrow keys."
          >
            <SceneFrame label="Gallery carousel of club events" className="h-[420px] cursor-grab rounded-[1.5rem] bg-white active:cursor-grabbing sm:h-[540px]" fallback={<GalleryFallback index={index} onPick={go} />}>
              {() => <GalleryScene target={target} onPick={pick} />}
            </SceneFrame>
            <div className="flex flex-wrap items-center justify-between gap-4 px-3 pb-2 pt-5 sm:px-4">
              <div className="min-w-0">
                <p className="eyebrow">
                  {String(index + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')} · {cur.year}
                </p>
                <p className="display mt-2 text-3xl">{cur.title}</p>
                <p className="mt-1 text-sm text-muted">{cur.caption}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-1.5" aria-hidden>
                  {gallery.map((g, i) => (
                    <button key={g.id} onClick={() => go(i)} tabIndex={-1} className={cn('h-2 rounded-full transition-all', i === index ? 'w-6' : 'w-2')} style={{ background: [google.blue, google.red, google.yellow, google.green, google.blue, google.red][i] }} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous photo" className="grid size-11 place-items-center rounded-full border border-line bg-white hover:bg-wash disabled:opacity-40">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => go(index + 1)} disabled={index === gallery.length - 1} aria-label="Next photo" className="grid size-11 place-items-center rounded-full border border-line bg-white hover:bg-wash disabled:opacity-40">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {open !== null && <Lightbox index={open} onClose={() => setOpen(null)} onNav={(d) => setOpen((v) => (v === null ? v : Math.max(0, Math.min(gallery.length - 1, v + d))))} />}
    </section>
  )
}

function Lightbox({ index, onClose, onNav }: { index: number; onClose: () => void; onNav: (d: number) => void }) {
  const item = gallery[index]!
  const [url, setUrl] = useState<string>(item.src ?? '')
  useEffect(() => {
    setUrl(item.src ?? renderArt(item).toDataURL('image/png'))
  }, [item])
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={item.title} onClick={onClose}>
      <div className="relative max-h-full w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {url && <img src={url} alt={`${item.title}, ${item.year}`} className="max-h-[78vh] w-full rounded-3xl object-contain shadow-2xl" />}
        <div className="mt-4 flex items-center justify-between gap-3 text-white">
          <div>
            <p className="display text-2xl">{item.title}</p>
            <p className="text-sm text-white/70">{item.caption}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onNav(-1)} aria-label="Previous" className="grid size-10 place-items-center rounded-full bg-white/15 hover:bg-white/25"><ChevronLeft size={18} /></button>
            <button onClick={() => onNav(1)} aria-label="Next" className="grid size-10 place-items-center rounded-full bg-white/15 hover:bg-white/25"><ChevronRight size={18} /></button>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close" className="absolute -right-2 -top-2 grid size-10 place-items-center rounded-full bg-white text-ink shadow-lg">
          <X size={18} />
        </button>
      </div>
    </div>
  )
}

function GalleryFallback({ index, onPick }: { index: number; onPick: (i: number) => void }) {
  return (
    <div className="absolute inset-0 grid grid-cols-3 gap-3 overflow-auto p-4">
      {gallery.map((g, i) => (
        <button key={g.id} onClick={() => onPick(i)} className={cn('rounded-2xl p-4 text-left text-sm font-medium', i === index && 'ring-2 ring-ink')} style={{ background: g.tint }}>
          {g.title}
        </button>
      ))}
    </div>
  )
}
