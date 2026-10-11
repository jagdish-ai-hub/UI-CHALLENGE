export const brand = {
  name: 'GDG on Campus',
  chapter: 'ITER Chapter',
  university: "Siksha 'O' Anusandhan, Bhubaneswar",
  short: 'GDG ITER',
  tagline: 'Build. Learn. Grow together.',
  email: 'hello@gdg-iter.example',
} as const

export const google = {
  blue: '#4285F4',
  red: '#EA4335',
  yellow: '#FBBC04',
  green: '#34A853',
  blueTint: '#E8F0FE',
  redTint: '#FCE8E6',
  yellowTint: '#FEF7E0',
  greenTint: '#E6F4EA',
  ink: '#202124',
  muted: '#5F6368',
  line: '#DADCE0',
} as const

export type TeamId = 'tech' | 'media' | 'design' | 'pr'

export const teams: Record<TeamId, { label: string; color: string; tint: string; soft: string; blurb: string }> = {
  tech: { label: 'Tech', color: google.blue, tint: google.blueTint, soft: '#D2E3FC', blurb: 'Web, mobile, cloud and AI builds' },
  media: { label: 'Media', color: google.red, tint: google.redTint, soft: '#FAD2CF', blurb: 'Photo, video and event coverage' },
  design: { label: 'Design', color: google.yellow, tint: google.yellowTint, soft: '#FEEFC3', blurb: 'Brand, UI and motion' },
  pr: { label: 'PR & Management', color: google.green, tint: google.greenTint, soft: '#CEEAD6', blurb: 'Partners, outreach and operations' },
}

export const teamOrder: TeamId[] = ['tech', 'media', 'design', 'pr']
