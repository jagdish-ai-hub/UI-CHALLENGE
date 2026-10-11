import Lenis from 'lenis'

let instance: Lenis | null = null

export function startLenis() {
  if (instance) return instance
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  instance = new Lenis({ duration: 1.1, smoothWheel: true })
  const raf = (t: number) => {
    instance?.raf(t)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
  return instance
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const y = el.getBoundingClientRect().top + window.scrollY - 72
  if (instance) instance.scrollTo(y, { duration: 1.2 })
  else window.scrollTo({ top: y, behavior: 'smooth' })
}
