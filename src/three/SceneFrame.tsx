import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'
import { useTier, type Tier } from '@/lib/useTier'
import { cn } from '@/lib/utils'
import { google } from '@/config/brand'
import { TierContext } from './tierContext'

interface Props {
  className?: string
  style?: React.CSSProperties
  label: string
  children: (tier: Exclude<Tier, 'off'>) => ReactNode
  /** Rendered instead of the 3D scene on `off` tier. */
  fallback?: ReactNode
}

export function DefaultFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center overflow-hidden rounded-[inherit] bg-wash">
      <svg viewBox="0 0 200 140" className="w-2/3 max-w-xs" aria-hidden>
        <rect x="20" y="30" width="70" height="70" rx="14" fill={google.blueTint} />
        <rect x="110" y="20" width="70" height="50" rx="14" fill={google.redTint} />
        <rect x="100" y="80" width="80" height="40" rx="14" fill={google.greenTint} />
        <circle cx="55" cy="65" r="14" fill={google.blue} />
        <circle cx="145" cy="45" r="12" fill={google.red} />
        <circle cx="140" cy="100" r="11" fill={google.green} />
        <circle cx="40" cy="115" r="9" fill={google.yellow} />
      </svg>
    </div>
  )
}

/**
 * Phones and tablets: one small canvas per scene, inside the element itself.
 * It scrolls with the page on the compositor (no judder against a fixed full-screen canvas),
 * and only exists while the scene is near the viewport, so at most one or two contexts are alive.
 */
function LocalScene({ children }: { children: (tier: 'low') => ReactNode }) {
  const host = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = host.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setNear(!!e?.isIntersecting), { rootMargin: '160px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={host} className="absolute inset-0">
      {near && (
        <Canvas
          flat
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
          style={{ touchAction: 'pan-y' }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <TierContext.Provider value="low">
            <Suspense fallback={null}>{children('low')}</Suspense>
          </TierContext.Provider>
        </Canvas>
      )}
    </div>
  )
}

export default function SceneFrame({ className, style, label, children, fallback }: Props) {
  const tier = useTier()
  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style} role="img" aria-label={label}>
      {tier === 'off' ? (
        (fallback ?? <DefaultFallback />)
      ) : tier === 'low' ? (
        <LocalScene>{children}</LocalScene>
      ) : (
        <View className="absolute inset-0">
          <TierContext.Provider value={tier}>
            <Suspense fallback={null}>{children(tier)}</Suspense>
          </TierContext.Provider>
        </View>
      )}
    </div>
  )
}
