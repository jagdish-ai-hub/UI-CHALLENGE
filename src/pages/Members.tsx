import { useMemo, useRef, useState, lazy } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Cake, Download, LayoutGrid, Network, Plus, Search, Table2, Upload, UserPlus } from 'lucide-react'
import { SceneFrame } from '@/three/lazy'
import MemberDrawer from '@/components/members/MemberDrawer'
import MemberForm, { type MemberDraft } from '@/components/members/MemberForm'
import { Button, Eyebrow, Reveal } from '@/components/ui/primitives'
import { google, teamOrder, teams, type TeamId } from '@/config/brand'
import { branches, type Branch, type Member } from '@/data/seed'
import { downloadText, membersToCsv, nextBirthday, parseMembersCsv } from '@/lib/members'
import { cn, fmtDate, initials } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { useTitle } from '@/lib/useTitle'
import { useToasts } from '@/store/useToasts'

const MemberNetwork = lazy(() => import('@/three/MemberNetwork'))

type View = 'grid' | 'table' | 'network'
type Sort = 'name' | 'name-desc' | 'points' | 'attendance' | 'birthday' | 'year'

const sorts: [Sort, string][] = [
  ['name', 'Name A to Z'],
  ['name-desc', 'Name Z to A'],
  ['points', 'Most points'],
  ['attendance', 'Best attendance'],
  ['birthday', 'Next birthday'],
  ['year', 'Year of study'],
]

export default function Members() {
  useTitle('Members')
  const members = useStore((s) => s.members)
  const role = useStore((s) => s.role)
  const setRole = useStore((s) => s.setRole)
  const addMember = useStore((s) => s.addMember)
  const updateMember = useStore((s) => s.updateMember)
  const removeMember = useStore((s) => s.removeMember)
  const push = useToasts((s) => s.push)
  const admin = role === 'admin'

  const [params, setParams] = useSearchParams()
  const team = (teamOrder.find((t) => t === params.get('team')) ?? null) as TeamId | null
  const focus = params.get('focus')
  const [q, setQ] = useState('')
  const [branch, setBranch] = useState<Branch | ''>('')
  const [year, setYear] = useState<number | 0>(0)
  const [sort, setSort] = useState<Sort>('name')
  const [view, setView] = useState<View>('grid')
  const [editing, setEditing] = useState<Member | 'new' | null>(null)
  const [deleting, setDeleting] = useState<Member | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const setTeam = (t: TeamId | null) => {
    const p = new URLSearchParams(params)
    if (t) p.set('team', t)
    else p.delete('team')
    setParams(p, { replace: true })
  }
  const openProfile = (id: string | null) => {
    const p = new URLSearchParams(params)
    if (id) p.set('focus', id)
    else p.delete('focus')
    setParams(p, { replace: true })
  }

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const out = members.filter(
      (m) =>
        (!team || m.team === team) &&
        (!branch || m.branch === branch) &&
        (!year || m.year === year) &&
        (!needle || [m.name, m.role, m.branch, m.email, ...m.skills].join(' ').toLowerCase().includes(needle)),
    )
    const by: Record<Sort, (a: Member, b: Member) => number> = {
      name: (a, b) => a.name.localeCompare(b.name),
      'name-desc': (a, b) => b.name.localeCompare(a.name),
      points: (a, b) => b.points - a.points,
      attendance: (a, b) => b.attendance - a.attendance,
      birthday: (a, b) => nextBirthday(a.dob).days - nextBirthday(b.dob).days,
      year: (a, b) => b.year - a.year || a.name.localeCompare(b.name),
    }
    return [...out].sort(by[sort])
  }, [members, q, team, branch, year, sort])

  const birthdays = useMemo(
    () =>
      members
        .map((m) => ({ m, ...nextBirthday(m.dob) }))
        .filter((b) => b.days <= 30)
        .sort((a, b) => a.days - b.days)
        .slice(0, 6),
    [members],
  )

  const counts = Object.fromEntries(teamOrder.map((t) => [t, members.filter((m) => m.team === t).length])) as Record<TeamId, number>
  const selected = members.find((m) => m.id === focus) ?? null
  const filtered = !!(q || team || branch || year)

  const clear = () => {
    setQ('')
    setBranch('')
    setYear(0)
    setTeam(null)
  }

  const save = (d: MemberDraft) => {
    if (editing === 'new') {
      addMember(d)
      push(`${d.name} added to ${teams[d.team].label}.`)
    } else if (editing) {
      updateMember(editing.id, d)
      push(`${d.name} updated.`)
    }
    setEditing(null)
  }

  const onFile = async (f: File | undefined) => {
    if (!f) return
    const { ok, skipped } = parseMembersCsv(await f.text())
    ok.forEach((m) => addMember(m))
    push(ok.length ? `Imported ${ok.length} member${ok.length > 1 ? 's' : ''}${skipped ? `, skipped ${skipped} invalid row${skipped > 1 ? 's' : ''}` : ''}.` : 'No valid rows found. Columns: name, role, team, branch, year, dob.', ok.length ? 'ok' : 'warn')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="bg-white pt-[68px]">
      <section className="mx-auto max-w-[1280px] px-5 pb-24 pt-10 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <Eyebrow color={google.blue}>Club · member directory</Eyebrow>
              <h1 className="display mt-4 text-[clamp(2.8rem,6vw,4.6rem)]">
                Members <span className="display-outline">{members.length}</span>
              </h1>
              <p className="mt-3 max-w-xl text-muted">Search, filter and manage every member. Switch to the network to see how the teams connect.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-full border border-line p-1 text-sm" role="group" aria-label="Viewing as">
                {(['admin', 'member'] as const).map((r) => (
                  <button key={r} onClick={() => setRole(r)} aria-pressed={role === r} className={cn('rounded-full px-4 py-1.5 capitalize transition-colors', role === r ? 'bg-ink text-white' : 'text-muted hover:text-ink')}>
                    {r}
                  </button>
                ))}
              </div>
              {admin && (
                <>
                  <Button variant="outline" onClick={() => fileRef.current?.click()}>
                    <Upload size={15} /> Import CSV
                  </Button>
                  <Button variant="outline" onClick={() => (downloadText('gdg-members.csv', membersToCsv(list)), push(`Exported ${list.length} members.`, 'info'))}>
                    <Download size={15} /> Export CSV
                  </Button>
                  <Button onClick={() => setEditing('new')}>
                    <Plus size={16} /> Add member
                  </Button>
                  <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
                </>
              )}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <button onClick={() => setTeam(null)} aria-pressed={!team} className={cn('rounded-3xl border p-5 text-left transition-colors', !team ? 'border-ink bg-ink text-white' : 'border-line bg-white hover:bg-wash')}>
            <p className="display text-4xl">{members.length}</p>
            <p className={cn('mt-1 text-xs', !team ? 'text-white/70' : 'text-muted')}>All members</p>
          </button>
          {teamOrder.map((t) => (
            <button key={t} onClick={() => setTeam(team === t ? null : t)} aria-pressed={team === t} className="rounded-3xl border p-5 text-left transition-all" style={{ background: team === t ? teams[t].soft : '#fff', borderColor: team === t ? teams[t].color : '#dadce0' }}>
              <p className="display text-4xl" style={{ color: t === 'design' ? '#b06000' : teams[t].color }}>
                {counts[t]}
              </p>
              <p className="mt-1 text-xs text-muted">{teams[t].label}</p>
            </button>
          ))}
        </div>

        {birthdays.length > 0 && (
          <div className="mt-4 flex items-center gap-4 overflow-x-auto rounded-3xl bg-g-yellow-50 px-5 py-4">
            <span className="inline-flex shrink-0 items-center gap-2 text-sm font-medium">
              <Cake size={18} className="text-g-yellow-700" /> Birthdays this month
            </span>
            {birthdays.map(({ m, days, date }) => (
              <button key={m.id} onClick={() => openProfile(m.id)} className="flex shrink-0 items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-4 text-left shadow-sm hover:shadow">
                <span className="grid size-8 place-items-center rounded-full text-xs font-semibold text-white" style={{ background: teams[m.team].color }}>
                  {initials(m.name)}
                </span>
                <span className="text-xs">
                  <span className="block font-medium">{m.name}</span>
                  <span className="block text-muted">
                    {days === 0 ? 'Today' : `in ${days} day${days > 1 ? 's' : ''}`} · {fmtDate(date.toISOString())}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="sticky top-[68px] z-20 -mx-5 mt-6 border-y border-line bg-white/90 px-5 py-3 backdrop-blur sm:-mx-0 sm:rounded-3xl sm:border sm:px-4">
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative min-w-[200px] flex-1">
              <span className="sr-only">Search members</span>
              <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, role, skill, branch" className="w-full rounded-full border border-line bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-g-blue focus:ring-4 focus:ring-g-blue-50" />
            </label>
            <select aria-label="Branch" value={branch} onChange={(e) => setBranch(e.target.value as Branch | '')} className="rounded-full border border-line bg-white px-4 py-2.5 text-sm">
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
            <select aria-label="Year" value={year} onChange={(e) => setYear(Number(e.target.value))} className="rounded-full border border-line bg-white px-4 py-2.5 text-sm">
              <option value={0}>All years</option>
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
            <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-full border border-line bg-white px-4 py-2.5 text-sm">
              {sorts.map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
            <div className="inline-flex rounded-full border border-line p-1" role="group" aria-label="View">
              {(
                [
                  ['grid', LayoutGrid, 'Grid'],
                  ['table', Table2, 'Table'],
                  ['network', Network, '3D network'],
                ] as const
              ).map(([v, Icon, label]) => (
                <button key={v} onClick={() => setView(v)} aria-pressed={view === v} aria-label={label} title={label} className={cn('grid size-9 place-items-center rounded-full transition-colors', view === v ? 'bg-ink text-white' : 'text-muted hover:text-ink')}>
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
          <p className="mt-2 px-1 text-xs text-muted">
            Showing {list.length} of {members.length}
            {filtered && (
              <button onClick={clear} className="ml-3 text-g-blue-700 underline-offset-2 hover:underline">
                Clear filters
              </button>
            )}
          </p>
        </div>

        <div className="mt-6">
          {list.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-line px-6 py-20 text-center">
              <UserPlus className="mx-auto text-muted" />
              <p className="display mt-4 text-3xl">No one matches</p>
              <p className="mt-2 text-muted">Try a different search or clear the filters.</p>
              <Button className="mt-6" variant="outline" onClick={clear}>
                Clear filters
              </Button>
            </div>
          ) : view === 'grid' ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((m) => (
                <li key={m.id}>
                  <button data-spot style={{ ['--spot' as string]: teams[m.team].color + '26' }} onClick={() => openProfile(m.id)} className="group flex h-full w-full flex-col rounded-3xl border border-line bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-26px_rgba(32,33,36,.5)]">
                    <span className="flex items-start justify-between">
                      <span className="grid size-14 place-items-center rounded-2xl font-display text-xl font-semibold" style={{ background: teams[m.team].soft, color: m.team === 'design' ? '#b06000' : teams[m.team].color }}>
                        {initials(m.name)}
                      </span>
                      {m.lead && <span className="rounded-full bg-ink px-2.5 py-0.5 text-[0.65rem] text-white">Lead</span>}
                    </span>
                    <span className="mt-4 block font-display text-lg font-semibold tracking-tight">{m.name}</span>
                    <span className="block text-sm text-muted">{m.role}</span>
                    <span className="mt-4 flex flex-wrap gap-1.5">
                      <span className="rounded-full px-2.5 py-0.5 text-[0.68rem] font-medium" style={{ background: teams[m.team].soft }}>
                        {teams[m.team].label}
                      </span>
                      <span className="rounded-full bg-wash px-2.5 py-0.5 text-[0.68rem] text-muted">{m.branch}</span>
                      <span className="rounded-full bg-wash px-2.5 py-0.5 text-[0.68rem] text-muted">Y{m.year}</span>
                    </span>
                    <span className="mt-auto flex items-center justify-between pt-5 text-xs text-muted">
                      <span>{m.points} pts</span>
                      <span>{m.attendance}% attendance</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : view === 'table' ? (
            <div className="overflow-x-auto rounded-3xl border border-line">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-wash text-xs text-muted">
                  <tr>
                    {['Member', 'Team', 'Role', 'Branch', 'Year', 'Attendance', 'Points'].map((h) => (
                      <th key={h} scope="col" className="px-4 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((m) => (
                    <tr key={m.id} onClick={() => openProfile(m.id)} className="cursor-pointer border-t border-line hover:bg-wash/70">
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-3">
                          <span className="grid size-8 place-items-center rounded-full text-[0.7rem] font-semibold text-white" style={{ background: teams[m.team].color }}>
                            {initials(m.name)}
                          </span>
                          <button className="font-medium" onClick={(e) => (e.stopPropagation(), openProfile(m.id))}>
                            {m.name}
                          </button>
                        </span>
                      </td>
                      <td className="px-4 py-3">{teams[m.team].label}</td>
                      <td className="px-4 py-3 text-muted">{m.role}</td>
                      <td className="px-4 py-3">{m.branch}</td>
                      <td className="px-4 py-3">{m.year}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-wash">
                            <span className="block h-full rounded-full" style={{ width: `${m.attendance}%`, background: m.attendance > 80 ? '#34A853' : m.attendance > 65 ? '#FBBC04' : '#EA4335' }} />
                          </span>
                          {m.attendance}%
                        </span>
                      </td>
                      <td className="px-4 py-3">{m.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-[2rem] bg-wash p-3">
              <SceneFrame label="3D network of the filtered members" className="h-[480px] rounded-[1.5rem] bg-white sm:h-[600px]">
                {() => <MemberNetwork members={list} team={team} hoveredId={hoverId} focusId={focus} onHover={setHoverId} onSelect={openProfile} />}
              </SceneFrame>
              <p className="px-3 pb-2 pt-3 text-sm text-muted">
                {hoverId ? (() => { const h = members.find((m) => m.id === hoverId); return h ? `${h.name} · ${h.role} · ${teams[h.team].label}` : '' })() : 'Hover a dot to see who it is, click it to open the profile.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {selected && (
        <MemberDrawer
          member={selected}
          canEdit={admin}
          onClose={() => openProfile(null)}
          onEdit={() => setEditing(selected)}
          onDelete={() => setDeleting(selected)}
        />
      )}
      {editing && <MemberForm initial={editing === 'new' ? undefined : editing} onSave={save} onClose={() => setEditing(null)} />}
      {deleting && (
        <div className="fixed inset-0 z-[75] grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-label="Confirm removal" onMouseDown={() => setDeleting(null)}>
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-7 shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
            <h2 className="display text-3xl">Remove {deleting.name.split(' ')[0]}?</h2>
            <p className="mt-3 text-sm text-muted">This removes them from the directory and the network. You can restore the demo data from the footer.</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleting(null)}>
                Keep
              </Button>
              <button
                onClick={() => {
                  removeMember(deleting.id)
                  push(`${deleting.name} removed.`, 'info')
                  setDeleting(null)
                  openProfile(null)
                }}
                className="rounded-full bg-g-red px-5 py-3 text-sm font-medium text-white hover:bg-g-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
