import { Suspense, type ReactNode } from 'react'
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

export default function SceneFrame({ className, style, label, children, fallback }: Props) {
  const tier = useTier()
  return (
    <div className={cn('relative isolate overflow-hidden', className)} style={style} role="img" aria-label={label}>
      {tier === 'off' ? (
        (fallback ?? <DefaultFallback />)
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
