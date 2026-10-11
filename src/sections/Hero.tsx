import { useState, lazy } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SceneFrame } from '@/three/lazy'
import { Button, CountUp, Eyebrow, Reveal } from '@/components/ui/primitives'
import { Hint } from '@/components/ui/Hint'
import { google, teamOrder, teams, type TeamId } from '@/config/brand'
import { scrollToId } from '@/lib/lenis'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const Clubhouse = lazy(() => import('@/three/Clubhouse'))

export default function Hero() {
  const [active, setActive] = useState<TeamId | null>(null)
  const navigate = useNavigate()
  const members = useStore((s) => s.members.length)
  const events = useStore((s) => s.events.length)

  const stats = [
    { n: members, s: '', label: 'Active members', c: google.blue },
    { n: 4, s: '', label: 'Teams', c: google.red },
    { n: events, s: '', label: 'Events this season', c: google.yellow },
    { n: 1200, s: '+', label: 'Hackathon participants', c: google.green },
  ]

  return (
    <section className="relative overflow-hidden pt-[68px]">
      <div className="mx-auto grid max-w-[1280px] items-center gap-6 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:pt-14">
        <div className="relative z-10">
          <Reveal>
            <Eyebrow>GDG on Campus · ITER Chapter</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="display mt-5 text-[clamp(2.7rem,5.3vw,4.8rem)]">
              <span className="text-g-blue">Build.</span> <span className="text-g-red">Learn.</span>
              <br />
              <span className="text-g-green">Grow.</span>{' '}
              <span className="marker" style={{ ['--marker' as string]: google.yellow }}>
                Together.
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-lg text-[1.08rem] leading-relaxed text-muted">
              We are a student-run developer community. We run workshops, hackathons and study jams, and this hub runs the club behind them: members, events, recruitment and attendance in one place.
            </p>
          </Reveal>
          <Reveal delay={0.18} className="mt-8 flex flex-wrap items-center gap-3">
            <Button onClick={() => scrollToId('recruit')}>
              Join the club <ArrowRight size={16} />
            </Button>
            <Button variant="outline" onClick={() => scrollToId('meets')}>
              See upcoming meets
            </Button>
          </Reveal>

          <Reveal delay={0.25} className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="border-t-2 pt-3" style={{ borderColor: s.c }}>
                <p className="display text-4xl text-ink">
                  <CountUp to={s.n} suffix={s.s} />
                </p>
                <p className="mt-1 text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </div>

        <div className="relative">
          <SceneFrame label="Isometric 3D clubhouse with four team zones: Tech, Media, Design, and PR and Management" className="h-[380px] rounded-[2rem] bg-wash sm:h-[480px] lg:h-[560px]">
            {() => <Clubhouse active={active} onActive={setActive} onSelect={(t) => navigate(`/members?team=${t}`)} />}
          </SceneFrame>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {teamOrder.map((t) => (
              <button
                key={t}
                onMouseEnter={() => setActive(t)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(t)}
                onBlur={() => setActive(null)}
                onClick={() => navigate(`/members?team=${t}`)}
                className={cn('flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition-colors', active === t ? 'border-transparent' : 'border-line bg-white')}
                style={active === t ? { background: teams[t].tint } : undefined}
              >
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: teams[t].color }} />
                <span className="text-xs font-medium text-ink">{teams[t].label}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted"><Hint mouse="Hover a zone to lift it, click to meet the team." touch="Tap a zone to meet the team." /></p>
        </div>
      </div>
    </section>
  )
}
