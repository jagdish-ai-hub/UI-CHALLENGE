import { Link } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { GoogleBar } from '@/components/ui/primitives'
import { brand } from '@/config/brand'
import { useStore } from '@/store/useStore'

export default function Footer() {
  const reset = useStore((s) => s.resetDemo)
  return (
    <footer className="relative border-t border-line bg-wash">
      <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8">
        <GoogleBar />
        <div className="mt-8 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              A student-run developer community at {brand.university}. Workshops, hackathons and study jams, every fortnight.
            </p>
          </div>
          <FooterCol title="Explore" links={[['/#recruit', 'Join the club'], ['/#meets', 'Meets'], ['/#gallery', 'Gallery'], ['/#milestones', 'Milestones']]} />
          <FooterCol title="Club" links={[['/members', 'Members'], ['/dashboard', 'Dashboard'], ['/events', 'Events manager'], ['/applicants', 'Applicants']]} />
          <div>
            <p className="eyebrow">Contact</p>
            <p className="mt-3 text-sm text-ink">{brand.email}</p>
            <p className="mt-1 text-sm text-muted">{brand.chapter}</p>
          </div>
        </div>
        <div className="mt-12 border-t border-line pt-6 text-xs text-muted">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>
              © {new Date().getFullYear()} {brand.name} · {brand.chapter}. Demo build with sample data.
            </p>
            <button onClick={reset} className="rounded-full border border-line bg-white px-3 py-1.5 hover:bg-wash">
              Reset demo data
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-2xl bg-white px-4 py-3 text-[0.8rem] text-ink">
            <p>
              Built by <span className="font-semibold">Jagdish Pattnaik</span> for the <span className="font-semibold">UI Sphere</span> GDG event.
            </p>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
              <a href="tel:+917894673682" className="hover:text-g-blue-700">
                Mobile: <span className="font-medium text-ink">7894673682</span>
              </a>
              <span>© Jagdish Pattnaik</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map(([to, label]) => (
          <li key={to}>
            <Link to={to} className="text-sm text-ink hover:text-g-blue-700">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
