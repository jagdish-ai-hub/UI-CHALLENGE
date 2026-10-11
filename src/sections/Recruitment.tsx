import { useState, lazy } from 'react'
import { Check, ArrowRight } from 'lucide-react'
import { SceneFrame } from '@/three/lazy'
import { Button, Reveal, SectionHeading } from '@/components/ui/primitives'
import { google, teamOrder, teams, type TeamId } from '@/config/brand'
import { branches, type Branch } from '@/data/seed'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const BadgeScene = lazy(() => import('@/three/BadgeScene'))

const steps = [
  { n: '01', t: 'Apply', d: 'Tell us who you are and which team fits.', c: google.blue },
  { n: '02', t: 'Review', d: 'Team leads read every application.', c: google.red },
  { n: '03', t: 'Interview', d: 'A friendly 15-minute chat, no whiteboards.', c: google.yellow },
  { n: '04', t: 'Welcome', d: 'You get a badge, a team and a first project.', c: google.green },
]

export default function Recruitment() {
  const addApplicant = useStore((s) => s.addApplicant)
  const [name, setName] = useState('')
  const [team, setTeam] = useState<TeamId>('tech')
  const [branch, setBranch] = useState<Branch>('CSE Core')
  const [why, setWhy] = useState('')
  const [done, setDone] = useState(false)
  const [touched, setTouched] = useState(false)

  const closes = 19
  const valid = name.trim().length >= 2 && why.trim().length >= 10

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    addApplicant({ name: name.trim(), team, branch, why: why.trim() })
    setDone(true)
  }

  return (
    <section id="recruit" className="relative scroll-mt-20 bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <SectionHeading eyebrow={`Recruitment 2026 · closes in ${closes} days`} color={google.red} line1="Join the core team." line2="Get your badge.">
          We are looking for developers, designers, storytellers and organisers. Type your name and watch your badge update, then send the application.
        </SectionHeading>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <SceneFrame label="3D member badge on a lanyard that updates with the name and team you choose" className="h-[480px] rounded-[2rem] transition-colors duration-500 sm:h-[620px]" style={{ background: teams[team].tint }}>
              {() => <BadgeScene name={name} team={team} branch={branch} />}
            </SceneFrame>
            <p className="mt-3 text-center text-xs text-muted">Move your cursor to swing the badge. Click it to flip.</p>
          </Reveal>

          <Reveal delay={0.08}>
            {done ? (
              <div className="flex h-full min-h-[420px] flex-col justify-center rounded-[2rem] border border-line bg-white p-8 sm:p-10">
                <span className="grid size-12 place-items-center rounded-full bg-g-green-50 text-g-green-700">
                  <Check />
                </span>
                <h3 className="display mt-6 text-4xl">Application sent, {name.split(' ')[0]}.</h3>
                <p className="mt-3 max-w-md text-muted">
                  The {teams[team].label} team lead will review it within a few days. You can see your application on the applicants board in the dashboard.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDone(false)
                      setName('')
                      setWhy('')
                      setTouched(false)
                    }}
                  >
                    Apply another
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="rounded-[2rem] border border-line bg-white p-6 sm:p-9" noValidate>
                <label className="block">
                  <span className="text-sm font-medium">Full name</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ritika Bose"
                    maxLength={28}
                    aria-invalid={touched && name.trim().length < 2}
                    className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-[0.95rem] outline-none transition-colors focus:border-g-blue focus:ring-4 focus:ring-g-blue-50"
                  />
                  {touched && name.trim().length < 2 && <span className="mt-1 block text-xs text-g-red-700">Please enter your name.</span>}
                </label>

                <fieldset className="mt-6">
                  <legend className="text-sm font-medium">Team you would like to join</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {teamOrder.map((t) => (
                      <button
                        type="button"
                        key={t}
                        onClick={() => setTeam(t)}
                        aria-pressed={team === t}
                        className={cn('rounded-xl border px-3.5 py-3 text-left transition-colors', team === t ? 'border-transparent' : 'border-line hover:bg-wash')}
                        style={team === t ? { background: teams[t].soft, boxShadow: `inset 0 0 0 2px ${teams[t].color}` } : undefined}
                      >
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <span className="size-2.5 rounded-full" style={{ background: teams[t].color }} />
                          {teams[t].label}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted">{teams[t].blurb}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <label className="mt-6 block">
                  <span className="text-sm font-medium">Branch</span>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value as Branch)}
                    className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-[0.95rem] outline-none focus:border-g-blue focus:ring-4 focus:ring-g-blue-50"
                  >
                    {branches.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </label>

                <label className="mt-6 block">
                  <span className="text-sm font-medium">Why this team?</span>
                  <textarea
                    value={why}
                    onChange={(e) => setWhy(e.target.value)}
                    rows={3}
                    placeholder="One or two lines about what you want to build or learn."
                    aria-invalid={touched && why.trim().length < 10}
                    className="mt-2 w-full resize-none rounded-xl border border-line bg-white px-4 py-3 text-[0.95rem] outline-none transition-colors focus:border-g-blue focus:ring-4 focus:ring-g-blue-50"
                  />
                  {touched && why.trim().length < 10 && <span className="mt-1 block text-xs text-g-red-700">A little more detail, please (10+ characters).</span>}
                </label>

                <Button type="submit" className="mt-7 w-full !py-3.5">
                  Send application <ArrowRight size={16} />
                </Button>
                <p className="mt-3 text-center text-xs text-muted">Demo: your application is stored in this browser only.</p>
              </form>
            )}
          </Reveal>
        </div>

        <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.06} className="bg-white p-6">
              <li>
                <span className="font-mono text-xs" style={{ color: s.c === google.yellow ? '#b06000' : s.c }}>
                  {s.n}
                </span>
                <p className="display mt-6 text-2xl">{s.t}</p>
                <p className="mt-2 text-sm text-muted">{s.d}</p>
                <div className="mt-5 h-1 w-10 rounded-full" style={{ background: s.c }} />
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
