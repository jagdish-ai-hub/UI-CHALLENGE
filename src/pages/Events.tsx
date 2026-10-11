import { useMemo, useState } from 'react'
import { CalendarPlus, Check, MapPin, Plus, Search, UserCheck, X } from 'lucide-react'
import { Button, Eyebrow, Reveal } from '@/components/ui/primitives'
import { google, teamOrder, teams, type TeamId } from '@/config/brand'
import { kindColor, type ClubEvent, type EventKind } from '@/data/seed'
import { downloadIcs } from '@/lib/ics'
import { cn, initials, isoDay } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { useTitle } from '@/lib/useTitle'
import { useToasts } from '@/store/useToasts'

const kinds: EventKind[] = ['Workshop', 'Talk', 'Hackathon', 'Social', 'Study Jam']
type Tab = 'upcoming' | 'past' | 'all'

const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

export default function Events() {
  useTitle('Events')
  const events = useStore((s) => s.events)
  const rsvps = useStore((s) => s.rsvps)
  const checkins = useStore((s) => s.checkins)
  const toggleRsvp = useStore((s) => s.toggleRsvp)
  const role = useStore((s) => s.role)
  const push = useToasts((s) => s.push)
  const admin = role === 'admin'
  const todayIso = isoDay(new Date())

  const [tab, setTab] = useState<Tab>('upcoming')
  const [kind, setKind] = useState<EventKind | ''>('')
  const [q, setQ] = useState('')
  const [creating, setCreating] = useState(false)
  const [checkId, setCheckId] = useState<string | null>(null)

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return events
      .filter((e) => (tab === 'all' ? true : tab === 'upcoming' ? e.date >= todayIso : e.date < todayIso))
      .filter((e) => !kind || e.kind === kind)
      .filter((e) => !needle || (e.title + e.location + e.blurb).toLowerCase().includes(needle))
      .sort((a, b) => (tab === 'past' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)))
  }, [events, tab, kind, q, todayIso])

  const checkEvent = events.find((e) => e.id === checkId) ?? null
  const tabs: [Tab, string, number][] = [
    ['upcoming', 'Upcoming', events.filter((e) => e.date >= todayIso).length],
    ['past', 'Past', events.filter((e) => e.date < todayIso).length],
    ['all', 'All', events.length],
  ]

  return (
    <div className="bg-white pt-[68px]">
      <section className="mx-auto max-w-[1280px] px-5 pb-24 pt-10 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <Eyebrow color={google.yellow}>Club · events manager</Eyebrow>
              <h1 className="display mt-4 text-[clamp(2.8rem,6vw,4.6rem)]">
                Events <span className="display-outline">{events.length}</span>
              </h1>
              <p className="mt-3 max-w-xl text-muted">Plan the season, track RSVPs, and check people in on the day. Switch to the member role to see the attendee view.</p>
            </div>
            {admin && (
              <Button onClick={() => setCreating(true)}>
                <Plus size={16} /> New event
              </Button>
            )}
          </div>
        </Reveal>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-line p-1" role="tablist">
            {tabs.map(([k, l, n]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-full px-4 py-2 text-sm transition-colors', tab === k ? 'bg-ink text-white' : 'text-muted hover:text-ink')}>
                {l} <span className={cn('ml-1 text-xs', tab === k ? 'text-white/70' : 'text-muted')}>{n}</span>
              </button>
            ))}
          </div>
          <label className="relative min-w-[180px] flex-1 sm:max-w-xs">
            <span className="sr-only">Search events</span>
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events" className="w-full rounded-full border border-line py-2.5 pl-10 pr-4 text-sm outline-none focus:border-g-blue focus:ring-4 focus:ring-g-blue-50" />
          </label>
          <div className="flex flex-wrap gap-2">
            {kinds.map((k) => (
              <button key={k} onClick={() => setKind(kind === k ? '' : k)} aria-pressed={kind === k} className={cn('inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-colors', kind === k ? 'border-transparent' : 'border-line hover:bg-wash')} style={kind === k ? { background: kindColor[k] + '30', boxShadow: `inset 0 0 0 1.5px ${kindColor[k]}` } : undefined}>
                <span className="size-2.5 rounded-sm" style={{ background: kindColor[k] }} />
                {k}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-8 space-y-3">
          {list.length === 0 && <li className="rounded-[2rem] border border-dashed border-line py-16 text-center text-muted">No events match.</li>}
          {list.map((e, i) => {
            const d = new Date(e.date)
            const going = rsvps.includes(e.id)
            const isPast = e.date < todayIso
            const pct = Math.min(100, (e.going / e.capacity) * 100)
            return (
              <Reveal key={e.id} delay={Math.min(i, 5) * 0.03}>
                <li data-spot style={{ ['--spot' as string]: kindColor[e.kind] + '22' }} className="grid gap-4 rounded-[2rem] border border-line bg-white p-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:p-6">
                  <div className="flex items-center gap-4">
                    <span className="grid size-16 shrink-0 place-items-center rounded-2xl text-center leading-none" style={{ background: kindColor[e.kind] + '2e' }}>
                      <span>
                        <span className="block font-display text-2xl font-semibold">{d.getDate()}</span>
                        <span className="block font-mono text-[0.6rem] uppercase tracking-wider text-muted">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                      </span>
                    </span>
                    <div className="sm:hidden">
                      <p className="font-display text-xl font-semibold tracking-tight">{e.title}</p>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="hidden font-display text-xl font-semibold tracking-tight sm:block">{e.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
                      <span className="rounded-full px-2.5 py-0.5 font-medium text-ink" style={{ background: kindColor[e.kind] + '33' }}>
                        {e.kind}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="size-2 rounded-full" style={{ background: teams[e.team].color }} />
                        {teams[e.team].label}
                      </span>
                      <span>
                        {fmt(e.date)} · {e.time}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={12} /> {e.location}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-wash">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: kindColor[e.kind] }} />
                      </div>
                      <span className="whitespace-nowrap text-xs text-muted">
                        {e.going}/{e.capacity} RSVP{isPast ? ` · ${e.attended} attended` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {!isPast && (
                      <Button variant={going ? 'soft' : 'blue'} onClick={() => (toggleRsvp(e.id), push(going ? 'RSVP cancelled.' : `You are going to ${e.title}.`, going ? 'info' : 'ok'))} className={cn('!py-2.5', going && '!bg-g-green-50 !text-g-green-700')}>
                        {going ? (<><Check size={15} /> Going</>) : 'RSVP'}
                      </Button>
                    )}
                    {admin && (
                      <Button variant="outline" onClick={() => setCheckId(e.id)} className="!py-2.5">
                        <UserCheck size={15} /> Check-in
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => downloadIcs(e)} className="!py-2.5" aria-label={`Add ${e.title} to calendar`}>
                      <CalendarPlus size={15} />
                    </Button>
                  </div>
                </li>
              </Reveal>
            )
          })}
        </ul>
      </section>

      {creating && <EventForm onClose={() => setCreating(false)} />}
      {checkEvent && <CheckIn event={checkEvent} present={checkins[checkEvent.id] ?? []} onClose={() => setCheckId(null)} />}
    </div>
  )
}

function EventForm({ onClose }: { onClose: () => void }) {
  const addEvent = useStore((s) => s.addEvent)
  const push = useToasts((s) => s.push)
  const [d, setD] = useState({ title: '', kind: 'Workshop' as EventKind, date: isoDay(new Date(Date.now() + 7 * 86400000)), time: '5:00 PM', location: '', team: 'tech' as TeamId, capacity: 100, blurb: '' })
  const [touched, setTouched] = useState(false)
  const ok = d.title.trim().length >= 3 && d.location.trim().length >= 2 && d.capacity > 0
  const field = 'mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-g-blue focus:ring-4 focus:ring-g-blue-50'
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!ok) return
    addEvent({ ...d, title: d.title.trim(), location: d.location.trim(), blurb: d.blurb.trim() || 'Details coming soon.' })
    push(`${d.title.trim()} scheduled for ${fmt(d.date)}.`)
    onClose()
  }
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="New event" onMouseDown={onClose}>
      <form onSubmit={submit} noValidate onMouseDown={(e) => e.stopPropagation()} className="relative w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid size-9 place-items-center rounded-full hover:bg-wash">
          <X size={18} />
        </button>
        <h2 className="display text-3xl">New event</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-sm font-medium">Title</span>
            <input autoFocus value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} className={field} maxLength={48} />
            {touched && d.title.trim().length < 3 && <span className="mt-1 block text-xs text-g-red-700">Give it a title.</span>}
          </label>
          <label>
            <span className="text-sm font-medium">Type</span>
            <select value={d.kind} onChange={(e) => setD({ ...d, kind: e.target.value as EventKind })} className={field}>
              {kinds.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-sm font-medium">Team</span>
            <select value={d.team} onChange={(e) => setD({ ...d, team: e.target.value as TeamId })} className={field}>
              {teamOrder.map((t) => (
                <option key={t} value={t}>
                  {teams[t].label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-sm font-medium">Date</span>
            <input type="date" value={d.date} onChange={(e) => setD({ ...d, date: e.target.value })} className={field} />
          </label>
          <label>
            <span className="text-sm font-medium">Time</span>
            <input value={d.time} onChange={(e) => setD({ ...d, time: e.target.value })} className={field} placeholder="5:00 PM" />
          </label>
          <label>
            <span className="text-sm font-medium">Location</span>
            <input value={d.location} onChange={(e) => setD({ ...d, location: e.target.value })} className={field} />
            {touched && d.location.trim().length < 2 && <span className="mt-1 block text-xs text-g-red-700">Add a location.</span>}
          </label>
          <label>
            <span className="text-sm font-medium">Capacity</span>
            <input type="number" min={1} value={d.capacity} onChange={(e) => setD({ ...d, capacity: Number(e.target.value) })} className={field} />
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium">Short description</span>
            <textarea rows={2} value={d.blurb} onChange={(e) => setD({ ...d, blurb: e.target.value })} className={cn(field, 'resize-none')} />
          </label>
        </div>
        <div className="mt-7 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create event</Button>
        </div>
      </form>
    </div>
  )
}

function CheckIn({ event, present, onClose }: { event: ClubEvent; present: string[]; onClose: () => void }) {
  const members = useStore((s) => s.members)
  const toggle = useStore((s) => s.toggleCheckin)
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()
  const list = members.filter((m) => !needle || (m.name + m.role).toLowerCase().includes(needle))
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Check-in for ${event.title}`} onMouseDown={onClose}>
      <div className="flex max-h-[86vh] w-full max-w-lg flex-col rounded-[2rem] bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 p-6 pb-3 sm:p-8 sm:pb-3">
          <div>
            <p className="eyebrow">Check-in</p>
            <h2 className="display mt-2 text-3xl">{event.title}</h2>
            <p className="mt-1 text-sm text-muted">
              {present.length} checked in now · {event.attended} total attended
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-wash">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 sm:px-8">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a member" className="w-full rounded-full border border-line py-2.5 pl-4 pr-4 text-sm outline-none focus:border-g-blue focus:ring-4 focus:ring-g-blue-50" />
        </div>
        <ul className="mt-3 flex-1 overflow-y-auto px-3 pb-4 sm:px-5">
          {list.map((m) => {
            const on = present.includes(m.id)
            return (
              <li key={m.id}>
                <button onClick={() => toggle(event.id, m.id)} aria-pressed={on} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-wash">
                  <span className="grid size-9 place-items-center rounded-full text-xs font-semibold text-white" style={{ background: teams[m.team].color }}>
                    {initials(m.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{m.name}</span>
                    <span className="block text-xs text-muted">{teams[m.team].label}</span>
                  </span>
                  <span className={cn('grid size-6 place-items-center rounded-full border', on ? 'border-g-green bg-g-green text-white' : 'border-line')}>{on && <Check size={14} />}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
