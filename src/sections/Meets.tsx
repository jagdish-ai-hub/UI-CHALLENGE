import { useMemo, useState, lazy } from 'react'
import { CalendarPlus, Check, ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react'
import { SceneFrame } from '@/three/lazy'
import { Button, Reveal, SectionHeading } from '@/components/ui/primitives'
import { google, teams } from '@/config/brand'
import { kindColor, type ClubEvent } from '@/data/seed'
import { useStore } from '@/store/useStore'
import { cn, daysUntil, isoDay } from '@/lib/utils'
import { downloadIcs } from '@/lib/ics'

const CalendarScene = lazy(() => import('@/three/CalendarScene'))

const kinds = [
  ['Workshop', google.blue],
  ['Talk', google.red],
  ['Hackathon', google.yellow],
  ['Social', google.green],
] as const

const fullDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })

export default function Meets() {
  const events = useStore((s) => s.events)
  const rsvps = useStore((s) => s.rsvps)
  const toggleRsvp = useStore((s) => s.toggleRsvp)
  const today = useMemo(() => new Date(), [])
  const todayIso = isoDay(today)

  const upcoming = useMemo(() => events.filter((e) => e.date >= todayIso).sort((a, b) => a.date.localeCompare(b.date)), [events, todayIso])
  const next = upcoming[0]

  const start = next ? new Date(next.date) : today
  const [view, setView] = useState({ y: start.getFullYear(), m: start.getMonth() })
  const [selectedId, setSelectedId] = useState<string | null>(next?.id ?? null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const shown: ClubEvent | undefined = events.find((e) => e.id === (hoveredId ?? selectedId))
  const going = shown ? rsvps.includes(shown.id) : false

  const shiftMonth = (d: number) =>
    setView((v) => {
      const n = new Date(v.y, v.m + d, 1)
      return { y: n.getFullYear(), m: n.getMonth() }
    })

  const pick = (id: string) => {
    const e = events.find((x) => x.id === id)
    setSelectedId(id)
    if (e) {
      const d = new Date(e.date)
      setView({ y: d.getFullYear(), m: d.getMonth() })
    }
  }

  const monthLabel = new Date(view.y, view.m, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  const inDays = next ? daysUntil(next.date) : 0

  return (
    <section id="meets" className="relative scroll-mt-20 bg-wash py-24 sm:py-32">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Meets · this season" color={google.yellow} line1="Every fortnight." line2="Something to build.">
            Workshops, talks, study jams and hackathons. Tap a tower to see the plan, RSVP, and drop it in your calendar. Taller towers mean more people are going.
          </SectionHeading>
          {next && (
            <Reveal>
              <div className="rounded-3xl border border-line bg-white px-6 py-5">
                <p className="eyebrow">Next meet</p>
                <p className="display mt-2 text-5xl">
                  {inDays === 0 ? 'Today' : inDays === 1 ? 'Tomorrow' : `${inDays} days`}
                </p>
                <p className="mt-1 text-sm text-muted">{next.title}</p>
              </div>
            </Reveal>
          )}
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
          <Reveal>
            <div className="rounded-[2rem] bg-g-yellow-50 p-3 sm:p-4">
              <div className="flex items-center justify-between px-3 pb-2 pt-2 sm:px-4">
                <h3 className="display text-3xl">{monthLabel}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => shiftMonth(-1)} aria-label="Previous month" className="grid size-10 place-items-center rounded-full border border-line bg-white hover:bg-wash">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => shiftMonth(1)} aria-label="Next month" className="grid size-10 place-items-center rounded-full border border-line bg-white hover:bg-wash">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              <SceneFrame label={`3D calendar for ${monthLabel}. Events appear as towers; select one for details.`} className="h-[400px] rounded-[1.5rem] bg-white sm:h-[500px]" fallback={<CalendarFallback events={events} view={view} onPick={pick} selectedId={selectedId} />}>
                {() => <CalendarScene events={events} year={view.y} month={view.m} today={today} selectedId={selectedId} hoveredId={hoveredId} rsvps={rsvps} onHover={setHoveredId} onSelect={pick} />}
              </SceneFrame>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-3 pb-2 pt-4 text-xs text-muted sm:px-4">
                {kinds.map(([k, c]) => (
                  <span key={k} className="inline-flex items-center gap-1.5">
                    <span className="size-2.5 rounded-sm" style={{ background: c }} />
                    {k}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-g-green" />
                  You are going
                </span>
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col gap-6">
            <Reveal delay={0.06}>
              {shown ? (
                <article className="rounded-[2rem] border border-line bg-white p-6 sm:p-8" aria-live="polite">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full px-3 py-1 text-xs font-medium text-ink" style={{ background: kindColor[shown.kind] + '33', boxShadow: `inset 0 0 0 1.5px ${kindColor[shown.kind]}` }}>
                      {shown.kind}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-wash px-3 py-1 text-xs text-muted">
                      <span className="size-2 rounded-full" style={{ background: teams[shown.team].color }} />
                      {teams[shown.team].label}
                    </span>
                  </div>
                  <h3 className="display mt-5 text-4xl">{shown.title}</h3>
                  <p className="mt-3 text-muted">{shown.blurb}</p>
                  <dl className="mt-5 space-y-2.5 text-sm">
                    <div className="flex items-center gap-2.5">
                      <Clock size={16} className="text-muted" />
                      <dd>
                        {fullDate(shown.date)} · {shown.time}
                      </dd>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin size={16} className="text-muted" />
                      <dd>{shown.location}</dd>
                    </div>
                  </dl>
                  <div className="mt-6">
                    <div className="flex justify-between text-xs text-muted">
                      <span>{shown.going} going</span>
                      <span>{shown.capacity} seats</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-wash">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (shown.going / shown.capacity) * 100)}%`, background: kindColor[shown.kind] }} />
                    </div>
                  </div>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button onClick={() => toggleRsvp(shown.id)} variant={going ? 'soft' : 'blue'} disabled={shown.date < todayIso} className={cn(going && '!bg-g-green-50 !text-g-green-700')}>
                      {shown.date < todayIso ? 'Event finished' : going ? (<><Check size={16} /> You are going</>) : 'RSVP'}
                    </Button>
                    <Button variant="outline" onClick={() => downloadIcs(shown)}>
                      <CalendarPlus size={16} /> Add to calendar
                    </Button>
                  </div>
                </article>
              ) : (
                <div className="rounded-[2rem] border border-line bg-white p-8 text-muted">Select a tower to see the event.</div>
              )}
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-[2rem] border border-line bg-white p-3">
                <p className="eyebrow px-4 pb-2 pt-3">Coming up</p>
                <ul>
                  {upcoming.slice(0, 4).map((e) => {
                    const d = new Date(e.date)
                    const on = e.id === selectedId
                    return (
                      <li key={e.id}>
                        <button onClick={() => pick(e.id)} className={cn('flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-wash', on && 'bg-wash')}>
                          <span className="grid size-14 shrink-0 place-items-center rounded-2xl text-center leading-none" style={{ background: kindColor[e.kind] + '2e' }}>
                            <span>
                              <span className="block font-display text-xl font-semibold">{d.getDate()}</span>
                              <span className="block font-mono text-[0.6rem] uppercase tracking-wider text-muted">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                            </span>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{e.title}</span>
                            <span className="block truncate text-xs text-muted">
                              {e.time} · {e.location}
                            </span>
                          </span>
                          {rsvps.includes(e.id) && <span className="grid size-6 place-items-center rounded-full bg-g-green-50 text-g-green-700"><Check size={13} /></span>}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

/** 2D fallback used when 3D is off. */
function CalendarFallback({ events, view, onPick, selectedId }: { events: ClubEvent[]; view: { y: number; m: number }; onPick: (id: string) => void; selectedId: string | null }) {
  const list = events.filter((e) => {
    const d = new Date(e.date)
    return d.getFullYear() === view.y && d.getMonth() === view.m
  })
  return (
    <div className="absolute inset-0 overflow-auto p-4">
      {list.length === 0 && <p className="p-4 text-sm text-muted">No events this month.</p>}
      <ul className="space-y-2">
        {list.map((e) => (
          <li key={e.id}>
            <button onClick={() => onPick(e.id)} className={cn('flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left', selectedId === e.id ? 'border-ink' : 'border-line')}>
              <span className="size-3 rounded-sm" style={{ background: kindColor[e.kind] }} />
              <span className="text-sm font-medium">{e.title}</span>
              <span className="ml-auto text-xs text-muted">{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
