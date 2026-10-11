import { google } from '@/config/brand'

export function LogoMark({ size = 36 }: { size?: number }) {
  // Official GDG structure: two chevrons, each made of two rounded pills (no centre dots).
  const pill = (d: string, c: string) => (
    <>
      <path d={d} fill="none" stroke="#fff" strokeWidth="15" strokeLinecap="round" />
      <path d={d} fill="none" stroke={c} strokeWidth="12" strokeLinecap="round" />
    </>
  )
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      {pill('M22 18 8 29.5', google.red)}
      {pill('M8 34.5 22 46', google.blue)}
      {pill('M42 18 56 29.5', google.green)}
      {pill('M56 34.5 42 46', google.yellow)}
    </svg>
  )
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      {!compact && (
        <span className="leading-none">
          <span className="block font-display text-[1.05rem] font-semibold tracking-tight text-ink">GDG on Campus</span>
          <span className="mt-1 block font-mono text-[0.62rem] uppercase tracking-[0.16em] text-muted">ITER Chapter</span>
        </span>
      )}
    </span>
  )
}
