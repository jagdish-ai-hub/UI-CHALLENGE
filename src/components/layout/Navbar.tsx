import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Box } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { ButtonLink } from '@/components/ui/primitives'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import { scrollToId } from '@/lib/lenis'

const anchors = [
  { id: 'recruit', label: 'Join' },
  { id: 'meets', label: 'Meets' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'community', label: 'Community' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const motion = useStore((s) => s.motion)
  const setMotion = useStore((s) => s.setMotion)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => setOpen(false), [pathname])

  const goAnchor = (id: string) => (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault()
      scrollToId(id)
      setOpen(false)
    }
  }

  const link = 'text-sm text-muted hover:text-ink transition-colors px-3 py-2 rounded-full'

  return (
    <header className={cn('fixed inset-x-0 top-0 z-50 transition-all duration-200', scrolled ? 'bg-white/85 backdrop-blur-md border-b border-line/80' : 'bg-transparent')}>
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="GDG on Campus home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {anchors.map((a) => (
            <Link key={a.id} to={`/#${a.id}`} onClick={goAnchor(a.id)} className={link}>
              {a.label}
            </Link>
          ))}
          <NavLink to="/members" className={({ isActive }) => cn(link, isActive && 'text-ink bg-wash')}>
            Members
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => cn(link, isActive && 'text-ink bg-wash')}>
            Dashboard
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMotion(!motion)}
            aria-pressed={motion}
            title={motion ? 'Turn 3D and animations off' : 'Turn 3D and animations on'}
            className={cn('hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors', motion ? 'border-g-green/40 bg-g-green-50 text-g-green-700' : 'border-line bg-white text-muted')}
          >
            <Box size={14} /> 3D {motion ? 'on' : 'off'}
          </button>
          <ButtonLink to="/#recruit" onClick={goAnchor('recruit')} className="hidden sm:inline-flex !py-2.5">
            Join the club
          </ButtonLink>
          <button className="inline-flex size-10 items-center justify-center rounded-full border border-line bg-white lg:hidden" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Toggle menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-white px-5 pb-6 pt-3 lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {anchors.map((a) => (
              <Link key={a.id} to={`/#${a.id}`} onClick={goAnchor(a.id)} className="border-b border-line/70 py-3.5 font-display text-2xl tracking-tight">
                {a.label}
              </Link>
            ))}
            <Link to="/members" className="border-b border-line/70 py-3.5 font-display text-2xl tracking-tight">
              Members
            </Link>
            <Link to="/dashboard" className="border-b border-line/70 py-3.5 font-display text-2xl tracking-tight">
              Dashboard
            </Link>
          </nav>
          <div className="mt-5 flex items-center gap-3">
            <ButtonLink to="/#recruit" onClick={goAnchor('recruit')}>
              Join the club
            </ButtonLink>
            <button onClick={() => setMotion(!motion)} className="rounded-full border border-line px-4 py-3 text-sm">
              3D {motion ? 'on' : 'off'}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
