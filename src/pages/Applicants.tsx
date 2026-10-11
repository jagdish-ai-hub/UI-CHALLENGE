import { useMemo, useState } from 'react'
import { ArrowRight, Search, UserPlus } from 'lucide-react'
import { Eyebrow, Reveal } from '@/components/ui/primitives'
import { google, teamOrder, teams, type TeamId } from '@/config/brand'
import type { Applicant, ApplicantStatus } from '@/data/seed'
import { cn, fmtDate, initials } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { useTitle } from '@/lib/useTitle'
import { useToasts } from '@/store/useToasts'

const cols: { id: ApplicantStatus; label: string; color: string; tint: string; hint: string }[] = [
  { id: 'applied', label: 'Applied', color: google.blue, tint: google.blueTint, hint: 'New applications' },
  { id: 'review', label: 'In review', color: google.yellow, tint: google.yellowTint, hint: 'Leads are reading' },
  { id: 'interview', label: 'Interview', color: google.red, tint: google.redTint, hint: '15-minute chats' },
  { id: 'selected', label: 'Selected', color: google.green, tint: google.greenTint, hint: 'Ready to welcome' },
]

export default function Applicants() {
  useTitle('Applicants')
  const applicants = useStore((s) => s.applicants)
  const move = useStore((s) => s.moveApplicant)
  const roster = useStore((s) => s.rosterApplicant)
  const role = useStore((s) => s.role)
  const push = useToasts((s) => s.push)
  const admin = role === 'admin'
  const [team, setTeam] = useState<TeamId | null>(null)
  const [q, setQ] = useState('')
  const [over, setOver] = useState<ApplicantStatus | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)

  const list = useMemo(() => {
    const n = q.trim().toLowerCase()
    return applicants.filter((a) => (!team || a.team === team) && (!n || (a.name + a.why + a.branch).toLowerCase().includes(n)))
  }, [applicants, team, q])

  const moveTo = (a: Applicant, status: ApplicantStatus) => {
    if (a.status === status) return
    move(a.id, status)
    push(`${a.name} moved to ${cols.find((c) => c.id === status)!.label}.`, status === 'selected' ? 'ok' : 'info')
  }

  return (
    <div className="bg-wash pt-[68px]">
      <section className="mx-auto max-w-[1280px] px-5 pb-24 pt-10 sm:px-8">
        <Reveal>
          <Eyebrow color={google.red}>Club · recruitment board</Eyebrow>
          <h1 className="display mt-4 text-[clamp(2.8rem,6vw,4.6rem)]">
            Applicants <span className="display-outline">{applicants.length}</span>
          </h1>
          <p className="mt-3 max-w-xl text-muted">
            {admin ? 'Drag a card between columns, or use the stage menu on touch screens. Selected applicants can be added straight to the roster.' : 'Switch to the admin role on the Members page to move applicants.'}
          </p>
        </Reveal>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          <label className="relative min-w-[200px] sm:w-72">
            <span className="sr-only">Search applicants</span>
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search applicants" className="w-full rounded-full border border-line bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-g-blue focus:ring-4 focus:ring-g-blue-50" />
          </label>
          <button onClick={() => setTeam(null)} className={cn('rounded-full border px-4 py-2 text-sm', !team ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:bg-white/60')}>
            All teams
          </button>
          {teamOrder.map((t) => (
            <button key={t} onClick={() => setTeam(team === t ? null : t)} aria-pressed={team === t} className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm', team === t ? 'border-transparent' : 'border-line bg-white hover:bg-white/60')} style={team === t ? { background: teams[t].soft, boxShadow: `inset 0 0 0 2px ${teams[t].color}` } : undefined}>
              <span className="size-2.5 rounded-full" style={{ background: teams[t].color }} />
              {teams[t].label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cols.map((c) => {
            const items = list.filter((a) => a.status === c.id)
            return (
              <div
                key={c.id}
                onDragOver={(e) => admin && (e.preventDefault(), setOver(c.id))}
                onDragLeave={() => setOver((o) => (o === c.id ? null : o))}
                onDrop={(e) => {
                  e.preventDefault()
                  setOver(null)
                  const a = applicants.find((x) => x.id === (e.dataTransfer.getData('text/plain') || dragId))
                  if (a && admin) moveTo(a, c.id)
                  setDragId(null)
                }}
                className={cn('flex min-h-[320px] flex-col rounded-[2rem] p-3 transition-colors', over === c.id ? 'bg-white ring-2' : 'bg-[#eef0f2]')}
                style={over === c.id ? ({ ['--tw-ring-color' as string]: c.color } as React.CSSProperties) : undefined}
              >
                <div className="flex items-center justify-between px-3 pb-3 pt-2">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
                      <span className="size-3 rounded-full" style={{ background: c.color }} />
                      {c.label}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted">{c.hint}</p>
                  </div>
                  <span className="grid size-8 place-items-center rounded-full bg-white text-sm font-medium">{items.length}</span>
                </div>
                <ul className="flex flex-1 flex-col gap-2.5">
                  {items.map((a) => (
                    <li
                      key={a.id}
                      data-spot
                      draggable={admin}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', a.id)
                        e.dataTransfer.effectAllowed = 'move'
                        setDragId(a.id)
                      }}
                      onDragEnd={() => setDragId(null)}
                      className={cn('rounded-3xl border border-line bg-white p-4 transition-all', admin && 'cursor-grab active:cursor-grabbing', dragId === a.id && 'opacity-40')}
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-full text-sm font-semibold text-white" style={{ background: teams[a.team].color }}>
                          {initials(a.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{a.name}</p>
                          <p className="text-xs text-muted">
                            {teams[a.team].label} · {a.branch}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-3 text-[0.82rem] leading-relaxed text-muted">{a.why}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-xs text-muted">{fmtDate(a.createdAt)}</span>
                        {admin && (
                          <label className="inline-flex items-center gap-1 text-xs">
                            <span className="sr-only">Move {a.name} to stage</span>
                            <select value={a.status} onChange={(e) => moveTo(a, e.target.value as ApplicantStatus)} className="rounded-full border border-line bg-white py-1 pl-2.5 pr-6 text-xs">
                              {cols.map((x) => (
                                <option key={x.id} value={x.id}>
                                  {x.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        )}
                      </div>
                      {c.id === 'selected' && admin && (
                        <button
                          disabled={a.rostered}
                          onClick={() => (roster(a.id), push(`${a.name} added to the ${teams[a.team].label} roster.`))}
                          className={cn('mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium transition-colors', a.rostered ? 'bg-g-green-50 text-g-green-700' : 'bg-ink text-white hover:bg-black')}
                        >
                          {a.rostered ? 'On the roster' : (<><UserPlus size={15} /> Add to roster <ArrowRight size={14} /></>)}
                        </button>
                      )}
                    </li>
                  ))}
                  {items.length === 0 && <li className="grid flex-1 place-items-center rounded-3xl border border-dashed border-[#c9ced4] px-4 py-10 text-center text-xs text-muted">Nothing here yet</li>}
                </ul>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
