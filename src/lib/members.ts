import { branches, type Branch, type Member } from '@/data/seed'
import { teamOrder, teams, type TeamId } from '@/config/brand'

export function nextBirthday(dob: string, from = new Date()) {
  const d = new Date(dob)
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  let n = new Date(today.getFullYear(), d.getMonth(), d.getDate())
  if (n < today) n = new Date(today.getFullYear() + 1, d.getMonth(), d.getDate())
  return { date: n, days: Math.round((n.getTime() - today.getTime()) / 86400000) }
}

export function ageOf(dob: string, from = new Date()) {
  const d = new Date(dob)
  let a = from.getFullYear() - d.getFullYear()
  const m = from.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && from.getDate() < d.getDate())) a--
  return a
}

const esc = (v: string | number) => {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function membersToCsv(list: Member[]) {
  const head = ['name', 'role', 'team', 'branch', 'year', 'dob', 'skills', 'email', 'points', 'attendance']
  const rows = list.map((m) => [m.name, m.role, m.team, m.branch, m.year, m.dob, m.skills.join('; '), m.email, m.points, m.attendance].map(esc).join(','))
  return [head.join(','), ...rows].join('\n')
}

export function downloadText(name: string, text: string, type = 'text/csv') {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

function splitCsvLine(line: string) {
  const out: string[] = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!
    if (q) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"'
        i++
      } else if (c === '"') q = false
      else cur += c
    } else if (c === '"') q = true
    else if (c === ',') {
      out.push(cur)
      cur = ''
    } else cur += c
  }
  out.push(cur)
  return out.map((s) => s.trim())
}

function teamFrom(v: string): TeamId | null {
  const x = v.toLowerCase()
  const byId = teamOrder.find((t) => t === x)
  if (byId) return byId
  return teamOrder.find((t) => teams[t].label.toLowerCase() === x || x.startsWith(teams[t].label.toLowerCase().split(' ')[0]!)) ?? null
}

export interface ImportResult {
  ok: Omit<Member, 'id' | 'joined' | 'points' | 'attendance'>[]
  skipped: number
}

export function parseMembersCsv(text: string): ImportResult {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return { ok: [], skipped: 0 }
  const head = splitCsvLine(lines[0]!).map((h) => h.toLowerCase())
  const col = (row: string[], k: string) => row[head.indexOf(k)] ?? ''
  const ok: ImportResult['ok'] = []
  let skipped = 0
  lines.slice(1).forEach((l) => {
    const r = splitCsvLine(l)
    const name = col(r, 'name')
    const team = teamFrom(col(r, 'team'))
    const branch = branches.find((b) => b.toLowerCase() === col(r, 'branch').toLowerCase()) as Branch | undefined
    const year = Number(col(r, 'year'))
    const dob = col(r, 'dob')
    if (!name || !team || !branch || !(year >= 1 && year <= 4) || Number.isNaN(Date.parse(dob))) {
      skipped++
      return
    }
    ok.push({
      name,
      role: col(r, 'role') || 'Member',
      team,
      branch,
      year: year as Member['year'],
      dob,
      skills: col(r, 'skills').split(/[;|]/).map((s) => s.trim()).filter(Boolean),
      email: col(r, 'email') || `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@iter.example`,
    })
  })
  return { ok, skipped }
}
