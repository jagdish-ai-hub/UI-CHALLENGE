import { useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { google } from '@/config/brand'

const INTERACTIVE = 'a,button,[role="button"],[role="tab"],input,select,textarea,summary,label[for],[data-hover]'
const dots = [google.blue, google.red, google.yellow, google.green]

/**
 * Pointer feedback for mouse and touch:
 *  - a ring that trails the cursor and grows over interactive elements (fine pointers only)
 *  - a four-dot Google-colour burst on every click or tap
 *  - a soft spotlight that follows the pointer or finger across any [data-spot] card
 */
export default function CursorFx() {
  const motion = useStore((s) => s.motion)
  const ring = useRef<HTMLDivElement>(null)
  const layer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!motion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const fine = window.matchMedia('(pointer: fine)').matches
    const r = ring.current
    let x = -100
    let y = -100
    let rx = -100
    let ry = -100
    let raf = 0
    let visible = false
    let hovering = false
    let pressed = false

    const spot = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.('[data-spot]') as HTMLElement | null
      if (!el) return
      const b = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${e.clientX - b.left}px`)
      el.style.setProperty('--my', `${e.clientY - b.top}px`)
      if (e.pointerType === 'touch') {
        el.setAttribute('data-touching', '')
        window.setTimeout(() => el.removeAttribute('data-touching'), 700)
      }
    }

    const move = (e: PointerEvent) => {
      spot(e)
      if (e.pointerType === 'touch' || !fine) return
      x = e.clientX
      y = e.clientY
      hovering = !!(e.target as HTMLElement | null)?.closest?.(INTERACTIVE)
      if (!visible) {
        visible = true
        rx = x
        ry = y
        r?.style.setProperty('opacity', '1')
      }
    }

    const burst = (e: PointerEvent) => {
      const host = layer.current
      if (!host) return
      const touch = e.pointerType === 'touch'
      // expanding ripple
      const ripple = document.createElement('span')
      ripple.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:999px;border:2px solid ${google.blue};opacity:.55;pointer-events:none`
      host.appendChild(ripple)
      ripple.animate([{ transform: 'scale(1)', opacity: 0.55 }, { transform: `scale(${touch ? 9 : 6})`, opacity: 0 }], { duration: touch ? 650 : 520, easing: 'cubic-bezier(.2,.7,.2,1)' }).finished.then(() => ripple.remove(), () => ripple.remove())
      // four Google-colour dots
      dots.forEach((c, i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4
        const d = touch ? 40 : 30
        const dot = document.createElement('span')
        dot.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:999px;background:${c};pointer-events:none`
        host.appendChild(dot)
        dot.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(.2)`, opacity: 0 }], { duration: 560, easing: 'cubic-bezier(.15,.8,.2,1)' }).finished.then(() => dot.remove(), () => dot.remove())
      })
    }

    const down = (e: PointerEvent) => {
      pressed = true
      spot(e)
      burst(e)
    }
    const up = () => (pressed = false)
    const leave = () => {
      visible = false
      r?.style.setProperty('opacity', '0')
    }

    const tick = () => {
      rx += (x - rx) * 0.2
      ry += (y - ry) * 0.2
      if (r) {
        const size = pressed ? 22 : hovering ? 52 : 30
        r.style.width = r.style.height = `${size}px`
        r.style.transform = `translate3d(${rx - size / 2}px, ${ry - size / 2}px, 0)`
        r.style.background = hovering ? 'rgba(66,133,244,.14)' : 'transparent'
        r.style.borderColor = hovering ? google.blue : 'rgba(32,33,36,.35)'
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    document.documentElement.addEventListener('mouseleave', leave)
    if (fine) raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.removeEventListener('mouseleave', leave)
    }
  }, [motion])

  if (!motion) return null
  return (
    <>
      <div ref={ring} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[95] hidden rounded-full border-2 opacity-0 transition-[width,height,background-color,border-color,opacity] duration-200 [@media(pointer:fine)]:block" style={{ width: 30, height: 30 }} />
      <div ref={layer} aria-hidden className="pointer-events-none fixed inset-0 z-[96] overflow-hidden" />
    </>
  )
}
