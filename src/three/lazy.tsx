import { lazy, Suspense, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * The 3D stack (three, r3f, drei) is code-split: pages paint immediately and the scenes stream in.
 * `SceneFrame` keeps its footprint while loading so the layout never jumps.
 */
const Frame = lazy(() => import('./SceneFrame'))
export const LazyCanvas = lazy(() => import('./SceneCanvas'))

export function SceneFrame(props: ComponentProps<typeof Frame>) {
  return (
    <Suspense fallback={<div className={cn('relative overflow-hidden', props.className)} style={props.style} aria-label={props.label} role="img"><div className="absolute inset-0 animate-pulse bg-black/[0.03]" /></div>}>
      <Frame {...props} />
    </Suspense>
  )
}
