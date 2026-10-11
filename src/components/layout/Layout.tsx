import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import SceneCanvas from '@/three/SceneCanvas'
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
      <main>
        <Outlet />
      </main>
      <Footer />
      <SceneCanvas eventSource={root} />
    </div>
  )
}
