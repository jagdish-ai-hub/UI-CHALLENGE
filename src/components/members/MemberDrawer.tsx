import { useEffect, useRef } from 'react'
import { Cake, Mail, Pencil, Trash2, X } from 'lucide-react'
import { teams } from '@/config/brand'
import type { Member } from '@/data/seed'
import { ageOf, nextBirthday } from '@/lib/members'
import { fmtDate, initials } from '@/lib/utils'

export default function MemberDrawer({ member, canEdit, onClose, onEdit, onDelete }: { member: Member; canEdit: boolean; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const t = teams[member.team]
  const close = useRef<HTMLButtonElement>(null)
  const bday = nextBirthday(member.dob)

  useEffect(() => {
    close.current?.focus()
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[65]" role="dialog" aria-modal="true" aria-label={`${member.name} profile`}>
      <div className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="relative px-7 pb-7 pt-8" style={{ background: t.soft }}>
          <button ref={close} onClick={onClose} aria-label="Close profile" className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/80 hover:bg-white">
            <X size={18} />
          </button>
          <span className="grid size-20 place-items-center rounded-3xl bg-white font-display text-3xl font-semibold" style={{ color: member.team === 'design' ? '#b06000' : t.color }}>
            {initials(member.name)}
          </span>
          <h2 className="display mt-5 text-4xl">{member.name}</h2>
          <p className="mt-1 text-muted">{member.role}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium">
              <span className="size-2 rounded-full" style={{ background: t.color }} />
              {t.label}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-xs">{member.branch}</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs">Year {member.year}</span>
            {member.lead && <span className="rounded-full bg-ink px-3 py-1 text-xs text-white">Core lead</span>}
          </div>
        </div>

        <div className="space-y-7 px-7 py-7">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-line p-4">
              <p className="eyebrow">Points</p>
              <p className="display mt-2 text-4xl">{member.points}</p>
            </div>
            <div className="rounded-2xl border border-line p-4">
              <p className="eyebrow">Attendance</p>
              <p className="display mt-2 text-4xl">{member.attendance}%</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-wash">
                <div className="h-full rounded-full" style={{ width: `${member.attendance}%`, background: member.attendance > 80 ? '#34A853' : member.attendance > 65 ? '#FBBC04' : '#EA4335' }} />
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow">Skills</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {member.skills.map((s) => (
                <span key={s} className="rounded-full border border-line px-3 py-1 text-sm">
                  {s}
                </span>
              ))}
              {member.skills.length === 0 && <span className="text-sm text-muted">No skills listed.</span>}
            </div>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-muted" />
              <dd>{member.email}</dd>
            </div>
            <div className="flex items-center gap-3">
              <Cake size={16} className="text-muted" />
              <dd>
                {fmtDate(member.dob, { day: 'numeric', month: 'long', year: 'numeric' })} · age {ageOf(member.dob)} ·{' '}
                <span className="font-medium">{bday.days === 0 ? 'birthday today' : `birthday in ${bday.days} days`}</span>
              </dd>
            </div>
            <p className="pl-7 text-muted">Joined {fmtDate(member.joined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </dl>
        </div>

        {canEdit && (
          <div className="mt-auto flex gap-3 border-t border-line px-7 py-5">
            <button onClick={onEdit} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-line py-3 text-sm font-medium hover:bg-wash">
              <Pencil size={15} /> Edit
            </button>
            <button onClick={onDelete} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-g-red/40 bg-g-red-50 py-3 text-sm font-medium text-g-red-700 hover:bg-[#fad2cf]">
              <Trash2 size={15} /> Remove
            </button>
          </div>
        )}
      </aside>
    </div>
  )
}
