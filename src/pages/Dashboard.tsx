import { useMemo, useState, lazy } from 'react'
import { Link } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowUpRight, CalendarDays, ClipboardList, Gauge, Users } from 'lucide-react'
import { SceneFrame } from '@/three/lazy'
import { Eyebrow, Reveal } from '@/components/ui/primitives'
import { google, teamOrder, teams } from '@/config/brand'
import { branches, kindColor } from '@/data/seed'
import { nextBirthday } from '@/lib/members'
import { cn, daysUntil, fmtDate, initials, isoDay } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { useTitle } from '@/lib/useTitle'

const ChartScene = lazy(() => import('@/three/ChartScene'))

const axis = { fontSize: 12, fill: '#5f6368' }
const tip = { borderRadius: 14, border: '1px solid #dadce0', boxShadow: '0 12px 30px -12px rgba(32,33,36,.25)', fontSize: 12 }

function Card({ title, sub, children, className, delay = 0 }: { title: string; sub?: string; children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <Reveal delay={delay} className={className}>
      <section data-spot className="h-full rounded-[2rem] border border-line bg-white p-6">
        <h2 className="font-display text-xl font-semibold tracking-tight">{title}</h2>
        {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
        <div className="mt-5">{children}</div>
      </section>
    </Reveal>
  )
}

export default function Dashboard() {
  useTitle('Dashboard')
  const members = useStore((s) => s.members)
  const events = useStore((s) => s.events)
  const applicants = useStore((s) => s.applicants)
  const [hover, setHover] = useState<number | null>(null)
  const today = useMemo(() => new Date(), [])
  const todayIso = isoDay(today)

  const upcoming = events.filter((e) => e.date >= todayIso).sort((a, b) => a.date.localeCompare(b.date))
  const past = events.filter((e) => e.date < todayIso).sort((a, b) => a.date.localeCompare(b.date))
  const avgAttendance = Math.round(members.reduce((a, m) => a + m.attendance, 0) / Math.max(members.length, 1))
  const open = applicants.filter((a) => a.status !== 'selected').length
  const newThisMonth = members.filter((m) => daysUntil(m.joined) >= -30).length

  const teamBars = teamOrder.map((t) => ({ label: teams[t].label, value: members.filter((m) => m.team === t).length, color: teams[t].color }))
  const teamPoints = teamOrder.map((t) => ({ name: teams[t].label, points: members.filter((m) => m.team === t).reduce((a, m) => a + m.points, 0), color: teams[t].color }))
  const branchData = branches.map((b, i) => ({ name: b, value: members.filter((m) => m.branch === b).length, color: [google.blue, google.red, google.yellow, google.green][i]! }))
  const yearData = [1, 2, 3, 4].map((y) => ({ name: `Year ${y}`, value: members.filter((m) => m.year === y).length }))
  const attendance = past.slice(-6).map((e) => ({ name: e.title.length > 14 ? e.title.slice(0, 13) + '…' : e.title, going: e.going, attended: e.attended }))
  const top = [...members].sort((a, b) => b.points - a.points).slice(0, 5)
  const birthdays = members
    .map((m) => ({ m, ...nextBirthday(m.dob) }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 3)

  const kpis = [
    { label: 'Active members', value: members.length, note: `+${newThisMonth} in the last 30 days`, icon: Users, c: google.blue, tint: google.blueTint },
    { label: 'Average attendance', value: `${avgAttendance}%`, note: 'across all members', icon: Gauge, c: google.green, tint: google.greenTint },
    { label: 'Upcoming events', value: upcoming.length, note: upcoming[0] ? `Next: ${upcoming[0].title}` : 'Nothing scheduled', icon: CalendarDays, c: google.yellow, tint: google.yellowTint },
    { label: 'Open applications', value: open, note: `${applicants.length} received this season`, icon: ClipboardList, c: google.red, tint: google.redTint },
  ]

  return (
    <div className="bg-wash pt-[68px]">
      <section className="mx-auto max-w-[1280px] px-5 pb-24 pt-10 sm:px-8">
        <Reveal>
          <Eyebrow color={google.green}>Club · live overview</Eyebrow>
          <h1 className="display mt-4 text-[clamp(2.8rem,6vw,4.6rem)]">
            Dashboard <span className="display-outline">{today.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
          </h1>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <Link to="/members" className="rounded-full border border-line bg-white px-4 py-2 hover:bg-white/60">Members</Link>
            <Link to="/events" className="rounded-full border border-line bg-white px-4 py-2 hover:bg-white/60">Events manager</Link>
            <Link to="/applicants" className="rounded-full border border-line bg-white px-4 py-2 hover:bg-white/60">Applicants board</Link>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k, i) => (
            <Reveal key={k.label} delay={i * 0.05}>
              <div data-spot className="h-full rounded-[2rem] border border-line bg-white p-6" style={{ borderTop: `4px solid ${k.c}`, ['--spot' as string]: k.c + '26' }}>
                <span className="grid size-10 place-items-center rounded-2xl" style={{ background: k.tint, color: k.c === google.yellow ? '#b06000' : k.c }}>
                  <k.icon size={18} />
                </span>
                <p className="display mt-5 text-5xl">{k.value}</p>
                <p className="mt-2 text-sm font-medium">{k.label}</p>
                <p className="mt-0.5 truncate text-xs text-muted">{k.note}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-5">
          <Card title="Team strength" sub="Members per team. Hover a bar." className="lg:col-span-3">
            <SceneFrame label="3D bar chart of members per team" className="h-[320px] rounded-3xl bg-wash sm:h-[380px]" fallback={<div className="absolute inset-0 grid place-items-center text-sm text-muted">3D chart is off</div>}>
              {() => <ChartScene bars={teamBars} hovered={hover} onHover={setHover} />}
            </SceneFrame>
            <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {teamBars.map((b, i) => (
                <li key={b.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} className={cn('rounded-2xl border px-3.5 py-2.5 transition-colors', hover === i ? 'border-transparent bg-wash' : 'border-line')}>
                  <span className="flex items-center gap-2 text-xs text-muted">
                    <span className="size-2.5 rounded-full" style={{ background: b.color }} />
                    {b.label}
                  </span>
                  <span className="display mt-1 block text-2xl">{b.value}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Attendance by event" sub="RSVPs against people who showed up." className="lg:col-span-2" delay={0.05}>
            <div className="h-[330px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendance} margin={{ left: -18, right: 4, top: 6 }}>
                  <CartesianGrid vertical={false} stroke="#e8eaed" />
                  <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} interval={0} angle={-25} textAnchor="end" height={64} />
                  <YAxis tick={axis} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f1f3f4' }} contentStyle={tip} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="going" name="RSVP" fill={google.blue} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="attended" name="Attended" fill={google.green} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card title="Members by branch" delay={0.02}>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={branchData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3} cornerRadius={8} stroke="none">
                    {branchData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tip} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="Members by year" delay={0.06}>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearData} margin={{ left: -22, right: 4, top: 6 }}>
                  <CartesianGrid vertical={false} stroke="#e8eaed" />
                  <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} />
                  <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#f1f3f4' }} contentStyle={tip} />
                  <Bar dataKey="value" name="Members" radius={[8, 8, 0, 0]}>
                    {yearData.map((_, i) => (
                      <Cell key={i} fill={[google.blue, google.red, google.yellow, google.green][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="Points by team" delay={0.1}>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teamPoints} layout="vertical" margin={{ left: 8, right: 12, top: 6 }}>
                  <CartesianGrid horizontal={false} stroke="#e8eaed" />
                  <XAxis type="number" tick={axis} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={axis} tickLine={false} axisLine={false} width={100} />
                  <Tooltip cursor={{ fill: '#f1f3f4' }} contentStyle={tip} />
                  <Bar dataKey="points" name="Points" radius={[0, 8, 8, 0]}>
                    {teamPoints.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card title="Leaderboard" sub="Top contributors by points">
            <ol className="space-y-2">
              {top.map((m, i) => (
                <li key={m.id}>
                  <Link to={`/members?focus=${m.id}`} className="flex items-center gap-3 rounded-2xl px-2 py-2 hover:bg-wash">
                    <span className="w-5 text-center font-mono text-xs text-muted">{i + 1}</span>
                    <span className="grid size-9 place-items-center rounded-full text-xs font-semibold text-white" style={{ background: teams[m.team].color }}>
                      {initials(m.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{m.name}</span>
                      <span className="block text-xs text-muted">{teams[m.team].label}</span>
                    </span>
                    <span className="font-display text-lg font-semibold">{m.points}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </Card>
          <Card title="Coming up" sub="Next events on the calendar" delay={0.05}>
            <ul className="space-y-2">
              {upcoming.slice(0, 4).map((e) => (
                <li key={e.id} className="flex items-center gap-3 rounded-2xl px-2 py-2">
                  <span className="grid size-12 place-items-center rounded-2xl text-center leading-none" style={{ background: kindColor[e.kind] + '2e' }}>
                    <span>
                      <span className="block font-display text-lg font-semibold">{new Date(e.date).getDate()}</span>
                      <span className="block font-mono text-[0.58rem] uppercase text-muted">{new Date(e.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{e.title}</span>
                    <span className="block text-xs text-muted">
                      {e.going}/{e.capacity} going
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <Link to="/events" className="mt-3 inline-flex items-center gap-1 text-sm text-g-blue-700 hover:underline">
              Manage events <ArrowUpRight size={14} />
            </Link>
          </Card>
          <Card title="Recent activity" sub="Applications and birthdays" delay={0.1}>
            <ul className="space-y-3 text-sm">
              {applicants.slice(0, 3).map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: teams[a.team].color }} />
                  <span>
                    <span className="font-medium">{a.name}</span> applied to {teams[a.team].label}
                    <span className="block text-xs text-muted">
                      {fmtDate(a.createdAt)} · {a.status}
                    </span>
                  </span>
                </li>
              ))}
              {birthdays.map(({ m, days }) => (
                <li key={m.id} className="flex items-start gap-3">
                  <span className="mt-1 size-2.5 shrink-0 rounded-full bg-g-yellow" />
                  <span>
                    <span className="font-medium">{m.name}</span> has a birthday
                    <span className="block text-xs text-muted">{days === 0 ? 'today' : `in ${days} days`}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Link to="/applicants" className="mt-4 inline-flex items-center gap-1 text-sm text-g-blue-700 hover:underline">
              Open applicants board <ArrowUpRight size={14} />
            </Link>
          </Card>
        </div>
      </section>
    </div>
  )
}
