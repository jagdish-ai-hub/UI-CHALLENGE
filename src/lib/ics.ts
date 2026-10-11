import type { ClubEvent } from '@/data/seed'

function parseTime(t: string): [number, number] {
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(t)
  if (!m) return [17, 0]
  let h = +m[1]!
  const min = +m[2]!
  const pm = m[3]!.toUpperCase() === 'PM'
  if (pm && h < 12) h += 12
  if (!pm && h === 12) h = 0
  return [h, min]
}

const pad = (n: number) => String(n).padStart(2, '0')

export function downloadIcs(e: ClubEvent) {
  const [h, m] = parseTime(e.time)
  const d = new Date(e.date)
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`
  const end = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad((h + 2) % 24)}${pad(m)}00`
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GDG on Campus//Hub//EN',
    'BEGIN:VEVENT',
    `UID:${e.id}@gdg-campus-hub`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${stamp}`,
    `DTEND:${end}`,
    `SUMMARY:${e.title}`,
    `LOCATION:${e.location}`,
    `DESCRIPTION:${e.blurb}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${e.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`
  a.click()
  URL.revokeObjectURL(url)
}
