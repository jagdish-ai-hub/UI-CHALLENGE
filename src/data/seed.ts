import { addDays, isoDay, mulberry32 } from '@/lib/utils'
import { google, teamOrder, type TeamId } from '@/config/brand'

export type Branch = 'CSE Core' | 'AIML' | 'IOT' | 'CSIT'
export const branches: Branch[] = ['CSE Core', 'AIML', 'IOT', 'CSIT']

export interface Member {
  id: string
  name: string
  role: string
  team: TeamId
  branch: Branch
  year: 1 | 2 | 3 | 4
  dob: string
  skills: string[]
  email: string
  joined: string
  points: number
  attendance: number
  lead?: boolean
}

export type EventKind = 'Workshop' | 'Talk' | 'Hackathon' | 'Social' | 'Study Jam'

export interface ClubEvent {
  id: string
  title: string
  kind: EventKind
  date: string
  time: string
  location: string
  team: TeamId
  capacity: number
  going: number
  attended: number
  blurb: string
}

export type ApplicantStatus = 'applied' | 'review' | 'interview' | 'selected'

export interface Applicant {
  id: string
  name: string
  branch: Branch
  team: TeamId
  why: string
  status: ApplicantStatus
  createdAt: string
  rostered?: boolean
}

export const kindColor: Record<EventKind, string> = {
  Workshop: google.blue,
  Talk: google.red,
  Hackathon: google.yellow,
  Social: google.green,
  'Study Jam': google.blue,
}

const first = ['Aarav', 'Ananya', 'Arjun', 'Diya', 'Farhan', 'Ishita', 'Kabir', 'Kunal', 'Meera', 'Nikhil', 'Niharika', 'Pratik', 'Riya', 'Rohan', 'Sanya', 'Saanvi', 'Siddharth', 'Tara', 'Vihaan', 'Zoya', 'Aditi', 'Anand', 'Bhavna', 'Chirag', 'Devansh', 'Esha', 'Gaurav', 'Harsh', 'Isha', 'Jayant', 'Kriti', 'Lakshya', 'Mansi', 'Nitin', 'Oviya', 'Parth', 'Rhea', 'Sahil', 'Trisha', 'Uday', 'Vanya', 'Yash', 'Aisha', 'Dev', 'Hriday', 'Jiya', 'Mihir', 'Naina', 'Omkar', 'Prisha']
const last = ['Sharma', 'Reddy', "D'Souza", 'Singhal', 'Ali', 'Verma', 'Das', 'Bansal', 'Mishra', 'Patnaik', 'Samal', 'Mohanty', 'Dash', 'Nayak', 'Behera', 'Rath', 'Sahoo', 'Panda', 'Mahapatra', 'Jena', 'Kar', 'Swain', 'Pradhan', 'Rout']

const rolesByTeam: Record<TeamId, string[]> = {
  tech: ['Full Stack Developer', 'Android Developer', 'Cloud Engineer', 'ML Engineer', 'Flutter Developer', 'DevOps Volunteer'],
  media: ['Photographer', 'Videographer', 'Video Editor', 'Social Media Creator', 'Content Writer'],
  design: ['UI/UX Designer', 'Motion Designer', 'Brand Designer', 'Illustrator', 'Design Systems Volunteer'],
  pr: ['Outreach Coordinator', 'Sponsorship Associate', 'Operations Associate', 'Community Manager', 'Logistics Volunteer'],
}
const skillsByTeam: Record<TeamId, string[]> = {
  tech: ['React', 'Flutter', 'Firebase', 'Cloud Run', 'Gemini API', 'TensorFlow', 'Kotlin', 'TypeScript', 'Python', 'Go'],
  media: ['Photography', 'Premiere Pro', 'DaVinci Resolve', 'Reels', 'Copywriting', 'Podcasting'],
  design: ['Figma', 'Motion', 'Illustration', 'Design Systems', 'Prototyping', 'Branding'],
  pr: ['Outreach', 'Sponsorship', 'Event Ops', 'Negotiation', 'Community', 'Social Media'],
}

const leads: Array<Pick<Member, 'name' | 'role' | 'team' | 'branch' | 'year'>> = [
  { name: 'Aarav Sharma', role: 'Tech Lead', team: 'tech', branch: 'CSE Core', year: 4 },
  { name: 'Arjun Reddy', role: 'Media Lead', team: 'media', branch: 'CSE Core', year: 3 },
  { name: "Tara D'Souza", role: 'Design Lead', team: 'design', branch: 'AIML', year: 3 },
  { name: 'Kunal Singhal', role: 'Community Lead', team: 'pr', branch: 'CSE Core', year: 4 },
]

export function buildMembers(now = new Date()): Member[] {
  const rnd = mulberry32(2026)
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)]!
  const usedNames = new Set(leads.map((l) => l.name))
  const members: Member[] = []
  let n = 0

  teamOrder.forEach((team) => {
    const lead = leads.find((l) => l.team === team)!
    const roster: Array<Partial<Member> & { name: string }> = [{ ...lead, lead: true }]
    while (roster.length < 15) {
      let name = ''
      do {
        name = `${pick(first)} ${pick(last)}`
      } while (usedNames.has(name))
      usedNames.add(name)
      roster.push({ name })
    }
    roster.forEach((r) => {
      n += 1
      const year = (r.year ?? (1 + Math.floor(rnd() * 4))) as Member['year']
      const bornYear = now.getFullYear() - (17 + year) - (rnd() > 0.6 ? 1 : 0)
      const dob = new Date(bornYear, Math.floor(rnd() * 12), 1 + Math.floor(rnd() * 28))
      const skills = Array.from(new Set([pick(skillsByTeam[team]), pick(skillsByTeam[team]), pick(skillsByTeam[team])]))
      members.push({
        id: `m${String(n).padStart(2, '0')}`,
        name: r.name,
        role: r.role ?? pick(rolesByTeam[team]),
        team,
        branch: (r.branch ?? pick(branches)) as Branch,
        year,
        dob: isoDay(dob),
        skills,
        email: `${r.name.toLowerCase().replace(/[^a-z]+/g, '.')}@iter.example`,
        joined: isoDay(addDays(now, -Math.floor(rnd() * 700) - 20)),
        points: Math.floor(rnd() * 900) + 80,
        attendance: Math.floor(55 + rnd() * 45),
        lead: r.lead,
      })
    })
  })

  // Make sure a few birthdays land in the next weeks so the tracker is alive.
  const bump = [1, 7, 14, 20, 28]
  const pool = members.filter((m) => !m.lead)
  bump.forEach((d, i) => {
    const m = pool[i * 9 + 3]!
    const target = addDays(now, d)
    const dobDate = new Date(m.dob)
    dobDate.setMonth(target.getMonth())
    dobDate.setDate(target.getDate())
    m.dob = isoDay(dobDate)
  })
  return members
}

export function buildEvents(now = new Date()): ClubEvent[] {
  const e = (
    id: string,
    offset: number,
    title: string,
    kind: EventKind,
    time: string,
    location: string,
    team: TeamId,
    capacity: number,
    going: number,
    attended: number,
    blurb: string,
  ): ClubEvent => ({ id, date: isoDay(addDays(now, offset)), title, kind, time, location, team, capacity, going, attended, blurb })
  return [
    e('e01', -96, 'Orientation & Club Fair', 'Social', '4:00 PM', 'Main Lawn', 'pr', 300, 280, 241, 'Meet the four teams and pick your track.'),
    e('e02', -75, 'Intro to Flutter', 'Workshop', '3:00 PM', 'Computer Lab 2', 'tech', 80, 76, 64, 'Ship a first cross-platform app in one evening.'),
    e('e03', -58, 'Design Sprint Night', 'Hackathon', '6:00 PM', 'Studio Hall', 'design', 60, 58, 49, 'Brief, sketch, prototype and pitch before midnight.'),
    e('e04', -41, 'Cloud Study Jam', 'Study Jam', '2:00 PM', 'Seminar Hall B', 'tech', 120, 104, 88, 'Hands-on Cloud Run and Firebase labs.'),
    e('e05', -27, 'Content Creator Meetup', 'Talk', '5:00 PM', 'Auditorium', 'media', 150, 131, 109, 'Shooting and editing for tech communities.'),
    e('e06', -14, 'Open Source Weekend', 'Hackathon', '10:00 AM', 'Innovation Hub', 'tech', 100, 92, 81, 'First pull requests, mentors on call.'),
    e('e07', 4, 'Intro to React 19', 'Workshop', '5:00 PM', 'Virtual', 'tech', 400, 212, 0, 'Actions, transitions and the new compiler, live-coded.'),
    e('e08', 11, 'AI/ML Bootcamp', 'Workshop', '10:00 AM', 'Main Campus', 'tech', 150, 97, 0, 'Build with Gemini: prompts, tools and evaluation.'),
    e('e09', 19, 'Portfolio Reviews', 'Talk', '4:30 PM', 'Studio Hall', 'design', 60, 33, 0, 'Bring your work, get feedback from the design team.'),
    e('e10', 26, 'Cloud Architecture', 'Talk', '4:00 PM', 'Auditorium', 'tech', 250, 118, 0, 'Designing reliable systems on Google Cloud.'),
    e('e11', 34, 'Winter Hackathon', 'Hackathon', '9:00 AM', 'Innovation Hub', 'tech', 200, 64, 0, '24 hours, teams of four, mentors across all tracks.'),
  ]
}

export function buildApplicants(now = new Date()): Applicant[] {
  const a = (id: string, name: string, branch: Branch, team: TeamId, status: ApplicantStatus, off: number, why: string): Applicant => ({
    id,
    name,
    branch,
    team,
    status,
    why,
    createdAt: isoDay(addDays(now, off)),
  })
  return [
    a('a01', 'Ritika Bose', 'CSE Core', 'tech', 'interview', -6, 'I built a Flutter app for my hostel mess and want to ship more with a team.'),
    a('a02', 'Mohit Anand', 'IOT', 'tech', 'review', -5, 'Interested in edge devices and the Gemini Nano demos.'),
    a('a03', 'Sneha Pattnaik', 'AIML', 'design', 'selected', -9, 'Design student turned builder, lots of Figma and a little React.'),
    a('a04', 'Imran Qureshi', 'CSIT', 'media', 'applied', -2, 'I shoot and edit college events and want a proper crew.'),
    a('a05', 'Divya Menon', 'CSE Core', 'pr', 'review', -3, 'Ran sponsorship for two college fests last year.'),
    a('a06', 'Karan Nanda', 'AIML', 'tech', 'applied', -1, 'Kaggle regular. Want to turn notebooks into products.'),
    a('a07', 'Pooja Lenka', 'CSIT', 'design', 'interview', -7, 'Motion design and brand systems, portfolio attached.'),
    a('a08', 'Samar Jha', 'IOT', 'pr', 'applied', 0, 'I like organising people and logistics, not just code.'),
  ]
}

export interface Milestone {
  year: string
  title: string
  text: string
  color: string
  tint: string
}

export const milestones: Milestone[] = [
  { year: '2023', title: 'Chapter founded', text: '12 students, one lab, and a plan to meet every fortnight.', color: google.yellow, tint: google.yellowTint },
  { year: '2024', title: 'Best Developer Community', text: 'Recognised by Google Developers for student-led programming.', color: google.blue, tint: google.blueTint },
  { year: '2025', title: '1,200-person hackathon', text: 'The region’s largest student-led hackathon, run end to end by the club.', color: google.red, tint: google.redTint },
  { year: '2026', title: '60 active members', text: 'Four teams, a weekly cadence, and a dashboard that runs the whole thing.', color: google.green, tint: google.greenTint },
]
