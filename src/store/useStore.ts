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
  setQuality: (q: Quality) => void
  setMotion: (v: boolean) => void
  setRole: (r: 'admin' | 'member') => void
  resetDemo: () => void
}

const fresh = () => {
  const now = new Date()
  return { members: buildMembers(now), events: buildEvents(now), applicants: buildApplicants(now), rsvps: [] as string[] }
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
        quality: s.quality,
        motion: s.motion,
        role: s.role,
      }),
    },
  ),
)
