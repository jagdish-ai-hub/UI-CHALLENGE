import { Suspense, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import Toaster from '@/components/ui/Toaster'
import CursorFx from '@/components/ui/CursorFx'
import { LazyCanvas } from '@/three/lazy'
import { scrollToId, startLenis } from '@/lib/lenis'

export default function Layout() {
  const root = useRef<HTMLDivElement>(null)
  const { pathname, hash } = useLocation()

  useEffect(() => {
    startLenis()
  }, [])

  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const t = window.setTimeout(() => scrollToId(id), 120)
      return () => window.clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div ref={root} className="relative min-h-screen bg-white">
      <Navbar />
      <a href="#main" className="sr-only z-[90] rounded-full bg-ink px-4 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <main id="main">
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <Suspense fallback={null}>
        <LazyCanvas eventSource={root} />
      </Suspense>
      <Toaster />
      <CursorFx />
    </div>
  )
}
