import { useState, lazy } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { SceneFrame } from '@/three/lazy'
import { ButtonLink, Reveal, SectionHeading } from '@/components/ui/primitives'
import { google, teamOrder, teams, type TeamId } from '@/config/brand'
import { useStore } from '@/store/useStore'
import { cn, initials } from '@/lib/utils'

const MemberNetwork = lazy(() => import('@/three/MemberNetwork'))

export default function Community() {
  const members = useStore((s) => s.members)
  const navigate = useNavigate()
  const [team, setTeam] = useState<TeamId | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null)
  const hovered = members.find((m) => m.id === hoverId)
  const leads = members.filter((m) => m.lead)
  const counts = Object.fromEntries(teamOrder.map((t) => [t, members.filter((m) => m.team === t).length])) as Record<TeamId, number>

  return (
    <section id="community" className="relative scroll-mt-20 bg-wash py-24 sm:py-32">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <SectionHeading eyebrow="Community · the network" color={google.blue} line1="Four teams." line2={`${members.length} people.`}>
          Every dot is a member, colored by team and linked to the people they build with. Hover to meet someone, click to open their profile.
        </SectionHeading>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal>
            <div className="rounded-[2rem] bg-white p-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-2 px-2 pb-3 pt-1">
                <button onClick={() => setTeam(null)} className={cn('rounded-full border px-4 py-2 text-sm transition-colors', team === null ? 'border-ink bg-ink text-white' : 'border-line hover:bg-wash')}>
                  All {members.length}
                </button>
                {teamOrder.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTeam(team === t ? null : t)}
                    aria-pressed={team === t}
                    className={cn('inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors', team === t ? 'border-transparent' : 'border-line hover:bg-wash')}
                    style={team === t ? { background: teams[t].soft, boxShadow: `inset 0 0 0 2px ${teams[t].color}` } : undefined}
                  >
                    <span className="size-2.5 rounded-full" style={{ background: teams[t].color }} />
                    {teams[t].label} <span className="text-muted">{counts[t]}</span>
                  </button>
                ))}
              </div>
              <div className="relative">
                <SceneFrame label="3D network of club members grouped into four team clusters" className="h-[420px] rounded-[1.5rem] bg-wash sm:h-[540px]">
                  {() => <MemberNetwork members={members} team={team} hoveredId={hoverId} onHover={setHoverId} onSelect={(id) => navigate(`/members?focus=${id}`)} />}
                </SceneFrame>
              </div>
              <div className="min-h-[3.75rem] px-2 pb-1 pt-3">
                {hovered ? (
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-2.5 shadow-sm">
                    <span className="grid size-9 place-items-center rounded-full text-xs font-semibold text-white" style={{ background: teams[hovered.team].color }}>
                      {initials(hovered.name)}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{hovered.name}</span>
                      <span className="block text-xs text-muted">
                        {hovered.role} · {hovered.branch} · Year {hovered.year}
                      </span>
                    </span>
                  </div>
                ) : (
                  <p className="py-3 text-xs text-muted">Hover a dot to see who it is. Click it to open their profile.</p>
                )}
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col gap-4">
            <Reveal delay={0.05}>
              <p className="eyebrow">Core leads</p>
            </Reveal>
            {leads.map((m, i) => (
              <Reveal key={m.id} delay={0.06 + i * 0.05}>
                <button data-spot style={{ ['--spot' as string]: teams[m.team].color + '26' }} onClick={() => navigate(`/members?focus=${m.id}`)} className="group flex w-full items-center gap-4 rounded-3xl border border-line bg-white p-4 text-left transition-shadow hover:shadow-[0_18px_40px_-26px_rgba(32,33,36,.5)]">
                  <span className="grid size-16 shrink-0 place-items-center rounded-2xl font-display text-2xl font-semibold" style={{ background: teams[m.team].soft, color: m.team === 'design' ? '#b06000' : teams[m.team].color }}>
                    {initials(m.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xl font-semibold tracking-tight">{m.name}</span>
                    <span className="block text-sm text-muted">{m.role}</span>
                    <span className="mt-2 flex gap-1.5">
                      <span className="rounded-full px-2.5 py-0.5 text-[0.68rem] font-medium" style={{ background: teams[m.team].soft }}>
                        {teams[m.team].label}
                      </span>
                      <span className="rounded-full bg-wash px-2.5 py-0.5 text-[0.68rem] text-muted">{m.branch}</span>
                    </span>
                  </span>
                  <ArrowRight size={18} className="text-muted transition-transform group-hover:translate-x-1" />
                </button>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <ButtonLink to="/members" variant="ink" className="mt-2 w-full sm:w-auto">
                Open the member directory <ArrowRight size={16} />
              </ButtonLink>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
