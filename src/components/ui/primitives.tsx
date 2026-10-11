import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef, type ButtonHTMLAttributes, type PointerEvent as RPointerEvent, type ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { google } from '@/config/brand'

type Variant = 'blue' | 'ink' | 'outline' | 'soft'
const variants: Record<Variant, string> = {
  blue: 'bg-g-blue-700 text-white hover:bg-[#1765cc] shadow-[0_1px_2px_rgba(26,115,232,.4)]',
  ink: 'bg-ink text-white hover:bg-black',
  outline: 'border border-line bg-white text-ink hover:bg-wash hover:border-[#bdc1c6]',
  soft: 'bg-g-blue-50 text-g-blue-700 hover:bg-[#d2e3fc]',
}
const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-[background-color,border-color,box-shadow,transform,scale] duration-200 select-none whitespace-nowrap hover:shadow-[0_10px_24px_-12px_rgba(32,33,36,.45)] active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none'

/** Buttons lean a few pixels toward a nearby mouse pointer, then spring back. Touch is ignored. */
function useMagnet<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  return {
    ref,
    onPointerMove: (e: RPointerEvent<T>) => {
      const el = ref.current
      if (!el || e.pointerType !== 'mouse') return
      const b = el.getBoundingClientRect()
      const dx = e.clientX - (b.left + b.width / 2)
      const dy = e.clientY - (b.top + b.height / 2)
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.28}px)`
    },
    onPointerLeave: () => {
      if (ref.current) ref.current.style.transform = ''
    },
  }
}

export function Button({ variant = 'blue', className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const m = useMagnet<HTMLButtonElement>()
  return <button ref={m.ref} onPointerMove={m.onPointerMove} onPointerLeave={m.onPointerLeave} className={cn(base, variants[variant], className)} {...rest} />
}

export function ButtonLink({ variant = 'blue', className, ...rest }: LinkProps & { variant?: Variant }) {
  const m = useMagnet<HTMLAnchorElement>()
  return <Link ref={m.ref} onPointerMove={m.onPointerMove} onPointerLeave={m.onPointerLeave} className={cn(base, variants[variant], className)} {...rest} />
}

export function Eyebrow({ children, color = google.blue, className }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <p className={cn('eyebrow inline-flex items-center gap-2', className)}>
      <span className="inline-block size-2 rounded-full" style={{ background: color }} />
      {children}
    </p>
  )
}

/** Four-segment Google color rule, used at the top of sections. */
export function GoogleBar({ className }: { className?: string }) {
  return (
    <div className={cn('flex h-1 w-24 overflow-hidden rounded-full', className)} aria-hidden>
      <span className="flex-1 bg-g-blue" />
      <span className="flex-1 bg-g-red" />
      <span className="flex-1 bg-g-yellow" />
      <span className="flex-1 bg-g-green" />
    </div>
  )
}

export function Reveal({ children, delay = 0, className, y = 22 }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function CountUp({ to, suffix = '', className }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { stiffness: 70, damping: 18 })
  useEffect(() => {
    if (inView) mv.set(to)
  }, [inView, to, mv])
  useEffect(
    () =>
      spring.on('change', (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('en-IN') + suffix
      }),
    [spring, suffix],
  )
  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  )
}

export function SectionHeading({
  eyebrow,
  color = google.blue,
  line1,
  line2,
  children,
  className,
}: {
  eyebrow: string
  color?: string
  line1: ReactNode
  line2?: ReactNode
  children?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('max-w-3xl', className)}>
      <Reveal>
        <Eyebrow color={color}>{eyebrow}</Eyebrow>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="display mt-4 text-[clamp(2.6rem,6.2vw,5rem)] text-ink">
          {line1}
          {line2 && (
            <>
              <br />
              <span className="display-outline">{line2}</span>
            </>
          )}
        </h2>
      </Reveal>
      {children && (
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-muted">{children}</p>
        </Reveal>
      )}
    </div>
  )
}
