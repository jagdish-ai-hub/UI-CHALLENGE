import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/primitives'
import { teamOrder, teams, type TeamId } from '@/config/brand'
import { branches, type Branch, type Member } from '@/data/seed'

export type MemberDraft = Omit<Member, 'id' | 'joined' | 'points' | 'attendance'>

const empty: MemberDraft = { name: '', role: '', team: 'tech', branch: 'CSE Core', year: 1, dob: '2007-01-01', skills: [], email: '' }

export default function MemberForm({ initial, onSave, onClose }: { initial?: Member; onSave: (d: MemberDraft) => void; onClose: () => void }) {
  const [d, setD] = useState<MemberDraft>(initial ? { name: initial.name, role: initial.role, team: initial.team, branch: initial.branch, year: initial.year, dob: initial.dob, skills: initial.skills, email: initial.email, lead: initial.lead } : empty)
  const [skills, setSkills] = useState((initial?.skills ?? []).join(', '))
  const [touched, setTouched] = useState(false)
  const first = useRef<HTMLInputElement>(null)

  useEffect(() => {
    first.current?.focus()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  const valid = d.name.trim().length >= 2 && d.role.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(d.email.trim())
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    onSave({ ...d, name: d.name.trim(), role: d.role.trim(), email: d.email.trim(), skills: skills.split(',').map((s) => s.trim()).filter(Boolean) })
  }
  const field = 'mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-g-blue focus:ring-4 focus:ring-g-blue-50'
  const err = (bad: boolean, msg: string) => touched && bad && <span className="mt-1 block text-xs text-g-red-700">{msg}</span>

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-ink/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={initial ? 'Edit member' : 'Add member'} onMouseDown={onClose}>
      <form onSubmit={submit} onMouseDown={(e) => e.stopPropagation()} noValidate className="relative w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid size-9 place-items-center rounded-full hover:bg-wash">
          <X size={18} />
        </button>
        <h2 className="display text-3xl">{initial ? 'Edit member' : 'Add a member'}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="text-sm font-medium">Full name</span>
            <input ref={first} value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} className={field} maxLength={40} />
            {err(d.name.trim().length < 2, 'Enter a name.')}
          </label>
          <label>
            <span className="text-sm font-medium">Role</span>
            <input value={d.role} onChange={(e) => setD({ ...d, role: e.target.value })} className={field} placeholder="e.g. UI/UX Designer" maxLength={40} />
            {err(d.role.trim().length < 2, 'Enter a role.')}
          </label>
          <label>
            <span className="text-sm font-medium">Email</span>
            <input value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} className={field} inputMode="email" />
            {err(!/^\S+@\S+\.\S+$/.test(d.email.trim()), 'Enter a valid email.')}
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
            <span className="text-sm font-medium">Branch</span>
            <select value={d.branch} onChange={(e) => setD({ ...d, branch: e.target.value as Branch })} className={field}>
              {branches.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-sm font-medium">Year of study</span>
            <select value={d.year} onChange={(e) => setD({ ...d, year: Number(e.target.value) as Member['year'] })} className={field}>
              {[1, 2, 3, 4].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="text-sm font-medium">Date of birth</span>
            <input type="date" value={d.dob} onChange={(e) => setD({ ...d, dob: e.target.value })} className={field} />
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium">Skills</span>
            <input value={skills} onChange={(e) => setSkills(e.target.value)} className={field} placeholder="React, Figma, Photography" />
          </label>
        </div>
        <div className="mt-7 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{initial ? 'Save changes' : 'Add member'}</Button>
        </div>
      </form>
    </div>
  )
}
