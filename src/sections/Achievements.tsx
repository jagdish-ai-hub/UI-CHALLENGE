import { useEffect, useRef, useState, lazy } from 'react'
import { SceneFrame } from '@/three/lazy'
import { Reveal, SectionHeading } from '@/components/ui/primitives'
import { milestones } from '@/data/seed'
import { google } from '@/config/brand'
import { cn } from '@/lib/utils'

const MilestoneTrack = lazy(() => import('@/three/MilestoneTrack'))

export default function Achievements() {
  const wrap = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const [active, setActive] = useState(0)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const el = wrap.current
      if (el) {
        const r = el.getBoundingClientRect()
        const vh = window.innerHeight
        const total = r.height - vh * 0.55
        const p = Math.min(1, Math.max(0, (vh * 0.3 - r.top) / Math.max(total, 1)))
        progress.current = p
        const idx = Math.min(milestones.length - 1, Math.floor(p * milestones.length * 0.999))
        setActive((a) => (a === idx ? a : idx))
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <section id="milestones" className="relative scroll-mt-20 bg-white pt-24 sm:pt-32">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <SectionHeading eyebrow="Milestones · 2023 to 2026" color={google.red} line1="Four years." line2="One road.">
          Scroll to drive the club bus down the road. Each stop is something the community built together.
        </SectionHeading>

        <div ref={wrap} className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="sticky top-[76px] z-10 h-[330px] self-start sm:h-[520px] lg:top-24 lg:h-[600px]">
            <SceneFrame label="3D road with a club bus driving past four milestone stations" className="h-full rounded-[2rem] bg-g-green-50" fallback={<div className="absolute inset-0 bg-g-green-50" />}>
              {() => <MilestoneTrack progress={progress} />}
            </SceneFrame>
          </div>

          <ol className="relative z-0">
            {milestones.map((m, i) => (
              <li key={m.year} className="flex min-h-[48vh] items-center py-6 lg:min-h-[62vh]">
                <Reveal className="w-full">
                  <article className={cn('w-full rounded-[2rem] border bg-white p-7 transition-all duration-500 sm:p-9', active === i ? 'border-transparent shadow-[0_20px_50px_-24px_rgba(32,33,36,.35)]' : 'border-line opacity-60')} style={active === i ? { boxShadow: `inset 0 0 0 2px ${m.color}, 0 20px 50px -24px rgba(32,33,36,.35)` } : undefined}>
                    <p className="display text-7xl sm:text-8xl" style={{ color: m.color === google.yellow ? '#b06000' : m.color }}>
                      {m.year}
                    </p>
                    <h3 className="display mt-5 text-3xl sm:text-4xl">{m.title}</h3>
                    <p className="mt-3 max-w-md text-muted">{m.text}</p>
                    <div className="mt-6 flex gap-1.5">
                      {milestones.map((_, j) => (
                        <span key={j} className="h-1.5 flex-1 rounded-full" style={{ background: j <= i ? m.color : '#e8eaed' }} />
                      ))}
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="h-24 sm:h-32" />
    </section>
  )
}
