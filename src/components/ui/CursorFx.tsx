import { useEffect } from 'react'
import { useStore } from '@/store/useStore'

/**
 * Desktop only: feeds --mx / --my to the card under the mouse so [data-spot] cards get a soft spotlight.
 * No cursor ring and no tap effects: touch devices use plain native press feedback (see index.css).
 * Work is batched into one requestAnimationFrame and the card's rect is cached while the pointer is over it.
 */
export default function CursorFx() {
  const motion = useStore((s) => s.motion)

  useEffect(() => {
    if (!motion) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let el: HTMLElement | null = null
    let rect: DOMRect | null = null
    let x = 0
    let y = 0
    let raf = 0

    const apply = () => {
      raf = 0
      if (!el || !rect) return
      el.style.setProperty('--mx', `${x - rect.left}px`)
      el.style.setProperty('--my', `${y - rect.top}px`)
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const target = (e.target as HTMLElement | null)?.closest?.('[data-spot]') as HTMLElement | null
      if (target !== el) {
        el = target
        rect = target ? target.getBoundingClientRect() : null
      }
      if (!el) return
      x = e.clientX
      y = e.clientY
      if (!raf) raf = requestAnimationFrame(apply)
    }
    const invalidate = () => (rect = el ? el.getBoundingClientRect() : null)

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('scroll', invalidate, { passive: true })
    window.addEventListener('resize', invalidate)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('scroll', invalidate)
      window.removeEventListener('resize', invalidate)
    }
  }, [motion])

  return null
}
