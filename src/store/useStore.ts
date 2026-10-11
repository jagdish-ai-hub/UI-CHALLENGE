import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  buildApplicants,
  buildEvents,
  buildMembers,
  type Applicant,
  type ApplicantStatus,
  type ClubEvent,
  type Member,
} from '@/data/seed'
import { isoDay } from '@/lib/utils'

export type Quality = 'auto' | 'high' | 'low' | 'off'

interface State {
  members: Member[]
  events: ClubEvent[]
  applicants: Applicant[]
  rsvps: string[]
  checkins: Record<string, string[]>
  quality: Quality
  motion: boolean
  role: 'admin' | 'member'

  toggleRsvp: (eventId: string) => void
  addApplicant: (a: Omit<Applicant, 'id' | 'status' | 'createdAt'>) => void
  moveApplicant: (id: string, status: ApplicantStatus) => void
  addMember: (m: Omit<Member, 'id' | 'joined' | 'points' | 'attendance'>) => void
  updateMember: (id: string, patch: Partial<Member>) => void
  removeMember: (id: string) => void
  addEvent: (e: Omit<ClubEvent, 'id' | 'going' | 'attended'>) => void
  toggleCheckin: (eventId: string, memberId: string) => void
  rosterApplicant: (id: string) => void
  setQuality: (q: Quality) => void
  setMotion: (v: boolean) => void
  setRole: (r: 'admin' | 'member') => void
  resetDemo: () => void
}

const fresh = () => {
  const now = new Date()
  return { members: buildMembers(now), events: buildEvents(now), applicants: buildApplicants(now), rsvps: [] as string[], checkins: {} as Record<string, string[]> }
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      ...fresh(),
      quality: 'auto',
      motion: true,
      role: 'admin',

      toggleRsvp: (eventId) =>
        set((s) => {
          const has = s.rsvps.includes(eventId)
          return {
            rsvps: has ? s.rsvps.filter((id) => id !== eventId) : [...s.rsvps, eventId],
            events: s.events.map((e) => (e.id === eventId ? { ...e, going: e.going + (has ? -1 : 1) } : e)),
          }
        }),
      addApplicant: (a) =>
        set((s) => ({
          applicants: [{ ...a, id: `a${Date.now()}`, status: 'applied', createdAt: isoDay(new Date()) }, ...s.applicants],
        })),
      moveApplicant: (id, status) => set((s) => ({ applicants: s.applicants.map((a) => (a.id === id ? { ...a, status } : a)) })),
      addMember: (m) =>
        set((s) => ({
          members: [{ ...m, id: `m${Date.now()}`, joined: isoDay(new Date()), points: 0, attendance: 100 }, ...s.members],
        })),
      updateMember: (id, patch) => set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      removeMember: (id) => set((s) => ({ members: s.members.filter((m) => m.id !== id) })),
      addEvent: (e) => set((s) => ({ events: [...s.events, { ...e, id: `e${Date.now()}`, going: 0, attended: 0 }] })),
      toggleCheckin: (eventId, memberId) =>
        set((s) => {
          const cur = s.checkins[eventId] ?? []
          const has = cur.includes(memberId)
          return {
            checkins: { ...s.checkins, [eventId]: has ? cur.filter((x) => x !== memberId) : [...cur, memberId] },
            events: s.events.map((e) => (e.id === eventId ? { ...e, attended: Math.max(0, e.attended + (has ? -1 : 1)) } : e)),
          }
        }),
      rosterApplicant: (id) =>
        set((s) => {
          const a = s.applicants.find((x) => x.id === id)
          if (!a || a.rostered) return s
          const m: Member = {
            id: `m${Date.now()}`,
            name: a.name,
            role: 'New member',
            team: a.team,
            branch: a.branch,
            year: 1,
            dob: '2007-01-01',
            skills: [],
            email: `${a.name.toLowerCase().replace(/[^a-z]+/g, '.')}@iter.example`,
            joined: isoDay(new Date()),
            points: 0,
            attendance: 100,
          }
          return { members: [m, ...s.members], applicants: s.applicants.map((x) => (x.id === id ? { ...x, rostered: true } : x)) }
        }),
      setQuality: (quality) => set({ quality }),
      setMotion: (motion) => set({ motion }),
      setRole: (role) => set({ role }),
      resetDemo: () => set({ ...fresh() }),
    }),
    {
      name: 'gdg-campus-hub:v1',
      version: 1,
      partialize: (s) => ({
        members: s.members,
        events: s.events,
        applicants: s.applicants,
        rsvps: s.rsvps,
        checkins: s.checkins,
        quality: s.quality,
        motion: s.motion,
        role: s.role,
      }),
    },
  ),
)
