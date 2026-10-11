import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
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
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-colors duration-150 select-none whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none'

export function Button({ variant = 'blue', className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={cn(base, variants[variant], className)} {...rest} />
}

export function ButtonLink({ variant = 'blue', className, ...rest }: LinkProps & { variant?: Variant }) {
  return <Link className={cn(base, variants[variant], className)} {...rest} />
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
